const daftarPesanan = document.getElementById('daftarPesanan')
const kosongPesanan = document.getElementById('kosongPesanan')

function formatUang(angka) {
	return '$' + Number(angka).toFixed(2)
}

function kosongkan(wadah) {
	if (!wadah) {
		return
	}
	while (wadah.firstChild) {
		wadah.removeChild(wadah.firstChild)
	}
}

function skeletonPesanan(jumlah) {
	if (!daftarPesanan) {
		return
	}
	kosongkan(daftarPesanan)

	for (let i = 0; i < jumlah; i++) {
		const baris = document.createElement('div')
		baris.className = 'skeleton skeleton-pesanan mb-3 rounded-3'
		daftarPesanan.appendChild(baris)
	}
}

function ambilPesananLokal() {
	const simpanan = localStorage.getItem('pesananSaya')
	if (!simpanan) {
		return []
	}
	try {
		const arr = JSON.parse(simpanan)
		if (Array.isArray(arr)) {
			return arr
		}
	} catch (e) {
		return []
	}
	return []
}

function simpanPesananLokal(arr) {
	localStorage.setItem('pesananSaya', JSON.stringify(arr))
	renderDaftarPesanan(arr)
}

function selesaikanPesanan(idPesanan) {
	const yakin = confirm('Konfirmasi bahwa pesanan ini telah Anda terima dengan baik?')
	if (!yakin) {
		return
	}

	const daftar = ambilPesananLokal()
	for (let i = 0; i < daftar.length; i++) {
		if (String(daftar[i].id) === String(idPesanan)) {
			daftar[i].status = 'Completed'
			break
		}
	}

	simpanPesananLokal(daftar)
	alert('Pesanan ' + idPesanan + ' telah selesai! Terima kasih telah berbelanja di WhisperCart.')
}

function renderDaftarPesanan(data) {
	if (!daftarPesanan) {
		return
	}

	kosongkan(daftarPesanan)

	if (!data || data.length === 0) {
		if (kosongPesanan) {
			kosongPesanan.style.display = 'block'
		}
		return
	}

	if (kosongPesanan) {
		kosongPesanan.style.display = 'none'
	}

	for (let i = 0; i < data.length; i++) {
		const pesanan = data[i]
		const status = pesanan.status || 'Processing'
		const isSelesai = status === 'Completed' || status === 'selesai'

		const kartu = document.createElement('div')
		kartu.className = 'border rounded-4 p-3 p-md-4 mb-4 bg-white shadow-sm'

		const kepala = document.createElement('div')
		kepala.className = 'd-flex align-items-center justify-content-between flex-wrap gap-2 pb-3 mb-3 border-bottom'

		const infoKiri = document.createElement('div')
		infoKiri.innerHTML = '<div class="fw-bold fs-6 text-dark">Nomor Pesanan: <span class="text-primary">#' + pesanan.id + '</span></div><div class="small text-muted">' + (pesanan.tanggal || 'Hari ini') + ' &bull; Metode: ' + (pesanan.metode || 'QRIS Instant') + '</div>'

		const badgeStatus = document.createElement('span')
		if (isSelesai) {
			badgeStatus.className = 'status-badge-selesai'
			badgeStatus.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="me-1"><polyline points="20 6 9 17 4 12"></polyline></svg>Pesanan Selesai'
		} else {
			badgeStatus.className = 'status-badge-diproses'
			badgeStatus.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Sedang Diproses'
		}

		kepala.appendChild(infoKiri)
		kepala.appendChild(badgeStatus)
		kartu.appendChild(kepala)

		const wadahItems = document.createElement('div')
		wadahItems.className = 'my-3'

		const items = pesanan.items || []
		for (let j = 0; j < items.length; j++) {
			const item = items[j]
			const barisItem = document.createElement('div')
			barisItem.className = 'd-flex align-items-center justify-content-between py-2 border-bottom border-light'

			const itemKiri = document.createElement('div')
			itemKiri.className = 'd-flex align-items-center gap-3'

			const img = document.createElement('img')
			img.src = item.image || 'assets/images/product-1.png'
			img.alt = item.title || 'Produk'
			img.className = 'rounded border p-1 bg-light'
			img.style.width = '48px'
			img.style.height = '48px'
			img.style.objectFit = 'contain'

			const infoBarang = document.createElement('div')
			infoBarang.innerHTML = '<div class="fw-semibold text-dark small">' + (item.title || 'Produk WhisperCart') + '</div><div class="small text-muted">' + (item.jumlah || 1) + ' x ' + formatUang(item.price || 0) + '</div>'

			itemKiri.appendChild(img)
			itemKiri.appendChild(infoBarang)

			const subtotalItem = document.createElement('div')
			subtotalItem.className = 'fw-bold text-dark small'
			subtotalItem.textContent = formatUang((Number(item.price) || 0) * (item.jumlah || 1))

			barisItem.appendChild(itemKiri)
			barisItem.appendChild(subtotalItem)
			wadahItems.appendChild(barisItem)
		}

		kartu.appendChild(wadahItems)

		const kaki = document.createElement('div')
		kaki.className = 'd-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top'

		const totalWrap = document.createElement('div')
		totalWrap.innerHTML = '<span class="small text-muted">Total Pembayaran: </span><span class="fs-5 fw-bold text-success">' + formatUang(pesanan.total) + '</span>'

		const aksiWrap = document.createElement('div')
		aksiWrap.className = 'd-flex gap-2'

		if (!isSelesai) {
			const btnSelesai = document.createElement('button')
			btnSelesai.className = 'btn btn-sm btn-success px-3 fw-semibold rounded-pill d-flex align-items-center gap-1'
			btnSelesai.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Selesaikan Pesanan</span>'
			btnSelesai.addEventListener('click', function () {
				selesaikanPesanan(pesanan.id)
			})
			aksiWrap.appendChild(btnSelesai)
		}

		kaki.appendChild(totalWrap)
		kaki.appendChild(aksiWrap)
		kartu.appendChild(kaki)

		daftarPesanan.appendChild(kartu)
	}
}

async function muatDaftarPesanan() {
	if (!daftarPesanan) {
		return
	}

	skeletonPesanan(2)

	let data = ambilPesananLokal()

	try {
		const jawaban = await fetch('/api/orders', { credentials: 'same-origin' })
		if (jawaban.status === 401) {
			window.location.href = 'login.html'
			return
		}
		if (jawaban.ok) {
			const dataServer = await jawaban.json()
			if (Array.isArray(dataServer) && dataServer.length > 0) {
				const mapSudahAda = {}
				for (let i = 0; i < data.length; i++) {
					mapSudahAda[String(data[i].id)] = true
				}
				for (let j = 0; j < dataServer.length; j++) {
					const s = dataServer[j]
					if (!mapSudahAda[String(s.id)]) {
						data.push({
							id: s.id,
							tanggal: 'Baru saja',
							total: s.total,
							metode: 'Online Pay',
							status: s.status || 'Processing',
							items: s.items || []
						})
					}
				}
			}
		}
	} catch (e) {}

	renderDaftarPesanan(data)
}

document.addEventListener('DOMContentLoaded', muatDaftarPesanan)
