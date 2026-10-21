# Panduan Instalasi — SPMB Kabupaten Mamuju 2027 (Fase 1)

Aplikasi terdiri dari dua bagian yang dipasang terpisah:

| Bagian | Tempat | Berkas |
|---|---|---|
| **Backend** (API + database Google Sheets) | Google Apps Script | `Kode.gs`, `appsscript.json` (dikirim terpisah dari ZIP ini) |
| **Frontend** (tampilan) | GitHub Pages | Isi ZIP ini (folder `spmb-mamuju-2027`) |

Pasang **backend dulu**, karena frontend butuh alamat (URL) backend.

---

## BAGIAN A — Memasang Backend (Google Apps Script)

Gunakan akun Google yang akan menjadi **pemilik data** (disarankan akun Google Workspace instansi, karena kuota email lebih besar).

### A1. Buat proyek
1. Buka https://script.google.com lalu klik **Proyek baru**.
2. Ubah nama proyek, misalnya `SPMB Mamuju 2027 API`.

### A2. Tempel kode
1. Di editor, buka berkas `Code.gs`, **hapus semua isinya**.
2. Buka berkas `Kode.gs` dari paket Anda, **salin seluruh isinya**, tempel ke `Code.gs`, lalu tekan **Ctrl+S**.

### A3. Pasang berkas konfigurasi
1. Klik ikon **Setelan proyek** (roda gigi) di kiri.
2. Centang **Tampilkan berkas manifes "appsscript.json" di editor**.
3. Kembali ke **Editor**, buka `appsscript.json`, hapus isinya, tempel isi berkas `appsscript.json` dari paket Anda, lalu **Ctrl+S**.

### A4. Jalankan setup (SEKALI SAJA)
1. Di bagian atas editor, pilih fungsi **`setupAppEnvironment`**, lalu klik **Jalankan**.
2. Muncul permintaan izin: klik **Tinjau izin** → pilih akun Anda → **Lanjutan** → **Buka SPMB Mamuju 2027 API (tidak aman)** → **Izinkan**. (Peringatan "tidak aman" muncul karena skrip buatan sendiri; ini normal.)
3. Tunggu sampai **Log eksekusi** menampilkan `✅ Setup selesai!`.
4. **Catat** baris berikut dari log (hanya tampil sekali):
   - `Username : admin`
   - `Kata sandi: ...` (12 karakter)
5. Setup otomatis membuat folder Drive dan spreadsheet database. Jangan jalankan setup lagi; bila dijalankan ulang, ia akan menolak dengan pesan peringatan.

> Lupa kata sandi admin? Jalankan fungsi **`resetSandiAdmin`** dari editor. Kata sandi baru tampil di log eksekusi.

### A5. (Opsional) Coba dengan data contoh
Jalankan fungsi `seedDataContoh` untuk mengisi 6 sekolah contoh (ID berawalan `CONTOH-`). Hapus dengan `hapusDataContoh` sebelum memakai data asli.

### A6. Deploy sebagai Web App
1. Klik **Terapkan** → **Deployment baru**.
2. Klik ikon roda gigi di samping "Pilih jenis" → **Aplikasi web**.
3. Isi:
   - **Jalankan sebagai**: *Saya* (akun Anda)
   - **Yang memiliki akses**: *Siapa saja*
4. Klik **Terapkan**, lalu **salin URL Web App** (berakhiran `/exec`).
5. Uji: tempel URL itu di peramban dan tambahkan `?action=ping` di akhir. Harus muncul `{"success":true,...}`.

> **Penting:** setiap kali Anda mengubah `Kode.gs`, buat versi baru: **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru → Terapkan**. URL tetap sama.

---

## BAGIAN B — Memasang Frontend (GitHub Pages)

### B1. Isi alamat backend
1. Ekstrak ZIP ini. Buka folder `spmb-mamuju-2027`, lalu berkas `js/config.js`.
2. Ganti `GANTI_DENGAN_URL_EXEC_DARI_APPS_SCRIPT` dengan URL Web App dari langkah A6. Simpan.

### B2. Coba di komputer sendiri (opsional, boleh dilewati)
Langkah ini hanya untuk melihat tampilan sebelum diunggah. Jika ragu atau Python belum terpasang, **lewati ke B3**.

1. Ekstrak ZIP. Folder hasil ekstrak bernama `spmb-mamuju-2027`; **di dalamnya langsung terlihat `index.html`**. Itulah folder yang dimaksud.
2. Buka folder itu di File Explorer (Windows). Klik kolom alamat di bagian atas, ketik `cmd`, lalu tekan Enter. Jendela hitam (Command Prompt) terbuka dan sudah berada di folder tersebut.
3. Di jendela hitam itu ketik `python -m http.server 8000`, lalu Enter. (Jika muncul "python is not recognized", Python belum terpasang; lewati langkah ini.)
4. Buka peramban dan kunjungi http://localhost:8000. Untuk berhenti, kembali ke jendela hitam dan tekan Ctrl+C.

### B3. Unggah ke GitHub
Folder yang di-`git init` adalah **folder `spmb-mamuju-2027`** (di dalamnya langsung terlihat `index.html`). Langkah rinci (instal Git, akun GitHub, repository, token akses, mengaktifkan Pages) dipandu pada percakapan Claude. Ringkasnya:

```bash
cd spmb-mamuju-2027
git init
git add .
git commit -m "SPMB Mamuju 2027 - Fase 1"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Lalu di GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save**. Alamat situs: `https://USERNAME.github.io/NAMA-REPO/`.

### B4. Memperbarui situs
Setelah mengubah berkas: `git add .` → `git commit -m "pesan"` → `git push`. Tunggu 1–2 menit.

---

## BAGIAN C — Langkah Awal Setelah Online

Buka situs → **Masuk** → login `admin` dengan kata sandi dari A4, lalu ikuti daftar **Langkah awal** di dasbor:

1. **Ganti kata sandi** (menu akun di pojok kanan atas).
2. **Pengaturan** → isi nama resmi instansi, alamat, kontak helpdesk.
3. **Impor Data** (urutan wajib): **Sekolah** (TK, SD, SMP) → **Zonasi** → **Kuota Jalur**. Unduh templat CSV di halaman itu, isi dengan Excel, simpan sebagai **CSV**, lalu unggah.
4. **Pengaturan → Jadwal**: isi tanggal tiap tahap dan saklar pendaftaran.
5. **Kelola Akun**: buat satu akun panitia untuk tiap sekolah dan akun Dinas.
6. **Pengumuman**: tambahkan pengumuman dan tautan dokumen (juknis).

Format kolom CSV:

| Impor | Kolom wajib | Kolom opsional |
|---|---|---|
| Sekolah | `npsn`, `nama`, `jenjang` (TK/SD/SMP), `kecamatan` | `alamat`, `lat`, `lng`, `jumlah_rombel`, `batas_per_rombel`, `daya_tampung`, `profil`, `kontak` |
| Zonasi | `npsn_tujuan`, `npsn_asal` | — |
| Kuota | `npsn`, `kode_jalur` (zonasi/prestasi/afirmasi), `kuota` | — |

Tips: simpan dari Excel sebagai **CSV (pemisah koma)** atau **CSV (pemisah titik koma)**; keduanya dikenali. Koordinat boleh memakai koma desimal (`-2,67`).

---

## BAGIAN D — Pemecahan Masalah

| Gejala | Penyebab dan solusi |
|---|---|
| Halaman menampilkan "Backend belum disambungkan" | `js/config.js` belum diisi, atau perubahan belum di-`git push` |
| "Respons server tidak valid" | URL salah, bukan berakhiran `/exec`, atau akses deployment bukan **Siapa saja**. Deploy ulang (A6) |
| "Sheet ... tidak ditemukan" | `setupAppEnvironment` belum dijalankan |
| Perubahan `Kode.gs` tidak berpengaruh | Belum membuat **versi baru** deployment (lihat catatan A6) |
| Situs GitHub menampilkan 404 | Pages belum diaktifkan, atau `index.html` tidak berada di root repository |
| Daftar sekolah kosong | Data belum diimpor (lihat Bagian C langkah 3) |
| "Akun terkunci sementara" | 5 kali salah kata sandi; tunggu 15 menit |
| Lupa kata sandi admin | Jalankan `resetSandiAdmin` dari editor Apps Script |
| Lupa kata sandi panitia/pendaftar | Admin/Dinas memakai tombol **Reset sandi** di Kelola Akun |

## Keamanan

- URL Web App dan isi `js/config.js` bersifat publik dan **tidak memuat rahasia**. Keamanan ada di server: hak akses tiap tindakan diperiksa ulang oleh backend.
- Kata sandi disimpan sebagai hash SHA-256 dengan garam acak (bukan teks biasa). Login dibatasi 5 percobaan.
- Jangan membagikan akses edit spreadsheet database dan folder Drive kepada orang yang tidak berwenang: berisi data pribadi anak.
- Jadwal, kontak, dan nama instansi diisi dari menu Pengaturan, bukan dari kode.
