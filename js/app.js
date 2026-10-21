// ============================================================
// APP — status global, tema, cangkang halaman (navbar/sidebar/footer), router
// ============================================================

const State = { cfg: null, sekolahAll: null, mode: null };

async function muatKonfigurasi() {
  State.cfg = (await API.get('publik')).data;
}

// ---------- Tema: warna dari pengaturan + mode terang/gelap ----------
function terapkanTema() {
  const p = State.cfg.pengaturan, st = document.documentElement.style;
  if (/^#[0-9a-fA-F]{6}$/.test(p.TEMA_PRIMARY)) st.setProperty('--primary', p.TEMA_PRIMARY);
  if (/^#[0-9a-fA-F]{6}$/.test(p.TEMA_NAVY)) st.setProperty('--navy', p.TEMA_NAVY);
  if (/^#[0-9a-fA-F]{6}$/.test(p.TEMA_ACCENT)) st.setProperty('--accent', p.TEMA_ACCENT);
  document.title = p.NAMA_APLIKASI || 'SPMB';
}
function modeTema() {
  return localStorage.getItem('spmb_tema') || (State.cfg && State.cfg.pengaturan.MODE_DEFAULT) || 'terang';
}
function terapkanMode() {
  document.documentElement.setAttribute('data-theme', modeTema() === 'gelap' ? 'dark' : 'light');
}
function gantiMode() {
  localStorage.setItem('spmb_tema', modeTema() === 'gelap' ? 'terang' : 'gelap');
  terapkanMode();
  $$('.js-mode').forEach(function (b) { b.innerHTML = icon(modeTema() === 'gelap' ? 'sun' : 'moon'); b.setAttribute('aria-label', modeTema() === 'gelap' ? 'Mode terang' : 'Mode gelap'); });
}

// ---------- Cangkang ----------
const MENU_PUBLIK = [['/', 'Beranda'], ['/sekolah', 'Informasi Sekolah'], ['/pencarian', 'Pencarian Pendaftar'], ['/hasil', 'Hasil Seleksi'], ['/dokumen', 'Dokumen'], ['/pendaftaran', 'Pendaftaran']];

function menuAdmin() {
  const peran = Session.user ? Session.user.peran : '';
  const m = [['/admin', 'Dasbor', 'dash']];
  if (peran === 'superadmin' || peran === 'dinas') {
    m.push(['/admin/akun', peran === 'superadmin' ? 'Kelola Akun' : 'Akun Panitia', 'users']);
    m.push(['/admin/impor', 'Impor Data', 'upload']);
    m.push(['/admin/pengumuman', 'Pengumuman', 'megaphone']);
    m.push(['/admin/pengaturan', 'Pengaturan', 'settings']);
  }
  if (peran === 'superadmin') m.push(['/admin/log', 'Log Aktivitas', 'log']);
  return m;
}

function menuAkun() {
  const u = Session.user;
  if (!u) return '<a class="btn btn-accent" href="#/masuk">Masuk</a>';
  return '<details class="menu"><summary class="avatar-btn" aria-label="Menu akun"><span class="avatar avatar--sm">' + esc(inisial(u.nama)) + '</span><span class="hide-sm">' + esc(u.nama.split(' ')[0]) + '</span></summary>' +
    '<div class="menu__list"><div class="menu__who"><b>' + esc(u.nama) + '</b><span class="small muted">' + esc(NAMA_PERAN[u.peran] || u.peran) + '</span></div>' +
    '<a href="' + (u.peran === 'pendaftar' ? '#/dasbor' : '#/admin') + '">' + icon('dash', 16) + ' ' + (u.peran === 'pendaftar' ? 'Dasbor saya' : 'Panel') + '</a>' +
    '<button type="button" id="mgp">' + icon('key', 16) + ' Ganti kata sandi</button>' +
    '<button type="button" id="mkeluar">' + icon('logout', 16) + ' Keluar</button></div></details>';
}

function cangkangPublik() {
  const p = State.cfg.pengaturan;
  return '<a class="skip" href="#view">Lewati ke konten</a>' +
    '<header class="site-nav" id="nav"><div class="container site-nav__inner">' +
      '<a class="brand" href="#/"><span class="brand__logo">' + icon('school', 22) + '</span><span class="brand__text"><b>' + esc(p.NAMA_APLIKASI) + '</b><small>' + esc(p.INSTANSI) + '</small></span></a>' +
      '<nav class="nav-links" aria-label="Menu utama">' + MENU_PUBLIK.map(function (m) { return '<a class="nav-link" data-r="' + m[0] + '" href="#' + m[0] + '">' + esc(m[1]) + '</a>'; }).join('') + '</nav>' +
      '<div class="nav-actions"><button class="icon-btn js-mode" aria-label="Ganti mode tampilan">' + icon(modeTema() === 'gelap' ? 'sun' : 'moon') + '</button>' + menuAkun() +
      '<button class="icon-btn nav-toggle" id="navtoggle" aria-label="Buka menu" aria-expanded="false">' + icon('menu') + '</button></div></div></header>' +
    '<main id="view" tabindex="-1"></main>' +
    '<footer class="site-footer"><div class="container footer-grid"><div><b class="foot-brand">' + esc(p.NAMA_APLIKASI) + '</b><p>' + esc(p.INSTANSI) + '</p>' + (p.ALAMAT_INSTANSI ? '<p class="small">' + esc(p.ALAMAT_INSTANSI) + '</p>' : '') + '</div>' +
      '<div><b>Tautan Cepat</b><ul><li><a href="#/sekolah">Informasi Sekolah &amp; Zonasi</a></li><li><a href="#/dokumen">Petunjuk &amp; Dokumen</a></li><li><a href="#/hasil">Cek Hasil Seleksi</a></li></ul></div>' +
      '<div><b>Helpdesk</b>' + ((p.KONTAK_WA || p.KONTAK_EMAIL || p.JAM_LAYANAN) ? '<ul>' + (p.KONTAK_WA ? '<li>WhatsApp: ' + esc(p.KONTAK_WA) + '</li>' : '') + (p.KONTAK_EMAIL ? '<li>Email: ' + esc(p.KONTAK_EMAIL) + '</li>' : '') + (p.JAM_LAYANAN ? '<li>' + esc(p.JAM_LAYANAN) + '</li>' : '') + '</ul>' : '<p class="small">Kontak belum diisi.</p>') + '</div></div>' +
      '<div class="footer-bottom"><div class="container">© ' + new Date().getFullYear() + ' ' + esc(p.INSTANSI) + '. Sistem Penerimaan Siswa Baru.</div></div></footer>';
}

function cangkangAdmin() {
  const p = State.cfg.pengaturan;
  return '<a class="skip" href="#view">Lewati ke konten</a><div class="adm" id="adm">' +
    '<aside class="adm-side" id="admside"><div class="adm-brand"><span class="brand__logo">' + icon('school', 22) + '</span><div><b>' + esc(p.NAMA_APLIKASI) + '</b><small>Panel ' + esc(NAMA_PERAN[Session.user.peran] || '') + '</small></div></div>' +
      '<nav class="adm-nav" aria-label="Menu panel">' + menuAdmin().map(function (m) { return '<a data-r="' + m[0] + '" href="#' + m[0] + '">' + icon(m[2], 18) + ' <span>' + esc(m[1]) + '</span></a>'; }).join('') + '</nav>' +
      '<div class="adm-foot"><a href="#/">' + icon('link', 16) + ' Lihat portal publik</a></div></aside>' +
    '<div class="adm-main"><header class="adm-top"><button class="icon-btn adm-toggle" id="admtoggle" aria-label="Buka menu" aria-expanded="false">' + icon('menu') + '</button><span class="adm-top__title">' + esc(p.INSTANSI) + '</span>' +
      '<div class="nav-actions"><button class="icon-btn js-mode" aria-label="Ganti mode tampilan">' + icon(modeTema() === 'gelap' ? 'sun' : 'moon') + '</button>' + menuAkun() + '</div></header>' +
    '<main id="view" tabindex="-1"></main></div></div>';
}

// Membangun ulang navbar/sidebar tanpa menghapus isi #view yang sedang tampil
function renderCangkang() {
  const root = $('#app-root');
  const lama = $('#view');
  const mode = (location.hash.slice(1) || '/').indexOf('/admin') === 0 && Session.user && Session.user.peran !== 'pendaftar' ? 'admin' : 'publik';
  State.mode = mode;
  root.innerHTML = mode === 'admin' ? cangkangAdmin() : cangkangPublik();
  if (lama) $('#view').replaceWith(lama);
  ikatCangkang();
  tandaiMenu();
}

function ikatCangkang() {
  $$('.js-mode').forEach(function (b) { b.addEventListener('click', gantiMode); });
  const t = $('#navtoggle');
  if (t) t.addEventListener('click', function () { const o = $('#nav').classList.toggle('open'); t.setAttribute('aria-expanded', o); });
  const a = $('#admtoggle');
  if (a) a.addEventListener('click', function () { const o = $('#adm').classList.toggle('open'); a.setAttribute('aria-expanded', o); });
  const am = $('.adm-main');
  if (am) am.addEventListener('click', function () { const a2 = $('#adm'); if (a2 && a2.classList.contains('open')) a2.classList.remove('open'); });
  const k = $('#mkeluar');
  if (k) k.addEventListener('click', keluar);
  const g = $('#mgp');
  if (g) g.addEventListener('click', function () { const d = $('details.menu'); if (d) d.open = false; modalGantiPassword(); });
}

function tandaiMenu() {
  const path = '/' + (location.hash.slice(1) || '/').replace(/^\//, '').split('?')[0];
  $$('[data-r]').forEach(function (el) {
    const r = el.dataset.r;
    const aktif = r === '/' ? path === '/' : (r === '/admin' ? path === '/admin' : path === r || path.indexOf(r + '/') === 0);
    el.classList.toggle('active', aktif);
    if (aktif) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
}

async function keluar() {
  try { await API.post('logout'); } catch (e) { /* tetap keluar di sisi browser */ }
  Session.clear(); API.clearCache();
  renderCangkang();
  toast('Anda telah keluar.');
  location.hash = '#/';
}

// ---------- Router ----------
const RUTE = [
  [/^\/$/, function () { return pageBeranda(); }],
  [/^\/sekolah$/, function () { return pageSekolah(); }],
  [/^\/sekolah\/(.+)$/, function (m) { return pageSekolahDetail(m[1]); }],
  [/^\/pencarian$/, function () { return pagePencarian(); }],
  [/^\/hasil$/, function () { return pageHasil(); }],
  [/^\/dokumen$/, function () { return pageDokumen(); }],
  [/^\/pendaftaran$/, function () { return pagePendaftaran(); }],
  [/^\/masuk$/, function () { return pageMasuk(); }],
  [/^\/buat-akun$/, function () { return pageBuatAkun(); }],
  [/^\/dasbor$/, function () { return pageDasbor(); }],
  [/^\/admin$/, function () { return pageAdminDasbor(); }],
  [/^\/admin\/akun$/, function () { return pageAdminAkun(); }],
  [/^\/admin\/impor$/, function () { return pageAdminImpor(); }],
  [/^\/admin\/pengumuman$/, function () { return pageAdminPengumuman(); }],
  [/^\/admin\/pengaturan$/, function () { return pageAdminPengaturan(); }],
  [/^\/admin\/log$/, function () { return pageAdminLog(); }]
];

async function route() {
  const path = '/' + (location.hash.slice(1) || '/').replace(/^\//, '').split('?')[0];
  if (path.indexOf('/admin') === 0 && !Session.token) { location.hash = '#/masuk'; return; }
  const modeButuh = path.indexOf('/admin') === 0 && Session.user && Session.user.peran !== 'pendaftar' ? 'admin' : 'publik';
  if (State.mode !== modeButuh || !$('#view')) renderCangkang();
  const nav = $('#nav'); if (nav) nav.classList.remove('open');
  const adm = $('#adm'); if (adm) adm.classList.remove('open');
  const d = $('details.menu'); if (d) d.open = false;
  tandaiMenu();
  loadingBar(true);
  try {
    let ketemu = false;
    for (let i = 0; i < RUTE.length; i++) {
      const m = RUTE[i][0].exec(path);
      if (m) { ketemu = true; await RUTE[i][1](m); break; }
    }
    if (!ketemu) setView('<div class="container section center">' + kosong('Halaman tidak ditemukan', 'Alamat yang Anda buka tidak tersedia.') + '<p><a class="btn btn-primary" href="#/">Kembali ke beranda</a></p></div>');
  } catch (e) {
    setView('<div class="container section">' + kosong('Terjadi kesalahan', e.message || 'Silakan muat ulang halaman.') + '</div>');
  }
  loadingBar(false);
}

// ---------- Mulai ----------
function tampilGalatAwal(judul, pesan, tombol) {
  $('#app-root').innerHTML = '<div class="boot boot--err"><h1>' + esc(judul) + '</h1><p>' + pesan + '</p>' + (tombol ? '<button class="btn btn-primary" id="ulang">Coba lagi</button>' : '') + '</div>';
  const u = $('#ulang'); if (u) u.addEventListener('click', function () { location.reload(); });
}

async function mulai() {
  Session.load();
  if (!CONFIG.GAS_URL || /^GANTI/.test(CONFIG.GAS_URL)) {
    tampilGalatAwal('Backend belum disambungkan', 'Buka berkas <code>js/config.js</code> lalu isi <code>GAS_URL</code> dengan URL Web App (/exec) dari Google Apps Script.', false);
    return;
  }
  try { await muatKonfigurasi(); }
  catch (e) { tampilGalatAwal('Portal belum dapat dimuat', esc(e.message), true); return; }
  terapkanTema(); terapkanMode();
  window.addEventListener('hashchange', route);
  window.addEventListener('spmb:auth', function () { toast('Sesi berakhir. Silakan masuk kembali.', 'error'); renderCangkang(); location.hash = '#/masuk'; });
  document.addEventListener('click', function (e) { const d = $('details.menu'); if (d && d.open && !d.contains(e.target)) d.open = false; });
  renderCangkang();
  route();
}
document.addEventListener('DOMContentLoaded', mulai);
