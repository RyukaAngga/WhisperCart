function perbaruiBadgeNavPublik() {
	const badges = document.querySelectorAll('.badge-keranjang, #badgeKeranjang')
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

	for (let i = 0; i < badges.length; i++) {
		const b = badges[i]
		b.textContent = total
		if (total > 0) {
			b.style.display = 'inline-flex'
		} else {
			b.style.display = 'none'
		}
	}
}

async function sinkronisasiStatusUserPublik() {
	const navUserItem = document.getElementById('navUserPublicItem')
	if (!navUserItem) {
		return
	}

	let dataUser = null

	try {
		const respon = await fetch('/api/auth/user', { credentials: 'same-origin' })
		if (respon.ok) {
			dataUser = await respon.json()
			localStorage.setItem('isLoggedIn', 'true')
			localStorage.setItem('wc_user', JSON.stringify(dataUser))
		} else {
			localStorage.removeItem('isLoggedIn')
			localStorage.removeItem('wc_user')
		}
	} catch (e) {
		const simpanan = localStorage.getItem('wc_user')
		if (simpanan && localStorage.getItem('isLoggedIn') === 'true') {
			try {
				dataUser = JSON.parse(simpanan)
			} catch (err) {}
		}
	}

	if (!dataUser) {
		navUserItem.innerHTML = '<a class="nav-link d-flex align-items-center" href="login.html" id="linkUserNav" title="Masuk / Daftar"><img src="assets/images/user.svg" alt="User"></a>'
		return
	}

	const namaPendek = (dataUser.nama || dataUser.email.split('@')[0])
	const inisial = namaPendek.charAt(0).toUpperCase()

	navUserItem.className = 'nav-item dropdown position-relative'
	navUserItem.innerHTML = ''

	const tombol = document.createElement('a')
	tombol.className = 'nav-link d-flex align-items-center gap-2 user-pill-nav'
	tombol.href = 'javascript:void(0)'
	tombol.setAttribute('data-bs-toggle', 'dropdown')
	tombol.setAttribute('aria-expanded', 'false')
	tombol.title = dataUser.nama + ' (' + dataUser.email + ')'

	const ava = document.createElement('div')
	ava.className = 'nav-avatar-circle'
	ava.textContent = inisial

	const spanNama = document.createElement('span')
	spanNama.className = 'nav-nama-user d-none d-sm-inline'
	spanNama.textContent = namaPendek

	const iconPanah = document.createElement('span')
	iconPanah.className = 'nav-panah-dropdown'
	iconPanah.innerHTML = '&#9662;'

	tombol.appendChild(ava)
	tombol.appendChild(spanNama)
	tombol.appendChild(iconPanah)

	const menu = document.createElement('div')
	menu.className = 'dropdown-menu dropdown-menu-end shadow-lg border-0 p-2 menu-profil-nav'

	const headerMenu = document.createElement('div')
	headerMenu.className = 'px-3 py-2 border-bottom mb-2'
	headerMenu.innerHTML = '<div class="fw-bold text-dark text-truncate">' + dataUser.nama + '</div><div class="small text-muted text-truncate">' + dataUser.email + '</div><span class="badge bg-success mt-1" style="font-size: 0.7rem;">Member WhisperCart</span>'

	const linkDashboard = document.createElement('a')
	linkDashboard.className = 'dropdown-item py-2 rounded d-flex align-items-center gap-2'
	linkDashboard.href = 'dashboard.html'
	linkDashboard.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg><span>Dashboard Member</span>'

	const linkAI = document.createElement('a')
	linkAI.className = 'dropdown-item py-2 rounded d-flex align-items-center gap-2'
	linkAI.href = 'ai.html'
	linkAI.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.7-1.17L2 22l1.17-5.3A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z"></path></svg><span>Whisper AI Assistant</span>'

	const linkPesanan = document.createElement('a')
	linkPesanan.className = 'dropdown-item py-2 rounded d-flex align-items-center gap-2'
	linkPesanan.href = 'orders.html'
	linkPesanan.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg><span>Riwayat Pesanan</span>'

	const divider = document.createElement('hr')
	divider.className = 'dropdown-divider my-2'

	const btnKeluar = document.createElement('button')
	btnKeluar.className = 'dropdown-item py-2 rounded text-danger d-flex align-items-center gap-2'
	btnKeluar.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg><span>Keluar / Log Out</span>'

	btnKeluar.addEventListener('click', function (e) {
		e.preventDefault()
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
	})

	menu.appendChild(headerMenu)
	menu.appendChild(linkDashboard)
	menu.appendChild(linkAI)
	menu.appendChild(linkPesanan)
	menu.appendChild(divider)
	menu.appendChild(btnKeluar)

	navUserItem.appendChild(tombol)
	navUserItem.appendChild(menu)
}

document.addEventListener('DOMContentLoaded', function () {
	perbaruiBadgeNavPublik()
	sinkronisasiStatusUserPublik()
})
