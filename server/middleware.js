const { supabaseAdmin } = require('./supabase')

async function cekLogin (req, res, next) {
  let token = req.cookies.token

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.replace('Bearer ', '')
  }

  if (!token || typeof token !== 'string' || token.length > 4000) {
    return res.status(401).json({ message: 'Anda belum login' })
  }

  const hasil = await supabaseAdmin.auth.getUser(token)

  if (hasil.error || !hasil.data.user) {
    return res.status(401).json({ message: 'Sesi Anda sudah berakhir, silakan login lagi' })
  }

  req.user = hasil.data.user
  next()
}

function cekAdmin (req, res, next) {
  const daftar = String(process.env.ADMIN_EMAILS || '').split(',')
  let boleh = false

  for (let i = 0; i < daftar.length; i++) {
    const email = daftar[i].trim().toLowerCase()

    if (email && email === String(req.user.email).toLowerCase()) {
      boleh = true
    }
  }

  if (!boleh) {
    return res.status(403).json({ message: 'Anda tidak punya hak akses untuk tindakan ini' })
  }

  next()
}

module.exports = {
  cekLogin: cekLogin,
  cekAdmin: cekAdmin
}
