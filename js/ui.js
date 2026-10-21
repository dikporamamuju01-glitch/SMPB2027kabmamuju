// ============================================================
// UI — helper tampilan: escape HTML, ikon, toast, modal, badge, format, CSV
// ============================================================

const esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
const $ = function (sel, el) { return (el || document).querySelector(sel); };
const $$ = function (sel, el) { return Array.from((el || document).querySelectorAll(sel)); };

// ---------- Ikon (gaya garis, 24px) ----------
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  school: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  dash: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  log: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};

function icon(name, size) {
  const s = size || 20;
  return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}

// ---------- Badge status ----------
const KELAS_STATUS = {
  'Menunggu': 'menunggu', 'Sesuai': 'sesuai', 'Terverifikasi': 'sesuai', 'Perlu Perbaikan': 'perbaikan',
  'Lulus': 'lulus', 'Dialihkan': 'dialihkan', 'Tidak Lulus': 'tidaklulus', 'Draft': 'draft', 'Belum': 'draft',
  'Sedang Berjalan': 'lulus', 'Akan Datang': 'menunggu', 'Selesai': 'draft', 'Belum Ditetapkan': 'draft'
};
function badge(status) {
  return '<span class="badge badge--' + (KELAS_STATUS[status] || 'draft') + '">' + esc(status || '-') + '</span>';
}

// ---------- Format ----------
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
// 'yyyy-MM-ddTHH:mm' (WITA) → '10 Juni 2027, 08.00 WITA' (tanpa konversi zona waktu)
function fmtWaktu(s, denganJam) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(String(s || ''));
  if (!m) return '';
  let t = parseInt(m[3], 10) + ' ' + BULAN[parseInt(m[2], 10) - 1] + ' ' + m[1];
  if (denganJam !== false && m[4]) t += ', ' + m[4] + '.' + m[5] + ' WITA';
  return t;
}
function fmtAngka(n) { return Number(n || 0).toLocaleString('id-ID'); }
function inisial(nama) {
  return String(nama || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (k) { return k.charAt(0).toUpperCase(); }).join('');
}
function debounce(fn, ms) {
  let t;
  return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 350); };
}

// ---------- Toast & loading ----------
function toast(pesan, jenis) {
  const wrap = $('#toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast toast--' + (jenis || 'sukses');
  el.setAttribute('role', jenis === 'error' ? 'alert' : 'status');
  el.innerHTML = icon(jenis === 'error' ? 'alert' : 'check', 18) + '<span>' + esc(pesan) + '</span>';
  wrap.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 300); }, jenis === 'error' ? 5000 : 3000);
}
function loadingBar(aktif) { const b = $('#loading-bar'); if (b) b.classList.toggle('on', !!aktif); }

function tombolBusy(btn, busy, teks) {
  if (!btn) return;
  if (busy) { btn.dataset.teksAsli = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span> ' + esc(teks || 'Memproses...'); }
  else { btn.disabled = false; if (btn.dataset.teksAsli) btn.innerHTML = btn.dataset.teksAsli; }
}

// ---------- Modal ----------
const Modal = {
  _aksiTutup: null, _fokusSebelum: null,
  buka(opsi) {
    const root = $('#modal-root');
    this._fokusSebelum = document.activeElement;
    root.innerHTML = '<div class="modal-backdrop" id="mb"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mj">' +
      '<div class="modal__head"><h3 id="mj">' + esc(opsi.judul) + '</h3><button class="icon-btn" id="mx" aria-label="Tutup">' + icon('x') + '</button></div>' +
      '<div class="modal__body">' + opsi.isi + '</div>' +
      (opsi.kaki ? '<div class="modal__foot">' + opsi.kaki + '</div>' : '') + '</div></div>';
    document.body.classList.add('modal-open');
    $('#mx').addEventListener('click', function () { Modal.tutup(); });
    $('#mb').addEventListener('mousedown', function (e) { if (e.target.id === 'mb') Modal.tutup(); });
    this._esc = function (e) { if (e.key === 'Escape') Modal.tutup(); };
    document.addEventListener('keydown', this._esc);
    const fokus = $('.modal input, .modal select, .modal textarea, .modal button.btn-primary');
    if (fokus) fokus.focus();
    return $('.modal');
  },
  tutup() {
    $('#modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', this._esc);
    if (this._fokusSebelum && this._fokusSebelum.focus) this._fokusSebelum.focus();
  }
};

// ---------- Paginasi ----------
function pagerHtml(hal) {
  if (!hal || hal.pages <= 1) return '';
  const p = hal.page, n = hal.pages, btn = [];
  const tambah = function (i) { btn.push('<button class="pg' + (i === p ? ' active' : '') + '" data-page="' + i + '"' + (i === p ? ' aria-current="page"' : '') + '>' + i + '</button>'); };
  const set = {};
  [1, 2, p - 1, p, p + 1, n - 1, n].forEach(function (i) { if (i >= 1 && i <= n) set[i] = true; });
  const urut = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
  let prev = 0;
  urut.forEach(function (i) { if (i - prev > 1) btn.push('<span class="pg-gap">…</span>'); tambah(i); prev = i; });
  return '<nav class="pager" aria-label="Halaman"><button class="pg" data-page="' + (p - 1) + '"' + (p <= 1 ? ' disabled' : '') + '>Sebelumnya</button>' +
    btn.join('') + '<button class="pg" data-page="' + (p + 1) + '"' + (p >= n ? ' disabled' : '') + '>Berikutnya</button></nav>';
}
function ikatPager(el, fn) {
  $$('.pg[data-page]', el).forEach(function (b) {
    b.addEventListener('click', function () { if (!b.disabled) fn(parseInt(b.dataset.page, 10)); });
  });
}

// ---------- CSV (pembatas koma atau titik koma, mengikuti Excel Indonesia) ----------
function parseCSV(teks) {
  teks = String(teks).replace(/^\uFEFF/, '');
  const barisPertama = teks.split(/\r?\n/)[0] || '';
  const pemisah = barisPertama.split(';').length > barisPertama.split(',').length ? ';' : ',';
  const rows = []; let row = [], sel = '', kutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (kutip) {
      if (c === '"') { if (teks[i + 1] === '"') { sel += '"'; i++; } else kutip = false; } else sel += c;
    } else if (c === '"') kutip = true;
    else if (c === pemisah) { row.push(sel); sel = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && teks[i + 1] === '\n') i++;
      row.push(sel); sel = '';
      if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
      row = [];
    } else sel += c;
  }
  row.push(sel);
  if (row.some(function (x) { return x.trim() !== ''; })) rows.push(row);
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows.shift().map(function (h) { return h.trim().toLowerCase().replace(/\s+/g, '_'); });
  return {
    headers: headers,
    rows: rows.map(function (r, i) {
      const o = { _baris: i + 2 };
      headers.forEach(function (h, j) { if (h) o[h] = (r[j] || '').trim(); });
      return o;
    })
  };
}

function unduhTeks(nama, isi, tipe) {
  const blob = new Blob([isi], { type: tipe || 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nama;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}

function salinTeks(teks) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(teks).then(function () { toast('Disalin ke papan klip.'); });
  }
  const ta = document.createElement('textarea'); ta.value = teks; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Disalin ke papan klip.'); } catch (e) { toast('Salin manual teks tersebut.', 'error'); }
  ta.remove();
  return Promise.resolve();
}

function kosong(judul, teks) {
  return '<div class="empty">' + icon('info', 28) + '<strong>' + esc(judul) + '</strong>' + (teks ? '<p>' + esc(teks) + '</p>' : '') + '</div>';
}
function skeleton(n) {
  let s = ''; for (let i = 0; i < (n || 3); i++) s += '<div class="skeleton"></div>';
  return '<div class="skeleton-wrap">' + s + '</div>';
}
