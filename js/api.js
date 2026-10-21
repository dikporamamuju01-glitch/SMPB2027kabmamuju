// ============================================================
// API — komunikasi dengan backend Google Apps Script lewat fetch()
// POST memakai text/plain agar tidak memicu CORS preflight (diblokir GAS)
// ============================================================

class ApiError extends Error {
  constructor(pesan, kode) { super(pesan); this.name = 'ApiError'; this.code = kode || 'ERR'; }
}

// Sesi login disimpan di localStorage; kedaluwarsa diatur server (6 jam)
const Session = {
  token: '',
  user: null,
  load() {
    try {
      const s = JSON.parse(localStorage.getItem('spmb_sesi') || 'null');
      if (s && s.token) { this.token = s.token; this.user = s.user; }
    } catch (e) { /* abaikan */ }
  },
  save(token, user) {
    this.token = token; this.user = user;
    localStorage.setItem('spmb_sesi', JSON.stringify({ token: token, user: user }));
  },
  clear() {
    this.token = ''; this.user = null;
    localStorage.removeItem('spmb_sesi');
  }
};

const API = {
  _cache: new Map(),

  _siap() {
    if (!CONFIG.GAS_URL || /^GANTI/.test(CONFIG.GAS_URL)) {
      throw new ApiError('Alamat backend (GAS_URL) belum diisi pada berkas js/config.js.', 'CONFIG');
    }
  },

  async _kirim(url, opsi) {
    try { return await fetch(url, opsi); }
    catch (e) { throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', 'NET'); }
  },

  async _urai(res, auth) {
    let j;
    try { j = await res.json(); }
    catch (e) { throw new ApiError('Respons server tidak valid. Pastikan URL backend benar dan sudah di-deploy ulang.', 'PARSE'); }
    if (!j.success) {
      if (j.code === 'AUTH' && auth) { Session.clear(); window.dispatchEvent(new CustomEvent('spmb:auth')); }
      throw new ApiError(j.message || 'Terjadi kesalahan.', j.code);
    }
    return j;
  },

  // GET data publik. ttl (ms) > 0 = simpan sementara di memori browser
  async get(action, params, ttl) {
    this._siap();
    const qs = new URLSearchParams({ action: action });
    Object.keys(params || {}).forEach(function (k) {
      const v = params[k];
      if (v !== '' && v != null) qs.set(k, v);
    });
    const url = CONFIG.GAS_URL + '?' + qs.toString();
    const hit = this._cache.get(url);
    if (ttl && hit && Date.now() - hit.t < ttl) return hit.d;
    const data = await this._urai(await this._kirim(url, {}), false);
    if (ttl) this._cache.set(url, { t: Date.now(), d: data });
    return data;
  },

  // POST (login, data pribadi, admin). auth=false untuk endpoint publik
  async post(action, data, auth) {
    this._siap();
    const withAuth = auth !== false;
    const body = { action: action, data: data || {} };
    if (withAuth) body.token = Session.token;
    const res = await this._kirim(CONFIG.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    return this._urai(res, withAuth);
  },

  clearCache() { this._cache.clear(); }
};
