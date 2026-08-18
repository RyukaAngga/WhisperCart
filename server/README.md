# WhisperCart Backend

Backend Express dengan autentikasi Supabase (email password dan Google), database Supabase,
asisten AI streaming lewat OpenRouter, dan dokumentasi Swagger.

## 1. Persiapan Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel isi berkas `database.sql`, lalu jalankan. Tabel `products` dan `orders` akan terbuat.
3. Buka **Authentication → Providers → Google**, aktifkan, lalu isi **Client ID** dan **Client Secret** dari Google Cloud Console.
   - Di Google Cloud Console, tambahkan Authorized redirect URI:
     `https://<project-anda>.supabase.co/auth/v1/callback`
4. Buka **Authentication → URL Configuration**, tambahkan ke **Redirect URLs**:
   `http://localhost:5000/api/auth/callback`
5. Buka **Project Settings → API**, salin **Project URL**, **anon key**, dan **service_role key**.

Kalau ingin akun baru bisa langsung dipakai tanpa buka email, matikan
**Authentication → Providers → Email → Confirm email**.

## 2. Persiapan OpenRouter

1. Daftar di [openrouter.ai](https://openrouter.ai), lalu buat API key.
2. Isi `OPENROUTER_API_KEY` dan pilih model di `OPENROUTER_MODEL`.

## 3. Isi berkas .env

Salin `.env.example` menjadi `.env`, lalu isi:

| Nama | Keterangan |
| --- | --- |
| `PORT` | Port server, standarnya 5000 |
| `SUPABASE_URL` | Project URL dari Supabase |
| `SUPABASE_ANON_KEY` | anon key, dipakai untuk login |
| `SUPABASE_SERVICE_KEY` | service_role key, **rahasia**, hanya dipakai di server |
| `CALLBACK_URL` | Alamat balikan login Google |
| `FRONTEND_URL` | Halaman tujuan setelah login berhasil, isi `http://localhost:5000/dashboard.html` |
| `CATALOG_URL` | Alamat katalog produk eksternal |
| `OPENROUTER_API_KEY` | API key OpenRouter untuk asisten AI |
| `OPENROUTER_MODEL` | Nama model, contoh `openai/gpt-4o-mini` |
| `ALLOWED_ORIGINS` | Daftar origin yang boleh memanggil API, dipisah koma |
| `ADMIN_EMAILS` | Daftar email yang boleh mengelola produk, dipisah koma |
| `COOKIE_SECURE` | Isi `true` kalau website sudah dipasang di HTTPS |
| `TRUST_PROXY` | Isi `true` hanya kalau server berada di belakang proxy atau hosting |

Ada satu pengaturan tambahan yang boleh dikosongkan, yaitu `OPENROUTER_URL`.
Isi hanya kalau ingin memakai alamat lain selain `https://openrouter.ai/api/v1/chat/completions`.

## 4. Menjalankan server

```
npm install
npm start
```

Server berjalan di `http://localhost:5000` dan sekaligus melayani halaman website di folder induk.

- Landing page: http://localhost:5000/index.html
- Halaman login: http://localhost:5000/login.html
- Dashboard pengguna: http://localhost:5000/dashboard.html
- Dokumentasi API: http://localhost:5000/api-docs

Buka website lewat alamat di atas, jangan lewat `file://`, supaya cookie login bisa bekerja.

## 5. Alur login

**Email dan password**

1. Pengguna mengisi form di `login.html`, lalu ditembakkan ke `POST /api/auth/register` atau `POST /api/auth/login`.
2. Server memasang cookie `token` yang httpOnly, lalu browser dialihkan ke `dashboard.html`.

**Google**

1. Pengguna menekan tombol **Masuk dengan Google**, browser menuju `/api/auth/google`.
2. Server menyiapkan kode PKCE, menyimpannya di cookie sementara, lalu meneruskan ke halaman login Google.
3. Setelah berhasil, Google mengembalikan ke `/api/auth/callback`.
4. Server menukar kode login menjadi token, memasang cookie `token`, lalu mengarahkan ke `FRONTEND_URL`.

Kalau login Google gagal, pengguna dikembalikan ke `login.html?error=...` dan pesannya ditampilkan dalam Bahasa Indonesia.

## 6. Katalog produk eksternal

Tabel `products` diisi dari katalog eksternal lewat endpoint `POST /api/products/sync` (khusus admin).
Alamat katalog diatur di `CATALOG_URL`. Kolom `external_id` menyimpan id asli dari katalog,
jadi sinkronisasi ulang akan menimpa data lama, bukan menggandakan.

Isi email Anda di `ADMIN_EMAILS` supaya bisa menjalankan sinkronisasi dan mengelola produk.

## 7. Asisten AI

`POST /api/chat` mengirim jawaban potongan demi potongan memakai Server-Sent Events.
Bentuk tiap potongan adalah `data: {"teks":"..."}` dan aliran ditutup dengan `data: [SELESAI]`.
Setiap pengguna dibatasi 15 pesan per menit.

## 8. Daftar endpoint

| Method | Alamat | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/api/status` | umum | Cek server |
| POST | `/api/auth/register` | umum | Daftar akun email dan password |
| POST | `/api/auth/login` | umum | Masuk memakai email dan password |
| GET | `/api/auth/google` | umum | Mulai login Google |
| GET | `/api/auth/callback` | umum | Balikan dari Google |
| GET | `/api/auth/user` | login | Data pengguna yang sedang login |
| POST | `/api/auth/logout` | umum | Hapus cookie token |
| GET | `/api/products` | umum | Daftar produk, bisa `?kategori=`, `?cari=`, `?batas=` |
| GET | `/api/products/:id` | umum | Satu produk |
| POST | `/api/products` | admin | Tambah produk |
| PUT | `/api/products/:id` | admin | Ubah produk |
| DELETE | `/api/products/:id` | admin | Hapus produk |
| POST | `/api/products/sync` | admin | Tarik data dari katalog eksternal |
| GET | `/api/orders` | login | Daftar pesanan sendiri |
| GET | `/api/orders/:id` | login | Satu pesanan sendiri |
| POST | `/api/orders` | login | Buat pesanan, total dihitung di server |
| PUT | `/api/orders/:id/status` | login | Ubah status pesanan sendiri |
| POST | `/api/chat` | login | Tanya asisten AI, jawaban streaming |
