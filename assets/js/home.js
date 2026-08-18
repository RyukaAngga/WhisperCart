const berandaProdukWadah = document.getElementById('berandaProdukWadah')
const badgeKeranjang = document.getElementById('badgeKeranjang')
const notifikasiToast = document.getElementById('notifikasiToast')
let waktuToast = null

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

function tambahKeranjangBeranda(item) {
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

function tampilkanSkeletonBeranda(jumlah) {
	if (!berandaProdukWadah) {
		return
	}

	while (berandaProdukWadah.firstChild) {
		berandaProdukWadah.removeChild(berandaProdukWadah.firstChild)
	}

	for (let i = 0; i < jumlah; i++) {
		const kolom = document.createElement('div')
		kolom.className = 'col-12 col-sm-6 col-md-3 mb-5 mb-md-0'

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
		berandaProdukWadah.appendChild(kolom)
	}
}

function pramuatGambarBeranda(daftar) {
	if (!daftar || daftar.length === 0) return Promise.resolve()
	const promises = daftar.map(item => {
		return new Promise(resolve => {
			const img = new Image()
			img.onload = resolve
			img.onerror = resolve
			img.src = item.thumbnail || item.image || 'assets/images/product-1.png'
		})
	})
	const timeout = new Promise(resolve => setTimeout(resolve, 1500))
	return Promise.race([Promise.all(promises), timeout])
}

async function muatProdukBeranda() {
	if (!berandaProdukWadah) {
		return
	}

	tampilkanSkeletonBeranda(4)

	let data = null

	try {
		const respon = await fetch('https://dummyjson.com/products?limit=4')
		if (respon.ok) {
			data = await respon.json()
		}
	} catch (e) {
		data = null
	}

	if (!data || !data.products || data.products.length === 0) {
		try {
			const respon2 = await fetch('https://dummyjson.com/products/category/furniture')
			if (respon2.ok) {
				data = await respon2.json()
			}
		} catch (e2) {
			data = null
		}
	}

	if (!data || !data.products) {
		return
	}

	const daftar = data.products.slice(0, 4)

	await pramuatGambarBeranda(daftar)

	while (berandaProdukWadah.firstChild) {
		berandaProdukWadah.removeChild(berandaProdukWadah.firstChild)
	}

	for (let i = 0; i < daftar.length; i++) {
		const produk = daftar[i]

		const kolom = document.createElement('div')
		kolom.className = 'col-12 col-sm-6 col-md-3 mb-5 mb-md-0'

		const a = document.createElement('a')
		a.className = 'product-item'
		a.href = 'javascript:void(0)'

		const img = document.createElement('img')
		img.src = produk.thumbnail || produk.image || 'assets/images/product-1.png'
		img.className = 'img-fluid product-thumbnail'
		img.alt = produk.title
		img.style.height = '160px'
		img.style.objectFit = 'contain'

		const tag = document.createElement('span')
		tag.className = 'product-kategori-tag'
		tag.textContent = produk.category || 'umum'

		const h3 = document.createElement('h3')
		h3.className = 'product-title'
		h3.textContent = produk.title

		const strong = document.createElement('strong')
		strong.className = 'product-price'
		strong.textContent = '$' + Number(produk.price).toFixed(2)

		const span = document.createElement('span')
		span.className = 'icon-cross'
		const iconImg = document.createElement('img')
		iconImg.src = 'assets/images/cross.svg'
		iconImg.className = 'img-fluid'
		span.appendChild(iconImg)

		a.appendChild(img)
		a.appendChild(tag)
		a.appendChild(h3)
		a.appendChild(strong)
		a.appendChild(span)

		a.addEventListener('click', function () {
			tambahKeranjangBeranda(produk)
		})

		kolom.appendChild(a)
		berandaProdukWadah.appendChild(kolom)
	}
}

perbaruiBadge()
muatProdukBeranda()
