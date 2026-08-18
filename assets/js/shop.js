const wadahProduk = document.getElementById('wadahProduk')
const pesanKosong = document.getElementById('pesanKosong')
const inputCari = document.getElementById('inputCari')
const tombolCari = document.getElementById('tombolCari')
const wadahKategori = document.getElementById('wadahKategori')
const notifikasiToast = document.getElementById('notifikasiToast')
const badgeKeranjang = document.getElementById('badgeKeranjang')
const wadahPagination = document.getElementById('wadahPagination')

let kategoriAktif = 'all'
let waktuToast = null
let semuaProdukData = []
let halamanSaatIni = 1
const perHalaman = 30

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

function munculkanToast(pesan) {
	if (!notifikasiToast) {
		return
	}

	notifikasiToast.textContent = pesan
	notifikasiToast.classList.add('muncul')

	if (waktuToast) {
		clearTimeout(waktuToast)
	}

	waktuToast = setTimeout(function () {
		notifikasiToast.classList.remove('muncul')
	}, 2500)
}

function tambahKeKeranjang(item) {
	let keranjang = []
	const simpanan = localStorage.getItem('keranjang')

	if (simpanan) {
		try {
			const hasil = JSON.parse(simpanan)
			if (Array.isArray(hasil)) {
				keranjang = hasil
			}
		} catch (e) {
			keranjang = []
		}
	}

	let sudahAda = false

	for (let i = 0; i < keranjang.length; i++) {
		if (keranjang[i].id === item.id) {
			keranjang[i].jumlah = (keranjang[i].jumlah || 1) + 1
			sudahAda = true
			break
		}
	}

	if (!sudahAda) {
		keranjang.push({
			id: item.id,
			title: item.title,
			price: item.price,
			image: item.thumbnail || item.image || 'assets/images/product-1.png',
			category: item.category || 'umum',
			jumlah: 1
		})
	}

	localStorage.setItem('keranjang', JSON.stringify(keranjang))
	perbaruiBadge()
	munculkanToast(item.title + ' berhasil dimasukkan ke keranjang!')
}

function tampilkanSkeleton(jumlah) {
	if (!wadahProduk) {
		return
	}

	while (wadahProduk.firstChild) {
		wadahProduk.removeChild(wadahProduk.firstChild)
	}

	if (pesanKosong) {
		pesanKosong.style.display = 'none'
	}

	if (wadahPagination) {
		wadahPagination.innerHTML = ''
	}

	for (let i = 0; i < jumlah; i++) {
		const kolom = document.createElement('div')
		kolom.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-5'

		const kartu = document.createElement('div')
		kartu.className = 'skeleton-shop'

		const img = document.createElement('div')
		img.className = 'skeleton-box skeleton-shop-img'

		const title = document.createElement('div')
		title.className = 'skeleton-box skeleton-shop-title'

		const price = document.createElement('div')
		price.className = 'skeleton-box skeleton-shop-price'

		kartu.appendChild(img)
		kartu.appendChild(title)
		kartu.appendChild(price)
		kolom.appendChild(kartu)
		wadahProduk.appendChild(kolom)
	}
}

function pramuatGambar(daftar) {
	if (!daftar || daftar.length === 0) return Promise.resolve();
	const promises = daftar.map(item => {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = resolve;
			img.onerror = resolve;
			img.src = item.thumbnail || item.image || 'assets/images/product-1.png';
		});
	});
	const timeout = new Promise(resolve => setTimeout(resolve, 1500));
	return Promise.race([Promise.all(promises), timeout]);
}

function renderProduk(daftar) {
	if (!wadahProduk) {
		return
	}

	while (wadahProduk.firstChild) {
		wadahProduk.removeChild(wadahProduk.firstChild)
	}

	if (!daftar || daftar.length === 0) {
		if (pesanKosong) {
			pesanKosong.style.display = 'block'
		}
		return
	}

	if (pesanKosong) {
		pesanKosong.style.display = 'none'
	}

	for (let i = 0; i < daftar.length; i++) {
		const produk = daftar[i]

		const kolom = document.createElement('div')
		kolom.className = 'col-6 col-sm-4 col-md-3 col-lg-2 mb-5'

		const kartu = document.createElement('a')
		kartu.className = 'product-item'
		kartu.href = 'javascript:void(0)'

		const foto = document.createElement('img')
		foto.src = produk.thumbnail || produk.image || 'assets/images/product-1.png'
		foto.className = 'img-fluid product-thumbnail'
		foto.alt = produk.title
		foto.loading = 'lazy'

		const tag = document.createElement('span')
		tag.className = 'product-kategori-tag'
		tag.textContent = produk.category || 'umum'

		const judul = document.createElement('h3')
		judul.className = 'product-title'
		judul.textContent = produk.title

		const harga = document.createElement('strong')
		harga.className = 'product-price'
		harga.textContent = '$' + Number(produk.price).toFixed(2)

		const iconCross = document.createElement('span')
		iconCross.className = 'icon-cross'
		iconCross.innerHTML = '<img src="assets/images/cross.svg" class="img-fluid">'

		kartu.appendChild(foto)
		kartu.appendChild(tag)
		kartu.appendChild(judul)
		kartu.appendChild(harga)
		kartu.appendChild(iconCross)

		kartu.addEventListener('click', function (e) {
			e.preventDefault()
			tambahKeKeranjang(produk)
		})

		kolom.appendChild(kartu)
		wadahProduk.appendChild(kolom)
	}
}

function renderPagination(totalItems, itemsPerHalaman, halamanAktif) {
	if (!wadahPagination) {
		return
	}

	wadahPagination.innerHTML = ''
	const totalHalaman = Math.ceil(totalItems / itemsPerHalaman)

	if (totalHalaman <= 1) {
		return
	}

	function buatTombol(label, targetHalaman, isActive = false, isDisabled = false) {
		const btn = document.createElement('button')
		btn.className = 'pagination-btn'
		if (isActive) btn.classList.add('active')
		if (isDisabled) btn.classList.add('disabled')
		btn.innerHTML = label

		if (!isDisabled && !isActive) {
			btn.addEventListener('click', function () {
				pindahHalaman(targetHalaman)
			})
		}
		return btn
	}

	const firstBtn = buatTombol('&laquo; First', 1, false, halamanAktif === 1)
	wadahPagination.appendChild(firstBtn)

	const backBtn = buatTombol('&lsaquo; Back', halamanAktif - 1, false, halamanAktif === 1)
	wadahPagination.appendChild(backBtn)

	const pageNumbers = []
	pageNumbers.push(1)

	if (totalHalaman <= 7) {
		for (let p = 2; p <= totalHalaman; p++) {
			pageNumbers.push(p)
		}
	} else {
		let startPage = Math.max(2, halamanAktif - 1)
		let endPage = Math.min(totalHalaman - 1, halamanAktif + 1)

		if (halamanAktif <= 3) {
			startPage = 2
			endPage = 4
		} else if (halamanAktif >= totalHalaman - 2) {
			startPage = totalHalaman - 3
			endPage = totalHalaman - 1
		}

		if (startPage > 2) {
			pageNumbers.push('ellipsis')
		}

		for (let p = startPage; p <= endPage; p++) {
			pageNumbers.push(p)
		}

		if (endPage < totalHalaman - 1) {
			pageNumbers.push('ellipsis')
		}

		pageNumbers.push(totalHalaman)
	}

	for (let i = 0; i < pageNumbers.length; i++) {
		const item = pageNumbers[i]
		if (item === 'ellipsis') {
			const ellipsisSpan = document.createElement('span')
			ellipsisSpan.className = 'pagination-ellipsis'
			ellipsisSpan.textContent = '...'
			wadahPagination.appendChild(ellipsisSpan)
		} else {
			const pageBtn = buatTombol(item.toString(), item, item === halamanAktif, false)
			wadahPagination.appendChild(pageBtn)
		}
	}

	const nextBtn = buatTombol('Next &rsaquo;', halamanAktif + 1, false, halamanAktif === totalHalaman)
	wadahPagination.appendChild(nextBtn)

	const lastBtn = buatTombol('Last &raquo;', totalHalaman, false, halamanAktif === totalHalaman)
	wadahPagination.appendChild(lastBtn)
}

async function pindahHalaman(targetHalaman) {
	const totalHalaman = Math.ceil(semuaProdukData.length / perHalaman)
	if (targetHalaman < 1 || (totalHalaman > 0 && targetHalaman > totalHalaman)) {
		return
	}

	halamanSaatIni = targetHalaman
	const awal = (halamanSaatIni - 1) * perHalaman
	const produkHalaman = semuaProdukData.slice(awal, awal + perHalaman)

	tampilkanSkeleton(produkHalaman.length || 12)
	await pramuatGambar(produkHalaman)

	renderProduk(produkHalaman)
	renderPagination(semuaProdukData.length, perHalaman, halamanSaatIni)

	if (wadahProduk) {
		wadahProduk.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}

async function muatDataProduk(kategori, kataKunci) {
	tampilkanSkeleton(12)

	let url = 'https://dummyjson.com/products?limit=100'

	if (kataKunci && kataKunci.trim().length > 0) {
		url = 'https://dummyjson.com/products/search?q=' + encodeURIComponent(kataKunci.trim())
	} else if (kategori && kategori !== 'all') {
		url = 'https://dummyjson.com/products/category/' + encodeURIComponent(kategori)
	}

	let data = null

	try {
		const respon = await fetch(url)
		if (respon.ok) {
			data = await respon.json()
		}
	} catch (error) {
		data = null
	}

	if (!data || !data.products) {
		try {
			const cadangan = await fetch('/api/products')
			if (cadangan.ok) {
				const hasilCadangan = await cadangan.json()
				semuaProdukData = hasilCadangan
				await pindahHalaman(1)
				return
			}
		} catch (e) {
			semuaProdukData = []
			await pindahHalaman(1)
			return
		}
	}

	semuaProdukData = data.products
	await pindahHalaman(1)
}

function pasangKategori() {
	if (!wadahKategori) {
		return
	}

	const daftarKategori = [
		{ slug: 'all', nama: 'Semua Produk' },
		{ slug: 'furniture', nama: 'Furnitur' },
		{ slug: 'home-decoration', nama: 'Dekorasi Rumah' },
		{ slug: 'kitchen-accessories', nama: 'Dapur' },
		{ slug: 'laptops', nama: 'Laptop & Gadget' },
		{ slug: 'groceries', nama: 'Kebutuhan Harian' },
		{ slug: 'beauty', nama: 'Kecantikan' }
	]

	while (wadahKategori.firstChild) {
		wadahKategori.removeChild(wadahKategori.firstChild)
	}

	for (let i = 0; i < daftarKategori.length; i++) {
		const kat = daftarKategori[i]
		const tombol = document.createElement('button')
		tombol.className = 'btn-kategori'
		if (kat.slug === kategoriAktif) {
			tombol.classList.add('active')
		}
		tombol.textContent = kat.nama

		tombol.addEventListener('click', function () {
			const semuaTombol = wadahKategori.getElementsByClassName('btn-kategori')
			for (let j = 0; j < semuaTombol.length; j++) {
				semuaTombol[j].classList.remove('active')
			}
			tombol.classList.add('active')
			kategoriAktif = kat.slug
			if (inputCari) {
				inputCari.value = ''
			}
			muatDataProduk(kategoriAktif, '')
		})

		wadahKategori.appendChild(tombol)
	}
}

if (tombolCari && inputCari) {
	tombolCari.addEventListener('click', function () {
		const teks = inputCari.value.trim()
		muatDataProduk('', teks)
	})

	inputCari.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			const teks = inputCari.value.trim()
			muatDataProduk('', teks)
		}
	})
}

function inisialisasi() {
	perbaruiBadge()
	pasangKategori()
	muatDataProduk('all', '')
}

inisialisasi()
