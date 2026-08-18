const tabelCheckout = document.querySelector('.site-block-order-table tbody')
const btnProsesPesanan = document.getElementById('btnProsesPesanan')
const badgeKeranjang = document.getElementById('badgeKeranjang')
const modalDemoElement = document.getElementById('modalDemoPembayaran')
const btnSimulasiSukses = document.getElementById('btnSimulasiSukses')
const demoTotalHarga = document.getElementById('demoTotalHarga')
const kontenModalPembayaran = document.getElementById('kontenModalPembayaran')

let metodeDipilihTerakhir = 'mbanking'
let opsiDetailTerakhir = 'BCA'

const nomorVAMap = {
	BCA: '8830 1928 3746 520',
	Mandiri: '8902 8374 6520 120',
	BRI: '1029 3847 5620 384',
	BNI: '9876 5432 1098 765'
}

function periksaAuth() {
	return true
}

function formatUang(angka) {
	return '$' + Number(angka).toFixed(2)
}

function perbaruiBadge() {
	if (!badgeKeranjang) {
		return
	}

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

	badgeKeranjang.textContent = total
	if (total > 0) {
		badgeKeranjang.style.display = 'inline-block'
	} else {
		badgeKeranjang.style.display = 'none'
	}
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

function hitungTotal(daftar) {
	let total = 0
	for (let i = 0; i < daftar.length; i++) {
		const item = daftar[i]
		const jumlah = item.jumlah || 1
		total += (Number(item.price) || 0) * jumlah
	}
	return total
}

function simpanPesananKeRiwayat(metodePembayaran, opsiDetail, totalHitung, daftarItem) {
	let riwayat = []
	const simpanan = localStorage.getItem('pesananSaya')
	if (simpanan) {
		try {
			const hasil = JSON.parse(simpanan)
			if (Array.isArray(hasil)) {
				riwayat = hasil
			}
		} catch (e) {
			riwayat = []
		}
	}

	let labelMetode = 'Cash on Delivery (COD)'
	if (metodePembayaran === 'mbanking') {
		labelMetode = 'M-Banking (' + opsiDetail + ' VA)'
	} else if (metodePembayaran === 'ewallet') {
		labelMetode = 'E-Wallet (' + opsiDetail + ' / QRIS)'
	}

	const pesananBaru = {
		id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
		tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
		total: totalHitung,
		metode: labelMetode,
		status: metodePembayaran === 'cod' ? 'Dalam Pengiriman (COD)' : 'Diproses (Lunas)',
		items: daftarItem
	}

	riwayat.unshift(pesananBaru)
	localStorage.setItem('pesananSaya', JSON.stringify(riwayat))
}

function renderCheckout() {
	const daftar = ambilKeranjang()

	if (!tabelCheckout) {
		return
	}

	while (tabelCheckout.firstChild) {
		tabelCheckout.removeChild(tabelCheckout.firstChild)
	}

	if (daftar.length === 0) {
		const tr = document.createElement('tr')
		const td = document.createElement('td')
		td.colSpan = 2
		td.textContent = 'Keranjang masih kosong. Silakan belanja terlebih dahulu.'
		tr.appendChild(td)
		tabelCheckout.appendChild(tr)
		return
	}

	let total = 0

	for (let i = 0; i < daftar.length; i++) {
		const item = daftar[i]
		const jumlah = item.jumlah || 1
		const totalItem = (Number(item.price) || 0) * jumlah
		total = total + totalItem

		const tr = document.createElement('tr')
		const tdNama = document.createElement('td')
		tdNama.innerHTML = item.title + ' <strong class="mx-2">x</strong> ' + jumlah

		const tdTotal = document.createElement('td')
		tdTotal.textContent = formatUang(totalItem)

		tr.appendChild(tdNama)
		tr.appendChild(tdTotal)
		tabelCheckout.appendChild(tr)
	}

	const trSub = document.createElement('tr')
	const tdSubJudul = document.createElement('td')
	tdSubJudul.className = 'text-black font-weight-bold'
	tdSubJudul.innerHTML = '<strong>Subtotal Keranjang</strong>'
	const tdSubNilai = document.createElement('td')
	tdSubNilai.className = 'text-black'
	tdSubNilai.textContent = formatUang(total)
	trSub.appendChild(tdSubJudul)
	trSub.appendChild(tdSubNilai)
	tabelCheckout.appendChild(trSub)

	const ongkir = total >= 100 ? 0 : 5.0
	const pajak = total * 0.11
	const totalAkhir = total + ongkir + pajak

	const trOngkir = document.createElement('tr')
	const tdOngkirJudul = document.createElement('td')
	tdOngkirJudul.className = 'text-black font-weight-bold'
	tdOngkirJudul.innerHTML = '<strong>Biaya Pengiriman (Ongkir)</strong>'
	const tdOngkirNilai = document.createElement('td')
	tdOngkirNilai.className = ongkir === 0 ? 'text-success font-weight-bold' : 'text-black'
	tdOngkirNilai.textContent = ongkir === 0 ? 'Gratis Ongkir' : formatUang(ongkir)
	trOngkir.appendChild(tdOngkirJudul)
	trOngkir.appendChild(tdOngkirNilai)
	tabelCheckout.appendChild(trOngkir)

	const trPajak = document.createElement('tr')
	const tdPajakJudul = document.createElement('td')
	tdPajakJudul.className = 'text-black font-weight-bold'
	tdPajakJudul.innerHTML = '<strong>Pajak (PPN 11%)</strong>'
	const tdPajakNilai = document.createElement('td')
	tdPajakNilai.className = 'text-black'
	tdPajakNilai.textContent = formatUang(pajak)
	trPajak.appendChild(tdPajakJudul)
	trPajak.appendChild(tdPajakNilai)
	tabelCheckout.appendChild(trPajak)

	const trTot = document.createElement('tr')
	const tdTotJudul = document.createElement('td')
	tdTotJudul.className = 'text-black font-weight-bold'
	tdTotJudul.innerHTML = '<strong>Total Pesanan</strong>'
	const tdTotNilai = document.createElement('td')
	tdTotNilai.className = 'text-black font-weight-bold'
	tdTotNilai.innerHTML = '<strong>' + formatUang(totalAkhir) + '</strong>'
	trTot.appendChild(tdTotJudul)
	trTot.appendChild(tdTotNilai)
	tabelCheckout.appendChild(trTot)
}

function renderKontenModal(metode, opsiDetail) {
	if (!kontenModalPembayaran) return

	if (metode === 'mbanking') {
		const nomorVA = nomorVAMap[opsiDetail] || '8830 1928 3746 520'
		kontenModalPembayaran.innerHTML = `
			<div class="border rounded p-3 mb-3 bg-white text-start shadow-sm">
				<div class="d-flex align-items-center justify-content-between mb-2">
					<span class="font-weight-bold text-dark">Bank ${opsiDetail} Virtual Account</span>
					<span class="badge text-white px-2 py-1" style="background: #3b5d50;">Otomatis</span>
				</div>
				<p class="small text-muted mb-2">Transfer tepat nominal tagihan ke nomor Virtual Account berikut:</p>
				<div class="input-group mb-3">
					<input type="text" class="form-control font-weight-bold text-center bg-light" value="${nomorVA}" readonly>
					<button class="btn font-weight-bold" type="button" style="color: #3b5d50; border: 1px solid #3b5d50; background: #ffffff;" onclick="navigator.clipboard.writeText('${nomorVA.replace(/\s/g, '')}'); alert('Nomor Virtual Account disalin!')">
						<i class="fa fa-copy me-1"></i> Salin
					</button>
				</div>
				<div class="small text-muted">
					<strong>Petunjuk Pembayaran M-Banking:</strong>
					<ol class="ps-3 mb-0 mt-1">
						<li>Buka aplikasi Mobile Banking ${opsiDetail} Anda.</li>
						<li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
						<li>Masukkan nomor Virtual Account di atas dan konfirmasi pembayaran.</li>
					</ol>
				</div>
			</div>
		`
	} else if (metode === 'ewallet') {
		kontenModalPembayaran.innerHTML = `
			<div class="border rounded p-3 mb-3 bg-white text-center shadow-sm">
				<div class="badge text-dark mb-2 px-3 py-2 font-weight-bold" style="background: #f9bf29; font-size: 13px;">E-Wallet: ${opsiDetail} / QRIS</div>
				<p class="small text-muted mb-3">Scan kode QRIS di bawah menggunakan aplikasi <strong>${opsiDetail}</strong> atau Mobile Banking Anda:</p>
				<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=WHISPERCART_${opsiDetail}_PAYMENT" alt="QRIS Prototype" class="img-fluid border p-2 bg-white rounded shadow-sm mb-3" style="max-width: 180px;">
				<div class="small text-muted font-weight-bold mb-3">NMID: ID1029384756201</div>
				<div class="border-top pt-3">
					<button type="button" class="btn w-100 font-weight-bold py-2" style="background: #ffffff; color: #3b5d50; border: 1px solid #3b5d50;" onclick="alert('Simulasi membuka aplikasi ${opsiDetail}...')">
						<i class="fa fa-external-link-alt me-1"></i> Buka Aplikasi ${opsiDetail}
					</button>
				</div>
			</div>
		`
	}
}

let timerInterval = null

function mulaiTimerMundurPembayaran() {
	if (timerInterval) {
		clearInterval(timerInterval)
	}
	let sisaWaktu = 900
	const timerElem = document.getElementById('timerHitungMundur')

	function updateTeks() {
		const m = Math.floor(sisaWaktu / 60)
		const s = sisaWaktu % 60
		const teksM = m < 10 ? '0' + m : m
		const teksS = s < 10 ? '0' + s : s
		if (timerElem) {
			timerElem.textContent = teksM + ':' + teksS
		}
	}

	updateTeks()

	timerInterval = setInterval(function () {
		sisaWaktu--
		if (sisaWaktu <= 0) {
			clearInterval(timerInterval)
			if (timerElem) {
				timerElem.textContent = '00:00'
			}
			alert('Waktu sesi pembayaran telah habis. Silakan lakukan proses ulang.')
			return
		}
		updateTeks()
	}, 1000)
}

function validasiFormPengiriman() {
	return true
}

function tanganiProsesPesanan(e) {
	if (e) {
		e.preventDefault()
	}

	const daftar = ambilKeranjang()

	if (daftar.length === 0) {
		alert('Keranjang belanja Anda masih kosong!')
		window.location.href = 'shop.html'
		return
	}

	if (!validasiFormPengiriman()) {
		return
	}

	const radioMBanking = document.getElementById('paymentMBanking')
	const radioEWallet = document.getElementById('paymentEWallet')
	const subtotal = hitungTotal(daftar)
	const ongkir = subtotal >= 100 ? 0 : 5.0
	const pajak = subtotal * 0.11
	const totalAkhir = subtotal + ongkir + pajak

	let metode = 'cod'
	let opsiDetail = ''

	if (radioMBanking && radioMBanking.checked) {
		metode = 'mbanking'
		const selectedBank = document.querySelector('input[name="subBank"]:checked')
		opsiDetail = selectedBank ? selectedBank.value : 'BCA'
	} else if (radioEWallet && radioEWallet.checked) {
		metode = 'ewallet'
		const selectedWallet = document.querySelector('input[name="subEwallet"]:checked')
		opsiDetail = selectedWallet ? selectedWallet.value : 'GoPay'
	}

	metodeDipilihTerakhir = metode
	opsiDetailTerakhir = opsiDetail

	if (metode === 'cod') {
		simpanPesananKeRiwayat('cod', '', totalAkhir, daftar)
		localStorage.removeItem('keranjang')
		window.location.href = 'thankyou.html'
	} else {
		if (demoTotalHarga) {
			demoTotalHarga.textContent = formatUang(totalAkhir)
		}
		renderKontenModal(metode, opsiDetail)
		mulaiTimerMundurPembayaran()

		if (modalDemoElement && typeof bootstrap !== 'undefined') {
			const bsModal = new bootstrap.Modal(modalDemoElement)
			bsModal.show()
		} else {
			simpanPesananKeRiwayat(metode, opsiDetail, totalAkhir, daftar)
			localStorage.removeItem('keranjang')
			window.location.href = 'thankyou.html'
		}
	}
}

const inputPhoneElem = document.getElementById('c_phone')
if (inputPhoneElem) {
	inputPhoneElem.addEventListener('input', function () {
		this.value = this.value.replace(/[^0-9+\s-]/g, '')
	})
}

if (btnSimulasiSukses) {
	btnSimulasiSukses.addEventListener('click', function () {
		if (timerInterval) {
			clearInterval(timerInterval)
		}
		const daftar = ambilKeranjang()
		const subtotal = hitungTotal(daftar)
		const ongkir = subtotal >= 100 ? 0 : 5.0
		const pajak = subtotal * 0.11
		const totalAkhir = subtotal + ongkir + pajak
		simpanPesananKeRiwayat(metodeDipilihTerakhir, opsiDetailTerakhir, totalAkhir, daftar)
		localStorage.removeItem('keranjang')
		window.location.href = 'thankyou.html'
	})
}

if (btnProsesPesanan) {
	btnProsesPesanan.addEventListener('click', tanganiProsesPesanan)
}

function perbaruiTampilanSubOpsi() {
	const radioMBanking = document.getElementById('paymentMBanking')
	const radioEWallet = document.getElementById('paymentEWallet')
	const subOpsiMBanking = document.getElementById('subOpsiMBanking')
	const subOpsiEWallet = document.getElementById('subOpsiEWallet')

	if (subOpsiMBanking) {
		subOpsiMBanking.style.display = (radioMBanking && radioMBanking.checked) ? 'block' : 'none'
	}
	if (subOpsiEWallet) {
		subOpsiEWallet.style.display = (radioEWallet && radioEWallet.checked) ? 'block' : 'none'
	}
}

const opsiPembayaran = document.getElementsByName('metodePembayaran')
for (let i = 0; i < opsiPembayaran.length; i++) {
	opsiPembayaran[i].addEventListener('change', perbaruiTampilanSubOpsi)
}

perbaruiTampilanSubOpsi()

periksaAuth()
perbaruiBadge()
renderCheckout()

