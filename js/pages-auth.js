// ============================================================
// AUTENTIKASI — Masuk, Buat Akun Pendaftar, Dasbor Pendaftar, Ganti Kata Sandi
// ============================================================

function tujuanSetelahLogin(user) {
  return user.peran === 'pendaftar' ? '#/dasbor' : '#/admin';
}

function pageMasuk() {
  if (Session.token && Session.user) { location.hash = tujuanSetelahLogin(Session.user); return; }
  const p = State.cfg.pengaturan;
  setView(
    '<div class="auth-wrap"><div class="container auth-grid">' +
      '<aside class="auth-side"><span class="chip chip--on-dark">' + icon('shield', 15) + ' Portal Resmi</span>' +
        '<h1>' + esc(p.NAMA_APLIKASI) + '</h1><p>' + esc(p.SUBJUDUL) + '</p>' +
        '<ul class="auth-points"><li>' + icon('check', 16) + ' Calon siswa / orang tua masuk dengan NIK calon siswa</li><li>' + icon('check', 16) + ' Panitia, Dinas, dan Super Admin masuk dengan username</li><li>' + icon('lock', 16) + ' Kata sandi disimpan terenkripsi (hash + garam)</li></ul></aside>' +
      '<form id="flogin" class="card card-pad stack auth-card" novalidate>' +
        '<h2>Masuk ke Portal</h2><p class="muted">Gunakan akun yang sudah terdaftar.</p>' +
        '<div class="field"><label for="lu">NIK calon siswa / Username petugas</label><input id="lu" class="input" autocomplete="username" required></div>' +
        '<div class="field"><label for="lp">Kata sandi</label><div class="input-ico input-ico--end"><input id="lp" class="input" type="password" autocomplete="current-password" required>' +
          '<button type="button" class="link-btn" id="ltoggle" aria-label="Tampilkan kata sandi">Lihat</button></div></div>' +
        '<div id="lerr" class="error-text" role="alert"></div>' +
        '<button class="btn btn-primary btn-lg btn-block" type="submit">Masuk ke Sistem</button>' +
        '<p class="muted small center">Lupa kata sandi? Hubungi panitia sekolah atau helpdesk dinas untuk reset.</p>' +
        '<hr><p class="center">Belum punya akun? <a href="#/buat-akun"><b>Buat akun pendaftar</b></a></p></form></div></div>'
  );
  $('#ltoggle').addEventListener('click', function () {
    const i = $('#lp'); const tampil = i.type === 'password'; i.type = tampil ? 'text' : 'password'; this.textContent = tampil ? 'Sembunyikan' : 'Lihat';
  });
  $('#flogin').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = $('button[type=submit]', e.target); $('#lerr').textContent = '';
    if (!$('#lu').value.trim() || !$('#lp').value) { $('#lerr').textContent = 'Lengkapi username dan kata sandi.'; return; }
    tombolBusy(btn, true, 'Memeriksa...');
    try {
      const r = await API.post('login', { username: $('#lu').value.trim(), password: $('#lp').value }, false);
      Session.save(r.data.token, r.data.user);
      renderCangkang();
      toast('Selamat datang, ' + r.data.user.nama + '.');
      location.hash = tujuanSetelahLogin(r.data.user);
    } catch (err) { $('#lerr').textContent = err.message; tombolBusy(btn, false); }
  });
}

function pageBuatAkun() {
  if (Session.token && Session.user) { location.hash = tujuanSetelahLogin(Session.user); return; }
  const p = State.cfg.pengaturan;
  setView(
    '<div class="page-head"><div class="container"><span class="eyebrow">' + icon('users', 16) + ' Portal resmi registrasi siswa baru</span><h1>Buat Akun Calon Peserta Didik Baru</h1>' +
    '<p class="lead">Tahun Ajaran ' + esc(p.TAHUN_AJARAN) + ' · ' + esc(p.INSTANSI) + '</p></div></div>' +
    '<div class="container section reg-grid"><form id="freg" class="card card-pad stack" novalidate>' +
      '<fieldset class="field"><legend>1. Pilih jenjang tujuan <span class="req">*</span></legend><div class="radio-cards">' +
        '<label class="radio-card"><input type="radio" name="jenjang" value="SD" checked><span><b>Masuk SD</b><small>Lulusan TK / PAUD atau baru masuk</small></span></label>' +
        '<label class="radio-card"><input type="radio" name="jenjang" value="SMP"><span><b>Masuk SMP</b><small>Lulusan SD / MI sederajat</small></span></label></div></fieldset>' +
      '<div class="grid grid-2">' +
        '<div class="field"><label for="rnik">NIK calon siswa <span class="req">*</span></label><input id="rnik" class="input" inputmode="numeric" maxlength="16" placeholder="16 digit NIK sesuai KK" autocomplete="off"><span class="hint">Dipakai sebagai username untuk masuk.</span></div>' +
        '<div class="field"><label for="rnisn">NISN <span class="hint-inline">(opsional untuk lulusan TK)</span></label><input id="rnisn" class="input" inputmode="numeric" maxlength="10" placeholder="10 digit"></div></div>' +
      '<div class="field"><label for="rnama">Nama lengkap calon siswa <span class="req">*</span></label><input id="rnama" class="input" placeholder="Sesuai akta kelahiran, tanpa gelar atau singkatan" autocomplete="off"></div>' +
      '<div class="grid grid-2"><div class="field"><label for="rtgl">Tanggal lahir <span class="req">*</span></label><input id="rtgl" class="input" type="date"></div>' +
        '<fieldset class="field"><legend>Jenis kelamin <span class="req">*</span></legend><div class="seg"><label><input type="radio" name="jk" value="L"><span>Laki-laki</span></label><label><input type="radio" name="jk" value="P"><span>Perempuan</span></label></div></fieldset></div>' +
      '<div class="field"><label for="ribu">Nama ibu kandung <span class="req">*</span></label><input id="ribu" class="input" autocomplete="off"></div>' +
      '<div class="grid grid-2"><div class="field"><label for="rhp">No. WhatsApp orang tua/wali <span class="req">*</span></label><div class="input-prefix"><span>+62</span><input id="rhp" class="input" inputmode="tel" placeholder="81234567890"></div></div>' +
        '<div class="field"><label for="remail">Email aktif <span class="hint-inline">(disarankan)</span></label><input id="remail" class="input" type="email" placeholder="ayah.bunda@gmail.com"></div></div>' +
      '<div class="grid grid-2"><div class="field"><label for="rp1">Kata sandi <span class="req">*</span></label><input id="rp1" class="input" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter"></div>' +
        '<div class="field"><label for="rp2">Ulangi kata sandi <span class="req">*</span></label><input id="rp2" class="input" type="password" autocomplete="new-password"></div></div>' +
      '<label class="check-row"><input type="checkbox" id="rsetuju"><span><b>Pakta integritas data diri:</b> saya menyatakan bahwa data identitas yang dimasukkan adalah benar dan dapat dipertanggungjawabkan.</span></label>' +
      '<div id="rerr" class="error-text" role="alert"></div>' +
      '<button class="btn btn-primary btn-lg" type="submit">Daftar Akun Baru Sekarang</button>' +
      '<p class="center">Sudah memiliki akun? <a href="#/masuk"><b>Masuk di sini</b></a></p></form>' +
    '<aside class="stack"><div class="card card-pad"><h2 class="h3">' + icon('file', 20) + ' Berkas yang disiapkan</h2><p class="muted small">Akan diminta saat mengisi formulir pendaftaran:</p>' +
      '<ul class="check-list"><li>Pas foto 3x4 (JPG/PNG)</li><li>Akta kelahiran</li><li>Kartu Keluarga (KK)</li><li>Ijazah atau surat keterangan lulus</li><li>Bukti prestasi (jalur prestasi) atau bukti dukung (jalur afirmasi)</li></ul></div>' +
      '<div class="card card-pad"><h2 class="h3">' + icon('info', 20) + ' Butuh bantuan?</h2>' +
        (p.KONTAK_WA || p.KONTAK_EMAIL || p.JAM_LAYANAN ? '<ul class="plain">' + (p.KONTAK_WA ? '<li>WhatsApp: ' + esc(p.KONTAK_WA) + '</li>' : '') + (p.KONTAK_EMAIL ? '<li>Email: ' + esc(p.KONTAK_EMAIL) + '</li>' : '') + (p.JAM_LAYANAN ? '<li>' + esc(p.JAM_LAYANAN) + '</li>' : '') + '</ul>' : '<p class="muted small">Kontak helpdesk belum diisi oleh admin.</p>') + '</div></aside></div>'
  );
  $('#freg').addEventListener('submit', async function (e) {
    e.preventDefault();
    const err = $('#rerr'); err.textContent = '';
    const v = {
      jenjang: ($('input[name=jenjang]:checked') || {}).value, nik: $('#rnik').value.trim(), nisn: $('#rnisn').value.trim(),
      nama: $('#rnama').value.trim(), tglLahir: $('#rtgl').value, jk: ($('input[name=jk]:checked') || {}).value || '',
      namaIbu: $('#ribu').value.trim(), hp: $('#rhp').value.trim(), email: $('#remail').value.trim(),
      password: $('#rp1').value, setuju: $('#rsetuju').checked
    };
    if (!/^\d{16}$/.test(v.nik)) { err.textContent = 'NIK harus 16 digit angka.'; $('#rnik').focus(); return; }
    if (v.nisn && !/^\d{10}$/.test(v.nisn)) { err.textContent = 'NISN harus 10 digit angka atau dikosongkan.'; $('#rnisn').focus(); return; }
    if (v.nama.length < 3) { err.textContent = 'Nama lengkap wajib diisi.'; $('#rnama').focus(); return; }
    if (!v.tglLahir) { err.textContent = 'Tanggal lahir wajib diisi.'; $('#rtgl').focus(); return; }
    if (!v.jk) { err.textContent = 'Pilih jenis kelamin.'; return; }
    if (v.namaIbu.length < 3) { err.textContent = 'Nama ibu kandung wajib diisi.'; $('#ribu').focus(); return; }
    if (v.hp.replace(/\D/g, '').length < 9) { err.textContent = 'Nomor WhatsApp tidak valid.'; $('#rhp').focus(); return; }
    v.hp = '0' + v.hp.replace(/\D/g, '').replace(/^(62|0)/, '');
    if (v.password.length < 8) { err.textContent = 'Kata sandi minimal 8 karakter.'; $('#rp1').focus(); return; }
    if (v.password !== $('#rp2').value) { err.textContent = 'Ulangi kata sandi tidak sama.'; $('#rp2').focus(); return; }
    if (!v.setuju) { err.textContent = 'Centang pakta integritas untuk melanjutkan.'; return; }
    const btn = $('button[type=submit]', e.target); tombolBusy(btn, true, 'Membuat akun...');
    try {
      await API.post('registerAkun', v, false);
      toast('Akun berhasil dibuat. Silakan masuk dengan NIK Anda.');
      location.hash = '#/masuk';
    } catch (ex) { err.textContent = ex.message; tombolBusy(btn, false); }
  });
}

// ---------- DASBOR PENDAFTAR ----------
async function pageDasbor() {
  if (!Session.token || !Session.user || Session.user.peran !== 'pendaftar') { location.hash = Session.token ? '#/admin' : '#/masuk'; return; }
  setView('<div class="container section">' + skeleton(3) + '</div>');
  try {
    const me = (await API.post('me')).data;
    const p = me.pendaftar || {};
    const c = State.cfg;
    const tahap = ['Registrasi Akun', 'Verifikasi Berkas', 'Seleksi', 'Pengumuman', 'Daftar Ulang'];
    const aktif = p.status_berkas === 'Draft' ? 0 : (p.status_hasil && p.status_hasil !== 'Belum' && c.hasilDibuka ? 3 : 1);
    setView(
      '<div class="container section">' +
      '<div class="card card-pad profile"><span class="avatar">' + esc(inisial(me.nama)) + '</span><div class="grow"><h1 class="h2">Selamat datang, ' + esc(me.nama) + '</h1>' +
        '<p class="muted">NIK •••• ' + esc(String(p.nik || '').slice(-4)) + ' · Jenjang tujuan ' + esc(p.jenjang_tujuan || '-') + (p.no_pendaftaran ? ' · No. ' + esc(p.no_pendaftaran) : '') + '</p>' +
        '<div class="chips">' + badge(p.status_berkas || 'Draft') + (p.status_hasil && p.status_hasil !== 'Belum' && c.hasilDibuka ? badge(p.status_hasil) : '') + '</div></div>' +
        '<div class="stack"><a class="btn btn-primary" href="#/pendaftaran">' + (p.status_berkas === 'Draft' ? 'Lanjutkan Pendaftaran' : 'Lihat Pendaftaran') + '</a><button class="btn btn-ghost" id="dgp">' + icon('key', 16) + ' Ganti kata sandi</button></div></div>' +
      '<div class="card card-pad"><h2 class="h3">Alur &amp; Status Tahapan</h2><ol class="tracker">' +
        tahap.map(function (t, i) { return '<li class="' + (i < aktif ? 'done' : (i === aktif ? 'now' : '')) + '"><span>' + (i < aktif ? icon('check', 16) : (i + 1)) + '</span><b>' + esc(t) + '</b></li>'; }).join('') + '</ol></div>' +
      '<div class="notice notice--' + (c.pendaftaranDibuka ? 'info' : 'warn') + '">' + icon('info', 20) + '<div>' + (c.pendaftaranDibuka ? 'Pendaftaran sedang dibuka.' : 'Pendaftaran belum dibuka.') + ' Formulir pendaftaran lengkap, unggah berkas, dan cetak bukti hadir pada tahap pengembangan berikutnya.</div></div></div>'
    );
    $('#dgp').addEventListener('click', modalGantiPassword);
  } catch (e) {
    if (e.code === 'AUTH') { renderCangkang(); location.hash = '#/masuk'; return; }
    setView('<div class="container section">' + kosong('Dasbor tidak dapat dimuat', e.message) + '</div>');
  }
}

function modalGantiPassword() {
  const m = Modal.buka({
    judul: 'Ganti Kata Sandi',
    isi: '<form id="fgp" class="stack" novalidate><div class="field"><label for="gp0">Kata sandi lama</label><input id="gp0" class="input" type="password" autocomplete="current-password"></div>' +
      '<div class="field"><label for="gp1">Kata sandi baru (minimal 8 karakter)</label><input id="gp1" class="input" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label for="gp2">Ulangi kata sandi baru</label><input id="gp2" class="input" type="password" autocomplete="new-password"></div>' +
      '<div id="gpe" class="error-text" role="alert"></div><p class="muted small">Setelah diganti, Anda akan keluar dan perlu masuk kembali.</p></form>',
    kaki: '<button class="btn btn-ghost" id="gpb">Batal</button><button class="btn btn-primary" id="gps">Simpan</button>'
  });
  $('#gpb').addEventListener('click', function () { Modal.tutup(); });
  const kirim = async function () {
    const err = $('#gpe'); err.textContent = '';
    if ($('#gp1').value.length < 8) { err.textContent = 'Kata sandi baru minimal 8 karakter.'; return; }
    if ($('#gp1').value !== $('#gp2').value) { err.textContent = 'Ulangi kata sandi tidak sama.'; return; }
    const btn = $('#gps'); tombolBusy(btn, true, 'Menyimpan...');
    try {
      await API.post('gantiPassword', { lama: $('#gp0').value, baru: $('#gp1').value });
      Modal.tutup(); Session.clear(); renderCangkang(); toast('Kata sandi diubah. Silakan masuk kembali.'); location.hash = '#/masuk';
    } catch (ex) { err.textContent = ex.message; tombolBusy(btn, false); }
  };
  $('#gps').addEventListener('click', kirim);
  $('#fgp').addEventListener('submit', function (e) { e.preventDefault(); kirim(); });
}
