const express = require('express')
const { supabase, supabaseAuth, memory } = require('../supabase')
const { cekLogin } = require('../middleware')

const router = express.Router()

const KUNCI_VERIFIER = 'wc-auth-code-verifier'
const AMAN = process.env.COOKIE_SECURE === 'true'

const opsiCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: AMAN,
  path: '/',
  maxAge: 604800000
}

const opsiVerifier = {
  httpOnly: true,
  sameSite: 'lax',
  secure: AMAN,
  path: '/',
  maxAge: 600000
}

const percobaan = {}

function batasiPercobaan (ip) {
  const sekarang = Date.now()
  const data = percobaan[ip]

  if (!data || sekarang - data.mulai > 900000) {
    percobaan[ip] = { mulai: sekarang, jumlah: 1 }
    return true
  }

  data.jumlah = data.jumlah + 1

  if (data.jumlah > 10) {
    return false
  }

  return true
}

function emailValid (email) {
  if (!email || typeof email !== 'string') {
    return false
  }

  if (email.length > 254) {
    return false
  }

  if (email.indexOf('@') < 1) {
    return false
  }

  if (email.indexOf('.') < 0) {
    return false
  }

  return true
}

router.post('/register', async (req, res) => {
  if (!batasiPercobaan(req.ip)) {
    return res.status(429).json({ message: 'Terlalu banyak percobaan, coba lagi 15 menit lagi' })
  }

  const email = req.body.email
  const password = req.body.password
  const nama = req.body.nama

  if (!emailValid(email)) {
    return res.status(400).json({ message: 'Format email tidak benar' })
  }

  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password harus 8 sampai 72 karakter' })
  }

  if (nama && (typeof nama !== 'string' || nama.length > 60)) {
    return res.status(400).json({ message: 'Nama terlalu panjang' })
  }

  const hasil = await supabaseAuth.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { full_name: nama || email.split('@')[0] }
    }
  })

  if (hasil.error) {
    console.log('register gagal:', hasil.error.message)

    if (hasil.error.status === 429) {
      return res.status(429).json({ message: 'Terlalu banyak percobaan, coba lagi nanti' })
    }

    return res.status(400).json({ message: 'Pendaftaran gagal, email mungkin sudah terpakai' })
  }

  if (!hasil.data.session) {
    return res.json({
      message: 'Pendaftaran berhasil, silakan cek email Anda untuk konfirmasi',
      perluKonfirmasi: true
    })
  }

  res.cookie('token', hasil.data.session.access_token, opsiCookie)

  res.json({
    message: 'Pendaftaran berhasil',
    perluKonfirmasi: false
  })
})

router.post('/login', async (req, res) => {
  if (!batasiPercobaan(req.ip)) {
    return res.status(429).json({ message: 'Terlalu banyak percobaan, coba lagi 15 menit lagi' })
  }

  const email = req.body.email
  const password = req.body.password

  if (!emailValid(email)) {
    return res.status(400).json({ message: 'Format email tidak benar' })
  }

  if (!password || typeof password !== 'string' || password.length > 72) {
    return res.status(400).json({ message: 'Password wajib diisi' })
  }

  const hasil = await supabaseAuth.auth.signInWithPassword({
    email: email,
    password: password
  })

  if (hasil.error) {
    console.log('login gagal:', hasil.error.message)
    return res.status(401).json({ message: 'Email atau password salah' })
  }

  res.cookie('token', hasil.data.session.access_token, opsiCookie)

  res.json({ message: 'Login berhasil' })
})

router.get('/google', async (req, res) => {
  const hasil = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.CALLBACK_URL,
      skipBrowserRedirect: true
    }
  })

  if (hasil.error) {
    console.log('google gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal menghubungi layanan login Google' })
  }

  const verifier = memory[KUNCI_VERIFIER]
  delete memory[KUNCI_VERIFIER]

  if (verifier) {
    res.cookie('verifier', verifier, opsiVerifier)
  }

  res.redirect(hasil.data.url)
})

router.get('/callback', async (req, res) => {
  const code = req.query.code

  if (!code || typeof code !== 'string' || code.length > 500) {
    return res.redirect('/login.html?error=kode')
  }

  const verifier = req.cookies.verifier

  if (!verifier) {
    return res.redirect('/login.html?error=sesi')
  }

  memory[KUNCI_VERIFIER] = verifier

  const hasil = await supabase.auth.exchangeCodeForSession(code)

  delete memory[KUNCI_VERIFIER]
  delete memory['wc-auth']
  res.clearCookie('verifier', { path: '/' })

  if (hasil.error) {
    console.log('callback gagal:', hasil.error.message)
    return res.redirect('/login.html?error=gagal')
  }

  res.cookie('token', hasil.data.session.access_token, opsiCookie)

  res.redirect(process.env.FRONTEND_URL)
})

router.get('/user', cekLogin, (req, res) => {
  const data = req.user.user_metadata || {}

  res.json({
    id: req.user.id,
    email: req.user.email,
    nama: data.full_name || data.name || req.user.email.split('@')[0],
    foto: data.avatar_url || data.picture || ''
  })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ message: 'Berhasil logout' })
})

module.exports = router
