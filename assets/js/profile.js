const profileNama = document.getElementById('profileNama')
const profileEmail = document.getElementById('profileEmail')
const infoNama = document.getElementById('infoNama')
const infoEmail = document.getElementById('infoEmail')
const profileAvatarBox = document.getElementById('profileAvatarBox')
const btnProfileLogout = document.getElementById('btnProfileLogout')
const btnKembaliProfile = document.getElementById('btnKembaliProfile')
const btnUbahNama = document.getElementById('btnUbahNama')

let dataProfilAktif = null

if (btnKembaliProfile) {
	btnKembaliProfile.addEventListener('click', function (e) {
		e.preventDefault()
		const referrer = document.referrer
		if (referrer && referrer.indexOf('login.html') === -1 && referrer.indexOf('profile.html') === -1) {
			window.location.href = referrer
		} else {
			const simpanan = sessionStorage.getItem('halamanSebelumnya')
			if (simpanan && simpanan.indexOf('login.html') === -1 && simpanan.indexOf('profile.html') === -1) {
				window.location.href = simpanan
			} else {
				window.location.href = 'index.html'
			}
		}
	})
}

function perbaruiTampilanProfil(nama, email, foto) {
	const namaFinal = nama || 'Pengguna WhisperCart'
	const emailFinal = email || 'ryukacoy@gmail.com'
	const inisial = namaFinal.charAt(0).toUpperCase()

	if (profileNama) profileNama.textContent = namaFinal
	if (infoNama) infoNama.textContent = namaFinal
	if (profileEmail) profileEmail.textContent = emailFinal
	if (infoEmail) infoEmail.textContent = emailFinal

	if (profileAvatarBox) {
		if (foto) {
			profileAvatarBox.innerHTML = `<img src="${foto}" class="w-100 h-100 rounded-circle" style="object-fit: cover;" alt="${namaFinal}">`
		} else {
			profileAvatarBox.textContent = inisial
		}
	}
}

async function muatProfilUser() {
	let dataUser = null

	try {
		const res = await fetch('/api/auth/user', { credentials: 'same-origin' })
		if (res.ok) {
			dataUser = await res.json()
		}
	} catch (e) {
		dataUser = null
	}

	const simpananLocal = localStorage.getItem('userProfil')
	let dataLocal = null
	if (simpananLocal) {
		try {
			dataLocal = JSON.parse(simpananLocal)
		} catch (e) {
			dataLocal = null
		}
	}

	let namaFinal = (dataUser && dataUser.nama) ? dataUser.nama : 'Pengguna WhisperCart'
	let emailFinal = (dataUser && dataUser.email) ? dataUser.email : 'ryukacoy@gmail.com'
	let fotoFinal = (dataUser && dataUser.foto) ? dataUser.foto : ''

	if (dataLocal) {
		if (dataLocal.nama) namaFinal = dataLocal.nama
		if (dataLocal.email) emailFinal = dataLocal.email
		if (dataLocal.foto) fotoFinal = dataLocal.foto
	}

	dataProfilAktif = { nama: namaFinal, email: emailFinal, foto: fotoFinal }
	localStorage.setItem('userProfil', JSON.stringify(dataProfilAktif))
	localStorage.setItem('wc_user', JSON.stringify(dataProfilAktif))

	perbaruiTampilanProfil(namaFinal, emailFinal, fotoFinal)
}

if (btnUbahNama) {
	btnUbahNama.addEventListener('click', function () {
		const namaLama = dataProfilAktif ? dataProfilAktif.nama : 'Pengguna WhisperCart'
		const namaBaru = prompt('Masukkan nama lengkap baru Anda:', namaLama)
		if (namaBaru !== null && namaBaru.trim() !== '') {
			const namaBersih = namaBaru.trim()
			if (!dataProfilAktif) {
				dataProfilAktif = { nama: namaBersih, email: 'ryukacoy@gmail.com', foto: '' }
			} else {
				dataProfilAktif.nama = namaBersih
			}
			localStorage.setItem('userProfil', JSON.stringify(dataProfilAktif))
			localStorage.setItem('wc_user', JSON.stringify(dataProfilAktif))
			perbaruiTampilanProfil(dataProfilAktif.nama, dataProfilAktif.email, dataProfilAktif.foto)
		}
	})
}

if (btnProfileLogout) {
	btnProfileLogout.addEventListener('click', async function () {
		try {
			await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
		} catch (e) {}
		localStorage.removeItem('isLoggedIn')
		localStorage.removeItem('userProfil')
		window.location.href = 'index.html'
	})
}

muatProfilUser()
