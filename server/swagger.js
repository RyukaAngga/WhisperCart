const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'WhisperCart API',
    version: '1.0.0',
    description: 'API backend WhisperCart. Login memakai email dan password atau akun Google lewat Supabase. Data produk dan pesanan disimpan di database Supabase, asisten AI memakai OpenRouter.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Server lokal'
    }
  ],
  tags: [
    { name: 'Status', description: 'Cek kondisi server' },
    { name: 'Auth', description: 'Daftar, login memakai email dan password atau akun Google, dan logout' },
    { name: 'Products', description: 'Data produk dan sinkronisasi katalog eksternal' },
    { name: 'Orders', description: 'Pesanan milik pengguna yang sedang login' },
    { name: 'Chat', description: 'Asisten AI WhisperCart dengan jawaban streaming' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          external_id: { type: 'string', example: '15' },
          title: { type: 'string', example: 'Nordic Comfort Bundle' },
          description: { type: 'string', example: 'Sofa minimalis bahan kain premium' },
          price: { type: 'number', example: 50 },
          category: { type: 'string', example: 'furniture' },
          image: { type: 'string', example: 'https://contoh.com/produk.png' },
          stock: { type: 'integer', example: 10 }
        }
      },
      ProductInput: {
        type: 'object',
        required: ['title', 'price'],
        properties: {
          external_id: { type: 'string', example: '15' },
          title: { type: 'string', example: 'Nordic Comfort Bundle' },
          description: { type: 'string', example: 'Sofa minimalis bahan kain premium' },
          price: { type: 'number', example: 50 },
          category: { type: 'string', example: 'furniture' },
          image: { type: 'string', example: 'https://contoh.com/produk.png' },
          stock: { type: 'integer', example: 10 }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'string', example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f' },
          email: { type: 'string', example: 'siswa@gmail.com' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'integer', example: 1 },
                title: { type: 'string', example: 'Nordic Comfort Bundle' },
                price: { type: 'number', example: 50 },
                quantity: { type: 'integer', example: 2 }
              }
            }
          },
          total: { type: 'number', example: 100 },
          status: { type: 'string', example: 'pending' }
        }
      },
      OrderInput: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'integer', example: 1 },
                quantity: { type: 'integer', example: 2 }
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '8f0c1d2e-3a4b-5c6d-7e8f-9a0b1c2d3e4f' },
          email: { type: 'string', example: 'siswa@gmail.com' },
          nama: { type: 'string', example: 'Arief' },
          foto: { type: 'string', example: 'https://lh3.googleusercontent.com/foto.jpg' }
        }
      },
      Pesan: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Anda belum login' }
        }
      }
    }
  },
  paths: {
    '/api/status': {
      get: {
        tags: ['Status'],
        summary: 'Cek apakah server berjalan',
        responses: {
          200: {
            description: 'Server berjalan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'online' },
                    message: { type: 'string', example: 'Backend server berjalan dengan baik' },
                    timestamp: { type: 'string', example: '2026-08-13T07:00:00.000Z' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Daftar akun baru memakai email dan password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  nama: { type: 'string', example: 'Arief' },
                  email: { type: 'string', example: 'siswa@gmail.com' },
                  password: { type: 'string', example: 'rahasia123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Pendaftaran berhasil. Jika konfirmasi email aktif, perluKonfirmasi bernilai true',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Pendaftaran berhasil' },
                    perluKonfirmasi: { type: 'boolean', example: false }
                  }
                }
              }
            }
          },
          400: {
            description: 'Data tidak sah atau email sudah terpakai',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          429: {
            description: 'Terlalu banyak percobaan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login memakai email dan password',
        description: 'Jika berhasil, server memasang cookie token yang bersifat httpOnly.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'siswa@gmail.com' },
                  password: { type: 'string', example: 'rahasia123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          400: {
            description: 'Data tidak sah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Email atau password salah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          429: {
            description: 'Terlalu banyak percobaan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Mulai login dengan akun Google',
        description: 'Membuka halaman login Google. Buka alamat ini langsung di browser, jangan lewat tombol Try it out.',
        responses: {
          302: { description: 'Diarahkan ke halaman login Google' },
          500: {
            description: 'Gagal membuat alamat login',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/auth/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Alamat balikan dari Google',
        description: 'Dipanggil otomatis oleh Supabase setelah pengguna selesai login di Google.',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Kode login dari Supabase'
          }
        ],
        responses: {
          302: { description: 'Login berhasil, cookie token dipasang lalu diarahkan ke halaman depan' },
          400: {
            description: 'Kode login tidak ada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Kode login tidak sah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/auth/user': {
      get: {
        tags: ['Auth'],
        summary: 'Lihat data pengguna yang sedang login',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Data pengguna',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Keluar dari akun',
        responses: {
          200: {
            description: 'Berhasil logout',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Ambil daftar produk',
        parameters: [
          {
            name: 'kategori',
            in: 'query',
            schema: { type: 'string' },
            description: 'Saring produk berdasarkan kategori'
          },
          {
            name: 'cari',
            in: 'query',
            schema: { type: 'string' },
            description: 'Cari produk berdasarkan nama'
          }
        ],
        responses: {
          200: {
            description: 'Daftar produk',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Products'],
        summary: 'Tambah produk baru (khusus admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
        },
        responses: {
          201: {
            description: 'Produk berhasil ditambah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          400: {
            description: 'Data tidak lengkap',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/products/sync': {
      post: {
        tags: ['Products'],
        summary: 'Tarik data produk dari katalog eksternal (khusus admin)',
        description: 'Mengambil produk dari alamat katalog di berkas .env lalu menyimpannya ke tabel products. Produk dengan external_id yang sama akan ditimpa.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Sinkronisasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Sinkronisasi katalog berhasil' },
                    jumlah: { type: 'integer', example: 100 }
                  }
                }
              }
            }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          502: {
            description: 'Katalog eksternal tidak bisa dihubungi',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Ambil satu produk',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Data produk',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          404: {
            description: 'Produk tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Ubah data produk (khusus admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
        },
        responses: {
          200: {
            description: 'Produk berhasil diubah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          404: {
            description: 'Produk tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Hapus produk (khusus admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Produk berhasil dihapus',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          404: {
            description: 'Produk tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Ambil daftar pesanan milik sendiri',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: 'Daftar pesanan',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
              }
            }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      },
      post: {
        tags: ['Orders'],
        summary: 'Buat pesanan baru',
        description: 'Total harga dihitung ulang di server memakai harga produk dari database.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } }
        },
        responses: {
          201: {
            description: 'Pesanan berhasil dibuat',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } }
          },
          400: {
            description: 'Item pesanan kosong',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          404: {
            description: 'Produk tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Ambil satu pesanan milik sendiri',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Data pesanan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          404: {
            description: 'Pesanan tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Ubah status pesanan',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', example: 'dibayar' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Status berhasil diubah',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } }
          },
          400: {
            description: 'Status kosong',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          404: {
            description: 'Pesanan tidak ditemukan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    },
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Tanya asisten AI WhisperCart',
        description: 'Jawaban dikirim potongan demi potongan memakai Server-Sent Events. Setiap potongan berbentuk baris "data: {"teks":"..."}" dan diakhiri baris "data: [SELESAI]". Halaman Swagger hanya menampilkan teks mentahnya.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pesan'],
                properties: {
                  pesan: {
                    type: 'string',
                    maxLength: 2000,
                    example: 'Carikan sofa untuk ruang tamu kecil budget 2 juta'
                  },
                  riwayat: {
                    type: 'array',
                    maxItems: 20,
                    items: {
                      type: 'object',
                      properties: {
                        peran: { type: 'string', enum: ['user', 'ai'], example: 'user' },
                        isi: { type: 'string', example: 'Halo' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Aliran jawaban asisten AI',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  example: 'data: {"teks":"Baik, "}\n\ndata: {"teks":"saya carikan."}\n\ndata: [SELESAI]\n\n'
                }
              }
            }
          },
          400: {
            description: 'Pesan kosong atau terlalu panjang',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          401: {
            description: 'Belum login, atau tidak punya hak akses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          429: {
            description: 'Terlalu banyak pesan dalam satu menit',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          502: {
            description: 'Asisten AI tidak bisa dihubungi',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          },
          503: {
            description: 'OPENROUTER_API_KEY belum diisi di server',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } }
          }
        }
      }
    }
  }
}

module.exports = swaggerDocument
