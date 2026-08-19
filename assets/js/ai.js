const daftarChatArea = document.getElementById('daftarChatBesar')
const chatInner = document.getElementById('aiChatInner')
const textareaChat = document.getElementById('kotakChatAI')
const tombolAksiChat = document.getElementById('tombolAksiChat')
const tombolChatBaru = document.getElementById('btnChatBaru')
const tombolChatBaruSidebar = document.getElementById('btnChatBaruSidebar')
const sapaanCard = document.getElementById('aiSapaanCenter')
const btnScrollBottom = document.getElementById('btnScrollBottom')
const daftarRekomendasiAI = document.getElementById('daftarRekomendasiAI')
const badgeRekomLive = document.getElementById('badgeRekomLive')
const btnBukaRekomFloating = document.getElementById('btnBukaRekomFloating')
const jmlRekomFloating = document.getElementById('jmlRekomFloating')
const btnTutupRekom = document.getElementById('btnTutupRekom')
const panelRekomendasi = document.getElementById('panelRekomendasi')
const toastRekomNotif = document.getElementById('toastRekomNotif')

const riwayatPercakapan = []
let controllerStreaming = null
let sedangStreaming = false
let pesanTerakhirUser = ''
let seluruhProdukRekom = []
let rekomendasiAktif = []
let autoScrollAktif = true

let antreanTeksStream = ''
let teksDitampilkanStream = ''
let idFrameAnimasi = null
let selesaiTerimaJaringan = false

const svgKirim = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'
const svgStop = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>'
const svgSalin = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
const svgCentang = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#28a745" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
const svgUlangi = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
const svgJempolAtas = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>'
const svgJempolBawah = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>'
const svgFile = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>'
const svgSparkle = '<img src="assets/images/logo/logo_icon.svg" style="width: 18px; height: 18px; filter: brightness(0); display: inline-block; vertical-align: middle;" alt="Logo">'

function formatUang(angka) {
	return '$' + Number(angka).toFixed(2)
}

function parseMarkdownSederhana(teks) {
	if (!teks) {
		return ''
	}

	const baris = teks.split('\n')
	const hasil = []
	let dalamList = false
	let dalamTabel = false
	let dalamCode = false
	let bufferCode = []
	let bufferParagraf = []

	function flushParagraf() {
		if (bufferParagraf.length > 0) {
			hasil.push('<p>' + bufferParagraf.map(formatInline).join('<br>') + '</p>')
			bufferParagraf = []
		}
	}

	function tutupList() {
		if (dalamList) {
			hasil.push('</ul>')
			dalamList = false
		}
	}

	function tutupTabel() {
		if (dalamTabel) {
			hasil.push('</table></div>')
			dalamTabel = false
		}
	}

	for (let i = 0; i < baris.length; i++) {
		const mentah = baris[i]
		const b = mentah.trim()

		if (b.startsWith('```')) {
			flushParagraf()
			tutupList()
			tutupTabel()
			if (dalamCode) {
				hasil.push('<div class="code-box-wrapper"><div class="code-box-header"><span>code</span><button class="btn-copy-code" onclick="salinTeksKode(this)">Salin</button></div><pre><code>' + bufferCode.join('\n') + '</code></pre></div>')
				bufferCode = []
				dalamCode = false
			} else {
				dalamCode = true
			}
			continue
		}

		if (dalamCode) {
			bufferCode.push(mentah)
			continue
		}

		if (b.startsWith('|') && b.endsWith('|')) {
			flushParagraf()
			tutupList()
			if (!dalamTabel) {
				hasil.push('<div class="tabel-markdown-wrap"><table class="tabel-markdown">')
				dalamTabel = true
			}
			if (b.includes('---')) {
				continue
			}
			const kolom = b.split('|').slice(1, -1)
			let tr = '<tr>'
			for (let k = 0; k < kolom.length; k++) {
				tr += '<td>' + formatCell(kolom[k].trim()) + '</td>'
			}
			tr += '</tr>'
			hasil.push(tr)
			continue
		} else if (dalamTabel) {
			tutupTabel()
		}

		if (b.startsWith('#### ')) {
			flushParagraf()
			tutupList()
			hasil.push('<h4>' + formatInline(b.substring(5)) + '</h4>')
		} else if (b.startsWith('### ')) {
			flushParagraf()
			tutupList()
			hasil.push('<h4>' + formatInline(b.substring(4)) + '</h4>')
		} else if (b.startsWith('## ') || b.startsWith('# ')) {
			flushParagraf()
			tutupList()
			const isi = b.startsWith('## ') ? b.substring(3) : b.substring(2)
			hasil.push('<h3>' + formatInline(isi) + '</h3>')
		} else if (/^[-*+•]\s+/.test(b) || /^\d+[.)]\s+/.test(b)) {
			flushParagraf()
			if (!dalamList) {
				hasil.push('<ul>')
				dalamList = true
			}
			const isi = b.replace(/^[-*+•]\s+/, '').replace(/^\d+[.)]\s+/, '')
			hasil.push('<li>' + formatInline(isi) + '</li>')
		} else if (b.startsWith('> ')) {
			flushParagraf()
			tutupList()
			hasil.push('<blockquote style="border-left: 3px solid #3b5d50; padding-left: 10px; margin: 0.5rem 0; color: #555;">' + formatInline(b.substring(2)) + '</blockquote>')
		} else if (b === '---' || b === '***') {
			flushParagraf()
			tutupList()
			hasil.push('<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 0.75rem 0;">')
		} else if (b === '') {
			flushParagraf()
			tutupList()
		} else {
			tutupList()
			bufferParagraf.push(b)
		}
	}

	flushParagraf()
	tutupList()
	tutupTabel()

	if (dalamCode) {
		hasil.push('<div class="code-box-wrapper"><pre><code>' + bufferCode.join('\n') + '</code></pre></div>')
	}

	return hasil.join('')
}

function formatCell(str) {
	if (!str) return ''
	let clean = formatInline(str)
	clean = clean.replace(/\\n/g, '<br>').replace(/\s*-\s+/g, '<br>• ')
	if (clean.startsWith('<br>• ')) {
		clean = clean.substring(4)
	}
	return clean
}

function formatInline(str) {
	if (!str) return ''
	return str
		.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/__(.*?)__/g, '<strong>$1</strong>')
		.replace(/\*(.*?)\*/g, '<em>$1</em>')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
}

function aturTinggiTextarea() {
	if (!textareaChat) {
		return
	}
	textareaChat.style.height = 'auto'
	const scrollH = textareaChat.scrollHeight
	const tinggiBaru = Math.min(Math.max(scrollH, 38), 180)
	textareaChat.style.height = tinggiBaru + 'px'
	if (scrollH > 180) {
		textareaChat.scrollTop = scrollH
	}
}

function setStatusTombol(streaming) {
	sedangStreaming = streaming
	if (!tombolAksiChat) {
		return
	}

	if (streaming) {
		tombolAksiChat.classList.add('mode-stop')
		tombolAksiChat.title = 'Hentikan Respon'
		tombolAksiChat.innerHTML = svgStop
	} else {
		tombolAksiChat.classList.remove('mode-stop')
		tombolAksiChat.title = 'Kirim Pesan'
		tombolAksiChat.innerHTML = svgKirim
	}
}

function cekJarakBawah() {
	if (!daftarChatArea) {
		return 0
	}
	return daftarChatArea.scrollHeight - daftarChatArea.scrollTop - daftarChatArea.clientHeight
}

function tanganiScrollUser() {
	if (!daftarChatArea) {
		return
	}
	const jarak = cekJarakBawah()
	if (jarak > 30) {
		autoScrollAktif = false
		if (btnScrollBottom) {
			btnScrollBottom.style.display = 'inline-flex'
		}
	} else {
		autoScrollAktif = true
		if (btnScrollBottom) {
			btnScrollBottom.style.display = 'none'
		}
	}
}

function scrollKeBawahOtomatis() {
	if (!daftarChatArea) {
		return
	}
	if (autoScrollAktif) {
		daftarChatArea.scrollTop = daftarChatArea.scrollHeight
	}
}

function buatElemenPesan(peran, teksAwal) {
	if (sapaanCard) {
		sapaanCard.style.display = 'none'
	}

	const baris = document.createElement('div')
	baris.className = 'chat-message-row ' + (peran === 'user' ? 'saya' : 'ai')

	if (peran === 'user') {
		const wrapUser = document.createElement('div')
		wrapUser.style.display = 'flex'
		wrapUser.style.flexDirection = 'column'
		wrapUser.style.alignItems = 'flex-end'

		const bubble = document.createElement('div')
		bubble.className = 'chat-bubble-isi'
		bubble.textContent = teksAwal || ''
		wrapUser.appendChild(bubble)

		baris.appendChild(wrapUser)
	} else {
		const avatar = document.createElement('div')
		avatar.className = 'chat-avatar-msg ai-ava'
		avatar.innerHTML = svgSparkle

		const wrapIsi = document.createElement('div')
		wrapIsi.className = 'chat-ai-content-wrap'

		const bubble = document.createElement('div')
		bubble.className = 'chat-bubble-isi chat-markdown-body'
		bubble.innerHTML = teksAwal ? parseMarkdownSederhana(teksAwal) : ''

		const actions = document.createElement('div')
		actions.className = 'pesan-ai-actions'
		actions.style.display = 'none'

		const btnSalin = document.createElement('button')
		btnSalin.className = 'btn-action-mini'
		btnSalin.title = 'Salin'
		btnSalin.innerHTML = svgSalin
		btnSalin.addEventListener('click', function () {
			salinBalasanPesan(bubble, btnSalin)
		})

		const btnUlang = document.createElement('button')
		btnUlang.className = 'btn-action-mini'
		btnUlang.title = 'Generate Ulang'
		btnUlang.innerHTML = svgUlangi
		btnUlang.addEventListener('click', function () {
			if (pesanTerakhirUser && !sedangStreaming) {
				kirimPesanChat(pesanTerakhirUser)
			}
		})

		const btnLike = document.createElement('button')
		btnLike.className = 'btn-action-mini'
		btnLike.title = 'Suka'
		btnLike.innerHTML = svgJempolAtas
		btnLike.addEventListener('click', function () {
			btnLike.classList.toggle('aktif')
		})

		const btnDislike = document.createElement('button')
		btnDislike.className = 'btn-action-mini'
		btnDislike.title = 'Tidak Suka'
		btnDislike.innerHTML = svgJempolBawah
		btnDislike.addEventListener('click', function () {
			btnDislike.classList.toggle('aktif')
		})

		actions.appendChild(btnSalin)
		actions.appendChild(btnUlang)
		actions.appendChild(btnLike)
		actions.appendChild(btnDislike)

		wrapIsi.appendChild(bubble)
		wrapIsi.appendChild(actions)

		baris.appendChild(avatar)
		baris.appendChild(wrapIsi)
	}

	chatInner.appendChild(baris)
	if (peran === 'user') {
		autoScrollAktif = true
		daftarChatArea.scrollTop = daftarChatArea.scrollHeight
		if (btnScrollBottom) {
			btnScrollBottom.style.display = 'none'
		}
	}
	return baris.querySelector('.chat-markdown-body') || baris.querySelector('.chat-bubble-isi')
}

function parseProdukDariTeks(teksUser, teksAI) {
	if (!seluruhProdukRekom || seluruhProdukRekom.length === 0) return []

	const gabunganTeks = ((teksUser || '') + ' ' + (teksAI || '')).toLowerCase()
	const teksAILower = ((teksAI || '')).toLowerCase()
	const produkHasil = []
	const idSudahAda = new Set()

	function tambahProduk(p) {
		if (p && !idSudahAda.has(p.id)) {
			idSudahAda.add(p.id)
			produkHasil.push(p)
		}
	}

	for (let i = 0; i < seluruhProdukRekom.length; i++) {
		const item = seluruhProdukRekom[i]
		const titleLower = item.title.toLowerCase()

		if (teksAILower.includes(titleLower)) {
			tambahProduk(item)
			continue
		}

		const kataTitle = titleLower.split(/[\s\-]+/)
		let cocok = 0
		for (let k = 0; k < kataTitle.length; k++) {
			if (kataTitle[k].length >= 3 && teksAILower.includes(kataTitle[k])) {
				cocok++
			}
		}
		const threshold = Math.max(1, Math.ceil(kataTitle.filter(function(w) { return w.length >= 3 }).length * 0.6))
		if (cocok >= threshold && cocok >= 2) {
			tambahProduk(item)
		}
	}

	const petaKategori = {
		'groceries': ['kucing', 'cat food', 'anjing', 'dog food', 'daging', 'steak', 'ayam', 'chicken', 'ikan', 'fish', 'telur', 'egg', 'beras', 'rice', 'susu', 'milk', 'kopi', 'coffee', 'madu', 'honey', 'jus', 'juice', 'minyak', 'sembako', 'makanan', 'minuman'],
		'furniture': ['sofa', 'kursi', 'chair', 'meja', 'table', 'ranjang', 'kasur', 'bed', 'wastafel', 'sink', 'furnitur'],
		'kitchen-accessories': ['blender', 'panci', 'wajan', 'wok', 'pisau', 'knife', 'talenan', 'spatula', 'microwave', 'oven', 'dapur', 'kitchen', 'masak', 'kompor'],
		'fragrances': ['parfum', 'wangi', 'fragrance', 'calvin', 'chanel', 'dior', 'gucci', 'cologne', 'perfume'],
		'beauty': ['maskara', 'lipstik', 'lipstick', 'bedak', 'eyeshadow', 'kutek', 'makeup', 'kosmetik', 'beauty', 'kecantikan'],
		'laptops': ['laptop', 'macbook', 'komputer', 'notebook']
	}

	if (produkHasil.length === 0) {
		const kategoriKunci = Object.keys(petaKategori)
		for (let c = 0; c < kategoriKunci.length; c++) {
			const kunciList = petaKategori[kategoriKunci[c]]
			let ditemukan = false
			for (let kw = 0; kw < kunciList.length; kw++) {
				if (gabunganTeks.includes(kunciList[kw])) {
					ditemukan = true
					break
				}
			}
			if (ditemukan) {
				const kategoriLower = kategoriKunci[c]
				const filtered = seluruhProdukRekom.filter(function(p) {
					return (p.category || '').toLowerCase() === kategoriLower
				})
				for (let f = 0; f < filtered.length; f++) {
					tambahProduk(filtered[f])
				}
			}
		}
	}

	return produkHasil
}

function cocokkanRekomendasiDenganPercakapan(teksUser, teksAI) {
	if (!seluruhProdukRekom || seluruhProdukRekom.length === 0) return

	const produkCocok = parseProdukDariTeks(teksUser, teksAI)
	if (produkCocok && produkCocok.length > 0) {
		rekomendasiAktif = produkCocok
		gambarRekomendasi(rekomendasiAktif)
		gambarPaketBundel(rekomendasiAktif)
		if (jmlRekomFloating) {
			jmlRekomFloating.textContent = rekomendasiAktif.length
		}
		bukaTutupPanelRekomendasi(true)
	}
}

function gambarPaketBundel(daftarProduk, konteksTeks) {
	const wadahPaket = document.getElementById('daftarPaketBundelAI')
	if (!wadahPaket) return

	while (wadahPaket.firstChild) {
		wadahPaket.removeChild(wadahPaket.firstChild)
	}

	if (!daftarProduk || daftarProduk.length === 0) {
		wadahPaket.innerHTML = `
			<div class="rekomendasi-kosong-box">
				<div class="rekomendasi-kosong-icon">
					<img src="assets/images/logo/logo_icon.svg" style="width: 32px; height: 32px;" alt="Logo WhisperCart">
				</div>
				<h4>Paket Rekomendasi AI</h4>
				<p>Mulai percakapan dengan Whisper AI untuk mendapatkan bundel Paket Hemat dan Paket Komplit.</p>
			</div>
		`
		return
	}

	const itemHemat = daftarProduk.slice(0, 2)
	let totalHemat = 0
	for (let i = 0; i < itemHemat.length; i++) {
		totalHemat += Number(itemHemat[i].price || 0)
	}

	let htmlItemHemat = ''
	for (let i = 0; i < itemHemat.length; i++) {
		const item = itemHemat[i]
		htmlItemHemat += `
			<div class="d-flex align-items-center gap-2 mb-2 pb-2 ${i < itemHemat.length - 1 ? 'border-bottom' : ''}">
				<img src="${item.thumbnail || item.image || 'assets/images/product-1.png'}" style="width: 44px; height: 44px; object-fit: contain; background: #f8faf9; border-radius: 8px; padding: 2px;" alt="${item.title}">
				<div class="flex-grow-1 overflow-hidden">
					<div class="text-dark font-weight-bold text-truncate" style="font-size: 0.85rem;">${item.title}</div>
					<small class="text-success font-weight-bold">${formatUang(item.price)}</small>
				</div>
			</div>
		`
	}

	const kartuHemat = document.createElement('div')
	kartuHemat.className = 'paket-bundel-card mb-3'
	kartuHemat.innerHTML = `
		<div class="d-flex align-items-center justify-content-between mb-2">
			<span class="badge bg-success text-white font-weight-bold px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
				<img src="assets/images/logo/logo_icon.svg" style="width: 14px; height: 14px; filter: brightness(0) invert(1);" alt="Logo">
				<span>Paket Hemat</span>
			</span>
			<span class="text-muted small">${itemHemat.length} Item Esensial</span>
		</div>
		<h5 class="font-weight-bold text-dark mb-1" style="font-size: 0.95rem;">Paket Hemat Pilihan AI</h5>
		<p class="text-muted small mb-2">2 produk utama pilihan terbaik untuk kebutuhan belanja hemat Anda.</p>
		<div class="mb-3">${htmlItemHemat}</div>
		<div class="d-flex align-items-center justify-content-between pt-2 border-top">
			<div>
				<small class="text-muted d-block" style="font-size: 0.75rem;">Total Paket</small>
				<strong class="text-success fs-6">${formatUang(totalHemat)}</strong>
			</div>
			<button class="btn btn-sm text-white font-weight-bold px-3 py-2 rounded-pill shadow-sm btn-beli-paket-hemat" style="background: #3b5d50; border: none;">
				<i class="fas fa-shopping-cart me-1"></i> Beli Paket Hemat
			</button>
		</div>
	`

	wadahPaket.appendChild(kartuHemat)

	const btnBeliHemat = kartuHemat.querySelector('.btn-beli-paket-hemat')
	if (btnBeliHemat) {
		btnBeliHemat.addEventListener('click', function () {
			tambahBanyakItemKeranjang(itemHemat, 'Paket Hemat')
		})
	}

	const batasKomplit = Math.min(daftarProduk.length, 4)
	if (batasKomplit >= 2) {
		const itemKomplit = daftarProduk.slice(0, batasKomplit)
		let totalKomplit = 0
		for (let i = 0; i < itemKomplit.length; i++) {
			totalKomplit += Number(itemKomplit[i].price || 0)
		}

		let htmlItemKomplit = ''
		for (let i = 0; i < itemKomplit.length; i++) {
			const item = itemKomplit[i]
			htmlItemKomplit += `
				<div class="d-flex align-items-center gap-2 mb-2 pb-2 ${i < itemKomplit.length - 1 ? 'border-bottom' : ''}">
					<img src="${item.thumbnail || item.image || 'assets/images/product-1.png'}" style="width: 44px; height: 44px; object-fit: contain; background: #f8faf9; border-radius: 8px; padding: 2px;" alt="${item.title}">
					<div class="flex-grow-1 overflow-hidden">
						<div class="text-dark font-weight-bold text-truncate" style="font-size: 0.85rem;">${item.title}</div>
						<small class="text-success font-weight-bold">${formatUang(item.price)}</small>
					</div>
				</div>
			`
		}

		const kartuKomplit = document.createElement('div')
		kartuKomplit.className = 'paket-bundel-card mb-3'
		kartuKomplit.innerHTML = `
			<div class="d-flex align-items-center justify-content-between mb-2">
				<span class="badge bg-warning text-dark font-weight-bold px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
					<img src="assets/images/logo/logo_icon.svg" style="width: 14px; height: 14px; filter: brightness(0);" alt="Logo">
					<span>Paket Komplit</span>
				</span>
				<span class="text-muted small">${itemKomplit.length} Item Lengkap</span>
			</div>
			<h5 class="font-weight-bold text-dark mb-1" style="font-size: 0.95rem;">Paket Komplit Siap Pakai</h5>
			<p class="text-muted small mb-2">Set lengkap rekomendasi AI untuk pengalaman belanja terbaik tanpa repot.</p>
			<div class="mb-3">${htmlItemKomplit}</div>
			<div class="d-flex align-items-center justify-content-between pt-2 border-top">
				<div>
					<small class="text-muted d-block" style="font-size: 0.75rem;">Total Paket</small>
					<strong class="text-success fs-6">${formatUang(totalKomplit)}</strong>
				</div>
				<button class="btn btn-sm text-dark font-weight-bold px-3 py-2 rounded-pill shadow-sm btn-beli-paket-komplit" style="background: #f8b810; border: none;">
					<i class="fas fa-shopping-cart me-1"></i> Beli Paket Komplit
				</button>
			</div>
		`

		wadahPaket.appendChild(kartuKomplit)

		const btnBeliKomplit = kartuKomplit.querySelector('.btn-beli-paket-komplit')
		if (btnBeliKomplit) {
			btnBeliKomplit.addEventListener('click', function () {
				tambahBanyakItemKeranjang(itemKomplit, 'Paket Komplit')
			})
		}
	}
}

async function kirimPesanChat(teksCustom) {
	if (sedangStreaming) {
		if (controllerStreaming) {
			controllerStreaming.abort()
		}
		return
	}

	const pesan = (typeof teksCustom === 'string' ? teksCustom : textareaChat.value).trim()

	if (!pesan) {
		return
	}

	pesanTerakhirUser = pesan
	buatElemenPesan('user', pesan)

	if (textareaChat) {
		textareaChat.value = ''
		aturTinggiTextarea()
	}

	const bubbleAI = buatElemenPesan('assistant', '')
	const actionsWrap = bubbleAI.parentElement.querySelector('.pesan-ai-actions')

	autoScrollAktif = true
	setStatusTombol(true)
	controllerStreaming = new AbortController()
	teksDitampilkanStream = ''

	let sisaChunk = ''

	try {
		const respon = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ pesan: pesan, riwayat: riwayatPercakapan }),
			signal: controllerStreaming.signal
		})

		if (respon.status === 401) {
			window.location.href = 'login.html'
			return
		}

		if (!respon.ok) {
			let errorData = null
			try {
				errorData = await respon.json()
			} catch (e) {}
			teksDitampilkanStream = (errorData && errorData.message) ? errorData.message : 'Gagal menghubungi asisten AI.'
			bubbleAI.innerHTML = parseMarkdownSederhana(teksDitampilkanStream)
		} else {
			const reader = respon.body.getReader()
			const decoder = new TextDecoder()

			while (true) {
				const bagian = await reader.read()
				if (bagian.done) {
					break
				}

				sisaChunk = sisaChunk + decoder.decode(bagian.value, { stream: true })
				const baris = sisaChunk.split('\n')
				sisaChunk = baris.pop()

				for (let i = 0; i < baris.length; i++) {
					const barisTeks = baris[i].trim()
					if (barisTeks.indexOf('data: ') === 0) {
						const dataPayload = barisTeks.slice(6)
						if (dataPayload !== '[SELESAI]' && dataPayload !== '[DONE]') {
							try {
								const obj = JSON.parse(dataPayload)
								if (obj.teks) {
									teksDitampilkanStream = teksDitampilkanStream + obj.teks
									bubbleAI.innerHTML = parseMarkdownSederhana(teksDitampilkanStream)
									scrollKeBawahOtomatis()
								}
							} catch (e) {}
						}
					}
				}
			}
		}
	} catch (err) {
		if (err.name !== 'AbortError') {
			teksDitampilkanStream = 'Maaf, terjadi kendala saat terhubung ke server asisten AI.'
			bubbleAI.innerHTML = parseMarkdownSederhana(teksDitampilkanStream)
		} else {
			if (!teksDitampilkanStream) {
				teksDitampilkanStream = 'Respon dihentikan.'
				bubbleAI.innerHTML = parseMarkdownSederhana(teksDitampilkanStream)
			}
		}
	}

	bubbleAI.innerHTML = parseMarkdownSederhana(teksDitampilkanStream)
	if (actionsWrap) {
		actionsWrap.style.display = 'flex'
	}
	if (teksDitampilkanStream && teksDitampilkanStream !== 'Respon dihentikan.') {
		riwayatPercakapan.push({ peran: 'user', isi: pesan })
		riwayatPercakapan.push({ peran: 'ai', isi: teksDitampilkanStream })
		cocokkanRekomendasiDenganPercakapan(pesan, teksDitampilkanStream)
	}
	setStatusTombol(false)
	controllerStreaming = null
	if (textareaChat) {
		textareaChat.focus()
	}
}

function salinBalasanPesan(elemenBubble, tombol) {
	const teks = elemenBubble.innerText || elemenBubble.textContent
	if (!navigator.clipboard) {
		return
	}
	navigator.clipboard.writeText(teks).then(function () {
		tombol.innerHTML = svgCentang
		setTimeout(function () {
			tombol.innerHTML = svgSalin
		}, 2000)
	})
}

function salinTeksKode(btn) {
	const pre = btn.parentElement.nextElementSibling
	const code = pre ? pre.querySelector('code') : null
	if (!code || !navigator.clipboard) {
		return
	}
	const teks = code.innerText || code.textContent
	navigator.clipboard.writeText(teks).then(function () {
		btn.textContent = 'Tersalin!'
		setTimeout(function () {
			btn.textContent = 'Salin'
		}, 2000)
	})
}

function obrolanBaru() {
	if (sedangStreaming && controllerStreaming) {
		controllerStreaming.abort()
	}

	teksDitampilkanStream = ''
	riwayatPercakapan.length = 0
	pesanTerakhirUser = ''

	while (chatInner.firstChild) {
		chatInner.removeChild(chatInner.firstChild)
	}

	if (sapaanCard) {
		chatInner.appendChild(sapaanCard)
		sapaanCard.style.display = 'block'
	}

	autoScrollAktif = true
	if (btnScrollBottom) {
		btnScrollBottom.style.display = 'none'
	}

	if (textareaChat) {
		textareaChat.value = ''
		aturTinggiTextarea()
		textareaChat.focus()
	}

	setStatusTombol(false)
	rekomendasiAktif = []
	tampilkanKeadaanKosongRekomendasi()
	bukaTutupPanelRekomendasi(false)
	if (btnBukaRekomFloating) {
		btnBukaRekomFloating.style.display = 'none'
	}
}

function tampilkanToastRekom(teks) {
	if (!toastRekomNotif) {
		return
	}
	toastRekomNotif.textContent = teks
	toastRekomNotif.style.display = 'flex'
	setTimeout(function () {
		toastRekomNotif.style.display = 'none'
	}, 2500)
}

function tambahBanyakItemKeranjang(daftarItem, namaPaket) {
	if (!daftarItem || daftarItem.length === 0) return

	let keranjang = []
	const simpanan = localStorage.getItem('keranjang')
	if (simpanan) {
		try {
			keranjang = JSON.parse(simpanan)
			if (!Array.isArray(keranjang)) {
				keranjang = []
			}
		} catch (e) {
			keranjang = []
		}
	}

	keranjang = keranjang.filter(function (item) {
		return !item.dariPaket
	})

	for (let i = 0; i < daftarItem.length; i++) {
		const produk = daftarItem[i]
		const idPaket = produk.id + '_paket'
		keranjang.push({
			id: idPaket,
			title: produk.title,
			price: produk.price,
			image: produk.image || produk.thumbnail || 'assets/images/product-1.png',
			category: (produk.category || 'umum') + ' (Paket AI)',
			jumlah: 1,
			dariPaket: true
		})
	}

	localStorage.setItem('keranjang', JSON.stringify(keranjang))
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}
	tampilkanToastRekom(namaPaket + ' berhasil dimasukkan ke keranjang!')
}

function tambahKeranjangRekom(produk) {
	let keranjang = []
	const simpanan = localStorage.getItem('keranjang')
	if (simpanan) {
		try {
			keranjang = JSON.parse(simpanan)
			if (!Array.isArray(keranjang)) {
				keranjang = []
			}
		} catch (e) {
			keranjang = []
		}
	}

	let ada = false
	for (let i = 0; i < keranjang.length; i++) {
		if (keranjang[i].id === produk.id) {
			keranjang[i].jumlah = (keranjang[i].jumlah || 1) + 1
			ada = true
			break
		}
	}

	if (!ada) {
		keranjang.push({
			id: produk.id,
			title: produk.title,
			price: produk.price,
			image: produk.image || produk.thumbnail,
			jumlah: 1
		})
	}

	localStorage.setItem('keranjang', JSON.stringify(keranjang))
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}
	tampilkanToastRekom('Ditambahkan ke keranjang!')
}

function tambahSemuaKeranjangRekom() {
	if (!rekomendasiAktif || rekomendasiAktif.length === 0) {
		return
	}
	let keranjang = []
	const simpanan = localStorage.getItem('keranjang')
	if (simpanan) {
		try {
			keranjang = JSON.parse(simpanan)
			if (!Array.isArray(keranjang)) {
				keranjang = []
			}
		} catch (e) {
			keranjang = []
		}
	}

	let batas = Math.min(rekomendasiAktif.length, 10)
	for (let i = 0; i < batas; i++) {
		const produk = rekomendasiAktif[i]
		let ada = false
		for (let j = 0; j < keranjang.length; j++) {
			if (keranjang[j].id === produk.id) {
				keranjang[j].jumlah = (keranjang[j].jumlah || 1) + 1
				ada = true
				break
			}
		}
		if (!ada) {
			keranjang.push({
				id: produk.id,
				title: produk.title,
				price: produk.price,
				image: produk.image || produk.thumbnail,
				jumlah: 1
			})
		}
	}

	localStorage.setItem('keranjang', JSON.stringify(keranjang))
	if (typeof perbaruiSidebarBadge === 'function') {
		perbaruiSidebarBadge()
	}
	tampilkanToastRekom('Semua paket rekomendasi AI berhasil dimasukkan ke keranjang!')
}

function tampilkanKeadaanKosongRekomendasi() {
	if (!daftarRekomendasiAI) {
		return
	}

	while (daftarRekomendasiAI.firstChild) {
		daftarRekomendasiAI.removeChild(daftarRekomendasiAI.firstChild)
	}

	const box = document.createElement('div')
	box.className = 'rekomendasi-kosong-box'

	const icon = document.createElement('div')
	icon.className = 'rekomendasi-kosong-icon'
	icon.innerHTML = svgSparkle

	const h4 = document.createElement('h4')
	h4.textContent = 'Menunggu Rekomendasi AI'

	const p = document.createElement('p')
	p.textContent = 'Tanyakan kebutuhan belanja Anda ke Whisper AI. Produk yang direkomendasikan AI akan otomatis muncul di panel ini.'

	box.appendChild(icon)
	box.appendChild(h4)
	box.appendChild(p)
	daftarRekomendasiAI.appendChild(box)

	const wadahBtnBeliSemua = document.getElementById('wadahBtnBeliSemua')
	if (wadahBtnBeliSemua) {
		wadahBtnBeliSemua.style.display = 'none'
	}
}

function tampilkanSkeletonRekomendasi() {
	if (!daftarRekomendasiAI) return
	while (daftarRekomendasiAI.firstChild) {
		daftarRekomendasiAI.removeChild(daftarRekomendasiAI.firstChild)
	}
	for (let i = 0; i < 3; i++) {
		const sk = document.createElement('div')
		sk.className = 'skeleton-card-item'
		sk.innerHTML = `
			<div class="skeleton-box skeleton-img"></div>
			<div style="flex: 1;">
				<div class="skeleton-box skeleton-line" style="width: 50%;"></div>
				<div class="skeleton-box skeleton-line" style="width: 90%;"></div>
				<div class="skeleton-box skeleton-line" style="width: 40%; margin-top: 10px;"></div>
			</div>
		`
		daftarRekomendasiAI.appendChild(sk)
	}
}

function gambarRekomendasi(daftar) {
	if (!daftarRekomendasiAI) {
		return
	}

	while (daftarRekomendasiAI.firstChild) {
		daftarRekomendasiAI.removeChild(daftarRekomendasiAI.firstChild)
	}

	const wadahBtnBeliSemua = document.getElementById('wadahBtnBeliSemua')

	if (!daftar || daftar.length === 0) {
		if (wadahBtnBeliSemua) wadahBtnBeliSemua.style.display = 'none'
		tampilkanKeadaanKosongRekomendasi()
		return
	}

	if (wadahBtnBeliSemua) {
		wadahBtnBeliSemua.style.display = 'block'
	}

	const batas = Math.min(daftar.length, 10)

	for (let i = 0; i < batas; i++) {
		const item = daftar[i]

		const kartu = document.createElement('div')
		kartu.className = 'kartu-rekom-item'

		const img = document.createElement('img')
		img.src = item.image || item.thumbnail || 'assets/images/product-1.png'
		img.alt = item.title
		img.className = 'kartu-rekom-img'

		const info = document.createElement('div')
		info.className = 'kartu-rekom-info'

		const tag = document.createElement('div')
		tag.className = 'kartu-rekom-tag d-flex align-items-center flex-wrap gap-1'

		let badgeTeks = ''
		if (daftar.length >= 3) {
			if (i === 0) {
				badgeTeks = '<span class="badge bg-warning text-dark me-1" style="font-size: 0.65rem; border-radius: 4px;"><i class="fas fa-trophy text-white me-1"></i>Top 1</span>'
			} else if (i === 1) {
				badgeTeks = '<span class="badge bg-light text-dark border me-1" style="font-size: 0.65rem; border-radius: 4px;"><i class="fas fa-medal me-1" style="color: #94a3b8;"></i>Top 2</span>'
			} else if (i === 2) {
				badgeTeks = '<span class="badge bg-light text-dark border me-1" style="font-size: 0.65rem; border-radius: 4px;"><i class="fas fa-medal me-1" style="color: #b45309;"></i>Top 3</span>'
			}
		} else {
			if (i === 0) {
				badgeTeks = '<span class="badge bg-warning text-dark me-1" style="font-size: 0.65rem; border-radius: 4px;"><i class="fas fa-star text-white me-1"></i>Top Rekomendasi</span>'
			}
		}

		tag.innerHTML = badgeTeks + '<img src="assets/images/logo/logo_icon.svg" style="width: 12px; height: 12px; filter: brightness(0); vertical-align: -1px; margin-right: 4px;" alt="Logo"> AI Match: ' + (item.category || 'Furnitur')

		const judul = document.createElement('div')
		judul.className = 'kartu-rekom-judul'
		judul.textContent = item.title

		const bawah = document.createElement('div')
		bawah.className = 'kartu-rekom-bawah'

		const harga = document.createElement('div')
		harga.className = 'kartu-rekom-harga'
		harga.textContent = formatUang(item.price)

		const btnTambah = document.createElement('button')
		btnTambah.className = 'btn-tambah-rekom'
		btnTambah.innerHTML = '+ Keranjang'
		btnTambah.addEventListener('click', function () {
			tambahKeranjangRekom(item)
		})

		bawah.appendChild(harga)
		bawah.appendChild(btnTambah)

		info.appendChild(tag)
		info.appendChild(judul)
		info.appendChild(bawah)

		kartu.appendChild(img)
		kartu.appendChild(info)
		daftarRekomendasiAI.appendChild(kartu)
	}
}

async function siapkanKatalogProduk() {
	try {
		const res = await fetch('/api/products?batas=100')
		if (res.ok) {
			const data = await res.json()
			seluruhProdukRekom = data || []
			return
		}
	} catch (e) {}

	try {
		const resFallback = await fetch('https://dummyjson.com/products?limit=100')
		if (resFallback.ok) {
			const json = await resFallback.json()
			seluruhProdukRekom = json.products || []
		}
	} catch (e) {}
}

function bukaTutupPanelRekomendasi(buka) {
	if (!panelRekomendasi) {
		return
	}

	if (typeof buka === 'boolean') {
		if (buka) {
			panelRekomendasi.classList.remove('tersembunyi')
			if (btnBukaRekomFloating) {
				btnBukaRekomFloating.style.display = 'none'
			}
		} else {
			panelRekomendasi.classList.add('tersembunyi')
			if (btnBukaRekomFloating && rekomendasiAktif && rekomendasiAktif.length > 0) {
				btnBukaRekomFloating.style.display = 'inline-flex'
			}
		}
	} else {
		panelRekomendasi.classList.toggle('tersembunyi')
		const sedangTerbuka = !panelRekomendasi.classList.contains('tersembunyi')
		if (btnBukaRekomFloating) {
			if (sedangTerbuka) {
				btnBukaRekomFloating.style.display = 'none'
			} else if (rekomendasiAktif && rekomendasiAktif.length > 0) {
				btnBukaRekomFloating.style.display = 'inline-flex'
			}
		}
	}
}

if (daftarChatArea) {
	daftarChatArea.addEventListener('scroll', tanganiScrollUser)
	daftarChatArea.addEventListener('wheel', function (e) {
		if (e.deltaY < 0) {
			autoScrollAktif = false
			if (btnScrollBottom) {
				btnScrollBottom.style.display = 'inline-flex'
			}
		}
	}, { passive: true })
	daftarChatArea.addEventListener('touchmove', function () {
		tanganiScrollUser()
	}, { passive: true })
}

if (btnScrollBottom) {
	btnScrollBottom.addEventListener('click', function () {
		autoScrollAktif = true
		daftarChatArea.scrollTo({ top: daftarChatArea.scrollHeight, behavior: 'smooth' })
		btnScrollBottom.style.display = 'none'
	})
}

if (textareaChat) {
	textareaChat.addEventListener('input', aturTinggiTextarea)
	textareaChat.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			kirimPesanChat()
		}
	})
}

if (tombolAksiChat) {
	tombolAksiChat.addEventListener('click', function () {
		kirimPesanChat()
	})
}

if (tombolChatBaru) {
	tombolChatBaru.addEventListener('click', obrolanBaru)
}

if (tombolChatBaruSidebar) {
	tombolChatBaruSidebar.addEventListener('click', obrolanBaru)
}

if (btnBukaRekomFloating) {
	btnBukaRekomFloating.addEventListener('click', function () {
		bukaTutupPanelRekomendasi(true)
	})
}

if (btnTutupRekom) {
	btnTutupRekom.addEventListener('click', function () {
		bukaTutupPanelRekomendasi(false)
	})
}

const btnTabRekomIndividu = document.getElementById('btnTabRekomIndividu')
const btnTabPaketBundel = document.getElementById('btnTabPaketBundel')
const secRekomIndividu = document.getElementById('secRekomIndividu')
const secPaketBundel = document.getElementById('secPaketBundel')

if (btnTabRekomIndividu && btnTabPaketBundel) {
	btnTabRekomIndividu.addEventListener('click', function () {
		btnTabRekomIndividu.classList.add('aktif', 'text-white')
		btnTabRekomIndividu.classList.remove('text-muted')
		btnTabRekomIndividu.style.background = '#3b5d50'

		btnTabPaketBundel.classList.remove('aktif', 'text-white')
		btnTabPaketBundel.classList.add('text-muted')
		btnTabPaketBundel.style.background = 'transparent'

		if (secRekomIndividu) secRekomIndividu.style.display = 'flex'
		if (secPaketBundel) secPaketBundel.style.display = 'none'
	})

	btnTabPaketBundel.addEventListener('click', function () {
		btnTabPaketBundel.classList.add('aktif', 'text-white')
		btnTabPaketBundel.classList.remove('text-muted')
		btnTabPaketBundel.style.background = '#3b5d50'

		btnTabRekomIndividu.classList.remove('aktif', 'text-white')
		btnTabRekomIndividu.classList.add('text-muted')
		btnTabRekomIndividu.style.background = 'transparent'

		if (secRekomIndividu) secRekomIndividu.style.display = 'none'
		if (secPaketBundel) secPaketBundel.style.display = 'flex'
	})
}

const btnBeliSemuaPaket = document.getElementById('btnBeliSemuaPaket')
if (btnBeliSemuaPaket) {
	btnBeliSemuaPaket.addEventListener('click', function () {
		tambahSemuaKeranjangRekom()
	})
}

const tombolSaran = document.querySelectorAll('.btn-saran-chip')
for (let i = 0; i < tombolSaran.length; i++) {
	tombolSaran[i].addEventListener('click', function () {
		const teks = this.getAttribute('data-prompt')
		if (teks) {
			kirimPesanChat(teks)
		}
	})
}

const chipsKategori = document.querySelectorAll('.chip-kategori-rekom')
for (let i = 0; i < chipsKategori.length; i++) {
	chipsKategori[i].addEventListener('click', function () {
		for (let j = 0; j < chipsKategori.length; j++) {
			chipsKategori[j].classList.remove('aktif')
		}
		this.classList.add('aktif')

		const kat = this.getAttribute('data-kat')
		const sumber = (rekomendasiAktif.length > 0 ? rekomendasiAktif : seluruhProdukRekom)

		if (!kat || kat === 'semua') {
			gambarRekomendasi(sumber)
		} else {
			const disaring = []
			for (let k = 0; k < sumber.length; k++) {
				const item = sumber[k]
				const itemKat = (item.category || '').toLowerCase()
				if (itemKat.indexOf(kat.toLowerCase()) !== -1) {
					disaring.push(item)
				}
			}
			gambarRekomendasi(disaring)
		}
	})
}

tampilkanKeadaanKosongRekomendasi()
siapkanKatalogProduk()

const btnTabModeTeks = document.getElementById('btnTabModeTeks')
const btnTabModeVoice = document.getElementById('btnTabModeVoice')
const btnBukaLiveVoice = document.getElementById('btnBukaLiveVoice')
const btnMicInput = document.getElementById('btnMicInput')
const btnKembaliTeks = document.getElementById('btnKembaliTeks')
const daftarChatBesar = document.getElementById('daftarChatBesar')
const aiInputFloating = document.getElementById('aiInputFloating')
const aiVoiceArea = document.getElementById('aiVoiceArea')
const btnVoiceMicMain = document.getElementById('btnVoiceMicMain')
const iconMicMain = document.getElementById('iconMicMain')
const iconStopMain = document.getElementById('iconStopMain')
const voiceStatusJudul = document.getElementById('voiceStatusJudul')
const voiceStatusSub = document.getElementById('voiceStatusSub')
const voiceTranscriptCard = document.getElementById('voiceTranscriptCard')
const voiceTranscriptLabel = document.getElementById('voiceTranscriptLabel')
const voiceTranscriptTeks = document.getElementById('voiceTranscriptTeks')

let pengenalSuara = null
let audioPlayerVoice = null
let statusLiveVoice = 'idle'
let timerJedaBicara = null
let controllerVoiceStream = null

function setVoiceState(state, judul, sub) {
	statusLiveVoice = state
	if (aiVoiceArea) {
		aiVoiceArea.className = 'ai-voice-area state-' + state
	}
	if (voiceStatusJudul) {
		voiceStatusJudul.textContent = judul
	}
	if (voiceStatusSub) {
		voiceStatusSub.textContent = sub
	}

	if (iconMicMain && iconStopMain) {
		if (state === 'listening' || state === 'speaking' || state === 'thinking') {
			iconMicMain.style.display = 'none'
			iconStopMain.style.display = 'block'
		} else {
			iconMicMain.style.display = 'block'
			iconStopMain.style.display = 'none'
		}
	}
}

function hentikanVoiceLengkap() {
	if (timerJedaBicara) {
		clearTimeout(timerJedaBicara)
		timerJedaBicara = null
	}
	if (pengenalSuara) {
		try {
			pengenalSuara.abort()
		} catch (e) {}
		pengenalSuara = null
	}
	if (audioPlayerVoice) {
		try {
			audioPlayerVoice.pause()
		} catch (e) {}
		audioPlayerVoice = null
	}
	if (controllerVoiceStream) {
		try {
			controllerVoiceStream.abort()
		} catch (e) {}
		controllerVoiceStream = null
	}
	if ('speechSynthesis' in window) {
		try {
			window.speechSynthesis.cancel()
		} catch (e) {}
	}
	setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
	sedangProsesVoice = false
}

function gantiModeTampilan(mode) {
	if (mode === 'voice') {
		if (daftarChatBesar) daftarChatBesar.style.display = 'none'
		if (aiInputFloating) aiInputFloating.style.display = 'none'
		if (aiVoiceArea) aiVoiceArea.style.display = 'flex'
		if (btnTabModeVoice) btnTabModeVoice.classList.add('aktif')
		if (btnTabModeTeks) btnTabModeTeks.classList.remove('aktif')
		mulaiMendengarkanVoice()
	} else {
		hentikanVoiceLengkap()
		if (daftarChatBesar) daftarChatBesar.style.display = 'block'
		if (aiInputFloating) aiInputFloating.style.display = 'block'
		if (aiVoiceArea) aiVoiceArea.style.display = 'none'
		if (btnTabModeTeks) btnTabModeTeks.classList.add('aktif')
		if (btnTabModeVoice) btnTabModeVoice.classList.remove('aktif')
		if (textareaChat) {
			textareaChat.focus()
		}
	}
}

function mulaiMendengarkanVoice() {
	hentikanVoiceLengkap()

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

	if (!SpeechRecognition) {
		setVoiceState('error', 'Browser Belum Mendukung Mic', 'Gunakan browser modern seperti Google Chrome atau Microsoft Edge untuk fitur suara.')
		return
	}

	try {
		pengenalSuara = new SpeechRecognition()
		pengenalSuara.lang = 'id-ID'
		pengenalSuara.interimResults = true
		pengenalSuara.continuous = true

		setVoiceState('listening', 'Listening...', 'Silakan berbicara, asisten mendengarkan Anda...')

		if (voiceTranscriptCard) {
			voiceTranscriptCard.style.display = 'block'
		}
		if (voiceTranscriptLabel) {
			voiceTranscriptLabel.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg><span>Mendengarkan Anda:</span>'
		}
		if (voiceTranscriptTeks) {
			voiceTranscriptTeks.textContent = '...'
		}

		pengenalSuara.onresult = function (event) {
			let transcriptTotal = ''
			for (let i = 0; i < event.results.length; i++) {
				transcriptTotal += event.results[i][0].transcript + ' '
			}
			transcriptTotal = transcriptTotal.trim()

			if (voiceTranscriptTeks && transcriptTotal.length > 0) {
				voiceTranscriptTeks.textContent = transcriptTotal
			}

			if (timerJedaBicara) {
				clearTimeout(timerJedaBicara)
			}

			if (transcriptTotal.length > 0) {
				timerJedaBicara = setTimeout(function () {
					const teksFinal = voiceTranscriptTeks.textContent.trim()
					if (teksFinal && teksFinal !== '...' && statusLiveVoice === 'listening') {
						prosesVoiceInput(teksFinal)
					}
				}, 1100)
			}
		}

		pengenalSuara.onerror = function (event) {
			if (event.error === 'not-allowed') {
				setVoiceState('error', 'Akses Mikrofon Ditolak', 'Izinkan akses microphone di pengaturan browser Anda.')
			} else if (event.error !== 'no-speech') {
				setVoiceState('error', 'Koneksi Suara Terganggu', 'Silakan coba tekan tombol mic lagi.')
			}
		}

		pengenalSuara.onend = function () {
			if (statusLiveVoice === 'listening') {
				const teksSisa = voiceTranscriptTeks ? voiceTranscriptTeks.textContent.trim() : ''
				if (teksSisa && teksSisa !== '...') {
					prosesVoiceInput(teksSisa)
				} else {
					setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
				}
			}
		}

		pengenalSuara.start()
	} catch (e) {
		setVoiceState('error', 'Gagal Membuka Mikrofon', 'Periksa koneksi mic perangkat Anda.')
	}
}

let sedangProsesVoice = false

async function prosesVoiceInput(teksUcapan) {
	if (sedangProsesVoice) return
	sedangProsesVoice = true

	if (timerJedaBicara) {
		clearTimeout(timerJedaBicara)
		timerJedaBicara = null
	}

	if (pengenalSuara) {
		try {
			pengenalSuara.stop()
		} catch (e) {}
		pengenalSuara = null
	}

	buatElemenPesan('user', teksUcapan)
	if (voiceTranscriptLabel) {
		voiceTranscriptLabel.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg><span>Pertanyaan Anda:</span>'
	}
	if (voiceTranscriptTeks) {
		voiceTranscriptTeks.textContent = teksUcapan
	}

	setVoiceState('thinking', 'Thinking...', 'Whisper AI sedang memproses jawaban percakapan...')

	const bubbleAI = buatElemenPesan('assistant', '')
	let teksAI = ''

	controllerVoiceStream = new AbortController()

	try {
		const respon = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({
				pesan: teksUcapan,
				riwayat: riwayatPercakapan,
				mode: 'voice'
			}),
			signal: controllerVoiceStream.signal
		})

		if (!respon.ok) {
			setVoiceState('error', 'AI Tidak Merespons', 'Terjadi kendala saat menghubungi AI.')
			bubbleAI.textContent = 'Maaf, terjadi kendala saat memproses jawaban.'
			return
		}

		const reader = respon.body.getReader()
		const decoder = new TextDecoder()
		let sisaChunk = ''

		while (true) {
			const bagian = await reader.read()
			if (bagian.done) {
				break
			}
			sisaChunk += decoder.decode(bagian.value, { stream: true })
			const baris = sisaChunk.split('\n')
			sisaChunk = baris.pop()

			for (let i = 0; i < baris.length; i++) {
				const barisTeks = baris[i].trim()
				if (barisTeks.indexOf('data: ') === 0) {
					const payload = barisTeks.slice(6)
					if (payload !== '[SELESAI]' && payload !== '[DONE]') {
						try {
							const obj = JSON.parse(payload)
							if (obj.teks) {
								teksAI += obj.teks
								bubbleAI.innerHTML = parseMarkdownSederhana(teksAI)
								scrollKeBawahOtomatis()
							}
						} catch (e) {}
					}
				}
			}
		}
	} catch (e) {
		sedangProsesVoice = false
		if (e.name !== 'AbortError') {
			setVoiceState('error', 'Gagal Mendapatkan Respons', 'Periksa koneksi internet Anda.')
		}
		return
	}

	if (!teksAI) {
		sedangProsesVoice = false
		setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
		return
	}

	riwayatPercakapan.push({ peran: 'user', isi: teksUcapan })
	riwayatPercakapan.push({ peran: 'ai', isi: teksAI })
	cocokkanRekomendasiDenganPercakapan(teksUcapan, teksAI)

	setVoiceState('speaking', 'AI is speaking...', 'Mendengarkan jawaban suara dari ElevenLabs...')
	if (voiceTranscriptLabel) {
		voiceTranscriptLabel.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.7-1.17L2 22l1.17-5.3A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z"></path></svg><span>Jawaban AI:</span>'
	}
	if (voiceTranscriptTeks) {
		voiceTranscriptTeks.textContent = teksAI.replace(/\[.*?\]/g, '').trim()
	}

	try {
		const responTTS = await fetch('/api/chat/tts', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ teks: teksAI })
		})

		if (!responTTS.ok) {
			if ('speechSynthesis' in window) {
				const utterance = new SpeechSynthesisUtterance(teksAI.replace(/\[.*?\]/g, '').trim())
				utterance.lang = 'id-ID'
				utterance.onend = function () {
					setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
				}
				window.speechSynthesis.speak(utterance)
				return
			}
			setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
			return
		}

		const audioBlob = await responTTS.blob()
		const audioUrl = URL.createObjectURL(audioBlob)

		audioPlayerVoice = new Audio(audioUrl)
		audioPlayerVoice.onended = function () {
			URL.revokeObjectURL(audioUrl)
			audioPlayerVoice = null
			sedangProsesVoice = false
			setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
		}
		audioPlayerVoice.onerror = function () {
			URL.revokeObjectURL(audioUrl)
			audioPlayerVoice = null
			sedangProsesVoice = false
			setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
		}

		await audioPlayerVoice.play()
	} catch (eTTS) {
		sedangProsesVoice = false
		if ('speechSynthesis' in window) {
			const utteranceFallback = new SpeechSynthesisUtterance(teksAI.replace(/\[.*?\]/g, '').trim())
			utteranceFallback.lang = 'id-ID'
			utteranceFallback.onend = function () {
				sedangProsesVoice = false
				setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
			}
			window.speechSynthesis.speak(utteranceFallback)
		} else {
			setVoiceState('idle', 'Start Live Voice', 'Talk naturally with your AI assistant using your voice.')
		}
	}
}

if (btnTabModeTeks) {
	btnTabModeTeks.addEventListener('click', function () {
		gantiModeTampilan('teks')
	})
}

if (btnTabModeVoice) {
	btnTabModeVoice.addEventListener('click', function () {
		gantiModeTampilan('voice')
	})
}

if (btnBukaLiveVoice) {
	btnBukaLiveVoice.addEventListener('click', function () {
		gantiModeTampilan('voice')
	})
}

if (btnMicInput) {
	btnMicInput.addEventListener('click', function () {
		gantiModeTampilan('voice')
	})
}

if (btnKembaliTeks) {
	btnKembaliTeks.addEventListener('click', function () {
		gantiModeTampilan('teks')
	})
}

if (btnVoiceMicMain) {
	btnVoiceMicMain.addEventListener('click', function () {
		if (statusLiveVoice === 'listening' || statusLiveVoice === 'speaking' || statusLiveVoice === 'thinking') {
			hentikanVoiceLengkap()
		} else {
			mulaiMendengarkanVoice()
		}
	})
}

