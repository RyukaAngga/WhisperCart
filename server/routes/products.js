const express = require('express')
const { supabaseAdmin } = require('../supabase')
const { cekLogin, cekAdmin } = require('../middleware')

const router = express.Router()

function teksAman (nilai, batas) {
  if (nilai === undefined || nilai === null) {
    return null
  }

  if (typeof nilai !== 'string') {
    return null
  }

  const bersih = nilai.trim()

  if (bersih.length === 0 || bersih.length > batas) {
    return null
  }

  return bersih
}

function angkaAman (nilai) {
  const angka = Number(nilai)

  if (isNaN(angka) || angka < 0 || angka > 1000000000) {
    return null
  }

  return angka
}

router.get('/', async (req, res) => {
  let query = supabaseAdmin.from('products').select('*')

  const kategori = teksAman(req.query.kategori, 60)
  const cari = teksAman(req.query.cari, 60)

  if (kategori) {
    query = query.eq('category', kategori)
  }

  if (cari) {
    query = query.ilike('title', '%' + cari.replace(/[%_,]/g, '') + '%')
  }

  let batas = Number(req.query.batas)

  if (isNaN(batas) || batas < 1 || batas > 100) {
    batas = 50
  }

  let hasil = await query.order('id').limit(batas)

  if (hasil.error) {
    console.log('ambil produk gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal mengambil data produk' })
  }

  if (hasil.data.length === 0 && !kategori && !cari) {
    try {
      const resp = await fetch(process.env.CATALOG_URL || 'https://dummyjson.com/products?limit=100')
      if (resp.ok) {
        const json = await resp.json()
        const items = []
        for (let i = 0; i < json.products.length; i++) {
          const item = json.products[i]
          if (item && item.id && item.title) {
            items.push({
              external_id: String(item.id),
              title: String(item.title).slice(0, 200),
              description: String(item.description || '').slice(0, 2000),
              price: angkaAman(item.price) || 0,
              category: String(item.category || '').slice(0, 60),
              image: String(item.thumbnail || item.image || '').slice(0, 500),
              stock: angkaAman(item.stock) || 0
            })
          }
        }
        if (items.length > 0) {
          const simpan = await supabaseAdmin.from('products').upsert(items, { onConflict: 'external_id' }).select().limit(batas)
          if (!simpan.error && simpan.data) {
            return res.json(simpan.data)
          }
        }
      }
    } catch (e) {
      console.log('auto sync gagal:', e.message)
    }
  }

  res.json(hasil.data)
})

router.post('/sync', cekLogin, cekAdmin, async (req, res) => {
  let katalog = null

  try {
    const response = await fetch(process.env.CATALOG_URL)

    if (!response.ok) {
      return res.status(502).json({ message: 'Gagal mengambil data dari katalog eksternal' })
    }

    katalog = await response.json()
  } catch (error) {
    console.log('sync katalog gagal:', error.message)
    return res.status(502).json({ message: 'Katalog eksternal tidak bisa dihubungi' })
  }

  const daftar = katalog.products

  if (!daftar || !Array.isArray(daftar)) {
    return res.status(502).json({ message: 'Format katalog tidak sesuai' })
  }

  const produk = []

  for (let i = 0; i < daftar.length; i++) {
    const item = daftar[i]

    if (item && item.id && item.title) {
      produk.push({
        external_id: String(item.id),
        title: String(item.title).slice(0, 200),
        description: String(item.description || '').slice(0, 2000),
        price: angkaAman(item.price) || 0,
        category: String(item.category || '').slice(0, 60),
        image: String(item.thumbnail || item.image || '').slice(0, 500),
        stock: angkaAman(item.stock) || 0
      })
    }
  }

  if (produk.length === 0) {
    return res.status(502).json({ message: 'Katalog eksternal tidak berisi produk' })
  }

  const hasil = await supabaseAdmin
    .from('products')
    .upsert(produk, { onConflict: 'external_id' })
    .select()

  if (hasil.error) {
    console.log('simpan katalog gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal menyimpan data katalog' })
  }

  res.json({
    message: 'Sinkronisasi katalog berhasil',
    jumlah: hasil.data.length
  })
})

router.get('/:id', async (req, res) => {
  const id = angkaAman(req.params.id)

  if (!id) {
    return res.status(400).json({ message: 'Id produk tidak benar' })
  }

  const hasil = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (hasil.error) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' })
  }

  res.json(hasil.data)
})

router.post('/', cekLogin, cekAdmin, async (req, res) => {
  const judul = teksAman(req.body.title, 200)
  const harga = angkaAman(req.body.price)

  if (!judul) {
    return res.status(400).json({ message: 'Nama produk wajib diisi dan maksimal 200 karakter' })
  }

  if (harga === null) {
    return res.status(400).json({ message: 'Harga produk tidak benar' })
  }

  const produk = {
    external_id: teksAman(req.body.external_id, 60),
    title: judul,
    description: teksAman(req.body.description, 2000),
    price: harga,
    category: teksAman(req.body.category, 60),
    image: teksAman(req.body.image, 500),
    stock: angkaAman(req.body.stock) || 0
  }

  const hasil = await supabaseAdmin
    .from('products')
    .insert(produk)
    .select()
    .single()

  if (hasil.error) {
    console.log('tambah produk gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal menambah produk' })
  }

  res.status(201).json(hasil.data)
})

router.put('/:id', cekLogin, cekAdmin, async (req, res) => {
  const id = angkaAman(req.params.id)

  if (!id) {
    return res.status(400).json({ message: 'Id produk tidak benar' })
  }

  const produk = {}
  const judul = teksAman(req.body.title, 200)
  const deskripsi = teksAman(req.body.description, 2000)
  const kategori = teksAman(req.body.category, 60)
  const gambar = teksAman(req.body.image, 500)
  const harga = angkaAman(req.body.price)
  const stok = angkaAman(req.body.stock)

  if (judul) {
    produk.title = judul
  }

  if (deskripsi) {
    produk.description = deskripsi
  }

  if (kategori) {
    produk.category = kategori
  }

  if (gambar) {
    produk.image = gambar
  }

  if (harga !== null) {
    produk.price = harga
  }

  if (stok !== null) {
    produk.stock = stok
  }

  if (Object.keys(produk).length === 0) {
    return res.status(400).json({ message: 'Tidak ada data yang diubah' })
  }

  const hasil = await supabaseAdmin
    .from('products')
    .update(produk)
    .eq('id', id)
    .select()
    .single()

  if (hasil.error) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' })
  }

  res.json(hasil.data)
})

router.delete('/:id', cekLogin, cekAdmin, async (req, res) => {
  const id = angkaAman(req.params.id)

  if (!id) {
    return res.status(400).json({ message: 'Id produk tidak benar' })
  }

  const hasil = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .select()

  if (hasil.error) {
    console.log('hapus produk gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal menghapus produk' })
  }

  if (hasil.data.length === 0) {
    return res.status(404).json({ message: 'Produk tidak ditemukan' })
  }

  res.json({ message: 'Produk berhasil dihapus' })
})

module.exports = router
