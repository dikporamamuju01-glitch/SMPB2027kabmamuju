// ============================================================
// HALAMAN PUBLIK — Beranda, Informasi Sekolah, Detail Sekolah,
// Pencarian Pendaftar, Hasil Seleksi, Dokumen, Pendaftaran
// ============================================================

function setView(html) {
  const v = $('#view');
  v.innerHTML = html;
  window.scrollTo(0, 0);
  const h = $('h1', v);
  if (h) { h.setAttribute('tabindex', '-1'); }
}

function judulHalaman(judul, sub, ikon) {
  return '<div class="page-head"><div class="container">' +
    (ikon ? '<span class="eyebrow">' + icon(ikon, 16) + ' ' + esc(ikon === 'school' ? 'Direktori Sekolah' : '') + '</span>' : '') +
    '<h1>' + esc(judul) + '</h1>' + (sub ? '<p class="lead">' + esc(sub) + '</p>' : '') + '</div></div>';
}

function ilustrasiSekolah() {
  return '<svg class="hero-art" viewBox="0 0 520 380" role="img" aria-label="Ilustrasi gedung sekolah">' +
    '<defs><linearGradient id="gLangit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBFF"/><stop offset="1" stop-color="#F4F9FF"/></linearGradient></defs>' +
    '<rect x="10" y="10" width="500" height="360" rx="24" fill="url(#gLangit)"/>' +
    '<circle cx="415" cy="88" r="32" fill="#FFE9A8"/>' +
    '<g fill="#fff"><ellipse cx="105" cy="78" rx="46" ry="15"/><ellipse cx="138" cy="66" rx="30" ry="13"/><ellipse cx="350" cy="135" rx="40" ry="12"/></g>' +
    '<path d="M10 300Q130 245 260 290T510 282V346a24 24 0 0 1-24 24H34a24 24 0 0 1-24-24Z" fill="#BFD9F6"/>' +
    '<path d="M10 330Q150 290 300 325T510 318V346a24 24 0 0 1-24 24H34a24 24 0 0 1-24-24Z" fill="#9FC4EE"/>' +
    '<rect x="150" y="172" width="220" height="128" fill="#fff" stroke="#14307A" stroke-width="4"/>' +
    '<path d="M135 174 260 112 385 174Z" fill="#0F52BA"/>' +
    '<rect x="258" y="44" width="4" height="70" fill="#14307A"/><rect x="262" y="46" width="42" height="12" fill="#D6322E"/><rect x="262" y="58" width="42" height="12" fill="#fff" stroke="#D6D9E0" stroke-width="1"/>' +
    '<g fill="#DCEBFF" stroke="#14307A" stroke-width="2"><rect x="170" y="196" width="34" height="34"/><rect x="216" y="196" width="34" height="34"/><rect x="270" y="196" width="34" height="34"/><rect x="316" y="196" width="34" height="34"/></g>' +
    '<rect x="240" y="244" width="40" height="56" fill="#14307A"/><circle cx="272" cy="274" r="2.5" fill="#FFE9A8"/>' +
    '<circle cx="104" cy="288" r="30" fill="#7FC8A9"/><rect x="101" y="296" width="6" height="26" fill="#5B6B8C"/>' +
    '<circle cx="424" cy="292" r="26" fill="#7FC8A9"/><rect x="421" y="298" width="6" height="22" fill="#5B6B8C"/>' +
    '<path d="M60 150l56-22-16 38-10-12z" fill="#0F52BA" opacity=".9"/>' +
    '<g fill="#0F52BA" opacity=".35"><circle cx="40" cy="50" r="3"/><circle cx="56" cy="50" r="3"/><circle cx="72" cy="50" r="3"/><circle cx="40" cy="66" r="3"/><circle cx="56" cy="66" r="3"/><circle cx="72" cy="66" r="3"/></g>' +
    '</svg>';
}

// ---------- BERANDA ----------
async function pageBeranda() {
  const c = State.cfg, p = c.pengaturan, st = c.statistik;
  const bg = p.HERO_BG_URL ? ' style="background-image:linear-gradient(180deg,rgba(244,249,255,.88),rgba(244,249,255,.96)),url(\'' + esc(p.HERO_BG_URL) + '\');background-size:cover;background-position:center"' : '';
  const judul = esc(p.HERO_JUDUL || p.NAMA_APLIKASI || 'SPMB');
  const sudahLogin = Session.token && Session.user && Session.user.peran === 'pendaftar';
  const ctaDaftar = sudahLogin ? '#/pendaftaran' : '#/buat-akun';

  const jadwalHtml = c.jadwal.map(function (t, i) {
    const tgl = t.mulai && t.selesai
      ? fmtWaktu(t.mulai, false) + (t.mulai.slice(0, 10) !== t.selesai.slice(0, 10) ? ' – ' + fmtWaktu(t.selesai, false) : '')
      : 'Jadwal belum ditetapkan';
    return '<li class="tl-step ' + (t.status === 'Sedang Berjalan' ? 'is-now' : (t.status === 'Selesai' ? 'is-done' : '')) + '">' +
      '<span class="tl-dot">' + (t.status === 'Selesai' ? icon('check', 16) : (i + 1)) + '</span>' +
      '<div class="tl-body">' + badge(t.status) + '<h3>' + esc(t.nama) + '</h3>' +
      (t.keterangan ? '<p>' + esc(t.keterangan) + '</p>' : '') +
      '<span class="tl-date">' + icon('calendar', 15) + ' ' + esc(tgl) + '</span></div></li>';
  }).join('');

  const alur = [
    ['users', 'Buat Akun & Isi Data', 'Daftarkan akun dengan NIK calon siswa, lalu lengkapi data diri.'],
    ['school', 'Pilih Jalur & Sekolah', 'Pilih jalur (zonasi, prestasi, afirmasi) dan sekolah tujuan.'],
    ['pin', 'Tandai Titik Rumah', 'Tandai lokasi rumah di peta untuk menghitung jarak ke sekolah.'],
    ['upload', 'Unggah Berkas', 'Pas foto, akta kelahiran, KK, dan ijazah atau surat keterangan lulus.'],
    ['file', 'Cetak Kartu & Pantau', 'Unduh bukti pendaftaran dan pantau status seleksi.']
  ].map(function (a, i) {
    return '<div class="step-card"><span class="step-no">Langkah ' + String(i + 1).padStart(2, '0') + '</span><span class="step-ico">' + icon(a[0], 22) + '</span><h3>' + esc(a[1]) + '</h3><p>' + esc(a[2]) + '</p></div>';
  }).join('');

  setView(
    '<section class="hero"' + bg + '><div class="container hero__grid">' +
      '<div class="hero__text">' +
        '<span class="chip">' + icon('calendar', 15) + ' Tahun Ajaran ' + esc(p.TAHUN_AJARAN) + (c.pendaftaranDibuka ? ' · Pendaftaran dibuka' : ' · Pendaftaran belum dibuka') + '</span>' +
        '<h1 class="hero__title">' + judul + '</h1>' +
        '<p class="hero__tagline">' + esc(p.HERO_TAGLINE) + '</p>' +
        '<div class="hero__cta"><a class="btn btn-primary btn-lg" href="' + ctaDaftar + '">Daftar Sekarang ' + icon('chevron', 18) + '</a>' +
        '<a class="btn btn-outline btn-lg" href="#/hasil">' + icon('search', 18) + ' Cek Status Pendaftaran</a></div>' +
        '<ul class="hero__points"><li>' + icon('shield', 16) + ' Data pribadi dilindungi</li><li>' + icon('pin', 16) + ' Zonasi berbasis sekolah asal</li><li>' + icon('check', 16) + ' Gratis, tanpa pungutan biaya</li></ul>' +
      '</div><div class="hero__art">' + ilustrasiSekolah() + '</div></div></section>' +

    '<section class="section"><div class="container"><h2 class="section-title">Kapasitas &amp; Statistik Wilayah</h2>' +
      '<div class="grid grid-4">' +
        '<div class="stat"><span class="stat__label">Total sekolah</span><strong class="stat__value">' + fmtAngka(st.totalSekolah) + '</strong><span class="stat__sub">SD dan SMP terdaftar</span></div>' +
        '<div class="stat"><span class="stat__label">Jenjang SD</span><strong class="stat__value">' + fmtAngka(st.sd) + '</strong><span class="stat__sub">Menerima lulusan TK sesuai zona</span></div>' +
        '<div class="stat"><span class="stat__label">Jenjang SMP</span><strong class="stat__value">' + fmtAngka(st.smp) + '</strong><span class="stat__sub">Menerima lulusan SD sesuai zona</span></div>' +
        '<div class="stat"><span class="stat__label">Daya tampung</span><strong class="stat__value">' + fmtAngka(st.dayaTampung) + '</strong><span class="stat__sub">Total kursi seluruh sekolah</span></div>' +
      '</div></div></section>' +

    '<section class="section section--card"><div class="container"><h2 class="section-title">Jadwal Pelaksanaan</h2>' +
      '<p class="muted">Waktu mengikuti WITA (UTC+8). Jadwal ditetapkan oleh ' + esc(p.INSTANSI) + '.</p>' +
      '<ol class="timeline">' + (jadwalHtml || '<li>' + kosong('Jadwal belum tersedia') + '</li>') + '</ol></div></section>' +

    '<section class="section"><div class="container center"><h2 class="section-title">Alur 5 Langkah Pendaftaran</h2>' +
      '<div class="grid grid-5">' + alur + '</div>' +
      '<div class="notice notice--info">' + icon('info', 20) + '<div>' + esc(p.BANNER_ZONASI) + '</div></div></div></section>' +

    '<section class="section"><div class="container"><div class="between"><h2 class="section-title">Pengumuman Terbaru</h2></div>' +
      '<div id="pengumuman" class="grid grid-3">' + skeleton(3) + '</div></div></section>'
  );

  try {
    const r = await API.get('informasi', {}, 60000);
    const pengumuman = r.data.filter(function (x) { return x.kategori === 'Pengumuman'; }).slice(0, 3);
    $('#pengumuman').innerHTML = pengumuman.length ? pengumuman.map(function (x) {
      return '<article class="news-card"><span class="news-date">' + esc(fmtWaktu(x.tanggal, false)) + '</span><h3>' + esc(x.judul) + '</h3><p>' + esc(x.isi) + '</p>' +
        (x.tautan ? '<a class="link" href="' + esc(x.tautan) + '" target="_blank" rel="noopener noreferrer">Baca selengkapnya ' + icon('chevron', 14) + '</a>' : '') + '</article>';
    }).join('') : '<div class="grid-span">' + kosong('Belum ada pengumuman', 'Pengumuman resmi akan tampil di sini.') + '</div>';
  } catch (e) {
    $('#pengumuman').innerHTML = '<div class="grid-span">' + kosong('Pengumuman tidak dapat dimuat', e.message) + '</div>';
  }
}

// ---------- INFORMASI SEKOLAH ----------
async function pageSekolah() {
  const c = State.cfg;
  const f = { q: '', jenjang: '', kecamatan: '', page: 1 };
  setView(
    judulHalaman('Informasi Sekolah & Zonasi', 'Cek profil sekolah, daya tampung, sisa kuota, dan daftar TK/SD asal yang masuk dalam zona.', 'school') +
    '<div class="container section"><div class="card card-pad filter-bar">' +
      '<div class="field grow"><label for="fq">Cari sekolah</label><div class="input-ico">' + icon('search', 18) + '<input id="fq" class="input" type="search" placeholder="Nama sekolah atau NPSN"></div></div>' +
      '<div class="field"><label for="fj">Jenjang</label><select id="fj" class="select"><option value="">Semua jenjang</option><option value="SD">SD</option><option value="SMP">SMP</option></select></div>' +
      '<div class="field"><label for="fk">Kecamatan</label><select id="fk" class="select"><option value="">Semua kecamatan</option>' +
        c.kecamatan.map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn btn-ghost" id="freset">Reset</button></div>' +
      '<p class="muted" id="ringkas" aria-live="polite"></p><div id="daftar" class="grid grid-3"></div><div id="pager"></div></div>'
  );

  async function muat() {
    $('#daftar').innerHTML = '<div class="grid-span">' + skeleton(3) + '</div>';
    try {
      const r = await API.get('sekolah', { q: f.q, jenjang: f.jenjang, kecamatan: f.kecamatan, page: f.page, size: 12 }, 30000);
      const h = r.data;
      $('#ringkas').textContent = 'Menampilkan ' + h.items.length + ' dari ' + fmtAngka(h.total) + ' sekolah';
      $('#daftar').innerHTML = h.items.length ? h.items.map(function (s) {
        const pct = s.dayaTampung ? Math.min(100, Math.round(s.terisi / s.dayaTampung * 100)) : 0;
        const kelas = pct >= 100 ? 'full' : (pct >= 80 ? 'warn' : '');
        return '<article class="card school-card"><div class="school-card__top"><span class="pill pill--' + s.jenjang.toLowerCase() + '">' + esc(s.jenjang) + '</span>' +
          '<span class="loc">' + icon('pin', 14) + ' ' + esc(s.kecamatan) + '</span></div>' +
          '<h3>' + esc(s.nama) + '</h3><span class="muted small">NPSN ' + esc(s.npsn) + '</span>' +
          '<div class="cap"><div class="cap__row"><span>Daya tampung <b>' + fmtAngka(s.dayaTampung) + '</b></span><span>Sisa <b>' + fmtAngka(s.sisa) + '</b></span></div>' +
          '<div class="meter ' + kelas + '" role="img" aria-label="Terisi ' + pct + ' persen"><span style="width:' + pct + '%"></span></div></div>' +
          '<div class="feeder"><span class="small muted">Sekolah asal dalam zona (' + s.jumlahFeeder + ')</span><div class="chips">' +
            (s.feeder.length ? s.feeder.map(function (n) { return '<span class="chip chip--sm">' + esc(n) + '</span>'; }).join('') + (s.jumlahFeeder > s.feeder.length ? '<span class="chip chip--sm">+' + (s.jumlahFeeder - s.feeder.length) + '</span>' : '') : '<span class="small muted">Belum ada data zona</span>') +
          '</div></div><a class="btn btn-primary btn-block" href="#/sekolah/' + encodeURIComponent(s.id) + '">Detail &amp; Zonasi ' + icon('chevron', 16) + '</a></article>';
      }).join('') : '<div class="grid-span">' + kosong('Sekolah tidak ditemukan', 'Ubah kata kunci atau reset filter.') + '</div>';
      $('#pager').innerHTML = pagerHtml(h);
      ikatPager($('#pager'), function (n) { f.page = n; muat(); });
    } catch (e) {
      $('#daftar').innerHTML = '<div class="grid-span">' + kosong('Data tidak dapat dimuat', e.message) + '</div>';
    }
  }
  $('#fq').addEventListener('input', debounce(function (e) { f.q = e.target.value.trim(); f.page = 1; muat(); }, 400));
  $('#fj').addEventListener('change', function (e) { f.jenjang = e.target.value; f.page = 1; muat(); });
  $('#fk').addEventListener('change', function (e) { f.kecamatan = e.target.value; f.page = 1; muat(); });
  $('#freset').addEventListener('click', function () { f.q = f.jenjang = f.kecamatan = ''; f.page = 1; $('#fq').value = ''; $('#fj').value = ''; $('#fk').value = ''; muat(); });
  muat();
}

// ---------- DETAIL SEKOLAH ----------
async function pageSekolahDetail(id) {
  setView('<div class="container section">' + skeleton(4) + '</div>');
  try {
    const s = (await API.get('sekolahDetail', { id: decodeURIComponent(id) }, 30000)).data;
    const peta = (s.lat != null && s.lng != null)
      ? '<a class="link" target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/?mlat=' + s.lat + '&mlon=' + s.lng + '#map=17/' + s.lat + '/' + s.lng + '">' + icon('pin', 15) + ' Lihat lokasi di peta (' + s.lat + ', ' + s.lng + ')</a>'
      : '<span class="muted small">Titik koordinat sekolah belum diisi.</span>';
    setView(
      '<div class="container section">' +
      '<nav class="crumb" aria-label="Navigasi"><a href="#/">Beranda</a> ' + icon('chevron', 14) + ' <a href="#/sekolah">Informasi Sekolah</a> ' + icon('chevron', 14) + ' <span>' + esc(s.nama) + '</span></nav>' +
      '<div class="detail-grid">' +
        '<div class="stack"><div class="card card-pad"><span class="pill pill--' + s.jenjang.toLowerCase() + '">' + esc(s.jenjang) + '</span>' +
          '<h1 class="h2">' + esc(s.nama) + '</h1><p class="muted">NPSN ' + esc(s.npsn) + '</p>' +
          '<dl class="kv"><dt>Kecamatan</dt><dd>' + esc(s.kecamatan) + '</dd><dt>Alamat</dt><dd>' + esc(s.alamat || '-') + '</dd><dt>Kontak</dt><dd>' + esc(s.kontak || '-') + '</dd><dt>Lokasi</dt><dd>' + peta + '</dd></dl>' +
          (s.profil ? '<h3>Profil</h3><p>' + esc(s.profil) + '</p>' : '') + '</div>' +
          '<div class="card card-pad"><h2 class="h3">Sekolah Asal dalam Zona (' + s.zona.length + ')</h2>' +
            '<p class="muted small">' + (s.jenjang === 'SD' ? 'TK' : 'SD') + ' yang lulusannya diterima melalui jalur zonasi sekolah ini.</p>' +
            (s.zona.length ? '<ol class="zona-list">' + s.zona.map(function (z) { return '<li><b>' + esc(z.nama) + '</b><span class="muted small">' + esc(z.jenjang) + ' · ' + esc(z.kecamatan) + '</span></li>'; }).join('') + '</ol>' : kosong('Belum ada data zona')) +
            '<div class="notice notice--info">' + icon('info', 18) + '<div>' + esc(State.cfg.pengaturan.BANNER_ZONASI) + '</div></div></div></div>' +
        '<div class="stack"><div class="card card-pad"><h2 class="h3">Daya Tampung</h2><div class="grid grid-2 mini-stats">' +
          '<div class="stat stat--flat"><span class="stat__label">Total daya tampung</span><strong class="stat__value">' + fmtAngka(s.dayaTampung) + '</strong></div>' +
          '<div class="stat stat--flat"><span class="stat__label">Sisa kursi</span><strong class="stat__value ok">' + fmtAngka(s.sisa) + '</strong></div>' +
          '<div class="stat stat--flat"><span class="stat__label">Jumlah rombel</span><strong class="stat__value">' + fmtAngka(s.jumlahRombel) + '</strong></div>' +
          '<div class="stat stat--flat"><span class="stat__label">Batas siswa/rombel</span><strong class="stat__value">' + fmtAngka(s.batasPerRombel) + '</strong></div></div></div>' +
          '<div class="card card-pad"><h2 class="h3">Kuota per Jalur</h2>' +
            (s.kuotaJalur.some(function (j) { return j.kuota > 0; }) ? s.kuotaJalur.map(function (j) {
              const pct = j.kuota ? Math.min(100, Math.round(j.terisi / j.kuota * 100)) : 0;
              return '<div class="quota"><div class="cap__row"><span><b>' + esc(j.nama) + '</b>' + (j.terikatZona ? '' : ' <span class="chip chip--sm">tidak terikat zona</span>') + '</span><span>' + j.terisi + ' / ' + j.kuota + '</span></div>' +
                '<div class="meter ' + (pct >= 100 ? 'full' : (pct >= 80 ? 'warn' : '')) + '"><span style="width:' + pct + '%"></span></div><span class="small muted">Tersisa ' + j.sisa + ' kursi</span></div>';
            }).join('') : kosong('Kuota jalur belum ditetapkan', 'Dinas Pendidikan akan menetapkan kuota tiap jalur.')) + '</div>' +
          '<a class="btn btn-primary btn-lg btn-block" href="#/pendaftaran">Daftar ke Sekolah Ini</a>' +
          '<a class="btn btn-ghost btn-block" href="#/sekolah">' + icon('chevron', 16) + ' Kembali ke daftar sekolah</a></div>' +
      '</div></div>'
    );
  } catch (e) {
    setView('<div class="container section">' + kosong('Sekolah tidak dapat ditampilkan', e.message) + '<p class="center"><a class="btn btn-outline" href="#/sekolah">Kembali ke daftar</a></p></div>');
  }
}

// ---------- PENCARIAN PENDAFTAR ----------
async function pagePencarian() {
  const c = State.cfg;
  const f = { q: '', jenjang: '', jalur: '', status: '', page: 1 };
  const statusOpsi = ['Menunggu', 'Terverifikasi', 'Perlu Perbaikan', 'Lulus', 'Dialihkan', 'Tidak Lulus'];
  setView(
    judulHalaman('Pencarian Pendaftar', 'Pantau status pendaftaran secara transparan. Sesuai prinsip perlindungan data anak, nama pendaftar disamarkan untuk umum.') +
    '<div class="container section">' +
    '<div class="notice notice--info">' + icon('lock', 20) + '<div><b>Jaminan privasi.</b> Data pribadi lengkap, titik tempat tinggal, dan berkas hanya dapat dilihat oleh pendaftar yang bersangkutan dan panitia berwenang.</div></div>' +
    '<form id="fcari" class="card card-pad filter-bar"><div class="field grow"><label for="pq">Nomor pendaftaran atau nama</label><div class="input-ico">' + icon('search', 18) + '<input id="pq" class="input" type="search" placeholder="Contoh: SPMB-2027-00001"></div></div>' +
      '<div class="field"><label for="pj">Jenjang</label><select id="pj" class="select"><option value="">Semua</option><option>SD</option><option>SMP</option></select></div>' +
      '<div class="field"><label for="pl">Jalur</label><select id="pl" class="select"><option value="">Semua</option>' + c.jalur.map(function (j) { return '<option value="' + esc(j.kode) + '">' + esc(j.nama) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="ps">Status</label><select id="ps" class="select"><option value="">Semua</option>' + statusOpsi.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div>' +
      '<button class="btn btn-primary" type="submit">Cari</button></form>' +
    '<div id="hasil" aria-live="polite"></div><div id="pager"></div></div>'
  );
  async function muat() {
    $('#hasil').innerHTML = skeleton(3);
    try {
      const h = (await API.get('pencarian', { q: f.q, jenjang: f.jenjang, jalur: f.jalur, status: f.status, page: f.page, size: 10 })).data;
      const namaJalur = {}; c.jalur.forEach(function (j) { namaJalur[j.kode] = j.nama; });
      $('#hasil').innerHTML = h.items.length ?
        '<p class="muted">' + fmtAngka(h.total) + ' pendaftar ditemukan</p><div class="table-wrap"><table class="table"><thead><tr><th>No. Pendaftaran</th><th>Nama</th><th>Asal Sekolah</th><th>Sekolah Tujuan</th><th>Jalur</th><th>Status</th></tr></thead><tbody>' +
        h.items.map(function (x) {
          return '<tr><td data-l="No. Pendaftaran"><code>' + esc(x.no) + '</code></td><td data-l="Nama">' + esc(x.nama) + '</td><td data-l="Asal Sekolah">' + esc(x.asal || '-') + '</td><td data-l="Sekolah Tujuan">' + esc(x.tujuan || '-') + '</td><td data-l="Jalur">' + esc(namaJalur[x.jalur] || x.jalur || '-') + '</td><td data-l="Status">' + badge(x.status) + '</td></tr>';
        }).join('') + '</tbody></table></div>' : kosong('Pendaftar tidak ditemukan', 'Belum ada pendaftar yang mengirim berkas, atau kata kunci tidak cocok.');
      $('#pager').innerHTML = pagerHtml(h);
      ikatPager($('#pager'), function (n) { f.page = n; muat(); });
    } catch (e) { $('#hasil').innerHTML = kosong('Pencarian gagal', e.message); }
  }
  $('#fcari').addEventListener('submit', function (e) {
    e.preventDefault();
    f.q = $('#pq').value.trim(); f.jenjang = $('#pj').value; f.jalur = $('#pl').value; f.status = $('#ps').value; f.page = 1; muat();
  });
  muat();
}

// ---------- HASIL SELEKSI ----------
function pageHasil() {
  const c = State.cfg;
  setView(
    judulHalaman('Hasil Seleksi', 'Masukkan nomor pendaftaran, tanggal lahir, dan PIN yang Anda buat saat mendaftar.') +
    '<div class="container section narrow">' +
    (c.hasilDibuka ? '' : '<div class="notice notice--warn">' + icon('calendar', 20) + '<div><b>Pengumuman belum dibuka.</b> ' +
      (c.pengaturan.HASIL_DIBUKA_PADA ? 'Hasil seleksi diumumkan pada ' + esc(fmtWaktu(c.pengaturan.HASIL_DIBUKA_PADA)) + '.' : 'Jadwal pengumuman belum ditetapkan.') + '</div></div>') +
    '<form id="fhasil" class="card card-pad stack" novalidate>' +
      '<div class="field"><label for="hn">Nomor pendaftaran</label><input id="hn" class="input" autocomplete="off" placeholder="SPMB-2027-00001" required></div>' +
      '<div class="field"><label for="ht">Tanggal lahir</label><input id="ht" class="input" type="date" required></div>' +
      '<div class="field"><label for="hp">PIN keamanan (6 digit)</label><input id="hp" class="input" type="password" inputmode="numeric" maxlength="6" autocomplete="off" required></div>' +
      '<div id="hasil-err" class="error-text" role="alert"></div>' +
      '<button class="btn btn-primary btn-lg" type="submit">' + icon('search', 18) + ' Cek Hasil Seleksi</button></form>' +
    '<div id="hasil-out"></div></div>'
  );
  $('#fhasil').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = $('button[type=submit]', e.target); $('#hasil-err').textContent = ''; $('#hasil-out').innerHTML = '';
    tombolBusy(btn, true, 'Memeriksa...');
    try {
      const r = (await API.post('cekHasil', { noPendaftaran: $('#hn').value.trim(), tglLahir: $('#ht').value, pin: $('#hp').value }, false)).data;
      if (!r.dibuka) {
        $('#hasil-out').innerHTML = '<div class="notice notice--warn">' + icon('calendar', 20) + '<div>Pengumuman belum dibuka' + (r.waktu ? ' (' + esc(fmtWaktu(r.waktu)) + ')' : '') + '.</div></div>';
      } else {
        const tema = { 'Lulus': 'ok', 'Dialihkan': 'alih', 'Tidak Lulus': 'no' }[r.statusHasil] || 'wait';
        const judul = { 'Lulus': 'Selamat! Anda dinyatakan LULUS', 'Dialihkan': 'Anda DIALIHKAN ke sekolah terdekat', 'Tidak Lulus': 'Belum lolos seleksi' }[r.statusHasil] || 'Hasil belum ditetapkan';
        $('#hasil-out').innerHTML = '<div class="result result--' + tema + '"><h2>' + esc(judul) + '</h2>' + badge(r.statusHasil) +
          '<dl class="kv"><dt>Nama</dt><dd>' + esc(r.nama) + '</dd><dt>No. Pendaftaran</dt><dd>' + esc(r.noPendaftaran) + '</dd><dt>Sekolah</dt><dd>' + esc(r.sekolah || '-') + '</dd></dl></div>';
      }
    } catch (err) { $('#hasil-err').textContent = err.message; }
    tombolBusy(btn, false);
  });
}

// ---------- DOKUMEN ----------
async function pageDokumen() {
  setView(
    judulHalaman('Pusat Dokumen', 'Unduh petunjuk teknis dan dokumen resmi penerimaan siswa baru.') +
    '<div class="container section"><div class="card card-pad"><h2 class="h3">Dokumen Umum</h2><div id="dok">' + skeleton(2) + '</div></div>' +
    '<div class="notice notice--info">' + icon('file', 20) + '<div><b>Dokumen pribadi.</b> Bukti pendaftaran dan kartu peserta tersedia di dasbor pendaftar setelah pendaftaran dikirim (fitur ini hadir pada tahap pengembangan berikutnya).</div></div></div>'
  );
  try {
    const r = await API.get('informasi', {}, 60000);
    const dok = r.data.filter(function (x) { return x.kategori === 'Dokumen' && x.tautan; });
    $('#dok').innerHTML = dok.length ? '<ul class="doc-list">' + dok.map(function (d) {
      return '<li>' + icon('file', 22) + '<div><b>' + esc(d.judul) + '</b>' + (d.isi ? '<p class="small muted">' + esc(d.isi) + '</p>' : '') + '</div>' +
        '<a class="btn btn-outline btn-sm" href="' + esc(d.tautan) + '" target="_blank" rel="noopener noreferrer">' + icon('download', 16) + ' Buka</a></li>';
    }).join('') + '</ul>' : kosong('Belum ada dokumen', 'Dokumen resmi akan ditambahkan oleh Dinas Pendidikan.');
  } catch (e) { $('#dok').innerHTML = kosong('Dokumen tidak dapat dimuat', e.message); }
}

// ---------- PENDAFTARAN (formulir 6 langkah hadir di Fase 2) ----------
async function pagePendaftaran() {
  const c = State.cfg;
  if (!Session.token || !Session.user || Session.user.peran !== 'pendaftar') {
    setView(judulHalaman('Pendaftaran', 'Buat akun atau masuk untuk memulai pendaftaran.') +
      '<div class="container section narrow"><div class="card card-pad stack center"><p>Pendaftaran dilakukan dengan akun pendaftar (NIK calon siswa).</p>' +
      '<a class="btn btn-primary btn-lg" href="#/buat-akun">Buat Akun Pendaftar</a><a class="btn btn-outline" href="#/masuk">Saya sudah punya akun</a></div></div>');
    return;
  }
  setView(judulHalaman('Formulir Pendaftaran', 'Formulir 6 langkah: data diri, asal sekolah dan jalur, titik rumah, pilih sekolah, unggah berkas, tinjau dan kirim.') +
    '<div class="container section narrow"><div class="notice notice--' + (c.pendaftaranDibuka ? 'info' : 'warn') + '">' + icon(c.pendaftaranDibuka ? 'info' : 'calendar', 20) +
    '<div>' + (c.pendaftaranDibuka ? 'Pendaftaran sedang dibuka.' : 'Pendaftaran belum dibuka.') + ' Akun Anda sudah aktif. <b>Formulir pendaftaran lengkap sedang disiapkan pada tahap pengembangan berikutnya</b> (Fase 2). Anda akan diberi tahu lewat portal ini.</div></div>' +
    '<p class="center"><a class="btn btn-outline" href="#/dasbor">Ke dasbor saya</a></p></div>');
}
