# PRD UI/UX SmartFarm — Modul QR Scan

**Project:** SmartFarm / Barbara Farm  
**Platform:** Web Responsive + Mobile Web  
**Frontend Stack:** Next.js, Tailwind CSS, component library optional, icon library optional  
**Backend Target Tahap 2:** Node.js, Prisma, PostgreSQL, JWT  
**Status:** Tahap 1 — UI/UX Demo dengan Dummy Data  
**Design Reference:** Berdasarkan visual brand pada halaman login Barbara Farm: warna hijau gelap, clean, modern, farm-tech, professional, mobile friendly.

---

## 1. Tujuan Modul

Modul **QR Scan** digunakan untuk memudahkan peternak, admin kandang, dokter hewan, atau manajer farm dalam membuka profil sapi secara cepat melalui pemindaian QR Code yang melekat pada identitas sapi.

Ketika QR Code sapi dipindai menggunakan kamera HP, sistem akan langsung membuka halaman **Profil Sapi** yang berisi data identitas, status kesehatan, grafik berat badan, riwayat penimbangan, riwayat medis, status pakan, dan informasi penjualan jika sapi sudah keluar.

Modul ini harus terasa sangat cepat, sederhana, dan cocok digunakan di area kandang oleh user non-teknis.

---

## 2. Analisis Masalah

Pada proses manual, peternak biasanya sulit melacak riwayat sapi satu per satu karena data tersebar di buku catatan, WhatsApp, spreadsheet, atau ingatan petugas. Akibatnya:

- Identifikasi sapi lambat saat pengecekan lapangan.
- Riwayat kesehatan sulit dilihat saat dokter melakukan pemeriksaan.
- Penimbangan dan grafik pertumbuhan tidak langsung terlihat.
- Risiko salah sapi saat input data cukup tinggi.
- Data withdrawal period obat bisa terlewat sebelum sapi dijual.

Dengan QR Scan, setiap sapi memiliki akses cepat ke profil digitalnya. Ini menjadi pintu utama untuk operasional lapangan.

---

## 3. Role Pengguna

### 3.1 Admin Farm

- Bisa scan QR semua sapi.
- Bisa membuka detail profil sapi.
- Bisa edit data sapi setelah masuk ke profil.
- Bisa menambahkan log penimbangan, medis, pakan, dan penjualan.

### 3.2 Petugas Kandang

- Bisa scan QR sapi.
- Bisa melihat ringkasan profil sapi.
- Bisa input log harian sesuai permission.
- Tidak selalu bisa edit master data.

### 3.3 Dokter Hewan / Tenaga Medis

- Bisa scan QR sapi.
- Fokus melihat riwayat medis, vaksin, obat, diagnosa, dan masa henti obat.
- Bisa menambahkan catatan medis jika diberi akses.

### 3.4 Owner / Manager

- Bisa scan QR sapi.
- Melihat ringkasan performa, ROI, ADG, status kesehatan, dan readiness jual.

### 3.5 Public Viewer Opsional

- Bisa scan QR untuk melihat data publik terbatas tanpa login.
- Data publik hanya berisi informasi aman seperti ID sapi, jenis sapi, jenis kelamin, asal farm, status umum, dan foto.
- Tidak boleh menampilkan harga beli, harga jual, data medis sensitif, biaya pakan, atau data internal farm.

---

## 4. Scope Modul QR Scan

### 4.1 In Scope Tahap 1 UI/UX Demo

- Halaman QR Scanner.
- Simulasi akses kamera.
- State kamera aktif, loading, scan berhasil, scan gagal, dan QR tidak dikenal.
- Halaman hasil scan cepat.
- Redirect ke halaman profil sapi dummy.
- Card profil sapi ringkas setelah scan.
- CTA menuju detail profil sapi.
- Mode input manual ID sapi sebagai alternatif jika kamera gagal.
- Quick scan dari halaman login untuk akses publik terbatas.
- QR scan dari dashboard untuk user login.
- Riwayat scan terakhir.
- UI mobile-first.

### 4.2 Out of Scope Tahap 1

- Integrasi kamera asli secara penuh dengan backend.
- Validasi QR real dari database.
- Generate QR Code dinamis dari backend.
- Permission backend berbasis JWT.
- Audit log scan real.
- Notifikasi real-time.

### 4.3 Disiapkan untuk Tahap 2 Backend

- Endpoint validasi QR.
- Endpoint profil sapi berdasarkan ID.
- Endpoint public cattle profile.
- Middleware JWT untuk scan internal.
- Audit log scan.
- Role-based access control.

---

## 5. Flow Utama QR Scan

### 5.1 Flow A — Scan QR dari Dashboard Internal

1. User login ke sistem SmartFarm.
2. User klik menu **QR Scan** pada sidebar atau tombol quick action di dashboard.
3. Sistem membuka halaman scanner.
4. User memberikan izin kamera browser.
5. Kamera aktif dan frame scanner muncul.
6. User arahkan kamera ke QR Code sapi.
7. Sistem membaca kode QR.
8. Sistem menampilkan loading validasi.
9. Jika QR valid, sistem menampilkan preview sapi.
10. User klik **Buka Profil Sapi**.
11. Sistem membuka halaman `/cattle/[id]`.
12. User melihat profil lengkap sapi sesuai role.

### 5.2 Flow B — Quick Scan dari Halaman Login

1. User belum login berada di halaman login.
2. User klik card **Quick Scan**.
3. Sistem membuka halaman `/quick-scan`.
4. Kamera aktif setelah permission diberikan.
5. User scan QR sapi.
6. Sistem membaca kode QR.
7. Jika QR valid, sistem membuka halaman profil publik sapi.
8. Data yang tampil dibatasi hanya informasi publik.
9. Jika user ingin melihat data lengkap, sistem menampilkan CTA **Login untuk Detail Lengkap**.

### 5.3 Flow C — Kamera Tidak Diizinkan

1. User membuka halaman QR Scan.
2. Browser meminta permission kamera.
3. User menolak permission.
4. Sistem menampilkan empty state: kamera tidak dapat diakses.
5. Sistem menyediakan tombol **Coba Izinkan Kamera Lagi**.
6. Sistem menyediakan alternatif input manual ID Sapi.
7. User dapat memasukkan ID Sapi secara manual.
8. Sistem melakukan simulasi pencarian dummy data.

### 5.4 Flow D — QR Tidak Valid

1. User scan QR.
2. Sistem membaca QR.
3. Kode QR tidak sesuai format SmartFarm.
4. Sistem menampilkan pesan gagal.
5. User dapat klik **Scan Ulang**.
6. User dapat klik **Input Manual ID Sapi**.

### 5.5 Flow E — QR Valid tetapi Sapi Tidak Ditemukan

1. User scan QR.
2. QR valid secara format.
3. ID sapi tidak ditemukan pada dummy data.
4. Sistem menampilkan state **Data Sapi Tidak Ditemukan**.
5. Sistem memberi opsi:
   - Scan ulang.
   - Input manual.
   - Daftarkan sapi baru jika role user adalah Admin Farm.

---

## 6. Standar Format QR Code

Untuk demo UI, gunakan format dummy berikut:

```text
SMARTFARM:CATTLE:BF-2026-0001
```

Alternatif format URL:

```text
https://app.barbarafarm.id/cattle/BF-2026-0001
```

Pada tahap UI demo, sistem cukup mengenali beberapa ID dummy:

- BF-2026-0001
- BF-2026-0002
- BF-2026-0003
- BF-2026-0004
- BF-2026-0005

---

## 7. Information Architecture

Tambahkan struktur halaman berikut pada aplikasi:

```text
/app
  /(auth)
    /login
    /quick-scan
  /(dashboard)
    /dashboard
    /qr-scan
    /cattle
      /[id]
    /profile
```

Jika menggunakan App Router Next.js:

```text
src/app/(public)/quick-scan/page.tsx
src/app/(dashboard)/qr-scan/page.tsx
src/app/(dashboard)/cattle/[id]/page.tsx
src/components/qr/QRScannerPanel.tsx
src/components/qr/ScanResultCard.tsx
src/components/qr/ManualCattleInput.tsx
src/components/qr/RecentScanList.tsx
src/components/cattle/CattleProfileHeader.tsx
src/data/dummy-cattle.ts
```

---

## 8. Navigasi Menu

### 8.1 Sidebar Dashboard

Tambahkan menu:

```text
Dashboard
Master Data Sapi
QR Scan
Monitoring Pertumbuhan
Kesehatan & Medis
Manajemen Pakan
Penjualan
Laporan
Pengaturan
```

Menu **QR Scan** harus terlihat sebagai menu operasional cepat. Gunakan icon scan, QR, camera, atau bracket scan.

### 8.2 Quick Action Dashboard

Pada dashboard utama, tambahkan card:

**Scan QR Sapi**  
Deskripsi: Buka profil sapi secara instan melalui kamera HP.  
CTA: Mulai Scan

---

## 9. Desain Visual

### 9.1 Brand Direction

Gunakan inspirasi dari gambar login Barbara Farm:

- Warna utama: hijau gelap farm-tech.
- Tampilan bersih, modern, luas, dan tidak ramai.
- Background putih atau soft green tint.
- Aksen hijau untuk tombol utama.
- Card dengan radius besar dan shadow halus.
- Tipografi modern, mudah dibaca oleh pekerja lapangan.

### 9.2 Token Warna Rekomendasi

```css
--color-primary: #006B3F;
--color-primary-dark: #004D2E;
--color-primary-soft: #EAF6F0;
--color-accent: #1FA463;
--color-bg: #F7FAF8;
--color-card: #FFFFFF;
--color-border: #DDE7E1;
--color-text: #17211B;
--color-muted: #68746D;
--color-warning: #D97706;
--color-danger: #DC2626;
--color-success: #059669;
```

### 9.3 UX Feeling

Modul QR Scan harus terasa:

- Cepat.
- Aman.
- Simple.
- Cocok digunakan dengan satu tangan di HP.
- Tidak terlalu banyak form.
- Tombol besar dan mudah disentuh.
- Informasi penting terlihat dalam 3 detik pertama.

---

## 10. Page Requirement — Internal QR Scan

### 10.1 Route

```text
/dashboard/qr-scan
```

atau

```text
/qr-scan
```

### 10.2 Layout Desktop

Gunakan 2 kolom:

#### Kolom Kiri — Scanner

- Page title: QR Scan Sapi
- Subtitle: Arahkan kamera ke QR Code pada ear tag atau kartu identitas sapi.
- Scanner frame besar.
- Status scanner.
- Button scan ulang.
- Button aktifkan kamera.

#### Kolom Kanan — Info & Recent Scan

- Card tips scanning.
- Card input manual ID sapi.
- Card riwayat scan terakhir.
- Card keamanan data.

### 10.3 Layout Mobile

Gunakan single column:

1. Header kecil dengan back button.
2. Scanner frame full width.
3. Status scan.
4. Hasil scan jika ditemukan.
5. Manual input.
6. Recent scan.

### 10.4 Komponen Scanner Frame

Scanner frame harus memiliki:

- Area kamera rasio 1:1 atau 4:3.
- Border corner hijau.
- Animasi scanning line halus.
- Overlay gelap tipis di luar area scan.
- Text instruksi singkat.
- Tombol flashlight dummy untuk mobile.
- Tombol switch camera dummy untuk mobile.

---

## 11. Page Requirement — Quick Scan Public

### 11.1 Route

```text
/quick-scan
```

### 11.2 Tujuan

Halaman ini digunakan untuk user yang belum login. Akses bisa dari login page melalui card **Quick Scan**.

### 11.3 Tampilan

- Header minimal dengan logo Barbara Farm.
- Tombol kembali ke login.
- Scanner frame.
- Copywriting: Scan QR Sapi untuk melihat data publik.
- Disclaimer kecil: Data internal hanya dapat dilihat setelah login.
- Setelah scan berhasil, tampil public profile card.

### 11.4 Data Publik yang Boleh Tampil

- Foto sapi.
- ID Sapi.
- Jenis sapi.
- Jenis kelamin.
- Status umum: Aktif / Dalam perawatan / Siap jual.
- Lokasi kandang umum.
- Berat terakhir jika diizinkan.
- Tanggal update terakhir.

### 11.5 Data yang Tidak Boleh Tampil untuk Public

- Harga beli.
- Harga jual.
- Biaya pakan.
- Biaya medis.
- ROI.
- Catatan diagnosa detail.
- Nama obat dan dosis.
- Data supplier sensitif.
- Data user internal.

---

## 12. Scan Result Card

Setelah QR berhasil dibaca, tampilkan card hasil dengan isi:

- Foto sapi thumbnail.
- ID Sapi.
- Jenis sapi.
- Jenis kelamin.
- Status sapi.
- Kandang.
- Berat terakhir.
- ADG singkat.
- Badge kesehatan.
- CTA utama: **Buka Profil Sapi**.
- CTA sekunder: **Scan Lagi**.

Contoh UI copy:

```text
Sapi ditemukan
BF-2026-0001
Limousin • Jantan • Kandang A1
Berat terakhir: 412 Kg
ADG: 1.12 Kg/hari
Status: Sehat
```

---

## 13. Cattle Profile Setelah Scan

Ketika user membuka profil sapi, tampilkan halaman detail dengan struktur:

### 13.1 Header Profil

- Foto sapi besar.
- ID Sapi.
- QR badge.
- Jenis sapi.
- Jenis kelamin.
- Status sapi.
- Kandang.
- Tombol cetak QR.
- Tombol edit data.

### 13.2 Summary Metrics

- Berat awal.
- Berat terakhir.
- ADG.
- Total biaya produksi.
- Estimasi margin.
- Status withdrawal period.

### 13.3 Tabs

- Overview.
- Pertumbuhan.
- Kesehatan.
- Pakan.
- Penjualan.
- Dokumen / Foto.

### 13.4 Alert Section

Jika ada kondisi penting, tampilkan alert:

- Sapi dalam masa henti obat.
- Kenaikan berat di bawah rata-rata.
- Jadwal vaksin mendekat.
- Data timbang belum diperbarui lebih dari 14 hari.

---

## 14. Dummy Data

Gunakan dummy data berikut:

```ts
export const dummyCattle = [
  {
    id: "BF-2026-0001",
    qrCode: "SMARTFARM:CATTLE:BF-2026-0001",
    name: "Sapi Aster",
    breed: "Limousin",
    gender: "Jantan",
    status: "Sehat",
    barn: "Kandang A1",
    initialWeight: 315,
    latestWeight: 412,
    adg: 1.12,
    bodyConditionScore: 4,
    lastWeighingDate: "2026-05-01",
    healthBadge: "Normal",
    image: "/images/cattle/cattle-001.jpg"
  },
  {
    id: "BF-2026-0002",
    qrCode: "SMARTFARM:CATTLE:BF-2026-0002",
    name: "Sapi Bima",
    breed: "Simental",
    gender: "Jantan",
    status: "Perlu Monitoring",
    barn: "Kandang A2",
    initialWeight: 288,
    latestWeight: 330,
    adg: 0.54,
    bodyConditionScore: 3,
    lastWeighingDate: "2026-04-28",
    healthBadge: "ADG Rendah",
    image: "/images/cattle/cattle-002.jpg"
  },
  {
    id: "BF-2026-0003",
    qrCode: "SMARTFARM:CATTLE:BF-2026-0003",
    name: "Sapi Cempaka",
    breed: "Bali",
    gender: "Betina",
    status: "Dalam Perawatan",
    barn: "Kandang B1",
    initialWeight: 245,
    latestWeight: 271,
    adg: 0.42,
    bodyConditionScore: 2,
    lastWeighingDate: "2026-04-25",
    healthBadge: "Masa Henti Obat",
    image: "/images/cattle/cattle-003.jpg"
  }
];
```

---

## 15. UI State yang Wajib Dibuat

### 15.1 Initial State

Kondisi saat halaman pertama kali dibuka.

Copy:

```text
Siap memindai QR Code sapi
Arahkan kamera ke QR Code yang terpasang pada sapi atau kartu identitas ternak.
```

### 15.2 Camera Permission State

Copy:

```text
Izinkan akses kamera
SmartFarm membutuhkan akses kamera untuk membaca QR Code sapi.
```

CTA:

```text
Aktifkan Kamera
```

### 15.3 Scanning State

Copy:

```text
Mencari QR Code...
Pastikan QR berada di dalam frame dan tidak blur.
```

### 15.4 Loading Validation State

Copy:

```text
Memvalidasi data sapi...
Mohon tunggu sebentar.
```

### 15.5 Success State

Copy:

```text
Sapi ditemukan
Data sapi berhasil dikenali dari QR Code.
```

### 15.6 Invalid QR State

Copy:

```text
QR Code tidak dikenali
Kode yang dipindai bukan QR SmartFarm atau formatnya tidak valid.
```

### 15.7 Not Found State

Copy:

```text
Data sapi tidak ditemukan
QR valid, tetapi ID sapi belum terdaftar di sistem.
```

### 15.8 Camera Error State

Copy:

```text
Kamera tidak dapat digunakan
Periksa izin kamera di browser atau gunakan input manual ID Sapi.
```

---

## 16. Manual Input ID Sapi

Komponen input manual harus tersedia di halaman scanner.

### Field

- Input ID Sapi.
- Placeholder: `Contoh: BF-2026-0001`.
- Button: `Cari Sapi`.

### Validasi UI

- Tidak boleh kosong.
- Format disarankan diawali `BF-`.
- Jika tidak ditemukan, tampilkan state not found.

### Use Case

- Kamera HP rusak.
- Browser tidak mendukung kamera.
- QR Code kotor atau rusak.
- Area kandang minim cahaya.

---

## 17. Recent Scan List

Tampilkan 5 riwayat scan terakhir pada halaman QR Scan.

### Data yang Tampil

- ID sapi.
- Nama sapi / label sapi.
- Waktu scan.
- Status scan.
- Tombol buka ulang.

Contoh:

```text
BF-2026-0001 — Sapi Aster — 2 menit lalu — Berhasil
BF-2026-0002 — Sapi Bima — 12 menit lalu — Berhasil
UNKNOWN-QR — Tidak dikenal — 18 menit lalu — Gagal
```

---

## 18. Komponen yang Harus Dibuat

### 18.1 QRScannerPanel

Fungsi:

- Menampilkan area kamera dummy.
- Simulasi scanning.
- Tombol trigger dummy scan success.
- Tombol trigger invalid QR.
- Tombol trigger camera error.

### 18.2 ScanResultCard

Fungsi:

- Menampilkan hasil scan.
- Menampilkan CTA buka profil.
- Menampilkan CTA scan ulang.

### 18.3 ManualCattleInput

Fungsi:

- Input ID Sapi.
- Simulasi pencarian dummy.
- Validasi sederhana.

### 18.4 RecentScanList

Fungsi:

- Menampilkan recent scan dummy.
- Memberikan akses cepat ke profil sapi.

### 18.5 PublicCattleCard

Fungsi:

- Menampilkan versi publik profil sapi setelah quick scan.
- Menyembunyikan data internal.

### 18.6 ScannerTipsCard

Fungsi:

- Menampilkan tips agar QR mudah terbaca.

Isi tips:

- Pastikan QR tidak tertutup kotoran.
- Arahkan kamera sejajar dengan QR.
- Gunakan cahaya cukup.
- Dekatkan kamera jika QR terlalu kecil.

---

## 19. Interaksi Demo yang Wajib Ada

Agar demo terlihat hidup, buat tombol developer/demo mode:

```text
Simulasikan QR Valid
Simulasikan QR Tidak Valid
Simulasikan Kamera Error
Reset Scanner
```

Tombol ini boleh ditempatkan kecil di bawah scanner dengan label **Demo Tools**. Pada production nanti dapat dihapus.

---

## 20. Responsive Requirement

### Desktop

- Scanner dan detail berada dalam 2 kolom.
- Width scanner maksimal 560px.
- Recent scan ada di kanan.
- Header dashboard tetap konsisten dengan layout utama.

### Tablet

- Scanner di atas.
- Info card di bawah dalam grid 2 kolom.

### Mobile

- Scanner full width.
- Bottom action sticky berisi:
  - Scan Ulang.
  - Input Manual.
- Tombol minimal tinggi 44px.
- Font tidak terlalu kecil.

---

## 21. Accessibility Requirement

- Semua tombol harus memiliki label jelas.
- Scanner harus memiliki fallback manual input.
- Warna alert tidak hanya mengandalkan warna, tetapi juga ikon dan teks.
- Form input bisa digunakan dengan keyboard.
- Loading state harus jelas.
- Error message harus mudah dipahami.

---

## 22. Security & Privacy UI Notes

Pada UI, tampilkan pesan bahwa data internal dilindungi.

Copy footer kecil:

```text
Data internal hanya dapat diakses oleh pengguna yang memiliki izin.
```

Untuk quick scan public, tampilkan:

```text
Anda sedang melihat versi publik. Login diperlukan untuk melihat riwayat lengkap.
```

---

## 23. Backend Preparation Notes untuk Tahap 2

Walaupun tahap ini hanya UI, struktur harus siap untuk integrasi API.

### Endpoint yang Akan Dibutuhkan

```http
POST /api/qr/validate
GET /api/cattle/:id
GET /api/public/cattle/:id
POST /api/audit/scan-log
```

### Payload Validate QR

```json
{
  "qrValue": "SMARTFARM:CATTLE:BF-2026-0001",
  "source": "dashboard_scan"
}
```

### Response Success

```json
{
  "success": true,
  "cattleId": "BF-2026-0001",
  "redirectUrl": "/cattle/BF-2026-0001"
}
```

### Response Error

```json
{
  "success": false,
  "code": "CATTLE_NOT_FOUND",
  "message": "Data sapi tidak ditemukan"
}
```

---

## 24. Acceptance Criteria

### 24.1 QR Scan Internal

- User dapat membuka halaman QR Scan dari sidebar dashboard.
- Halaman QR Scan memiliki scanner frame yang modern.
- User dapat mensimulasikan scan QR valid.
- Sistem menampilkan hasil scan sapi.
- User dapat membuka profil sapi dari hasil scan.
- User dapat melihat state QR invalid.
- User dapat melihat state kamera error.
- User dapat mencari sapi melalui input manual.
- UI responsive di desktop dan mobile.

### 24.2 Quick Scan Public

- User dapat membuka quick scan dari halaman login.
- User dapat mensimulasikan scan QR valid.
- Sistem hanya menampilkan data publik.
- Sistem menampilkan CTA login untuk detail lengkap.
- Data internal tidak tampil di mode public.

### 24.3 Profile Integration

- Setelah scan berhasil, halaman profil sapi dapat dibuka.
- Profil sapi menampilkan ringkasan data utama.
- Profil sapi memiliki tabs pertumbuhan, kesehatan, pakan, dan penjualan.
- Alert penting tampil pada profil jika dummy data memiliki status bermasalah.

---

## 25. Copywriting UI

Gunakan bahasa Indonesia yang mudah dipahami petugas lapangan.

### Page Title

```text
QR Scan Sapi
```

### Subtitle

```text
Scan QR Code untuk membuka profil sapi secara instan.
```

### Scanner Instruction

```text
Arahkan kamera ke QR Code yang terpasang pada sapi.
```

### Success Message

```text
Sapi berhasil ditemukan.
```

### Error Message

```text
QR Code tidak dikenali. Silakan scan ulang atau input ID Sapi secara manual.
```

### Public Mode Notice

```text
Mode publik hanya menampilkan informasi terbatas.
```

---

## 26. Prompt Implementasi untuk Google Antigravity

Gunakan instruksi berikut untuk membangun UI:

```text
Bangun UI/UX modul QR Scan untuk aplikasi SmartFarm / Barbara Farm menggunakan Next.js dan Tailwind CSS.

Fokus tahap ini hanya frontend demo dengan dummy data, tanpa backend real.

Gunakan style visual seperti halaman login Barbara Farm: hijau gelap, clean, modern, farm-tech, white space luas, rounded card, soft shadow, dan responsive mobile-first.

Buat halaman:
1. /quick-scan untuk public QR scan dari login page.
2. /qr-scan atau /dashboard/qr-scan untuk internal user setelah login.
3. /cattle/[id] untuk profil sapi hasil scan.

Buat komponen:
- QRScannerPanel
- ScanResultCard
- ManualCattleInput
- RecentScanList
- PublicCattleCard
- ScannerTipsCard
- CattleProfileHeader

Buat dummy data sapi minimal 3 data dengan ID:
- BF-2026-0001
- BF-2026-0002
- BF-2026-0003

Buat simulasi scan dengan tombol demo:
- Simulasikan QR Valid
- Simulasikan QR Tidak Valid
- Simulasikan Kamera Error
- Reset Scanner

Saat QR valid, tampilkan card hasil scan dan tombol Buka Profil Sapi.
Saat QR tidak valid, tampilkan error state.
Saat kamera error, tampilkan fallback input manual ID Sapi.

Untuk public quick scan, tampilkan hanya data publik dan sembunyikan data internal seperti harga beli, harga jual, biaya pakan, biaya medis, ROI, dan catatan obat detail.

Untuk internal scan, tampilkan data lebih lengkap dan arahkan ke profil sapi.

Pastikan UI mobile friendly, tombol besar, mudah digunakan di kandang, dan tetap terlihat enterprise.
```

---

## 27. Definition of Done

Modul dianggap selesai untuk tahap UI demo jika:

- Halaman QR Scan internal sudah bisa diakses.
- Halaman Quick Scan public sudah bisa diakses.
- Scanner frame tampil modern dan responsive.
- Simulasi scan valid, invalid, dan camera error berjalan.
- Hasil scan dapat membuka halaman profil sapi.
- Profil sapi tampil menggunakan dummy data.
- Data public dan data internal dibedakan secara jelas.
- Visual konsisten dengan brand Barbara Farm.
- Siap dipresentasikan sebagai demo kepada calon user atau investor.

