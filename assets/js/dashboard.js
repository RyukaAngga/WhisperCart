const daftarProduk = document.getElementById('daftarProduk')
const kosongProduk = document.getElementById('kosongProduk')
const kotakCari = document.getElementById('kotakCari')
const tombolCari = document.getElementById('tombolCari')
const judulSapaan = document.getElementById('judulSapaan')
const notifikasiToast = document.getElementById('notifikasiToast')
let waktuToast = null
let kategoriAktif = ''
const wadahPagination = document.getElementById('wadahPagination')
let semuaProdukData = []
let halamanSaatIni = 1
const perHalaman = 20

function formatUang(angka) {
	return '$' + Number(angka).toFixed(2)
}

function gambarAman(alamat) {
	if (typeof alamat !== 'string' || alamat.trim().length === 0) {
		return 'assets/images/product-1.png'
	}
	if (alamat.indexOf('http://') === 0 || alamat.indexOf('https://') === 0 || alamat.indexOf('assets/') === 0) {
		return alamat
	}
	return 'assets/images/product-1.png'
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

function kosongkan(wadah) {
	if (!wadah) {
		return
	}
	while (wadah.firstChild) {
		wadah.removeChild(wadah.firstChild)
	}
}

function skeletonProduk(jumlah) {
	if (!daftarProduk) {
		return
	}
	kosongkan(daftarProduk)

	for (let i = 0; i < jumlah; i++) {
		const kolom = document.createElement('div')
		kolom.className = 'col-6 col-sm-4 col-md-3 col-xl-3 mb-5'

		const kartu = document.createElement('div')
		kartu.className = 'skeleton-produk p-3 border rounded-3 bg-white'

		const gambar = document.createElement('div')
		gambar.className = 'skeleton skeleton-gambar'

		const baris1 = document.createElement('div')
		baris1.className = 'skeleton skeleton-teks mb-2'

		const baris2 = document.createElement('div')
		baris2.className = 'skeleton skeleton-teks pendek mb-3'

		const tombol = document.createElement('div')
		tombol.className = 'skeleton skeleton-tombol'

		kartu.appendChild(gambar)
		kartu.appendChild(baris1)
		kartu.appendChild(baris2)
		kartu.appendChild(tombol)
		kolom.appendChild(kartu)
		daftarProduk.appendChild(kolom)
	}
}

function tambahKeranjang(produk) {
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
		if (keranjang[i].id === produk.id) {
			keranjang[i].jumlah = (keranjang[i].jumlah || 1) + 1
			sudahAda = true
			break
		}
	}

	if (!sudahAda) {
		keranjang.push({
			id: produk.id,
			title: produk.title,
			price: Number(produk.price) || 0,
			image: gambarAman(produk.image || produk.thumbnail),
			category: produk.category || 'umum',
			jumlah: 1
		})
	}

	localStorage.setItem('keranjang', JSON.stringify(keranjang))
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}
	munculkanToast(produk.title + ' dimasukkan ke keranjang!')
}

async function muatProduk(cari) {
	if (!daftarProduk) {
		return
	}

	skeletonProduk(8)
	if (kosongProduk) {
		kosongProduk.style.display = 'none'
	}
	if (wadahPagination) {
		wadahPagination.innerHTML = ''
	}

	let alamat = '/api/products?batas=100'
	if (cari) {
		alamat += '&cari=' + encodeURIComponent(cari)
	}
	if (kategoriAktif) {
		alamat += '&kategori=' + encodeURIComponent(kategoriAktif)
	}

	let data = []

	try {
		const respon = await fetch(alamat, { credentials: 'same-origin' })
		if (respon.ok) {
			data = await respon.json()
		}
	} catch (e) {
		data = []
	}

	if (!data || data.length === 0) {
		try {
			let fallbackUrl = 'https://dummyjson.com/products?limit=100'
			if (kategoriAktif) {
				fallbackUrl = 'https://dummyjson.com/products/category/' + encodeURIComponent(kategoriAktif)
			}
			const respon2 = await fetch(fallbackUrl)
			if (respon2.ok) {
				const json = await respon2.json()
				data = json.products || []
				if (cari) {
					const kataKecil = cari.toLowerCase()
					data = data.filter(function (item) {
						return (item.title && item.title.toLowerCase().indexOf(kataKecil) !== -1) ||
							(item.description && item.description.toLowerCase().indexOf(kataKecil) !== -1)
					})
				}
			}
		} catch (e2) {
			data = []
		}
	}

	semuaProdukData = data || []
	pindahHalaman(1)
}

function pindahHalaman(targetHalaman) {
	const totalHalaman = Math.ceil(semuaProdukData.length / perHalaman)
	if (targetHalaman < 1 || (totalHalaman > 0 && targetHalaman > totalHalaman)) {
		return
	}

	halamanSaatIni = targetHalaman
	const awal = (halamanSaatIni - 1) * perHalaman
	const produkHalaman = semuaProdukData.slice(awal, awal + perHalaman)

	renderProduk(produkHalaman)
	renderPagination(semuaProdukData.length, perHalaman, halamanSaatIni)

	if (daftarProduk) {
		daftarProduk.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}

function renderProduk(daftar) {
	kosongkan(daftarProduk)

	if (!daftar || daftar.length === 0) {
		if (kosongProduk) {
			kosongProduk.textContent = 'Tidak ada produk yang cocok dengan pencarian Anda.'
			kosongProduk.style.display = 'block'
		}
		return
	}

	for (let i = 0; i < daftar.length; i++) {
		const produk = daftar[i]

		const kolom = document.createElement('div')
		kolom.className = 'col-6 col-sm-4 col-md-3 col-xl-3 mb-5'

		const kartu = document.createElement('a')
		kartu.className = 'product-item'
		kartu.href = 'javascript:void(0)'

		const img = document.createElement('img')
		img.src = gambarAman(produk.image || produk.thumbnail)
		img.alt = produk.title
		img.className = 'img-fluid product-thumbnail'

		const tag = document.createElement('span')
		tag.className = 'product-kategori-tag'
		tag.textContent = produk.category || 'katalog'

		const h3 = document.createElement('h3')
		h3.className = 'product-title'
		h3.textContent = produk.title
		h3.title = produk.title

		const strong = document.createElement('strong')
		strong.className = 'product-price'
		strong.textContent = formatUang(produk.price)

		const iconCross = document.createElement('span')
		iconCross.className = 'icon-cross'
		iconCross.innerHTML = '<img src="assets/images/cross.svg" class="img-fluid">'

		kartu.appendChild(img)
		kartu.appendChild(tag)
		kartu.appendChild(h3)
		kartu.appendChild(strong)
		kartu.appendChild(iconCross)

		kartu.addEventListener('click', function (e) {
			e.preventDefault()
			tambahKeranjang(produk)
		})

		kolom.appendChild(kartu)
		daftarProduk.appendChild(kolom)
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

	wadahPagination.appendChild(buatTombol('&laquo; First', 1, false, halamanAktif === 1))
	wadahPagination.appendChild(buatTombol('&lsaquo; Back', halamanAktif - 1, false, halamanAktif === 1))

	for (let p = 1; p <= totalHalaman; p++) {
		wadahPagination.appendChild(buatTombol(p.toString(), p, p === halamanAktif, false))
	}

	wadahPagination.appendChild(buatTombol('Next &rsaquo;', halamanAktif + 1, false, halamanAktif === totalHalaman))
	wadahPagination.appendChild(buatTombol('Last &raquo;', totalHalaman, false, halamanAktif === totalHalaman))
}

function pasangFilterKategori() {
	const tombols = document.querySelectorAll('.tombol-kategori')
	for (let i = 0; i < tombols.length; i++) {
		tombols[i].addEventListener('click', function () {
			for (let j = 0; j < tombols.length; j++) {
				tombols[j].classList.remove('active')
			}
			this.classList.add('active')
			kategoriAktif = this.getAttribute('data-kategori') || ''
			muatProduk(kotakCari ? kotakCari.value.trim() : '')
		})
	}
}

if (tombolCari && kotakCari) {
	tombolCari.addEventListener('click', function () {
		muatProduk(kotakCari.value.trim())
	})

	kotakCari.addEventListener('keydown', function (e) {
		if (e.key === 'Enter') {
			muatProduk(kotakCari.value.trim())
		}
	})
}

async function mulaiDashboard() {
	let dataUser = null
	const simpanan = localStorage.getItem('wc_user')
	if (simpanan) {
		try {
			dataUser = JSON.parse(simpanan)
		} catch (e) {}
	}

	if (judulSapaan && dataUser && dataUser.nama) {
		judulSapaan.textContent = 'Halo, ' + dataUser.nama + '!'
	}

	pasangFilterKategori()

	const params = new URLSearchParams(window.location.search)
	const kataCari = params.get('cari') || ''
	if (kotakCari && kataCari) {
		kotakCari.value = kataCari
	}

	muatProduk(kataCari)
}

document.addEventListener('DOMContentLoaded', mulaiDashboard)
