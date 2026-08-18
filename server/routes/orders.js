const express = require('express')
const { supabaseAdmin } = require('../supabase')
const { cekLogin } = require('../middleware')

const router = express.Router()

const STATUS_BOLEH = ['pending', 'dibayar', 'dikirim', 'selesai', 'batal']

function idAman (nilai) {
  const angka = Number(nilai)

  if (isNaN(angka) || angka < 1 || angka > 1000000000) {
    return null
  }

  return Math.floor(angka)
}

router.get('/', cekLogin, async (req, res) => {
  const hasil = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('user_id', req.user.id)
    .order('id', { ascending: false })
    .limit(50)

  if (hasil.error) {
    console.log('ambil pesanan gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal mengambil data pesanan' })
  }

  res.json(hasil.data)
})

router.get('/:id', cekLogin, async (req, res) => {
  const id = idAman(req.params.id)

  if (!id) {
    return res.status(400).json({ message: 'Id pesanan tidak benar' })
  }

  const hasil = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single()

  if (hasil.error) {
    return res.status(404).json({ message: 'Pesanan tidak ditemukan' })
  }

  res.json(hasil.data)
})

router.post('/', cekLogin, async (req, res) => {
  const items = req.body.items

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Item pesanan tidak boleh kosong' })
  }

  if (items.length > 50) {
    return res.status(400).json({ message: 'Item pesanan terlalu banyak, maksimal 50' })
  }

  let total = 0
  const daftarItem = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const idProduk = idAman(item.product_id)

    if (!idProduk) {
      return res.status(400).json({ message: 'Id produk tidak benar' })
    }

    let jumlah = Number(item.quantity)

    if (isNaN(jumlah) || jumlah < 1) {
      jumlah = 1
    }

    if (jumlah > 99) {
      return res.status(400).json({ message: 'Jumlah pembelian maksimal 99 per produk' })
    }

    jumlah = Math.floor(jumlah)

    const produk = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', idProduk)
      .single()

    if (produk.error || !produk.data) {
      return res.status(404).json({ message: 'Produk dengan id ' + idProduk + ' tidak ditemukan' })
    }

    total = total + produk.data.price * jumlah

    daftarItem.push({
      product_id: produk.data.id,
      title: produk.data.title,
      price: produk.data.price,
      quantity: jumlah
    })
  }

  const pesanan = {
    user_id: req.user.id,
    email: req.user.email,
    items: daftarItem,
    total: Math.round(total * 100) / 100,
    status: 'pending'
  }

  const hasil = await supabaseAdmin
    .from('orders')
    .insert(pesanan)
    .select()
    .single()

  if (hasil.error) {
    console.log('buat pesanan gagal:', hasil.error.message)
    return res.status(500).json({ message: 'Gagal membuat pesanan' })
  }

  res.status(201).json(hasil.data)
})

router.put('/:id/status', cekLogin, async (req, res) => {
  const id = idAman(req.params.id)

  if (!id) {
    return res.status(400).json({ message: 'Id pesanan tidak benar' })
  }

  const status = req.body.status

  if (!status || typeof status !== 'string' || STATUS_BOLEH.indexOf(status) < 0) {
    return res.status(400).json({ message: 'Status hanya boleh: ' + STATUS_BOLEH.join(', ') })
  }

  const hasil = await supabaseAdmin
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select()
    .single()

  if (hasil.error) {
    return res.status(404).json({ message: 'Pesanan tidak ditemukan' })
  }

  res.json(hasil.data)
})

module.exports = router
