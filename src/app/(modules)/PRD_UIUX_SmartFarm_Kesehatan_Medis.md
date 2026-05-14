# PRD UI/UX SmartFarm — Modul Kesehatan & Medis Ternak

**Project:** SmartFarm / Barbara Farm  
**Modul:** Kesehatan & Medis  
**Platform:** Web responsive + mobile-first  
**Frontend:** Next.js, Tailwind CSS, TypeScript  
**Target Step:** UI/UX Demo dengan dummy data  
**Output:** PRD siap pakai untuk Google Antigravity  

---

## 1. Tujuan Modul

Modul **Kesehatan & Medis** digunakan untuk mencatat, memantau, dan mengevaluasi kondisi kesehatan setiap sapi secara mudah melalui ponsel. Modul ini membantu peternak mengetahui sapi mana yang sedang sakit, riwayat pengobatan, jadwal vaksinasi, masa henti obat, dan status kelayakan jual setelah tindakan medis.

Modul ini harus dibuat sederhana untuk peternak, tetapi tetap terlihat modern, rapi, dan profesional seperti sistem peternakan digital berskala enterprise.

---

## 2. Prinsip UI/UX

Gunakan referensi visual dari branding login **Barbara Farm**:

- Warna utama: hijau gelap / farm green.
- Aksen: hijau muda, putih, abu lembut.
- Gaya UI: clean, modern, mobile-first, card-based.
- Font: gunakan font modern seperti Inter, Plus Jakarta Sans, atau Geist.
- Komponen harus mudah dipakai di ponsel dengan satu tangan.
- Hindari tampilan tabel berat di mobile. Gunakan card list, badge status, dan bottom sheet.
- Tabel desktop tetap disediakan untuk admin atau operator.

---

## 3. Role Pengguna

### 3.1 Peternak / Operator Kandang

- Input kondisi sakit sapi.
- Input tindakan medis sederhana.
- Melihat sapi yang perlu perhatian.
- Melihat jadwal vaksin dan obat cacing.
- Melihat apakah sapi masih dalam masa henti obat.

### 3.2 Admin Peternakan

- Melihat seluruh data kesehatan sapi.
- Edit dan validasi data medis.
- Mengelola referensi obat dan tindakan.
- Export report.

### 3.3 Dokter Hewan / Paramedik

- Input diagnosa lanjutan.
- Input obat, dosis, dan catatan medis.
- Menentukan tanggal sembuh.
- Menentukan masa henti obat.

---

## 4. Analisis Flow Modul

### 4.1 Flow Dashboard Kesehatan

1. User login ke SmartFarm.
2. User membuka menu **Kesehatan & Medis**.
3. Sistem menampilkan ringkasan:
   - Total sapi sehat.
   - Total sapi sakit.
   - Total sapi dalam perawatan.
   - Total sapi dalam masa henti obat.
   - Jadwal vaksin/obat cacing terdekat.
4. User dapat memilih salah satu kartu status untuk memfilter daftar sapi.
5. User memilih sapi untuk melihat detail riwayat medis.

### 4.2 Flow Input Pemeriksaan Baru

1. User klik tombol **+ Catat Pemeriksaan**.
2. User memilih sapi melalui:
   - scan QR Code,
   - search ID sapi,
   - pilih dari daftar sapi.
3. Sistem menampilkan preview identitas sapi:
   - foto sapi,
   - ID sapi,
   - jenis sapi,
   - kandang,
   - status kesehatan terakhir.
4. User mengisi form pemeriksaan:
   - tanggal cek,
   - gejala,
   - diagnosa,
   - tingkat urgensi,
   - suhu tubuh jika ada,
   - nafsu makan,
   - kondisi feses,
   - tindakan/vaksinasi,
   - nama obat,
   - dosis,
   - masa henti obat,
   - tanggal kontrol berikutnya,
   - foto kondisi jika ada.
5. User klik **Simpan Pemeriksaan**.
6. Sistem menyimpan data dummy ke state/local storage untuk demo.
7. Sistem mengubah status kesehatan sapi sesuai input.
8. Sistem menampilkan success state dan pilihan:
   - lihat detail riwayat medis,
   - input pemeriksaan sapi lain,
   - kembali ke dashboard kesehatan.

### 4.3 Flow Monitoring & Evaluasi Kesehatan

1. User membuka halaman detail sapi.
2. User memilih tab **Kesehatan**.
3. Sistem menampilkan timeline riwayat medis.
4. Sistem menampilkan status terkini:
   - sehat,
   - sakit,
   - dalam perawatan,
   - pemulihan,
   - masa henti obat,
   - siap jual.
5. User dapat melihat grafik/tren:
   - jumlah kejadian sakit,
   - frekuensi pengobatan,
   - status vaksinasi,
   - masa henti obat.
6. User dapat menambahkan catatan lanjutan atau menandai sapi sembuh.

### 4.4 Flow Tandai Sembuh

1. User membuka detail kasus medis yang masih aktif.
2. User klik **Tandai Sembuh**.
3. Sistem menampilkan form singkat:
   - tanggal sembuh,
   - catatan pemulihan,
   - rekomendasi lanjutan,
   - apakah tetap ada masa henti obat.
4. User simpan.
5. Sistem mengubah status kasus menjadi selesai.
6. Jika masa henti obat belum selesai, status sapi menjadi **Masa Henti Obat**.
7. Jika tidak ada masa henti obat, status sapi menjadi **Sehat**.

### 4.5 Flow Alert Masa Henti Obat

1. Sistem membaca tanggal pemberian obat dan jumlah hari withdrawal period.
2. Sistem menghitung tanggal aman jual.
3. Jika tanggal hari ini masih sebelum tanggal aman jual:
   - sapi diberi badge **Jangan Dijual**.
   - muncul alert pada dashboard.
4. Jika sudah melewati tanggal aman jual:
   - badge berubah menjadi **Aman Dijual**.
   - sapi keluar dari daftar alert.

### 4.6 Flow Jadwal Vaksin / Obat Cacing

1. User membuka tab **Jadwal Medis**.
2. Sistem menampilkan daftar jadwal berdasarkan tanggal terdekat.
3. User klik jadwal.
4. User dapat memilih:
   - tandai selesai,
   - reschedule,
   - input tindakan medis baru.
5. Jika ditandai selesai, sistem membuat log pemeriksaan otomatis dengan tipe tindakan vaksin/obat cacing.

---

## 5. Analisis Input - Proses - Output

### 5.1 Input Data

| Kelompok Input | Field | Keterangan |
|---|---|---|
| Identitas Pemeriksaan | ID Pemeriksaan | Auto generated |
| Identitas Sapi | ID Sapi | Relasi ke Master Data Sapi |
| Tanggal | Tanggal Cek | Tanggal pemeriksaan dilakukan |
| Kondisi Awal | Gejala | Contoh: nafsu makan turun, luka kaki, demam |
| Diagnosa | Diagnosa Medis | Contoh: cacingan, PMK ringan, luka infeksi |
| Vital Sederhana | Suhu Tubuh | Opsional, dalam Celcius |
| Perilaku | Nafsu Makan | Normal, menurun, tidak mau makan |
| Observasi | Kondisi Feses | Normal, encer, keras, berdarah |
| Tingkat Urgensi | Severity | Ringan, sedang, berat, darurat |
| Tindakan | Tindakan/Vaksinasi | Vaksin, obat cacing, antibiotik, perawatan luka |
| Obat | Nama Obat | Nama obat yang diberikan |
| Dosis | Dosis Obat | Contoh: 10 ml, 2 tablet, 5 cc |
| Masa Henti Obat | Withdrawal Period | Jumlah hari sapi tidak boleh dijual/dipotong |
| Tanggal Kontrol | Next Checkup Date | Jadwal pemeriksaan lanjutan |
| Status | Status Kasus | Aktif, dalam perawatan, sembuh, selesai |
| Lampiran | Foto Kondisi | Opsional, upload/preview dummy |
| Catatan | Catatan Petugas | Catatan tambahan |

### 5.2 Proses Sistem

| Proses | Deskripsi |
|---|---|
| Validasi input | Pastikan ID sapi, tanggal cek, gejala, dan status wajib terisi |
| Generate ID pemeriksaan | Format contoh: MED-2026-0001 |
| Update status sapi | Status berubah sesuai severity dan status kasus |
| Hitung tanggal aman jual | Tanggal pemberian obat + withdrawal period |
| Buat alert | Jika masih dalam masa henti obat atau butuh kontrol ulang |
| Simpan timeline | Riwayat medis masuk ke timeline profil sapi |
| Buat indikator dashboard | Data dihitung ulang untuk summary dashboard |
| Integrasi QR | Data dapat dibuka dari profil sapi setelah scan QR |
| Generate report | Sistem menyiapkan ringkasan kesehatan per sapi/per kandang |

### 5.3 Output Data

| Output | Deskripsi |
|---|---|
| Dashboard kesehatan | Ringkasan status seluruh sapi |
| Daftar kasus medis | List sapi sakit/dalam perawatan/masa henti obat |
| Detail riwayat medis sapi | Timeline lengkap pemeriksaan dan tindakan |
| Badge status | Sehat, sakit, perawatan, masa henti obat, aman jual |
| Alert | Jadwal kontrol, vaksin, obat cacing, jangan dijual |
| Report per sapi | Ringkasan jumlah kasus, obat, tindakan, status akhir |
| Report per kandang | Ringkasan kesehatan berdasarkan kelompok kandang |
| Data dummy | Seed medis untuk demo UI |

---

## 6. Struktur Menu Modul

Tambahkan menu pada sidebar/mobile bottom navigation:

```txt
Kesehatan & Medis
├── Dashboard Kesehatan
├── Catat Pemeriksaan
├── Kasus Aktif
├── Jadwal Medis
├── Riwayat Medis
└── Report Kesehatan
```

Pada mobile, gunakan bottom navigation utama:

```txt
Dashboard | Sapi | Scan | Kesehatan | Profil
```

---

## 7. Halaman UI yang Harus Dibuat

### 7.1 Halaman Dashboard Kesehatan

Route:

```txt
/app/health
```

Komponen utama:

- Header: **Kesehatan & Medis**.
- Search sapi.
- Quick action:
  - Scan QR Sapi.
  - Catat Pemeriksaan.
  - Jadwal Vaksin.
- Summary cards:
  - Sehat.
  - Sakit.
  - Dalam Perawatan.
  - Masa Henti Obat.
- Alert card:
  - Sapi harus kontrol hari ini.
  - Sapi belum aman dijual.
  - Jadwal vaksin terdekat.
- List kasus aktif.

Mobile layout:

- Summary card dibuat horizontal scroll.
- Kasus aktif dalam bentuk card.
- Floating action button: **+ Pemeriksaan**.

Desktop layout:

- Summary di grid 4 kolom.
- Kasus aktif dalam table.
- Panel kanan untuk jadwal terdekat.

---

### 7.2 Halaman Catat Pemeriksaan

Route:

```txt
/app/health/create
```

Gunakan form wizard 3 langkah agar mudah di ponsel:

#### Step 1 — Pilih Sapi

- Tombol scan QR.
- Search ID sapi.
- Pilih dari daftar.
- Preview sapi terpilih:
  - foto,
  - ID,
  - jenis,
  - kandang,
  - status terakhir.

#### Step 2 — Kondisi & Diagnosa

Input:

- Tanggal cek.
- Gejala.
- Diagnosa.
- Tingkat urgensi.
- Suhu tubuh.
- Nafsu makan.
- Kondisi feses.
- Foto kondisi.

#### Step 3 — Tindakan & Obat

Input:

- Jenis tindakan.
- Nama obat/vaksin.
- Dosis.
- Masa henti obat.
- Tanggal kontrol berikutnya.
- Catatan.

CTA:

- Simpan Pemeriksaan.
- Simpan sebagai Draft.
- Batal.

---

### 7.3 Halaman Kasus Aktif

Route:

```txt
/app/health/cases
```

Fitur:

- Filter status:
  - semua,
  - sakit,
  - perawatan,
  - kontrol ulang,
  - masa henti obat.
- Search sapi.
- Sort:
  - terbaru,
  - urgensi tertinggi,
  - tanggal kontrol terdekat.

Card mobile wajib menampilkan:

- Foto sapi.
- ID sapi.
- Jenis sapi.
- Gejala utama.
- Status badge.
- Tanggal cek.
- Tanggal kontrol.
- CTA: Detail / Tandai Sembuh.

---

### 7.4 Halaman Detail Riwayat Medis Sapi

Route:

```txt
/app/cattle/[id]/health
```

Konten:

- Header profil sapi mini.
- Status kesehatan terkini.
- Alert masa henti obat jika ada.
- Timeline riwayat medis.
- Ringkasan:
  - total pemeriksaan,
  - total kasus sakit,
  - vaksin terakhir,
  - obat cacing terakhir,
  - tanggal aman jual.
- Grafik sederhana jumlah kasus per bulan.
- CTA:
  - Catat Pemeriksaan Baru.
  - Tandai Sembuh.
  - Jadwalkan Kontrol.

---

### 7.5 Halaman Jadwal Medis

Route:

```txt
/app/health/schedule
```

Fitur:

- Calendar/list mode.
- Jadwal vaksin.
- Jadwal obat cacing.
- Jadwal kontrol ulang.
- Reminder badge:
  - hari ini,
  - besok,
  - terlambat.

Action:

- Tandai selesai.
- Reschedule.
- Buat pemeriksaan dari jadwal.

---

### 7.6 Halaman Report Kesehatan

Route:

```txt
/app/health/report
```

Report mobile-first:

- Report per sapi.
- Report per kandang.
- Report jenis penyakit terbanyak.
- Report obat paling sering digunakan.
- Report sapi yang sering sakit.
- Report sapi dalam masa henti obat.

Tampilan mobile:

- Gunakan insight card.
- Hindari table panjang.
- Table hanya muncul di desktop.

---

## 8. Komponen UI yang Dibutuhkan

Buat komponen reusable:

```txt
/components/health/HealthSummaryCard.tsx
/components/health/HealthStatusBadge.tsx
/components/health/MedicalCaseCard.tsx
/components/health/MedicalTimeline.tsx
/components/health/MedicalFormWizard.tsx
/components/health/CattleHealthMiniProfile.tsx
/components/health/WithdrawalAlert.tsx
/components/health/MedicineScheduleCard.tsx
/components/health/HealthReportCard.tsx
/components/health/SeverityBadge.tsx
```

---

## 9. Status dan Badge

Gunakan status berikut:

| Status | Label | Warna UI |
|---|---|---|
| healthy | Sehat | Green |
| sick | Sakit | Red |
| treatment | Dalam Perawatan | Orange |
| recovery | Pemulihan | Blue |
| withdrawal | Masa Henti Obat | Purple/Dark Orange |
| safe_to_sell | Aman Dijual | Green |
| urgent | Darurat | Red solid |

Catatan: warna tetap selaras dengan tema hijau Barbara Farm. Warna red/orange hanya untuk alert medis.

---

## 10. Dummy Data / Seed Data Medis

Buat file dummy:

```txt
/src/data/health.seed.ts
```

Gunakan data sapi dari seed 25 sapi Master Data. Buat minimal 30 data log medis.

Contoh struktur TypeScript:

```ts
export type MedicalRecord = {
  id: string;
  cattleId: string;
  checkDate: string;
  symptoms: string;
  diagnosis: string;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  bodyTemperature?: number;
  appetite: 'normal' | 'reduced' | 'none';
  stoolCondition: 'normal' | 'soft' | 'watery' | 'bloody' | 'hard';
  actionType: 'checkup' | 'vaccination' | 'deworming' | 'medicine' | 'wound_care';
  medicineName?: string;
  dosage?: string;
  withdrawalDays?: number;
  safeToSellDate?: string;
  nextCheckupDate?: string;
  status: 'active' | 'treatment' | 'recovered' | 'closed';
  recoveryDate?: string;
  notes?: string;
  photoUrl?: string;
  officerName: string;
};
```

Contoh seed:

```ts
export const medicalRecords: MedicalRecord[] = [
  {
    id: 'MED-2026-0001',
    cattleId: 'BF-001',
    checkDate: '2026-05-01',
    symptoms: 'Nafsu makan menurun dan terlihat lemas',
    diagnosis: 'Gangguan pencernaan ringan',
    severity: 'mild',
    bodyTemperature: 38.7,
    appetite: 'reduced',
    stoolCondition: 'soft',
    actionType: 'medicine',
    medicineName: 'Vitamin B Complex',
    dosage: '10 ml',
    withdrawalDays: 0,
    safeToSellDate: '2026-05-01',
    nextCheckupDate: '2026-05-04',
    status: 'treatment',
    notes: 'Pantau pakan dan minum selama 3 hari.',
    officerName: 'Operator Kandang 1'
  },
  {
    id: 'MED-2026-0002',
    cattleId: 'BF-003',
    checkDate: '2026-05-02',
    symptoms: 'Luka kecil pada kaki belakang',
    diagnosis: 'Luka ringan akibat gesekan kandang',
    severity: 'moderate',
    bodyTemperature: 38.9,
    appetite: 'normal',
    stoolCondition: 'normal',
    actionType: 'wound_care',
    medicineName: 'Antiseptic Spray',
    dosage: '2 kali sehari',
    withdrawalDays: 0,
    safeToSellDate: '2026-05-02',
    nextCheckupDate: '2026-05-05',
    status: 'active',
    notes: 'Bersihkan area luka setiap pagi dan sore.',
    officerName: 'Paramedik Farm'
  },
  {
    id: 'MED-2026-0003',
    cattleId: 'BF-007',
    checkDate: '2026-04-25',
    symptoms: 'Program obat cacing rutin',
    diagnosis: 'Preventif parasit internal',
    severity: 'mild',
    appetite: 'normal',
    stoolCondition: 'normal',
    actionType: 'deworming',
    medicineName: 'Albendazole',
    dosage: '1 bolus',
    withdrawalDays: 14,
    safeToSellDate: '2026-05-09',
    nextCheckupDate: '2026-07-25',
    status: 'closed',
    recoveryDate: '2026-04-25',
    notes: 'Obat cacing rutin triwulan.',
    officerName: 'Dokter Hewan'
  }
];
```

Tambahkan generator/array manual hingga minimal 30 record yang tersebar ke 25 sapi:

- 12 record checkup umum.
- 6 record vaksinasi.
- 5 record obat cacing.
- 4 record luka/perawatan.
- 3 record sakit pencernaan/pernapasan.

---

## 11. Kalkulasi yang Dibutuhkan di Frontend Demo

Buat helper:

```txt
/src/lib/health-calculation.ts
```

Fungsi:

```ts
calculateSafeToSellDate(checkDate: string, withdrawalDays: number): string
isUnderWithdrawal(today: string, safeToSellDate: string): boolean
getHealthStatus(records: MedicalRecord[]): string
countActiveCases(records: MedicalRecord[]): number
getUpcomingMedicalSchedules(records: MedicalRecord[]): MedicalRecord[]
getMostFrequentDiagnosis(records: MedicalRecord[]): string[]
```

Rules:

- Jika ada record aktif dengan severity severe/emergency, status sapi = Sakit/Darurat.
- Jika ada record treatment, status sapi = Dalam Perawatan.
- Jika semua record closed tetapi safeToSellDate masih di masa depan, status sapi = Masa Henti Obat.
- Jika tidak ada kasus aktif dan tidak dalam withdrawal, status sapi = Sehat.

---

## 12. UX Detail untuk Peternak di Ponsel

### 12.1 Quick Input Mode

Sediakan mode input cepat untuk peternak:

- Pilih sapi.
- Pilih gejala dari template.
- Pilih tindakan.
- Simpan.

Template gejala:

- Nafsu makan turun.
- Lemas.
- Batuk.
- Diare.
- Luka kaki.
- Mata berair.
- Demam.
- Perut kembung.

Template tindakan:

- Pantau 1 hari.
- Beri vitamin.
- Hubungi dokter.
- Pisahkan dari kelompok.
- Bersihkan luka.
- Jadwalkan kontrol.

### 12.2 Voice-Friendly Copy

Gunakan bahasa tombol yang mudah:

- `Catat Sakit`
- `Tandai Sembuh`
- `Jadwalkan Kontrol`
- `Jangan Dijual Dulu`
- `Aman Dijual`
- `Scan Sapi`

### 12.3 Empty State

Jika belum ada data medis:

```txt
Belum ada riwayat kesehatan.
Sapi ini belum pernah dicatat sakit atau diberikan tindakan medis.
```

CTA:

```txt
+ Catat Pemeriksaan Pertama
```

### 12.4 Error State

Jika sapi tidak ditemukan:

```txt
Sapi tidak ditemukan.
Periksa kembali ID sapi atau scan QR ulang.
```

Jika form belum lengkap:

```txt
Lengkapi data wajib: sapi, tanggal cek, gejala, dan tindakan.
```

---

## 13. Integrasi dengan Modul Lain

### 13.1 Master Data Sapi

- Modul kesehatan mengambil ID, foto, jenis, kandang, dan status sapi.
- Status kesehatan terbaru tampil di profil sapi.

### 13.2 QR Scan

- Setelah scan QR, user dapat langsung membuka tab kesehatan sapi.
- Jika sapi sakit, tampil alert di profil.

### 13.3 Monitoring Pertumbuhan

- Jika ADG turun drastis, sistem dapat memberi rekomendasi cek kesehatan.
- Report kesehatan dapat dibandingkan dengan grafik berat badan.

### 13.4 Penjualan

- Jika sapi masih dalam masa henti obat, sistem memberi warning pada proses penjualan.
- Status `safe_to_sell` menjadi validasi awal sebelum sapi dijual.

---

## 14. Struktur Folder yang Disarankan

```txt
/src
├── app
│   ├── health
│   │   ├── page.tsx
│   │   ├── create
│   │   │   └── page.tsx
│   │   ├── cases
│   │   │   └── page.tsx
│   │   ├── schedule
│   │   │   └── page.tsx
│   │   └── report
│   │       └── page.tsx
│   └── cattle
│       └── [id]
│           └── health
│               └── page.tsx
├── components
│   └── health
├── data
│   └── health.seed.ts
├── lib
│   └── health-calculation.ts
└── types
    └── health.ts
```

---

## 15. Acceptance Criteria

Modul dianggap selesai untuk UI demo jika:

- User dapat membuka dashboard kesehatan.
- User dapat melihat summary kesehatan sapi.
- User dapat melihat daftar kasus aktif.
- User dapat input pemeriksaan baru melalui form wizard.
- User dapat memilih sapi dari dummy data 25 sapi.
- User dapat melihat riwayat medis per sapi.
- User dapat melihat alert masa henti obat.
- User dapat melihat jadwal vaksin/obat cacing/kontrol.
- User dapat menandai kasus sebagai sembuh.
- UI nyaman digunakan di ponsel.
- Desktop tetap memiliki table view yang rapi.
- Data dummy minimal 30 log medis tersedia.
- Semua warna dan komponen mengikuti branding Barbara Farm.

---

## 16. Prompt Implementasi untuk Google Antigravity

Gunakan instruksi berikut untuk mulai mengembangkan modul:

```txt
Bangun modul UI/UX SmartFarm untuk Kesehatan & Medis ternak/sapi menggunakan Next.js, TypeScript, Tailwind CSS, dan komponen reusable.

Fokus pada UI demo mobile-first dengan dummy data. Jangan integrasikan backend dulu.

Buat halaman:
1. /health sebagai dashboard kesehatan.
2. /health/create sebagai form wizard catat pemeriksaan.
3. /health/cases sebagai daftar kasus aktif.
4. /health/schedule sebagai jadwal vaksin/obat cacing/kontrol.
5. /health/report sebagai report kesehatan.
6. /cattle/[id]/health sebagai riwayat medis per sapi.

Gunakan branding Barbara Farm: hijau gelap, putih, abu lembut, clean, modern, enterprise, card-based, mudah digunakan peternak di ponsel.

Buat komponen reusable:
- HealthSummaryCard
- HealthStatusBadge
- MedicalCaseCard
- MedicalTimeline
- MedicalFormWizard
- CattleHealthMiniProfile
- WithdrawalAlert
- MedicineScheduleCard
- HealthReportCard
- SeverityBadge

Buat seed data di /src/data/health.seed.ts minimal 30 record medis yang terhubung ke 25 sapi dari seed master data.

Buat helper kalkulasi di /src/lib/health-calculation.ts untuk menghitung safeToSellDate, under withdrawal, active cases, upcoming schedule, dan status kesehatan sapi.

Pastikan UI mobile sangat mudah digunakan:
- card list untuk mobile
- floating action button untuk input cepat
- bottom sheet untuk action
- table hanya untuk desktop
- badge status jelas
- alert masa henti obat jelas

Jangan gunakan data backend/API. Gunakan dummy data dan state lokal untuk demo.
```

---

## 17. Catatan Pengembangan Tahap 2 Backend

Untuk tahap backend nanti, modul ini akan membutuhkan tabel:

- cattle_medical_records
- medicine_master
- medical_schedules
- cattle_health_status
- medical_attachments

Relasi utama:

- cattle_medical_records.cattle_id → cattle.id
- medical_schedules.cattle_id → cattle.id
- medical_attachments.medical_record_id → cattle_medical_records.id

Namun pada tahap UI/UX demo, seluruh data cukup menggunakan seed TypeScript.

---

## 18. Ringkasan Nilai Modul

Modul Kesehatan & Medis membuat SmartFarm tidak hanya menjadi aplikasi pencatatan sapi, tetapi menjadi alat kontrol kesehatan ternak yang membantu peternak mengambil keputusan harian:

- sapi mana yang sakit,
- sapi mana yang butuh kontrol,
- sapi mana yang belum aman dijual,
- sapi mana yang sudah sehat,
- dan bagaimana riwayat medis setiap sapi dari waktu ke waktu.

