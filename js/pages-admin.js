// ============================================================
// PANEL ADMIN (Fase 1) — Dasbor, Kelola Akun, Impor Data, Pengumuman,
// Pengaturan, Log Aktivitas. Hak akses diperiksa ulang oleh server.
// ============================================================

const NAMA_PERAN = { superadmin: 'Super Admin', dinas: 'Dinas Pendidikan', panitia: 'Panitia SPMB', pendaftar: 'Pendaftar' };

function wajibStaf(peranBoleh) {
  const u = Session.user;
  if (!Session.token || !u) { location.hash = '#/masuk'; return false; }
  if (u.peran === 'pendaftar') { location.hash = '#/dasbor'; return false; }
  if (peranBoleh && peranBoleh.indexOf(u.peran) === -1) {
    setView('<div class="adm-content">' + kosong('Akses ditolak', 'Halaman ini tidak tersedia untuk peran ' + NAMA_PERAN[u.peran] + '.') + '</div>');
    return false;
  }
  return true;
}

function adminHead(judul, sub, aksi) {
  return '<div class="adm-head"><div><h1>' + esc(judul) + '</h1>' + (sub ? '<p class="muted">' + esc(sub) + '</p>' : '') + '</div>' + (aksi ? '<div class="adm-actions">' + aksi + '</div>' : '') + '</div>';
}

async function muatSemuaSekolah() {
  if (State.sekolahAll) return State.sekolahAll;
  let semua = [], hal = 1, total = 1;
  while (hal <= total) {
    const r = (await API.get('sekolah', { page: hal, size: 100 })).data;
    semua = semua.concat(r.items); total = r.pages; hal++;
  }
  State.sekolahAll = semua;
  return semua;
}

// ---------- DASBOR ----------
async function pageAdminDasbor() {
  if (!wajibStaf()) return;
  const u = Session.user;
  setView('<div class="adm-content">' + adminHead('Dasbor ' + NAMA_PERAN[u.peran], 'Ringkasan data dan langkah awal pengaturan.') + skeleton(3) + '</div>');
  try {
    const d = (await API.post('admin.dashboard')).data;
    const st = d.statistik;
    if (u.peran === 'panitia') {
      setView('<div class="adm-content">' + adminHead('Dasbor Panitia SPMB', 'Selamat datang, ' + u.nama) +
        '<div class="notice notice--info">' + icon('info', 20) + '<div>Verifikasi berkas, input nilai, dan penetapan kelulusan akan tersedia pada tahap pengembangan berikutnya (Fase 3). Akun Anda sudah aktif.</div></div></div>');
      return;
    }
    const langkah = [
      ['Ganti kata sandi awal', 'Ganti kata sandi bawaan melalui menu akun di pojok kanan atas (tidak dapat dideteksi otomatis).', null, null],
      ['Isi identitas instansi', 'Nama resmi instansi, alamat, dan kontak helpdesk.', '#/admin/pengaturan', !!(State.cfg.pengaturan.ALAMAT_INSTANSI && (State.cfg.pengaturan.KONTAK_WA || State.cfg.pengaturan.KONTAK_EMAIL))],
      ['Impor data sekolah', 'TK, SD, dan SMP beserta koordinat, rombel, dan daya tampung.', '#/admin/impor', st.totalSekolah > 0],
      ['Impor zonasi', 'Daftar sekolah asal pada zona tiap SD dan SMP.', '#/admin/impor', d.jumlahZonasi > 0],
      ['Impor kuota jalur', 'Kuota zonasi, prestasi, dan afirmasi tiap sekolah.', '#/admin/impor', d.jumlahKuota > 0],
      ['Atur jadwal tahapan', 'Tanggal pendaftaran sampai daftar ulang, dan saklar pendaftaran.', '#/admin/pengaturan', State.cfg.jadwal.some(function (t) { return t.status !== 'Belum Ditetapkan'; })],
      ['Buat akun panitia', 'Satu akun untuk tiap sekolah.', '#/admin/akun', u.peran === 'superadmin' ? d.akun.panitia > 0 : null]
    ];
    setView('<div class="adm-content">' + adminHead('Dasbor ' + NAMA_PERAN[u.peran], 'Ringkasan data dan langkah awal pengaturan.') +
      '<div class="grid grid-4">' +
        '<div class="stat"><span class="stat__label">Sekolah tujuan</span><strong class="stat__value">' + fmtAngka(st.totalSekolah) + '</strong><span class="stat__sub">' + st.sd + ' SD · ' + st.smp + ' SMP</span></div>' +
        '<div class="stat"><span class="stat__label">Total daya tampung</span><strong class="stat__value">' + fmtAngka(st.dayaTampung) + '</strong><span class="stat__sub">Diisi manual oleh dinas</span></div>' +
        '<div class="stat"><span class="stat__label">Pendaftar mengirim berkas</span><strong class="stat__value">' + fmtAngka(st.totalPendaftar) + '</strong><span class="stat__sub">' + fmtAngka(d.pendaftarDraft) + ' masih draf</span></div>' +
        '<div class="stat"><span class="stat__label">Akun</span><strong class="stat__value">' + fmtAngka(d.akun.pendaftar + d.akun.panitia + d.akun.dinas + d.akun.superadmin) + '</strong><span class="stat__sub">' + d.akun.pendaftar + ' pendaftar · ' + d.akun.panitia + ' panitia</span></div></div>' +
      '<div class="adm-cols"><div class="card card-pad"><h2 class="h3">Langkah awal</h2><ol class="todo">' +
        langkah.map(function (l) {
          const sel = l[3] === true;
          return '<li class="' + (sel ? 'done' : '') + '"><span class="todo__box">' + (sel ? icon('check', 14) : '') + '</span><div><b>' + (l[2] ? '<a href="' + l[2] + '">' + esc(l[0]) + '</a>' : esc(l[0])) + '</b><p class="small muted">' + esc(l[1]) + '</p></div></li>';
        }).join('') + '</ol></div>' +
      (u.peran === 'superadmin' ? '<div class="card card-pad"><h2 class="h3">Aktivitas terbaru</h2>' + (d.aktivitas.length ? '<ul class="act">' + d.aktivitas.map(function (a) {
        return '<li><span class="small muted">' + esc(fmtWaktu(a.waktu)) + '</span><b>' + esc(a.nama || 'Sistem') + '</b> — ' + esc(a.aksi) + (a.detail ? ' <span class="muted">(' + esc(a.detail) + ')</span>' : '') + '</li>'; }).join('') + '</ul>' : kosong('Belum ada aktivitas')) + '</div>' : '') + '</div></div>');
  } catch (e) { setView('<div class="adm-content">' + kosong('Dasbor tidak dapat dimuat', e.message) + '</div>'); }
}

// ---------- KELOLA AKUN ----------
async function pageAdminAkun() {
  if (!wajibStaf(['superadmin', 'dinas'])) return;
  const sa = Session.user.peran === 'superadmin';
  const f = { peran: sa ? '' : 'panitia', q: '', page: 1 };
  setView('<div class="adm-content">' + adminHead(sa ? 'Kelola Semua Akun' : 'Akun Panitia', sa ? 'Atur akun petugas dan lihat akun pendaftar.' : 'Satu akun panitia untuk tiap sekolah.', '<button class="btn btn-primary" id="atambah">' + icon('plus', 16) + ' Tambah Akun</button>') +
    (sa ? '<div class="tabs" role="tablist">' + [['', 'Semua'], ['superadmin', 'Super Admin'], ['dinas', 'Dinas'], ['panitia', 'Panitia'], ['pendaftar', 'Pendaftar']].map(function (t) { return '<button class="tab' + (t[0] === '' ? ' active' : '') + '" role="tab" data-p="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' : '') +
    '<div class="card card-pad filter-bar"><div class="field grow"><label for="aq">Cari nama atau username</label><div class="input-ico">' + icon('search', 18) + '<input id="aq" class="input" type="search"></div></div></div>' +
    '<div id="atabel"></div><div id="apager"></div></div>');

  async function muat() {
    $('#atabel').innerHTML = skeleton(3);
    try {
      const h = (await API.post('admin.listAkun', { peran: f.peran, q: f.q, page: f.page })).data;
      $('#atabel').innerHTML = h.items.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Username</th><th>Peran</th><th>Sekolah</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' +
        h.items.map(function (a) {
          const staf = a.peran !== 'pendaftar';
          return '<tr><td data-l="Nama"><b>' + esc(a.nama) + '</b>' + (a.email ? '<br><span class="small muted">' + esc(a.email) + '</span>' : '') + '</td><td data-l="Username"><code>' + esc(a.peran === 'pendaftar' ? '•••• ' + String(a.username).slice(-4) : a.username) + '</code></td>' +
            '<td data-l="Peran">' + esc(NAMA_PERAN[a.peran]) + '</td><td data-l="Sekolah">' + esc(a.sekolah_nama || '-') + '</td><td data-l="Status">' + '<span class="badge badge--' + (a.aktif === 'ya' ? 'lulus' : 'draft') + '">' + (a.aktif === 'ya' ? 'Aktif' : 'Nonaktif') + '</span>' + '</td>' +
            '<td data-l="Aksi" class="td-actions">' + (staf ? '<button class="btn btn-ghost btn-sm" data-a="ubah" data-id="' + esc(a.id) + '">' + icon('edit', 15) + ' Ubah</button>' : '') +
            '<button class="btn btn-ghost btn-sm" data-a="reset" data-id="' + esc(a.id) + '">' + icon('key', 15) + ' Reset sandi</button>' +
            '<button class="btn btn-ghost btn-sm" data-a="aktif" data-id="' + esc(a.id) + '" data-v="' + (a.aktif === 'ya' ? '0' : '1') + '">' + (a.aktif === 'ya' ? 'Nonaktifkan' : 'Aktifkan') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>' : kosong('Akun tidak ditemukan');
      $('#apager').innerHTML = pagerHtml(h);
      ikatPager($('#apager'), function (n) { f.page = n; muat(); });
      $$('#atabel [data-a]').forEach(function (b) {
        b.addEventListener('click', function () {
          const a = h.items.filter(function (x) { return x.id === b.dataset.id; })[0];
          if (b.dataset.a === 'ubah') formAkun(a);
          else if (b.dataset.a === 'reset') resetSandi(a);
          else ubahAktif(a, b.dataset.v === '1');
        });
      });
    } catch (e) { $('#atabel').innerHTML = kosong('Akun tidak dapat dimuat', e.message); }
  }

  function tampilSandi(judul, nama, sandi) {
    Modal.buka({ judul: judul, isi: '<p>Kata sandi sementara untuk <b>' + esc(nama) + '</b>:</p><div class="secret"><code id="sandiTmp">' + esc(sandi) + '</code><button class="btn btn-outline btn-sm" id="sandiSalin">' + icon('copy', 15) + ' Salin</button></div>' +
      '<div class="notice notice--warn">' + icon('alert', 18) + '<div>Kata sandi ini <b>hanya tampil sekali</b>. Sampaikan kepada pemilik akun dan minta segera menggantinya.</div></div>',
      kaki: '<button class="btn btn-primary" id="sandiOk">Selesai</button>' });
    $('#sandiSalin').addEventListener('click', function () { salinTeks(sandi); });
    $('#sandiOk').addEventListener('click', function () { Modal.tutup(); });
  }

  async function resetSandi(a) {
    if (!confirm('Reset kata sandi akun "' + a.nama + '"? Sesi aktifnya akan diakhiri.')) return;
    try { const r = await API.post('admin.resetPassword', { id: a.id }); tampilSandi('Kata Sandi Direset', a.nama, r.data.sandiSementara); }
    catch (e) { toast(e.message, 'error'); }
  }
  async function ubahAktif(a, aktif) {
    if (!confirm((aktif ? 'Aktifkan' : 'Nonaktifkan') + ' akun "' + a.nama + '"?')) return;
    try { const r = await API.post('admin.setAktif', { id: a.id, aktif: aktif }); toast(r.message); muat(); }
    catch (e) { toast(e.message, 'error'); }
  }

  async function formAkun(a) {
    let sekolah = [];
    try { sekolah = await muatSemuaSekolah(); } catch (e) { toast('Daftar sekolah tidak dapat dimuat: ' + e.message, 'error'); }
    const peranOpsi = sa ? ['panitia', 'dinas', 'superadmin'] : ['panitia'];
    Modal.buka({
      judul: a ? 'Ubah Akun' : 'Tambah Akun',
      isi: '<form id="fakun" class="stack" novalidate>' +
        '<div class="field"><label for="ap">Peran</label><select id="ap" class="select">' + peranOpsi.map(function (p) { return '<option value="' + p + '"' + (a && a.peran === p ? ' selected' : '') + '>' + NAMA_PERAN[p] + '</option>'; }).join('') + '</select></div>' +
        '<div class="field" id="aswrap"><label for="as">Sekolah (wajib untuk panitia)</label><select id="as" class="select"><option value="">— pilih sekolah —</option>' +
          sekolah.map(function (s) { return '<option value="' + esc(s.id) + '"' + (a && a.sekolah_id === s.id ? ' selected' : '') + '>' + esc(s.nama) + ' (' + s.jenjang + ', ' + esc(s.kecamatan) + ')</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="an">Nama lengkap</label><input id="an" class="input" value="' + esc(a ? a.nama : '') + '"></div>' +
        '<div class="field"><label for="au">Username</label><input id="au" class="input" autocomplete="off" value="' + esc(a ? a.username : '') + '"><span class="hint">Huruf kecil, angka, titik, garis bawah. Minimal 4 karakter.</span></div>' +
        '<div class="grid grid-2"><div class="field"><label for="ae">Email</label><input id="ae" class="input" type="email" value="' + esc(a ? a.email : '') + '"></div>' +
        '<div class="field"><label for="ah">No. HP</label><input id="ah" class="input" inputmode="tel" value="' + esc(a ? a.hp : '') + '"></div></div>' +
        (a ? '' : '<p class="muted small">Kata sandi sementara dibuat otomatis dan ditampilkan sekali setelah akun disimpan.</p>') +
        '<div id="aerr" class="error-text" role="alert"></div></form>',
      kaki: '<button class="btn btn-ghost" id="abatal">Batal</button><button class="btn btn-primary" id="asimpan">Simpan</button>'
    });
    const atur = function () { $('#aswrap').style.display = $('#ap').value === 'panitia' ? '' : 'none'; };
    $('#ap').addEventListener('change', atur); atur();
    $('#abatal').addEventListener('click', function () { Modal.tutup(); });
    const simpan = async function () {
      const btn = $('#asimpan'); $('#aerr').textContent = ''; tombolBusy(btn, true, 'Menyimpan...');
      const namaAkun = $('#an').value;
      try {
        const r = await API.post('admin.simpanAkun', { id: a ? a.id : '', peran: $('#ap').value, sekolah_id: $('#as').value, nama: namaAkun, username: $('#au').value, email: $('#ae').value, hp: $('#ah').value });
        Modal.tutup(); toast(r.message); muat();
        if (r.data.sandiSementara) tampilSandi('Akun Dibuat', namaAkun, r.data.sandiSementara);
      } catch (e) { $('#aerr').textContent = e.message; tombolBusy(btn, false); }
    };
    $('#asimpan').addEventListener('click', simpan);
    $('#fakun').addEventListener('submit', function (e) { e.preventDefault(); simpan(); });
  }

  $('#atambah').addEventListener('click', function () { formAkun(null); });
  $('#aq').addEventListener('input', debounce(function (e) { f.q = e.target.value.trim(); f.page = 1; muat(); }, 400));
  $$('.tab').forEach(function (t) { t.addEventListener('click', function () { $$('.tab').forEach(function (x) { x.classList.remove('active'); }); t.classList.add('active'); f.peran = t.dataset.p; f.page = 1; muat(); }); });
  muat();
}

// ---------- IMPOR DATA ----------
const JENIS_IMPOR = {
  sekolah: { nama: '1. Data Sekolah (TK, SD, SMP)', wajib: ['npsn', 'nama', 'jenjang', 'kecamatan'], semua: ['npsn', 'nama', 'jenjang', 'kecamatan', 'alamat', 'lat', 'lng', 'jumlah_rombel', 'batas_per_rombel', 'daya_tampung', 'profil', 'kontak'],
    petunjuk: 'jenjang diisi TK, SD, atau SMP. TK dan SD wajib diimpor karena menjadi sekolah asal pada zonasi. lat/lng boleh memakai koma atau titik desimal. daya_tampung diisi manual oleh dinas.' },
  zonasi: { nama: '2. Zonasi (sekolah asal per sekolah tujuan)', wajib: ['npsn_tujuan', 'npsn_asal'], semua: ['npsn_tujuan', 'npsn_asal'],
    petunjuk: 'Satu baris = satu sekolah asal pada zona sekolah tujuan. Tujuan SD → asal TK; tujuan SMP → asal SD. Impor data sekolah terlebih dahulu.' },
  kuota: { nama: '3. Kuota per Jalur', wajib: ['npsn', 'kode_jalur', 'kuota'], semua: ['npsn', 'kode_jalur', 'kuota'],
    petunjuk: 'kode_jalur: zonasi, prestasi, atau afirmasi. Total kuota satu sekolah sebaiknya tidak melebihi daya tampung; sistem akan memberi peringatan.' }
};

function pageAdminImpor() {
  if (!wajibStaf(['superadmin', 'dinas'])) return;
  let jenis = 'sekolah', data = null;
  setView('<div class="adm-content">' + adminHead('Impor Data', 'Unggah berkas CSV (hasil simpan dari Excel). Pembatas koma atau titik koma dikenali otomatis.') +
    '<div class="notice notice--info">' + icon('info', 20) + '<div>Urutan impor: <b>Sekolah → Zonasi → Kuota Jalur</b>. Impor ulang akan memperbarui data yang sudah ada (berdasarkan NPSN) tanpa menggandakan. Kolom opsional yang dikosongkan tidak menghapus data lama.</div></div>' +
    '<div class="card card-pad stack"><div class="tabs" id="jtab">' + Object.keys(JENIS_IMPOR).map(function (k) { return '<button class="tab' + (k === jenis ? ' active' : '') + '" data-j="' + k + '">' + esc(JENIS_IMPOR[k].nama) + '</button>'; }).join('') + '</div>' +
    '<div id="jinfo"></div>' +
    '<div class="dropzone" id="dz"><input type="file" id="berkas" accept=".csv,text/csv,text/plain">' + icon('upload', 28) + '<b>Pilih berkas CSV</b><span class="muted small">atau seret ke sini</span></div>' +
    '<div id="pratinjau"></div><div id="hasilimpor"></div></div></div>');

  function tampilInfo() {
    const j = JENIS_IMPOR[jenis];
    $('#jinfo').innerHTML = '<p class="small"><b>Kolom wajib:</b> ' + j.wajib.map(function (k) { return '<code>' + k + '</code>'; }).join(' ') + '<br><b>Semua kolom:</b> ' + j.semua.map(function (k) { return '<code>' + k + '</code>'; }).join(' ') + '</p><p class="small muted">' + esc(j.petunjuk) + '</p>' +
      '<button class="btn btn-outline btn-sm" id="templat">' + icon('download', 15) + ' Unduh templat CSV</button>';
    $('#templat').addEventListener('click', function () { unduhTeks('templat-' + jenis + '.csv', '\uFEFF' + j.semua.join(',') + '\n'); });
    $('#pratinjau').innerHTML = ''; $('#hasilimpor').innerHTML = ''; data = null;
  }
  $$('#jtab .tab').forEach(function (t) { t.addEventListener('click', function () { $$('#jtab .tab').forEach(function (x) { x.classList.remove('active'); }); t.classList.add('active'); jenis = t.dataset.j; tampilInfo(); }); });

  function bacaBerkas(file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast('Berkas terlalu besar (maksimal 3 MB).', 'error'); return; }
    const rd = new FileReader();
    rd.onload = function () {
      const p = parseCSV(String(rd.result));
      const j = JENIS_IMPOR[jenis];
      const hilang = j.wajib.filter(function (k) { return p.headers.indexOf(k) === -1; });
      if (!p.rows.length || hilang.length) {
        $('#pratinjau').innerHTML = '<div class="notice notice--error">' + icon('alert', 20) + '<div>' + (hilang.length ? 'Kolom wajib tidak ditemukan: <b>' + hilang.join(', ') + '</b>. Gunakan templat CSV.' : 'Berkas tidak berisi baris data.') + '</div></div>';
        data = null; return;
      }
      data = p.rows;
      $('#pratinjau').innerHTML = '<p><b>' + fmtAngka(data.length) + ' baris</b> siap diimpor dari <code>' + esc(file.name) + '</code>. Pratinjau 5 baris pertama:</p><div class="table-wrap"><table class="table table--compact"><thead><tr>' +
        j.semua.filter(function (k) { return p.headers.indexOf(k) !== -1; }).map(function (k) { return '<th>' + k + '</th>'; }).join('') + '</tr></thead><tbody>' +
        data.slice(0, 5).map(function (r) { return '<tr>' + j.semua.filter(function (k) { return p.headers.indexOf(k) !== -1; }).map(function (k) { return '<td>' + esc(r[k]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        '<button class="btn btn-primary" id="mulai">' + icon('upload', 16) + ' Mulai Impor</button>';
      $('#mulai').addEventListener('click', jalankan);
    };
    rd.readAsText(file, 'utf-8');
  }

  async function jalankan() {
    const btn = $('#mulai'); tombolBusy(btn, true, 'Mengimpor...');
    const total = { ditambah: 0, diperbarui: 0, ditolak: [], peringatan: [] };
    const UKURAN = 200;
    try {
      for (let i = 0; i < data.length; i += UKURAN) {
        const r = (await API.post('admin.impor', { jenis: jenis, rows: data.slice(i, i + UKURAN) })).data;
        total.ditambah += r.ditambah; total.diperbarui += r.diperbarui;
        total.ditolak = total.ditolak.concat(r.ditolak); total.peringatan = total.peringatan.concat(r.peringatan || []);
        $('#hasilimpor').innerHTML = '<p class="muted">Memproses… ' + Math.min(i + UKURAN, data.length) + ' / ' + data.length + ' baris</p>';
      }
      State.sekolahAll = null; API.clearCache();
      $('#hasilimpor').innerHTML = '<div class="notice notice--ok">' + icon('check', 20) + '<div><b>Impor selesai.</b> ' + total.ditambah + ' ditambahkan, ' + total.diperbarui + ' diperbarui, ' + total.ditolak.length + ' ditolak.</div></div>' +
        (total.peringatan.length ? '<div class="notice notice--warn">' + icon('alert', 20) + '<div><b>Peringatan kuota:</b><ul>' + total.peringatan.slice(0, 20).map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div></div>' : '') +
        (total.ditolak.length ? '<h3 class="h3">Baris ditolak (' + total.ditolak.length + ')</h3><div class="table-wrap"><table class="table table--compact"><thead><tr><th>Baris</th><th>Alasan</th></tr></thead><tbody>' +
          total.ditolak.slice(0, 100).map(function (x) { return '<tr><td>' + esc(x.baris) + '</td><td>' + esc(x.alasan) + '</td></tr>'; }).join('') + '</tbody></table></div>' + (total.ditolak.length > 100 ? '<p class="muted small">Menampilkan 100 baris pertama.</p>' : '') : '');
      $('#pratinjau').innerHTML = '';
      toast('Impor selesai.');
    } catch (e) {
      $('#hasilimpor').innerHTML = '<div class="notice notice--error">' + icon('alert', 20) + '<div>Impor terhenti: ' + esc(e.message) + ' Baris sebelumnya mungkin sudah tersimpan; impor ulang aman dilakukan.</div></div>';
      tombolBusy(btn, false);
    }
  }

  const dz = $('#dz');
  $('#berkas').addEventListener('change', function (e) { bacaBerkas(e.target.files[0]); });
  ['dragover', 'dragenter'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); }); });
  dz.addEventListener('drop', function (e) { bacaBerkas(e.dataTransfer.files[0]); });
  tampilInfo();
}

// ---------- PENGUMUMAN & DOKUMEN ----------
async function pageAdminPengumuman() {
  if (!wajibStaf(['superadmin', 'dinas'])) return;
  setView('<div class="adm-content">' + adminHead('Pengumuman & Dokumen', 'Tampil di beranda (pengumuman) dan halaman Dokumen (tautan unduhan).', '<button class="btn btn-primary" id="itambah">' + icon('plus', 16) + ' Tambah</button>') + '<div id="itabel">' + skeleton(3) + '</div></div>');
  async function muat() {
    try {
      const daftar = (await API.post('admin.listInformasi')).data;
      $('#itabel').innerHTML = daftar.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Judul</th><th>Jenis</th><th>Tanggal</th><th>Tampil</th><th>Aksi</th></tr></thead><tbody>' + daftar.map(function (x) {
        return '<tr><td data-l="Judul"><b>' + esc(x.judul) + '</b>' + (x.tautan ? '<br><span class="small muted">' + esc(x.tautan) + '</span>' : '') + '</td><td data-l="Jenis">' + esc(x.kategori) + '</td><td data-l="Tanggal">' + esc(fmtWaktu(x.tanggal, false)) + '</td><td data-l="Tampil">' + (x.aktif === 'tidak' ? 'Tidak' : 'Ya') + '</td>' +
          '<td data-l="Aksi" class="td-actions"><button class="btn btn-ghost btn-sm" data-e="' + esc(x.id) + '">' + icon('edit', 15) + ' Ubah</button><button class="btn btn-ghost btn-sm" data-h="' + esc(x.id) + '">' + icon('trash', 15) + ' Hapus</button></td></tr>';
      }).join('') + '</tbody></table></div>' : kosong('Belum ada pengumuman atau dokumen');
      $$('#itabel [data-e]').forEach(function (b) { b.addEventListener('click', function () { form(daftar.filter(function (x) { return x.id === b.dataset.e; })[0]); }); });
      $$('#itabel [data-h]').forEach(function (b) { b.addEventListener('click', async function () {
        if (!confirm('Hapus data ini?')) return;
        try { await API.post('admin.hapusInformasi', { id: b.dataset.h }); API.clearCache(); toast('Dihapus.'); muat(); } catch (e) { toast(e.message, 'error'); } }); });
    } catch (e) { $('#itabel').innerHTML = kosong('Data tidak dapat dimuat', e.message); }
  }
  function form(x) {
    Modal.buka({ judul: x ? 'Ubah' : 'Tambah Pengumuman / Dokumen',
      isi: '<form id="fi" class="stack" novalidate><div class="field"><label for="ik">Jenis</label><select id="ik" class="select"><option' + (x && x.kategori === 'Dokumen' ? '' : ' selected') + '>Pengumuman</option><option' + (x && x.kategori === 'Dokumen' ? ' selected' : '') + '>Dokumen</option></select></div>' +
        '<div class="field"><label for="ij">Judul</label><input id="ij" class="input" maxlength="150" value="' + esc(x ? x.judul : '') + '"></div>' +
        '<div class="field"><label for="ii">Isi / keterangan</label><textarea id="ii" class="textarea" rows="4" maxlength="1500">' + esc(x ? x.isi : '') + '</textarea></div>' +
        '<div class="field"><label for="it">Tautan (https://…) — wajib untuk Dokumen</label><input id="it" class="input" value="' + esc(x ? x.tautan : '') + '" placeholder="https://drive.google.com/…"></div>' +
        (x ? '<label class="check-row"><input type="checkbox" id="ia"' + (x.aktif === 'tidak' ? '' : ' checked') + '><span>Tampilkan di portal</span></label>' : '') + '<div id="ie" class="error-text" role="alert"></div></form>',
      kaki: '<button class="btn btn-ghost" id="ib">Batal</button><button class="btn btn-primary" id="is">Simpan</button>' });
    $('#ib').addEventListener('click', function () { Modal.tutup(); });
    const simpan = async function () {
      const btn = $('#is'); $('#ie').textContent = ''; tombolBusy(btn, true, 'Menyimpan...');
      try { await API.post('admin.simpanInformasi', { id: x ? x.id : '', kategori: $('#ik').value, judul: $('#ij').value, isi: $('#ii').value, tautan: $('#it').value, aktif: x ? $('#ia').checked : true });
        API.clearCache(); Modal.tutup(); toast('Tersimpan.'); muat(); }
      catch (e) { $('#ie').textContent = e.message; tombolBusy(btn, false); }
    };
    $('#is').addEventListener('click', simpan);
  }
  $('#itambah').addEventListener('click', function () { form(null); });
  muat();
}

// ---------- PENGATURAN ----------
async function pageAdminPengaturan() {
  if (!wajibStaf(['superadmin', 'dinas'])) return;
  const sa = Session.user.peran === 'superadmin';
  setView('<div class="adm-content">' + adminHead('Pengaturan', sa ? 'Identitas, tema, teks beranda, dan jadwal.' : 'Jadwal tahapan dan saklar pendaftaran.') + skeleton(3) + '</div>');
  try {
    const s = (await API.post('admin.getPengaturan')).data;
    let jadwal = []; try { jadwal = JSON.parse(s.JADWAL_JSON || '[]'); } catch (e) { jadwal = []; }
    const teksField = function (k, label, ket, tipe) { return '<div class="field"><label for="s_' + k + '">' + label + '</label>' + (tipe === 'area' ? '<textarea id="s_' + k + '" class="textarea" rows="3" data-k="' + k + '">' + esc(s[k]) + '</textarea>' : '<input id="s_' + k + '" class="input" data-k="' + k + '" value="' + esc(s[k]) + '">') + (ket ? '<span class="hint">' + ket + '</span>' : '') + '</div>'; };
    const warna = function (k, label) { return '<div class="field"><label for="s_' + k + '">' + label + '</label><div class="color-row"><input type="color" id="s_' + k + '" data-k="' + k + '" value="' + esc(s[k] || '#000000') + '"><code>' + esc(s[k]) + '</code></div></div>'; };
    setView('<div class="adm-content">' + adminHead('Pengaturan', sa ? 'Identitas, tema, teks beranda, dan jadwal.' : 'Jadwal tahapan dan saklar pendaftaran.', '<button class="btn btn-primary" id="ssimpan">' + icon('check', 16) + ' Simpan Perubahan</button>') +
      '<form id="fset" class="stack" novalidate>' +
      (sa ? '<div class="card card-pad stack"><h2 class="h3">Identitas Instansi</h2><div class="grid grid-2">' +
          teksField('NAMA_APLIKASI', 'Nama aplikasi') + teksField('SUBJUDUL', 'Sub-judul') + teksField('INSTANSI', 'Nama resmi instansi', 'Wajib disesuaikan dengan nama resmi Dinas.') + teksField('TAHUN_AJARAN', 'Tahun ajaran aktif') +
          teksField('KONTAK_WA', 'WhatsApp helpdesk') + teksField('KONTAK_EMAIL', 'Email helpdesk') + teksField('JAM_LAYANAN', 'Jam layanan') + teksField('ALAMAT_INSTANSI', 'Alamat instansi') + '</div></div>' +
        '<div class="card card-pad stack"><h2 class="h3">Tema &amp; Tampilan</h2><div class="grid grid-3">' + warna('TEMA_PRIMARY', 'Warna utama') + warna('TEMA_NAVY', 'Warna navy (judul, sidebar)') + warna('TEMA_ACCENT', 'Warna aksen (tombol Masuk)') + '</div>' +
          '<div class="grid grid-2"><div class="field"><label for="s_MODE_DEFAULT">Mode tampilan bawaan</label><select id="s_MODE_DEFAULT" class="select" data-k="MODE_DEFAULT"><option value="terang"' + (s.MODE_DEFAULT !== 'gelap' ? ' selected' : '') + '>Terang</option><option value="gelap"' + (s.MODE_DEFAULT === 'gelap' ? ' selected' : '') + '>Gelap</option></select></div>' +
          teksField('HERO_BG_URL', 'URL gambar latar beranda (opsional)', 'Harus diawali https://. Unggah gambar langsung hadir pada tahap berikutnya.') + '</div></div>' +
        '<div class="card card-pad stack"><h2 class="h3">Teks Beranda</h2>' + teksField('HERO_JUDUL', 'Judul besar') + teksField('HERO_TAGLINE', 'Teks pengantar', '', 'area') + teksField('BANNER_ZONASI', 'Pesan edukasi zonasi', '', 'area') + '</div>' : '') +
      '<div class="card card-pad stack"><h2 class="h3">Jadwal Tahapan</h2><p class="muted small">Waktu dalam WITA. Biarkan kosong bila belum ditetapkan.</p><div id="jadwal">' +
        jadwal.map(function (t, i) { return '<div class="jrow" data-i="' + i + '"><b>' + esc(t.nama) + '</b><div class="field"><label>Mulai</label><input type="datetime-local" class="input j-mulai" value="' + esc(t.mulai) + '"></div><div class="field"><label>Selesai</label><input type="datetime-local" class="input j-selesai" value="' + esc(t.selesai) + '"></div></div>'; }).join('') + '</div>' +
        '<div class="grid grid-2"><div class="field"><label for="s_PENDAFTARAN_DIBUKA">Saklar pendaftaran</label><select id="s_PENDAFTARAN_DIBUKA" class="select" data-k="PENDAFTARAN_DIBUKA"><option value="tidak"' + (s.PENDAFTARAN_DIBUKA !== 'ya' ? ' selected' : '') + '>Ditutup</option><option value="ya"' + (s.PENDAFTARAN_DIBUKA === 'ya' ? ' selected' : '') + '>Dibuka (selama tahap pendaftaran berjalan)</option></select></div>' +
        '<div class="field"><label for="s_HASIL_DIBUKA_PADA">Waktu pengumuman hasil</label><input type="datetime-local" id="s_HASIL_DIBUKA_PADA" class="input" data-k="HASIL_DIBUKA_PADA" value="' + esc(s.HASIL_DIBUKA_PADA) + '"><span class="hint">Hasil seleksi tidak tampil ke publik sebelum waktu ini (embargo).</span></div></div></div></form></div>');
    $$('input[type=color]').forEach(function (c) { c.addEventListener('input', function () { c.nextElementSibling.textContent = c.value.toUpperCase(); }); });
    $('#ssimpan').addEventListener('click', async function () {
      const btn = this; tombolBusy(btn, true, 'Menyimpan...');
      const nilai = {};
      $$('#fset [data-k]').forEach(function (el) { nilai[el.dataset.k] = el.type === 'color' ? el.value.toUpperCase() : el.value.trim(); });
      nilai.JADWAL_JSON = JSON.stringify(jadwal.map(function (t, i) {
        const row = $('.jrow[data-i="' + i + '"]');
        return { kode: t.kode, nama: t.nama, keterangan: t.keterangan || '', mulai: $('.j-mulai', row).value, selesai: $('.j-selesai', row).value };
      }));
      try {
        await API.post('admin.simpanPengaturan', { nilai: nilai });
        API.clearCache(); await muatKonfigurasi(); terapkanTema(); renderCangkang();
        toast('Pengaturan disimpan.');
      } catch (e) { toast(e.message, 'error'); }
      tombolBusy(btn, false);
    });
  } catch (e) { setView('<div class="adm-content">' + kosong('Pengaturan tidak dapat dimuat', e.message) + '</div>'); }
}

// ---------- LOG AKTIVITAS ----------
async function pageAdminLog() {
  if (!wajibStaf(['superadmin'])) return;
  const f = { q: '', kategori: '', page: 1 };
  setView('<div class="adm-content">' + adminHead('Log Aktivitas', 'Jejak tindakan penting. Log hanya bertambah dan tidak dapat diubah dari aplikasi.') +
    '<div class="card card-pad filter-bar"><div class="field grow"><label for="lq">Cari</label><div class="input-ico">' + icon('search', 18) + '<input id="lq" class="input" type="search" placeholder="Nama, aksi, atau detail"></div></div>' +
    '<div class="field"><label for="lk">Kategori</label><select id="lk" class="select"><option value="">Semua</option>' + ['Autentikasi', 'Akun', 'Impor', 'Pengaturan', 'Pengumuman'].map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select></div></div>' +
    '<div id="ltabel"></div><div id="lpager"></div></div>');
  async function muat() {
    $('#ltabel').innerHTML = skeleton(3);
    try {
      const h = (await API.post('admin.log', { q: f.q, kategori: f.kategori, page: f.page })).data;
      $('#ltabel').innerHTML = h.items.length ? '<div class="table-wrap"><table class="table table--compact"><thead><tr><th>Waktu</th><th>Pengguna</th><th>Kategori</th><th>Aksi</th><th>Detail</th></tr></thead><tbody>' + h.items.map(function (x) {
        return '<tr><td data-l="Waktu" class="nowrap">' + esc(fmtWaktu(x.waktu)) + '</td><td data-l="Pengguna">' + esc(x.nama || '-') + '<br><span class="small muted">' + esc(NAMA_PERAN[x.peran] || '') + '</span></td><td data-l="Kategori">' + esc(x.kategori) + '</td><td data-l="Aksi">' + esc(x.aksi) + '</td><td data-l="Detail">' + esc(x.detail) + '</td></tr>'; }).join('') + '</tbody></table></div>' : kosong('Tidak ada catatan');
      $('#lpager').innerHTML = pagerHtml(h); ikatPager($('#lpager'), function (n) { f.page = n; muat(); });
    } catch (e) { $('#ltabel').innerHTML = kosong('Log tidak dapat dimuat', e.message); }
  }
  $('#lq').addEventListener('input', debounce(function (e) { f.q = e.target.value.trim(); f.page = 1; muat(); }, 400));
  $('#lk').addEventListener('change', function (e) { f.kategori = e.target.value; f.page = 1; muat(); });
  muat();
}
