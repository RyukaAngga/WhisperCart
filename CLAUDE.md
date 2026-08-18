# WhisperCart (Inoventure)

Website e-commerce berbasis template Bootstrap 5 "Furni" (Untree.co, CC-BY 3.0) yang sudah di-rebrand menjadi WhisperCart, ditambah backend Express + Supabase.

## ATURAN PENULISAN KODE (WAJIB DIPATUHI)

Kode di project ini harus terlihat seperti ditulis manual oleh siswa SMK, bukan hasil generate.

1. **DILARANG menulis komentar di dalam kode.** Tidak ada `//`, tidak ada `/* */`, tidak ada JSDoc. Kode harus bersih tanpa dokumentasi inline.
2. **Kode harus sederhana.** Tidak boleh ada abstraksi berlebihan, design pattern, class helper, atau utility generik yang tidak perlu.
3. **Hindari sintaks yang terlihat aneh atau canggih**: destructuring bertingkat, optional chaining bertumpuk, ternary bersarang, arrow function di dalam arrow function, reduce, IIFE, regex rumit. Pakai `if`, `for`, dan `function` biasa.
4. **Yang penting jalan dan tidak error.** Utamakan kode yang lurus dan mudah dibaca daripada kode yang pintar.
5. Nama variabel boleh campur Indonesia/Inggris seperti yang sudah ada (`hasil`, `daftar`, `produk`, `cekLogin`).
6. Pesan error untuk pengguna ditulis dalam Bahasa Indonesia.

Aturan ini berlaku untuk semua perubahan berikutnya, tanpa perlu diingatkan lagi.

## Struktur

```
Inoventure/
├── index.html           landing page publik
├── shop.html about.html services.html blog.html contact.html
├── cart.html checkout.html thankyou.html
├── login.html           halaman masuk dan daftar
├── dashboard.html       halaman khusus pengguna yang sudah login
├── assets/
│   ├── css/             bootstrap.min.css, style.css, tiny-slider.css, login.css, dashboard.css
│   ├── js/              bootstrap.bundle.min.js, tiny-slider.js, custom.js, login.js, dashboard.js
│   ├── images/          semua gambar dan favicon.png
│   └── scss/style.scss  sumber styling utama, dikompilasi ke assets/css/style.css lewat Prepros
└── server/              backend Express
    ├── index.js         entry point, keamanan, static file, swagger, daftar route
    ├── supabase.js      tiga client: supabase (OAuth PKCE), supabaseAuth (email password), supabaseAdmin (database)
    ├── middleware.js    cekLogin dan cekAdmin
    ├── swagger.js       dokumentasi OpenAPI 3.0 (objek biasa, bukan anotasi komentar)
    ├── database.sql     perintah SQL untuk membuat tabel di Supabase
    └── routes/          auth.js, products.js, orders.js, chat.js
```

## Alur halaman

- `index.html` sampai `contact.html` adalah halaman publik, tidak butuh login.
- `login.html` menangani daftar dan masuk (email password serta Google), lalu mengarahkan ke `dashboard.html`.
- `dashboard.html` khusus pengguna yang sudah login: profil, belanja, keranjang, asisten AI, riwayat pesanan.
  Jika belum login, halaman ini otomatis mengarahkan kembali ke `login.html`.

## Catatan penting

- Styling utama diubah di `assets/scss/style.scss` lalu dikompilasi, jangan langsung edit `assets/css/style.css`.
- `assets/css/login.css` dan `assets/css/dashboard.css` berdiri sendiri, tidak ikut SCSS.
- Dokumentasi Swagger ditulis sebagai objek JavaScript di `server/swagger.js`, **bukan** memakai swagger-jsdoc, supaya tidak melanggar aturan larangan komentar.
- Berkas `server/.env` berisi kunci rahasia dan tidak ikut di-commit.
- Data dari database dan dari pengguna ditampilkan memakai `textContent` dan `createElement`, jangan memakai `innerHTML`, supaya tidak ada celah XSS.
- Pesan error dari Supabase tidak boleh dikirim mentah ke browser. Catat dengan `console.log` di server, lalu balas dengan kalimat umum dalam Bahasa Indonesia.
