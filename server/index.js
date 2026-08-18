const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true })
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true })

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')

const swaggerDocument = require('./swagger')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const chatRoutes = require('./routes/chat')

const app = express()
const PORT = process.env.PORT || 5000

const asalBoleh = []
const daftarAsal = String(process.env.ALLOWED_ORIGINS || '').split(',')

for (let i = 0; i < daftarAsal.length; i++) {
  const asal = daftarAsal[i].trim()

  if (asal) {
    asalBoleh.push(asal)
  }
}

const dilarang = ['/server', '/claude.md', '/readme.md', '/readme.txt', '/prepros-6.config', '/assets/scss', '/license']

app.disable('x-powered-by')

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1)
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
})

app.use(cors({
  origin: (asal, callback) => {
    if (!asal || asalBoleh.indexOf(asal) >= 0) {
      return callback(null, true)
    }

    callback(null, false)
  },
  credentials: true
}))

app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.use((req, res, next) => {
  const alamat = req.path.toLowerCase()

  for (let i = 0; i < dilarang.length; i++) {
    if (alamat.indexOf(dilarang[i]) === 0) {
      return res.status(404).json({ message: 'Halaman tidak ditemukan' })
    }
  }

  next()
})

app.use(express.static(path.join(__dirname, '..')))

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend server berjalan dengan baik',
    timestamp: new Date()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/chat', chatRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Alamat API tidak ditemukan' })
})

app.use((err, req, res, next) => {
  console.log('kesalahan server:', err.message)

  if (res.headersSent) {
    return res.end()
  }

  res.status(500).json({ message: 'Terjadi kesalahan di server' })
})

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Server berjalan di http://localhost:' + PORT)
    console.log('Dokumentasi API di http://localhost:' + PORT + '/api-docs')
  })
}

module.exports = app
