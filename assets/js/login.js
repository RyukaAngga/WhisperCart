let container = document.getElementById('container')

toggle = () => {
	container.classList.toggle('sign-in')
	container.classList.toggle('sign-up')
}

setTimeout(() => {
	container.classList.add('sign-in')
}, 200)

const pesanMasuk = document.getElementById('pesanMasuk')
const pesanDaftar = document.getElementById('pesanDaftar')
const tombolMasuk = document.getElementById('tombolMasuk')
const tombolDaftar = document.getElementById('tombolDaftar')

function tampilkanPesan(kotak, teks, jenis) {
	kotak.textContent = teks
	kotak.className = 'pesan ' + jenis
}

function bersihkanPesan(kotak) {
	kotak.textContent = ''
	kotak.className = 'pesan'
}

function bacaKesalahanAlamat() {
	const alamat = new URLSearchParams(window.location.search)
	const kode = alamat.get('error')

	if (kode === 'kode') {
		tampilkanPesan(pesanMasuk, 'Login Google gagal, kode tidak diterima. Silakan coba lagi.', 'gagal')
	}

	if (kode === 'sesi') {
		tampilkanPesan(pesanMasuk, 'Sesi login Google sudah kedaluwarsa. Silakan ulangi dari awal.', 'gagal')
	}

	if (kode === 'gagal') {
		tampilkanPesan(pesanMasuk, 'Login Google gagal diproses. Silakan coba lagi.', 'gagal')
	}
}

bacaKesalahanAlamat()

async function cekSudahLogin() {
	try {
		const jawaban = await fetch('/api/auth/user', { credentials: 'same-origin' })

		if (jawaban.ok) {
			window.location.href = 'dashboard.html'
		}
	} catch (error) {
		console.log('server belum bisa dihubungi')
	}
}

cekSudahLogin()

async function kirimMasuk() {
	const email = document.getElementById('emailMasuk').value.trim()
	const password = document.getElementById('passwordMasuk').value

	bersihkanPesan(pesanMasuk)

	if (!email || !password) {
		tampilkanPesan(pesanMasuk, 'Email dan password wajib diisi', 'gagal')
		return
	}

	tombolMasuk.disabled = true
	tombolMasuk.textContent = 'Memproses...'

	try {
		const jawaban = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ email: email, password: password })
		})

		const data = await jawaban.json()

		if (!jawaban.ok) {
			tampilkanPesan(pesanMasuk, data.message, 'gagal')
			tombolMasuk.disabled = false
			tombolMasuk.textContent = 'Masuk'
			return
		}

		tampilkanPesan(pesanMasuk, 'Login berhasil, mengalihkan ke dashboard...', 'berhasil')
		localStorage.setItem('isLoggedIn', 'true');
		window.location.href = 'dashboard.html'
	} catch (error) {
		tampilkanPesan(pesanMasuk, 'Tidak bisa menghubungi server, periksa koneksi Anda', 'gagal')
		tombolMasuk.disabled = false
		tombolMasuk.textContent = 'Masuk'
	}
}

async function kirimDaftar() {
	const nama = document.getElementById('namaDaftar').value.trim()
	const email = document.getElementById('emailDaftar').value.trim()
	const password = document.getElementById('passwordDaftar').value
	const ulangi = document.getElementById('ulangiDaftar').value

	bersihkanPesan(pesanDaftar)

	if (!nama || !email || !password) {
		tampilkanPesan(pesanDaftar, 'Nama, email, dan password wajib diisi', 'gagal')
		return
	}

	if (password.length < 8) {
		tampilkanPesan(pesanDaftar, 'Password minimal 8 karakter', 'gagal')
		return
	}

	if (password !== ulangi) {
		tampilkanPesan(pesanDaftar, 'Ulangi password tidak sama', 'gagal')
		return
	}

	tombolDaftar.disabled = true
	tombolDaftar.textContent = 'Memproses...'

	try {
		const jawaban = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ nama: nama, email: email, password: password })
		})

		const data = await jawaban.json()

		if (!jawaban.ok) {
			tampilkanPesan(pesanDaftar, data.message, 'gagal')
			tombolDaftar.disabled = false
			tombolDaftar.textContent = 'Daftar'
			return
		}

		if (data.perluKonfirmasi) {
			tampilkanPesan(pesanDaftar, data.message, 'berhasil')
			tombolDaftar.disabled = false
			tombolDaftar.textContent = 'Daftar'
			return
		}

		tampilkanPesan(pesanDaftar, 'Pendaftaran berhasil, mengalihkan ke dashboard...', 'berhasil')
		localStorage.setItem('isLoggedIn', 'true');
		window.location.href = 'dashboard.html'
	} catch (error) {
		tampilkanPesan(pesanDaftar, 'Tidak bisa menghubungi server, periksa koneksi Anda', 'gagal')
		tombolDaftar.disabled = false
		tombolDaftar.textContent = 'Daftar'
	}
}

tombolMasuk.addEventListener('click', kirimMasuk)
tombolDaftar.addEventListener('click', kirimDaftar)

document.getElementById('passwordMasuk').addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		kirimMasuk()
	}
})

document.getElementById('ulangiDaftar').addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		kirimDaftar()
	}
})
