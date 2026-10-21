# SPMB Kabupaten Mamuju 2027 — Frontend (Fase 1)

Sistem Penerimaan Siswa Baru jenjang SD dan SMP. Frontend statis (HTML/CSS/JavaScript murni) untuk GitHub Pages, terhubung ke backend REST API Google Apps Script.

## Cakupan Fase 1
- **Portal publik:** Beranda, Informasi Sekolah & Zonasi, Detail Sekolah, Pencarian Pendaftar (nama disamarkan), Hasil Seleksi (dengan embargo waktu), Dokumen.
- **Akun:** Buat akun pendaftar (login NIK), Masuk, dasbor pendaftar, ganti kata sandi.
- **Panel admin:** Dasbor, Kelola Akun, Impor Data (sekolah, zonasi, kuota jalur), Pengumuman & Dokumen, Pengaturan (identitas, tema, jadwal), Log Aktivitas.
- Mode terang/gelap, responsif HP, hak akses per peran (Super Admin, Dinas, Panitia, Pendaftar).

Fase berikutnya: formulir pendaftaran 6 langkah + unggah berkas + PDF (Fase 2), panel panitia (Fase 3), panel dinas (Fase 4), penyelesaian super admin (Fase 5).

## Struktur
```
spmb-mamuju-2027/
├── index.html
├── css/style.css
├── js/
│   ├── config.js        ← satu-satunya berkas yang diedit (GAS_URL)
│   ├── api.js           ← komunikasi fetch ke backend + sesi
│   ├── ui.js            ← helper tampilan (ikon, modal, toast, CSV)
│   ├── pages-publik.js  ← halaman publik
│   ├── pages-auth.js    ← masuk, buat akun, dasbor pendaftar
│   ├── pages-admin.js   ← panel admin
│   └── app.js           ← router dan cangkang halaman
├── README.md
└── PANDUAN-INSTALASI.md
```

## Pemasangan
Lihat **PANDUAN-INSTALASI.md**. Intinya: pasang backend (`Kode.gs`) lebih dulu → isi `js/config.js` → unggah folder ini ke GitHub Pages.
