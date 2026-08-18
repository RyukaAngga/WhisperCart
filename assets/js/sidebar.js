const elemenSidebar = document.getElementById('sidebarApp')
const tombolToggleSidebar = document.getElementById('btnToggleSidebar')
const areaKontenUtama = document.getElementById('kontenUtamaApp')
const inputCariSidebar = document.getElementById('inputCariSidebar')
const wadahAvatarSidebar = document.getElementById('sidebarAvatar')
const namaUserSidebar = document.getElementById('sidebarNamaUser')
const emailUserSidebar = document.getElementById('sidebarEmailUser')
const tombolKeluarSidebar = document.getElementById('btnKeluarSidebar')
const badgeKeranjangSidebar = document.getElementById('sidebarBadgeKeranjang')
const badgeKeranjangHeader = document.getElementById('headerBadgeKeranjang')
const tombolMobileMenu = document.getElementById('btnMobileMenu')
const backdropSidebar = document.getElementById('sidebarBackdrop')
const btnHeaderProfil = document.getElementById('btnHeaderProfil')

let modalProfilBackdrop = null

function perbaruiSidebarBadge() {
	let total = 0
	const simpanan = localStorage.getItem('keranjang')

	if (simpanan) {
		try {
			const data = JSON.parse(simpanan)
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					total = total + (data[i].jumlah || 1)
				}
			}
		} catch (e) {
			total = 0
		}
	}

	if (badgeKeranjangSidebar) {
		badgeKeranjangSidebar.textContent = total
		if (total > 0) {
			badgeKeranjangSidebar.style.display = 'inline-flex'
		} else {
			badgeKeranjangSidebar.style.display = 'none'
		}
	}

	if (badgeKeranjangHeader) {
		badgeKeranjangHeader.textContent = total
		if (total > 0) {
			badgeKeranjangHeader.style.display = 'inline-flex'
		} else {
			badgeKeranjangHeader.style.display = 'none'
		}
	}

	const semuaBadgeMerah = document.querySelectorAll('.badge-merah, .badge-keranjang')
	for (let i = 0; i < semuaBadgeMerah.length; i++) {
		semuaBadgeMerah[i].textContent = total
		if (total > 0) {
			semuaBadgeMerah[i].style.display = 'inline-flex'
		} else {
			semuaBadgeMerah[i].style.display = 'none'
		}
	}
}

function pasangStatusSidebar() {
	const statusTersimpan = localStorage.getItem('sidebar_minimized') === 'true'

	if (statusTersimpan && elemenSidebar && window.innerWidth >= 992) {
		elemenSidebar.classList.add('diminimalkan')
		if (areaKontenUtama) {
			areaKontenUtama.classList.add('geser-mini')
		}
		if (tombolToggleSidebar) {
			tombolToggleSidebar.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>'
		}
	}
}

function toggleSidebar() {
	if (!elemenSidebar) {
		return
	}

	if (window.innerWidth < 992) {
		const buka = elemenSidebar.classList.toggle('buka-mobile')
		if (backdropSidebar) {
			backdropSidebar.classList.toggle('aktif', buka)
		}
		return
	}

	const isMini = elemenSidebar.classList.toggle('diminimalkan')

	if (areaKontenUtama) {
		areaKontenUtama.classList.toggle('geser-mini', isMini)
	}

	localStorage.setItem('sidebar_minimized', isMini ? 'true' : 'false')

	if (tombolToggleSidebar) {
		tombolToggleSidebar.innerHTML = isMini
			? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>'
			: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>'
	}
}

function tutupSidebarMobile() {
	if (elemenSidebar) {
		elemenSidebar.classList.remove('buka-mobile')
	}
	if (backdropSidebar) {
		backdropSidebar.classList.remove('aktif')
	}
}

function buatModalProfil(dataUser) {
	if (document.getElementById('modalProfilUserBackdrop')) {
		return
	}

	const backdrop = document.createElement('div')
	backdrop.className = 'modal-profil-backdrop'
	backdrop.id = 'modalProfilUserBackdrop'

	const nama = dataUser.nama || 'Pengguna WhisperCart'
	const email = dataUser.email || 'user@whispercart.com'
	const inisial = nama.charAt(0).toUpperCase()
	let avatarHtml = inisial
	if (dataUser.foto) {
		avatarHtml = `<img src="${dataUser.foto}" class="w-100 h-100 rounded-circle" style="object-fit: cover;" alt="${nama}">`
	}

	let totalItemKeranjang = 0
	const simpananKeranjang = localStorage.getItem('keranjang')
	if (simpananKeranjang) {
		try {
			const arr = JSON.parse(simpananKeranjang)
			if (Array.isArray(arr)) {
				for (let i = 0; i < arr.length; i++) {
					totalItemKeranjang += (arr[i].jumlah || 1)
				}
			}
		} catch (e) {}
	}

	let totalPesanan = 0
	const simpananPesanan = localStorage.getItem('pesananSaya')
	if (simpananPesanan) {
		try {
			const arrPesanan = JSON.parse(simpananPesanan)
			if (Array.isArray(arrPesanan)) {
				totalPesanan = arrPesanan.length
			}
		} catch (e) {}
	}

	const kartu = document.createElement('div')
	kartu.className = 'modal-profil-card'

	kartu.innerHTML = `
		<div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
			<h5 class="fw-bold mb-0 text-dark">Profil Pengguna</h5>
			<button type="button" class="btn-close" id="btnTutupModalProfil" aria-label="Close"></button>
		</div>
		<div class="text-center my-3">
			<div class="mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 68px; height: 68px; border-radius: 50%; background: #eef5f2; color: #233b33; font-size: 1.6rem; border: 2px solid #3b5d50; overflow: hidden;">
				${avatarHtml}
			</div>
			<h5 class="fw-bold text-dark mb-1" id="modalProfilNamaTeks">${nama}</h5>
			<p class="text-muted small mb-2" id="modalProfilEmailTeks">${email}</p>
			<span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill" style="font-size: 0.75rem;">Member Aktif WhisperCart</span>
		</div>
		<div class="row g-2 my-3 text-center">
			<div class="col-6">
				<div class="p-2 rounded bg-light border">
					<div class="small text-muted">Item Keranjang</div>
					<div class="fw-bold fs-5 text-dark" id="modalProfilCountKeranjang">${totalItemKeranjang}</div>
				</div>
			</div>
			<div class="col-6">
				<div class="p-2 rounded bg-light border">
					<div class="small text-muted">Total Pesanan</div>
					<div class="fw-bold fs-5 text-dark" id="modalProfilCountPesanan">${totalPesanan}</div>
				</div>
			</div>
		</div>
		<div class="d-flex flex-column gap-2 mt-4">
			<a href="dashboard.html" class="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
				<span>Belanja Produk</span>
			</a>
			<button class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold" id="btnKeluarModalAksi">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
				<span>Keluar / Log Out</span>
			</button>
		</div>
	`

	backdrop.appendChild(kartu)
	document.body.appendChild(backdrop)
	modalProfilBackdrop = backdrop

	const btnTutup = document.getElementById('btnTutupModalProfil')
	if (btnTutup) {
		btnTutup.addEventListener('click', tutupModalProfil)
	}

	backdrop.addEventListener('click', function (e) {
		if (e.target === backdrop) {
			tutupModalProfil()
		}
	})

	const btnKeluarAksi = document.getElementById('btnKeluarModalAksi')
	if (btnKeluarAksi) {
		btnKeluarAksi.addEventListener('click', konfirmasiKeluar)
	}
}

function bukaModalProfil() {
	let dataUser = { nama: 'Pengguna WhisperCart', email: 'user@whispercart.com' }
	const simpanan = localStorage.getItem('wc_user')
	if (simpanan) {
		try {
			dataUser = JSON.parse(simpanan)
		} catch (e) {}
	}

	buatModalProfil(dataUser)

	if (modalProfilBackdrop) {
		modalProfilBackdrop.classList.add('aktif')
	}
}

function tutupModalProfil() {
	if (modalProfilBackdrop) {
		modalProfilBackdrop.classList.remove('aktif')
	}
}

function konfirmasiKeluar(e) {
	if (e) e.preventDefault()
	const yakin = confirm('Apakah Anda yakin ingin keluar dari akun WhisperCart?')
	if (yakin) {
		fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).then(function () {
			localStorage.removeItem('isLoggedIn')
			localStorage.removeItem('wc_user')
			window.location.href = 'login.html'
		}).catch(function () {
			localStorage.removeItem('isLoggedIn')
			localStorage.removeItem('wc_user')
			window.location.href = 'login.html'
		})
	}
}

async function muatUserSidebar() {
	let hasil = null

	try {
		const respon = await fetch('/api/auth/user', { credentials: 'same-origin' })
		if (respon.ok) {
			hasil = await respon.json()
			localStorage.setItem('isLoggedIn', 'true')
			localStorage.setItem('wc_user', JSON.stringify(hasil))
		} else {
			localStorage.removeItem('isLoggedIn')
			localStorage.removeItem('wc_user')
			window.location.href = 'login.html'
			return
		}
	} catch (e) {
		const simpanan = localStorage.getItem('wc_user')
		if (simpanan) {
			try {
				hasil = JSON.parse(simpanan)
			} catch (err) {}
		}
	}

	if (!hasil) {
		hasil = { nama: 'Pengguna WhisperCart', email: 'user@whispercart.com' }
	}

	const nama = hasil.nama || 'Pengguna WhisperCart'
	const email = hasil.email || 'user@whispercart.com'
	const inisial = nama.charAt(0).toUpperCase()

	if (namaUserSidebar) {
		namaUserSidebar.textContent = nama
	}

	if (emailUserSidebar) {
		emailUserSidebar.textContent = email
	}

	if (wadahAvatarSidebar) {
		while (wadahAvatarSidebar.firstChild) {
			wadahAvatarSidebar.removeChild(wadahAvatarSidebar.firstChild)
		}

		if (hasil.foto) {
			const img = document.createElement('img')
			img.src = hasil.foto
			img.alt = nama
			img.className = 'sidebar-avatar'
			wadahAvatarSidebar.appendChild(img)
		} else {
			const boxInisial = document.createElement('div')
			boxInisial.className = 'sidebar-avatar-inisial'
			boxInisial.textContent = inisial
			wadahAvatarSidebar.appendChild(boxInisial)
		}
	}

	const sidebarProfilInfo = document.querySelector('.sidebar-profil-info')
	if (sidebarProfilInfo) {
		sidebarProfilInfo.style.cursor = 'pointer'
		sidebarProfilInfo.title = 'Lihat Profil: ' + nama + ' (' + email + ')'
		sidebarProfilInfo.onclick = bukaModalProfil
	}

	if (btnHeaderProfil) {
		btnHeaderProfil.onclick = bukaModalProfil
		btnHeaderProfil.title = 'Lihat Profil: ' + nama
		const textHeader = btnHeaderProfil.querySelector('.header-profil-nama')
		if (textHeader) {
			textHeader.textContent = nama.split(' ')[0]
		}
		const initialHeader = btnHeaderProfil.querySelector('.header-avatar-circle')
		if (initialHeader) {
			if (hasil.foto) {
				initialHeader.innerHTML = `<img src="${hasil.foto}" class="w-100 h-100 rounded-circle" style="object-fit: cover;" alt="${nama}">`
				initialHeader.style.overflow = 'hidden'
				initialHeader.style.display = 'flex'
				initialHeader.style.alignItems = 'center'
				initialHeader.style.justifyContent = 'center'
			} else {
				initialHeader.innerHTML = inisial
				initialHeader.style.overflow = ''
			}
		}
	}
}

if (tombolToggleSidebar) {
	tombolToggleSidebar.addEventListener('click', toggleSidebar)
}

if (tombolMobileMenu) {
	tombolMobileMenu.addEventListener('click', toggleSidebar)
}

if (backdropSidebar) {
	backdropSidebar.addEventListener('click', tutupSidebarMobile)
}

if (tombolKeluarSidebar) {
	tombolKeluarSidebar.addEventListener('click', konfirmasiKeluar)
}

if (inputCariSidebar) {
	inputCariSidebar.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			const kata = inputCariSidebar.value.trim()
			if (window.location.pathname.indexOf('dashboard.html') !== -1 && typeof muatProduk === 'function') {
				muatProduk(kata)
			} else {
				window.location.href = 'dashboard.html?cari=' + encodeURIComponent(kata)
			}
		}
	})
}

pasangStatusSidebar()
perbaruiSidebarBadge()
muatUserSidebar()
