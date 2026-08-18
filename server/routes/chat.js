const express = require('express')
const { cekLogin } = require('../middleware')

const router = express.Router()

const ALAMAT_OPENROUTER = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions'
const CATALOG_URL = process.env.CATALOG_URL || 'https://dummyjson.com/products?limit=100'

let katalogProdukTeks = ''
let katalogSiap = false

async function muatKatalog() {
  try {
    const res = await fetch(CATALOG_URL)
    if (!res.ok) return

    const data = await res.json()
    const produkList = data.products || data || []

    if (!Array.isArray(produkList) || produkList.length === 0) return

    const kategoriMap = {}

    for (let i = 0; i < produkList.length; i++) {
      const p = produkList[i]
      const kat = p.category || 'Lainnya'

      if (!kategoriMap[kat]) {
        kategoriMap[kat] = []
      }

      kategoriMap[kat].push({
        id: p.id,
        nama: p.title,
        harga: p.price,
        rating: p.rating
      })
    }

    let teks = ''
    const kategoriKeys = Object.keys(kategoriMap)

    for (let k = 0; k < kategoriKeys.length; k++) {
      const namaKat = kategoriKeys[k]
      const items = kategoriMap[namaKat]
      teks += '\n[' + namaKat + ']\n'

      for (let j = 0; j < items.length; j++) {
        const item = items[j]
        teks += '- ID:' + item.id + ' | ' + item.nama + ' | $' + item.harga + ' | Rating:' + item.rating + '\n'
      }
    }

    katalogProdukTeks = teks.trim()
    katalogSiap = true
    console.log('Katalog produk dimuat: ' + produkList.length + ' item')
  } catch (err) {
    console.log('Gagal memuat katalog produk:', err.message)
  }
}

muatKatalog()

function bangunPromptSistem(modeSuara) {
  let katalogBagian = ''

  if (katalogSiap && katalogProdukTeks) {
    katalogBagian = '\n\nDATABASE PRODUK WHISPERCART (data langsung dari sistem):\n' + katalogProdukTeks + '\n'
  }

  if (modeSuara) {
    return 'Kamu adalah Whisper AI dalam Mode Suara Percakapan Langsung (Live Voice) di WhisperCart.'
      + '\n\nGaya Bahasa & Percakapan Suara:'
      + '\n1. Respons Anda akan langsung dibacakan dengan suara alami ElevenLabs.'
      + '\n2. Gunakan Bahasa Indonesia percakapan yang sangat luwes, ramah, hangat, dan ringkas (cukup 1-2 paragraf pendek).'
      + '\n3. DILARANG menggunakan tanda bintang (**), tanda pagar (#), tabel, atau poin nomor berderet karena tidak enak didengar saat dibacakan suara.'
      + '\n4. Sebutkan nama produk persis seperti di database. Untuk harga sebutkan dengan kata-kata alami bahasa Indonesia (contoh: "10 dolar" atau "10 koma 99 dolar", jangan menulis simbol $ mentah).'
      + '\n5. Gunakan audio expression tags secara wajar jika sesuai emosi, contoh: [calm], [happy], [pause], [excited].'
      + '\n\nATURAN KRITIS REKOMENDASI:'
      + '\n- Kamu WAJIB merekomendasikan HANYA produk yang ada di DATABASE PRODUK di bawah ini.'
      + '\n- Sebutkan nama produk PERSIS sesuai database (contoh: "Cat Food", bukan "Royal Canin" atau nama fiktif).'
      + '\n- Jangan pernah mengarang produk yang tidak ada di database.'
      + katalogBagian
  }

  return 'Kamu adalah Whisper AI, asisten belanja cerdas resmi di WhisperCart.'
    + '\n\nGaya Bahasa & Komunikasi:'
    + '\n1. Gunakan Bahasa Indonesia yang sangat alami, santun, hangat, dan luwes seperti asisten belanja profesional.'
    + '\n2. DILARANG menggunakan sapaan klise atau basa-basi berlebih ("Selamat datang di WhisperCart...", "Di sore hari yang santai ini...").'
    + '\n3. Langsung tanggapi inti kebutuhan pembeli secara jelas dan bersahabat.'
    + '\n\nATURAN KRITIS REKOMENDASI:'
    + '\n- Kamu WAJIB merekomendasikan HANYA produk yang ada di DATABASE PRODUK di bawah ini.'
    + '\n- Sebutkan nama produk PERSIS sesuai database (contoh: "Cat Food", bukan "Royal Canin" atau nama fiktif).'
    + '\n- Sertakan harga asli dari database (dalam format $XX.XX).'
    + '\n- Jangan pernah mengarang produk, merek, atau harga yang tidak ada di database.'
    + '\n- Jangan pernah mengulang produk yang sama dalam satu respon.'
    + '\n- Jika pembeli menanyakan produk yang tidak ada di database, katakan dengan jujur bahwa produk tersebut belum tersedia di WhisperCart dan tawarkan alternatif dari database.'
    + '\n- Tampilkan rekomendasi dalam format daftar bullet yang rapi:'
    + '\n  - **Nama Produk** - $Harga - Keunggulan singkat'
    + katalogBagian
}

const pemakaian = {}

function batasiPemakaian (idUser) {
  const sekarang = Date.now()
  const data = pemakaian[idUser]

  if (!data || sekarang - data.mulai > 60000) {
    pemakaian[idUser] = { mulai: sekarang, jumlah: 1 }
    return true
  }

  data.jumlah = data.jumlah + 1

  if (data.jumlah > 20) {
    return false
  }

  return true
}

function susunRiwayat (riwayat) {
  const daftar = []

  if (!riwayat || !Array.isArray(riwayat)) {
    return daftar
  }

  let mulai = 0

  if (riwayat.length > 20) {
    mulai = riwayat.length - 20
  }

  for (let i = mulai; i < riwayat.length; i++) {
    const item = riwayat[i]

    if (item && typeof item.isi === 'string' && item.isi.length > 0 && item.isi.length <= 4000) {
      let peran = 'user'

      if (item.peran === 'ai' || item.peran === 'assistant') {
        peran = 'assistant'
      }

      daftar.push({ role: peran, content: item.isi })
    }
  }

  return daftar
}

router.post('/', cekLogin, async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ message: 'Asisten AI belum diatur di server' })
  }

  if (!batasiPemakaian(req.user.id)) {
    return res.status(429).json({ message: 'Terlalu banyak pesan, tunggu sebentar ya' })
  }

  const pesan = req.body.pesan

  if (!pesan || typeof pesan !== 'string' || pesan.trim().length === 0) {
    return res.status(400).json({ message: 'Pesan tidak boleh kosong' })
  }

  if (pesan.length > 2000) {
    return res.status(400).json({ message: 'Pesan terlalu panjang, maksimal 2000 karakter' })
  }

  const modeSuara = req.body.mode === 'voice'
  const promptSistem = bangunPromptSistem(modeSuara)

  const daftarPesan = [{ role: 'system', content: promptSistem }]
  const riwayat = susunRiwayat(req.body.riwayat)

  for (let i = 0; i < riwayat.length; i++) {
    daftarPesan.push(riwayat[i])
  }

  daftarPesan.push({ role: 'user', content: pesan.trim() })

  let jawaban = null

  try {
    jawaban = await fetch(ALAMAT_OPENROUTER, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5000',
        'X-Title': 'WhisperCart'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:nitro',
        messages: daftarPesan,
        stream: true,
        temperature: modeSuara ? 0.6 : 0.5,
        top_p: 0.9,
        max_tokens: modeSuara ? 250 : 2000
      })
    })
  } catch (error) {
    console.log('openrouter tidak bisa dihubungi:', error.message)
    return res.status(502).json({ message: 'Asisten AI sedang tidak bisa dihubungi' })
  }

  if (!jawaban.ok) {
    const detail = await jawaban.text()
    console.log('openrouter menolak:', jawaban.status, detail.slice(0, 300))

    if (jawaban.status === 429) {
      return res.status(429).json({ message: 'Asisten AI sedang sibuk, coba lagi sebentar lagi' })
    }

    return res.status(502).json({ message: 'Asisten AI gagal menjawab permintaan Anda' })
  }

  req.socket.setNoDelay(true)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const reader = jawaban.body.getReader()
  const decoder = new TextDecoder()
  let putus = false
  let sisa = ''

  req.on('close', () => {
    putus = true
    reader.cancel()
  })

  try {
    while (true) {
      const bagian = await reader.read()

      if (bagian.done || putus) {
        break
      }

      sisa = sisa + decoder.decode(bagian.value, { stream: true })

      const baris = sisa.split('\n')
      sisa = baris.pop()

      for (let i = 0; i < baris.length; i++) {
        const isi = baris[i].trim()

        if (isi.indexOf('data: ') === 0) {
          const data = isi.slice(6)

          if (data !== '[DONE]') {
            try {
              const objek = JSON.parse(data)
              const teks = objek.choices[0].delta.content

              if (teks) {
                res.write('data: ' + JSON.stringify({ teks: teks }) + '\n\n')
                if (typeof res.flush === 'function') {
                  res.flush()
                }
              }
            } catch (error) {
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('streaming terputus:', error.message)
  }

  if (!putus) {
    res.write('data: [SELESAI]\n\n')
    res.end()
  }
})

function rapikanTeksUntukSuara (teks) {
  let hasil = teks
  hasil = hasil.replace(/\$(\d+)\.(\d+)/g, '$1 koma $2 dolar')
  hasil = hasil.replace(/\$(\d+)/g, '$1 dolar')
  hasil = hasil.replace(/(\d+)\.(\d+)/g, '$1 koma $2')
  hasil = hasil.replace(/\$/g, ' dolar ')
  hasil = hasil.replace(/[*#_`~\[\]]/g, ' ')
  hasil = hasil.replace(/\s+/g, ' ').trim()
  return hasil
}

router.post('/tts', cekLogin, async (req, res) => {
  const teks = req.body.teks
  if (!teks || typeof teks !== 'string' || teks.trim().length === 0) {
    return res.status(400).json({ message: 'Teks tidak boleh kosong' })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return res.status(503).json({ message: 'ElevenLabs API key belum diatur di server' })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5'

  let teksBersih = rapikanTeksUntukSuara(teks).slice(0, 1200)

  try {
    const responTTS = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '/stream?optimize_streaming_latency=4', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: teksBersih,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!responTTS.ok) {
      const errText = await responTTS.text()
      console.log('elevenlabs tts error:', responTTS.status, errText.slice(0, 200))
      return res.status(502).json({ message: 'Gagal membuat suara ElevenLabs' })
    }

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-cache')

    const arrayBuffer = await responTTS.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return res.send(buffer)
  } catch (err) {
    console.log('elevenlabs tts gagal:', err.message)
    return res.status(502).json({ message: 'Layanan suara gagal diproses' })
  }
})

module.exports = router
