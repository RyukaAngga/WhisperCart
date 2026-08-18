const tabelKeranjang = document.getElementById('tabelKeranjang')
const wadahKosong = document.getElementById('wadahKosong')
const wadahTabel = document.getElementById('wadahTabel')
const subtotalTeks = document.getElementById('subtotalTeks')
const ongkirTeks = document.getElementById('ongkirTeks')
const pajakTeks = document.getElementById('pajakTeks')
const totalTeks = document.getElementById('totalTeks')
const btnBukaModalBayar = document.getElementById('btnBukaModalBayar')
const modalPembayaranBackdrop = document.getElementById('modalPembayaranBackdrop')
const btnTutupModalBayar = document.getElementById('btnTutupModalBayar')
const btnBatalBayar = document.getElementById('btnBatalBayar')
const modalBayarTotalTeks = document.getElementById('modalBayarTotalTeks')
const formPembayaran = document.getElementById('formPembayaran')
const bayarNama = document.getElementById('bayarNama')
const bayarTelepon = document.getElementById('bayarTelepon')
const bayarAlamat = document.getElementById('bayarAlamat')
const btnTerapkanKupon = document.getElementById('btnTerapkanKupon')

let totalTagihanGlobal = 0

function formatUang(angka) {
	return '$' + Number(angka).toFixed(2)
}

function ambilKeranjang() {
	const simpanan = localStorage.getItem('keranjang')
	if (!simpanan) {
		return []
	}

	try {
		const data = JSON.parse(simpanan)
		if (Array.isArray(data)) {
			return data
		}
	} catch (e) {
		return []
	}

	return []
}

function simpanKeranjang(data) {
	localStorage.setItem('keranjang', JSON.stringify(data))
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}
	renderKeranjang()
}

function ubahJumlah(id, delta) {
	const daftar = ambilKeranjang()

	for (let i = 0; i < daftar.length; i++) {
		if (daftar[i].id === id) {
			daftar[i].jumlah = (daftar[i].jumlah || 1) + delta

			if (daftar[i].jumlah <= 0) {
				daftar.splice(i, 1)
			}
			break
		}
	}

	simpanKeranjang(daftar)
}

function hapusItem(id) {
	const daftar = ambilKeranjang()

	for (let i = 0; i < daftar.length; i++) {
		if (daftar[i].id === id) {
			daftar.splice(i, 1)
			break
		}
	}

	simpanKeranjang(daftar)
}

function renderKeranjang() {
	const daftar = ambilKeranjang()

	if (!tabelKeranjang) {
		return
	}

	while (tabelKeranjang.firstChild) {
		tabelKeranjang.removeChild(tabelKeranjang.firstChild)
	}

	if (daftar.length === 0) {
		if (wadahKosong) wadahKosong.style.display = 'block'
		if (wadahTabel) wadahTabel.style.display = 'none'
		if (subtotalTeks) subtotalTeks.textContent = '$0.00'
		if (ongkirTeks) ongkirTeks.textContent = '$0.00'
		if (pajakTeks) pajakTeks.textContent = '$0.00'
		if (totalTeks) totalTeks.textContent = '$0.00'
		totalTagihanGlobal = 0
		return
	}

	if (wadahKosong) wadahKosong.style.display = 'none'
	if (wadahTabel) wadahTabel.style.display = 'block'

	let total = 0

	for (let i = 0; i < daftar.length; i++) {
		const item = daftar[i]
		const jumlah = item.jumlah || 1
		const totalItem = (Number(item.price) || 0) * jumlah
		total = total + totalItem

		const tr = document.createElement('tr')

		const tdFoto = document.createElement('td')
		tdFoto.style.width = '80px'
		const img = document.createElement('img')
		img.src = item.image || 'assets/images/product-1.png'
		img.alt = item.title
		img.className = 'img-fluid rounded border p-1 bg-light'
		img.style.height = '60px'
		img.style.objectFit = 'contain'
		tdFoto.appendChild(img)

		const tdNama = document.createElement('td')
		const h5 = document.createElement('div')
		h5.className = 'fw-bold text-dark mb-0'
		h5.textContent = item.title
		const spanKat = document.createElement('div')
		spanKat.className = 'small text-muted'
		spanKat.textContent = item.category || 'katalog'
		tdNama.appendChild(h5)
		tdNama.appendChild(spanKat)

		const tdHarga = document.createElement('td')
		tdHarga.className = 'fw-semibold text-dark'
		tdHarga.textContent = formatUang(item.price)

		const tdJumlah = document.createElement('td')
		tdJumlah.className = 'text-center'
		const group = document.createElement('div')
		group.className = 'd-inline-flex align-items-center border rounded-pill overflow-hidden bg-light'

		const btnMin = document.createElement('button')
		btnMin.className = 'btn btn-sm btn-light p-0 border-0 d-flex align-items-center justify-content-center'
		btnMin.type = 'button'
		btnMin.style.width = '28px'
		btnMin.style.height = '28px'
		btnMin.style.borderRadius = '50%'
		btnMin.title = 'Kurangi Jumlah'
		btnMin.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#233b33" stroke-width="2.8"><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
		btnMin.addEventListener('click', function () {
			ubahJumlah(item.id, -1)
		})

		const spanQty = document.createElement('span')
		spanQty.className = 'px-3 fw-bold text-dark fs-6'
		spanQty.style.minWidth = '32px'
		spanQty.textContent = jumlah

		const btnPlus = document.createElement('button')
		btnPlus.className = 'btn btn-sm btn-light p-0 border-0 d-flex align-items-center justify-content-center'
		btnPlus.type = 'button'
		btnPlus.style.width = '28px'
		btnPlus.style.height = '28px'
		btnPlus.style.borderRadius = '50%'
		btnPlus.title = 'Tambah Jumlah'
		btnPlus.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#233b33" stroke-width="2.8"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
		btnPlus.addEventListener('click', function () {
			ubahJumlah(item.id, 1)
		})

		group.appendChild(btnMin)
		group.appendChild(spanQty)
		group.appendChild(btnPlus)
		tdJumlah.appendChild(group)

		const tdTotal = document.createElement('td')
		tdTotal.className = 'fw-bold text-success'
		tdTotal.textContent = formatUang(totalItem)

		const tdHapus = document.createElement('td')
		tdHapus.className = 'text-center'
		const btnHapus = document.createElement('button')
		btnHapus.className = 'btn btn-outline-danger btn-sm rounded-circle d-inline-flex align-items-center justify-content-center p-0'
		btnHapus.style.width = '32px'
		btnHapus.style.height = '32px'
		btnHapus.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
		btnHapus.title = 'Hapus item'
		btnHapus.addEventListener('click', function () {
			hapusItem(item.id)
		})
		tdHapus.appendChild(btnHapus)

		tr.appendChild(tdFoto)
		tr.appendChild(tdNama)
		tr.appendChild(tdHarga)
		tr.appendChild(tdJumlah)
		tr.appendChild(tdTotal)
		tr.appendChild(tdHapus)
		tabelKeranjang.appendChild(tr)
	}

	const ongkir = total >= 100 ? 0 : 5.0
	const pajak = total * 0.11
	const totalAkhir = total + ongkir + pajak
	totalTagihanGlobal = totalAkhir

	if (subtotalTeks) subtotalTeks.textContent = formatUang(total)
	if (ongkirTeks) {
		ongkirTeks.textContent = ongkir === 0 ? 'Gratis Ongkir' : formatUang(ongkir)
	}
	if (pajakTeks) pajakTeks.textContent = formatUang(pajak)
	if (totalTeks) totalTeks.textContent = formatUang(totalAkhir)
}

function bukaModalBayar() {
	const daftar = ambilKeranjang()
	if (daftar.length === 0) {
		alert('Keranjang belanja masih kosong! Silakan pilih produk terlebih dahulu.')
		return
	}

	if (modalBayarTotalTeks) {
		modalBayarTotalTeks.textContent = formatUang(totalTagihanGlobal)
	}

	const simpanan = localStorage.getItem('wc_user')
	if (simpanan && bayarNama && !bayarNama.value) {
		try {
			const u = JSON.parse(simpanan)
			if (u.nama) bayarNama.value = u.nama
		} catch (e) {}
	}

	if (modalPembayaranBackdrop) {
		modalPembayaranBackdrop.classList.add('aktif')
	}
}

function tutupModalBayar() {
	if (modalPembayaranBackdrop) {
		modalPembayaranBackdrop.classList.remove('aktif')
	}
}

function pasangPilihanMetodeBayar() {
	const radios = document.querySelectorAll('input[name="metodeBayar"]')
	for (let i = 0; i < radios.length; i++) {
		radios[i].addEventListener('change', function () {
			const items = document.querySelectorAll('.opsi-bayar-item')
			for (let j = 0; j < items.length; j++) {
				items[j].classList.remove('terpilih')
			}
			if (this.parentElement) {
				this.parentElement.classList.add('terpilih')
			}
		})
	}
}

async function prosesBayar(e) {
	if (e) e.preventDefault()

	const nama = bayarNama ? bayarNama.value.trim() : ''
	const telepon = bayarTelepon ? bayarTelepon.value.trim() : ''
	const alamat = bayarAlamat ? bayarAlamat.value.trim() : ''

	if (!nama || !telepon || !alamat) {
		alert('Harap lengkapi nama penerima, nomor telepon, dan alamat pengiriman.')
		return
	}

	const daftar = ambilKeranjang()
	if (daftar.length === 0) {
		alert('Keranjang kosong.')
		return
	}

	let metodeTerpilih = 'QRIS Instant'
	const radioTerpilih = document.querySelector('input[name="metodeBayar"]:checked')
	if (radioTerpilih) {
		metodeTerpilih = radioTerpilih.value
	}

	const nomorPesanan = 'WC-' + Math.floor(10000 + Math.random() * 90000)
	const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})

	const pesananBaru = {
		id: nomorPesanan,
		tanggal: tanggalSekarang,
		total: totalTagihanGlobal,
		metode: metodeTerpilih,
		penerima: nama,
		telepon: telepon,
		alamat: alamat,
		status: 'Processing',
		items: daftar
	}

	let daftarPesanan = []
	const simpanan = localStorage.getItem('pesananSaya')
	if (simpanan) {
		try {
			const dataLokal = JSON.parse(simpanan)
			if (Array.isArray(dataLokal)) {
				daftarPesanan = dataLokal
			}
		} catch (err) {}
	}

	daftarPesanan.unshift(pesananBaru)
	localStorage.setItem('pesananSaya', JSON.stringify(daftarPesanan))

	try {
		const itemsApi = []
		for (let k = 0; k < daftar.length; k++) {
			itemsApi.push({
				product_id: daftar[k].id,
				quantity: daftar[k].jumlah || 1
			})
		}
		await fetch('/api/orders', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ items: itemsApi })
		})
	} catch (eApi) {}

	localStorage.removeItem('keranjang')
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}

	tutupModalBayar()
	alert('Pembayaran Berhasil!\n\nPesanan ' + nomorPesanan + ' telah dibuat dengan status Sedang Diproses. Anda akan dialihkan ke halaman Riwayat Pesanan.')
	window.location.href = 'orders.html'
}

if (btnBukaModalBayar) {
	btnBukaModalBayar.addEventListener('click', bukaModalBayar)
}

if (btnTutupModalBayar) {
	btnTutupModalBayar.addEventListener('click', tutupModalBayar)
}

if (btnBatalBayar) {
	btnBatalBayar.addEventListener('click', tutupModalBayar)
}

if (formPembayaran) {
	formPembayaran.addEventListener('submit', prosesBayar)
}

if (btnTerapkanKupon) {
	btnTerapkanKupon.addEventListener('click', function () {
		alert('Kupon promo diskon berhasil diterapkan!')
	})
}

if (modalPembayaranBackdrop) {
	modalPembayaranBackdrop.addEventListener('click', function (e) {
		if (e.target === modalPembayaranBackdrop) {
			tutupModalBayar()
		}
	})
}

pasangPilihanMetodeBayar()
renderKeranjang()
