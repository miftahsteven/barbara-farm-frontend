# PRD UI/UX SmartFarm — Modul Manajemen Pakan

**Project:** SmartFarm  
**Modul:** Manajemen Pakan / Feeding Management  
**Tahap:** Step 1 — Pengembangan Frontend UI/UX Demo  
**Target Platform:** Web responsive + mobile browser  
**Frontend Stack:** Next.js, Tailwind CSS, optional chart library, optional UI component library  
**Backend Status:** Dummy data/local state terlebih dahulu, siap diintegrasikan ke Node.js + Prisma + PostgreSQL pada tahap 2  
**Target User:** Peternak, mandor kandang, admin peternakan, owner/pemilik usaha ternak

---

## 1. Tujuan Modul

Modul **Manajemen Pakan** digunakan untuk membantu peternak mencatat, memantau, dan mengevaluasi pemberian pakan ternak/sapi secara harian. Modul ini harus memudahkan peternak untuk mengetahui:

1. Sapi atau kelompok kandang mana yang sudah diberi pakan.
2. Jenis pakan yang diberikan.
3. Jumlah pakan per hari dalam kilogram.
4. Estimasi biaya pakan harian, mingguan, dan bulanan.
5. Perbandingan konsumsi pakan terhadap kenaikan berat badan.
6. Indikasi efisiensi pakan atau **FCR — Feed Conversion Ratio**.
7. Sapi/kelompok dengan konsumsi tinggi tetapi pertumbuhan rendah.
8. Riwayat pemberian pakan per sapi atau per kelompok kandang.

Modul ini harus dibuat **mobile-first**, karena peternak kemungkinan besar menginput data dari ponsel saat berada di kandang.

---

## 2. Prinsip UI/UX

### 2.1 Karakter UI

Gunakan style visual sesuai brand SmartFarm yang sudah dibuat sebelumnya:

- Modern agriculture dashboard.
- Warna utama hijau natural.
- Kartu informasi rounded dan mudah dibaca.
- Layout mobile sederhana, tidak terlalu padat.
- Tombol aksi besar agar nyaman digunakan di ponsel.
- Ikon visual untuk jenis pakan.
- Report berbentuk card, chart, dan ringkasan sederhana.

### 2.2 Fokus Pengalaman Peternak

Peternak tidak boleh dipaksa mengisi form yang rumit. Form harus cepat, praktis, dan bisa digunakan dalam kondisi lapangan.

Prioritas UX:

1. Input cepat dari HP.
2. Pilihan sapi/kelompok bisa lewat QR, search, atau dropdown.
3. Porsi dan biaya pakan otomatis menghitung total biaya.
4. Dashboard langsung menunjukkan status hari ini.
5. Report per sapi mudah dibaca tanpa perlu membuka banyak halaman.
6. Ada indikator visual: hemat, normal, boros, perlu evaluasi.

---

## 3. Scope Modul

### 3.1 In Scope

Frontend UI demo untuk:

1. Dashboard Manajemen Pakan.
2. Input pakan harian.
3. Input pakan per sapi.
4. Input pakan per kelompok kandang.
5. List log pemberian pakan.
6. Detail log pakan.
7. Edit log pakan.
8. Delete/void log pakan.
9. Report pakan per sapi.
10. Report pakan per kelompok kandang.
11. Report biaya pakan.
12. Report efisiensi pakan/FCR.
13. Alert konsumsi tidak normal.
14. Dummy data pakan.
15. Komponen mobile card untuk peternak.
16. Komponen desktop table untuk admin/owner.

### 3.2 Out of Scope untuk Step 1

Belum perlu membangun:

1. API backend nyata.
2. Database PostgreSQL nyata.
3. Login authorization nyata.
4. Integrasi IoT timbangan pakan.
5. Integrasi stok gudang pakan nyata.
6. Export PDF/Excel nyata.
7. Notifikasi WhatsApp nyata.

Namun UI harus disiapkan agar mudah diintegrasikan pada tahap backend.

---

## 4. Definisi Data Utama

### 4.1 Feeding Log

Data utama modul ini adalah catatan pemberian pakan.

Field minimal:

| Field | Tipe | Keterangan |
|---|---|---|
| id | string | ID log pakan |
| feedingDate | date | Tanggal pemberian pakan |
| feedingTime | time | Waktu pemberian pakan: pagi/siang/sore/malam/custom |
| targetType | enum | `SAPI` atau `KELOMPOK` |
| cattleId | string/null | ID sapi jika target per sapi |
| groupId | string/null | ID kelompok/kandang jika target per kelompok |
| feedType | enum/string | Hijauan, Konsentrat, Fermentasi, Silase, Mineral, Tambahan |
| feedName | string | Nama pakan detail |
| portionKg | number | Porsi pakan dalam Kg |
| costPerKg | number | Biaya pakan per Kg |
| totalCost | number | portionKg x costPerKg |
| notes | string | Catatan tambahan |
| createdBy | string | User penginput |
| createdAt | datetime | Waktu dibuat |
| updatedAt | datetime | Waktu update |
| status | enum | Draft, Posted, Voided |

### 4.2 Feed Type Master Dummy

Untuk UI demo, siapkan jenis pakan:

| Kode | Jenis Pakan | Contoh Nama | Default Biaya/Kg |
|---|---|---|---:|
| HIJAUAN | Hijauan | Rumput gajah | 700 |
| KONSENTRAT | Konsentrat | Konsentrat protein | 4500 |
| FERMENTASI | Fermentasi | Fermentasi gedebog | 1200 |
| SILASE | Silase | Silase jagung | 1800 |
| MINERAL | Mineral | Mineral mix | 9000 |
| TAMBAHAN | Tambahan | Ampas tahu | 1500 |

### 4.3 Kelompok Kandang Dummy

| ID Kelompok | Nama Kelompok | Jumlah Sapi | Keterangan |
|---|---|---:|---|
| KDG-A | Kandang A - Penggemukan 1 | 8 | Sapi jantan bobot 250-300 kg |
| KDG-B | Kandang B - Penggemukan 2 | 7 | Sapi campuran bobot 300-350 kg |
| KDG-C | Kandang C - Perawatan | 5 | Sapi perlu pemantauan kesehatan |
| KDG-D | Kandang D - Siap Jual | 5 | Sapi mendekati target jual |

---

## 5. Analisis Flow Modul Manajemen Pakan

### 5.1 Flow Dashboard Pakan Harian

1. User login ke SmartFarm.
2. User membuka menu **Manajemen Pakan**.
3. Sistem menampilkan dashboard ringkas:
   - Total pakan hari ini.
   - Total biaya pakan hari ini.
   - Jumlah sapi/kelompok yang sudah diberi pakan.
   - Alert pakan belum tercatat.
   - Ranking biaya pakan tertinggi.
   - Indikator efisiensi pakan.
4. User dapat memilih filter:
   - Hari ini.
   - 7 hari terakhir.
   - Bulan ini.
   - Per kandang.
   - Per jenis pakan.
5. Sistem memperbarui card dan chart berdasarkan filter.

### 5.2 Flow Input Pakan Per Sapi

1. User klik tombol **+ Input Pakan**.
2. Sistem membuka halaman/form input mobile.
3. User memilih target **Per Sapi**.
4. User memilih sapi dengan salah satu cara:
   - Scan QR sapi.
   - Search ID sapi/nama sapi.
   - Pilih dari list sapi.
5. Sistem menampilkan mini profile sapi:
   - Foto sapi.
   - ID sapi.
   - Jenis sapi.
   - Bobot terakhir.
   - Kandang.
6. User mengisi:
   - Tanggal pakan.
   - Waktu pakan.
   - Jenis pakan.
   - Nama pakan.
   - Porsi Kg.
   - Biaya per Kg.
   - Catatan.
7. Sistem menghitung otomatis:
   - Total biaya pakan.
   - Estimasi biaya pakan harian sapi.
8. User klik **Simpan Log Pakan**.
9. Sistem menampilkan success state.
10. Data muncul di riwayat pakan sapi.

### 5.3 Flow Input Pakan Per Kelompok Kandang

1. User klik **+ Input Pakan**.
2. User memilih target **Per Kelompok/Kandang**.
3. User memilih kelompok kandang.
4. Sistem menampilkan informasi kelompok:
   - Nama kandang.
   - Jumlah sapi.
   - Rata-rata bobot terakhir.
5. User mengisi jenis pakan, porsi total, biaya per Kg, dan catatan.
6. Sistem menghitung:
   - Total biaya kelompok.
   - Estimasi biaya per ekor.
   - Estimasi porsi per ekor.
7. User menyimpan data.
8. Sistem menyimpan log sebagai feeding group log.
9. Pada report per sapi, data kelompok dapat ditampilkan sebagai estimasi alokasi pakan per ekor.

### 5.4 Flow Report Pakan Per Sapi

1. User membuka halaman detail sapi atau menu report pakan.
2. User memilih sapi.
3. Sistem menampilkan:
   - Total konsumsi pakan periode terpilih.
   - Total biaya pakan.
   - Rata-rata pakan/hari.
   - Grafik porsi pakan harian.
   - Komposisi jenis pakan.
   - Hubungan pakan dengan berat badan.
   - Estimasi FCR.
4. User bisa mengubah filter periode.
5. Sistem memperbarui report.

### 5.5 Flow Monev Efisiensi Pakan/FCR

1. Sistem mengambil data pakan dan data monitoring pertumbuhan.
2. Sistem menghitung total pakan pada periode tertentu.
3. Sistem menghitung kenaikan berat badan pada periode yang sama.
4. Sistem menghitung FCR:

```txt
FCR = Total Pakan Dikonsumsi / Kenaikan Berat Badan
```

5. Sistem memberi label evaluasi:
   - Baik: FCR rendah/efisien.
   - Normal: masih dalam batas wajar.
   - Perlu evaluasi: pakan tinggi, kenaikan berat rendah.
6. Sistem menampilkan rekomendasi sederhana:
   - Cek kesehatan sapi.
   - Evaluasi jenis pakan.
   - Cek jadwal pemberian pakan.
   - Bandingkan dengan kelompok lain.

### 5.6 Flow Alert Pakan Tidak Normal

1. Sistem membaca data pakan harian.
2. Sistem membandingkan konsumsi pakan dengan standar target.
3. Sistem mendeteksi kondisi:
   - Belum ada input pakan hari ini.
   - Porsi pakan terlalu rendah.
   - Porsi pakan terlalu tinggi.
   - Biaya pakan naik drastis.
   - FCR memburuk.
4. Sistem menampilkan alert card di dashboard.
5. User klik alert.
6. Sistem membuka detail sapi/kelompok terkait.
7. User bisa input catatan evaluasi.

---

## 6. Analisis Input — Proses — Output

### 6.1 Input

Data yang dimasukkan user:

| Kategori | Input | Keterangan |
|---|---|---|
| Target Pakan | Per Sapi / Per Kelompok | Menentukan mode pencatatan |
| Identitas Target | ID Sapi / ID Kelompok | Dipilih via QR, search, dropdown, atau card |
| Tanggal | Tanggal pemberian pakan | Default hari ini |
| Waktu | Pagi/Siang/Sore/Malam | Bisa dibuat quick select |
| Jenis Pakan | Hijauan/Konsentrat/Fermentasi/dll | Dropdown berbasis master dummy |
| Nama Pakan | Contoh: rumput gajah | Text/dropdown |
| Porsi | Kg | Input numeric |
| Biaya per Kg | Rupiah | Input numeric, bisa auto dari master feed |
| Catatan | Text opsional | Misal pakan tidak habis, nafsu makan turun |

### 6.2 Proses

Proses yang dilakukan sistem:

| Proses | Deskripsi |
|---|---|
| Validasi target | Pastikan sapi/kelompok dipilih |
| Validasi angka | Porsi dan biaya tidak boleh minus |
| Auto calculate total cost | `porsiKg x biayaPerKg` |
| Estimasi pakan per ekor | Jika target kelompok, `totalPorsi / jumlahSapi` |
| Estimasi biaya per ekor | Jika target kelompok, `totalBiaya / jumlahSapi` |
| Agregasi report | Hitung total pakan dan biaya per periode |
| Komposisi pakan | Kelompokkan total pakan berdasarkan jenis pakan |
| Perhitungan FCR | Bandingkan total pakan dengan kenaikan berat badan |
| Alert pakan | Deteksi data belum input, porsi anomali, biaya tinggi, FCR buruk |
| Timeline log | Susun riwayat pakan per sapi/kelompok |

### 6.3 Output

Output yang dilihat user:

| Output | Bentuk UI | Keterangan |
|---|---|---|
| Dashboard pakan | Summary cards | Total pakan, biaya, status hari ini |
| Log pakan | Mobile card/table | Riwayat input pakan |
| Detail log | Detail page/bottom sheet | Informasi lengkap pemberian pakan |
| Report per sapi | Chart + card | Konsumsi, biaya, komposisi pakan |
| Report per kelompok | Chart + table | Total pakan dan biaya kandang |
| FCR indicator | Badge/card | Efisien/normal/perlu evaluasi |
| Alert | Warning card | Data pakan abnormal atau belum dicatat |
| Recommendation | Insight card | Saran tindakan sederhana |

---

## 7. Struktur Halaman

### 7.1 Route yang Dibutuhkan

Gunakan struktur route berikut:

```txt
/app
  /feeding
    page.tsx                         # Dashboard Manajemen Pakan
    /create
      page.tsx                       # Input log pakan
    /logs
      page.tsx                       # List log pakan
    /logs/[id]
      page.tsx                       # Detail log pakan
    /logs/[id]/edit
      page.tsx                       # Edit log pakan
    /cattle/[cattleId]
      page.tsx                       # Report pakan per sapi
    /groups/[groupId]
      page.tsx                       # Report pakan per kelompok
    /reports
      page.tsx                       # Report biaya dan FCR
```

Jika project menggunakan App Router Next.js, gunakan folder `app`. Jika menggunakan Pages Router, sesuaikan struktur namun pertahankan URL.

---

## 8. Detail UI Halaman

## 8.1 Halaman Dashboard Manajemen Pakan

### Tujuan

Memberikan ringkasan cepat kondisi pakan hari ini dan performa biaya pakan.

### Komponen UI Mobile

1. Header halaman:
   - Title: `Manajemen Pakan`
   - Subtitle: `Pantau pakan, biaya, dan efisiensi ternak`
   - Button icon filter.

2. Quick action card:
   - `+ Input Pakan`
   - `Scan Sapi`
   - `Report Pakan`

3. Summary cards:
   - Total pakan hari ini: `428 Kg`
   - Biaya pakan hari ini: `Rp 812.000`
   - Sapi tercatat: `21/25`
   - Kelompok tercatat: `4 Kandang`

4. Alert section:
   - `4 sapi belum ada catatan pakan hari ini`
   - `KDG-C konsumsi rendah 18% dari rata-rata`
   - `SF-012 FCR perlu evaluasi`

5. Chart mini:
   - Grafik total pakan 7 hari.
   - Grafik biaya pakan 7 hari.

6. Feed composition card:
   - Hijauan 62%
   - Konsentrat 24%
   - Fermentasi 10%
   - Mineral 4%

7. Top cost list:
   - Sapi/kelompok dengan biaya pakan tertinggi.

### Komponen UI Desktop

1. Header + filter bar.
2. Summary cards dalam grid 4 kolom.
3. Chart pakan dan biaya.
4. Table log pakan terbaru.
5. Side panel alert.

---

## 8.2 Halaman Input Pakan

### Tujuan

Memudahkan peternak input data pakan dari ponsel secara cepat.

### Layout Mobile

Gunakan form bertahap/section sederhana.

#### Section 1 — Pilih Target

Komponen:

- Segmented control:
  - `Per Sapi`
  - `Per Kelompok`

Jika `Per Sapi`:

- Button `Scan QR Sapi`.
- Search input `Cari ID sapi...`.
- Recent cattle cards.

Jika `Per Kelompok`:

- Dropdown/card list kelompok kandang.

#### Section 2 — Info Target

Tampilkan mini card:

```txt
[Foto/Ikon]
SF-001 • Limousin
Kandang A
Bobot terakhir: 328 Kg
Status: Normal
```

Untuk kelompok:

```txt
KDG-A — Kandang A Penggemukan 1
8 sapi aktif
Rata-rata bobot: 302 Kg
```

#### Section 3 — Data Pemberian Pakan

Field:

1. Tanggal pakan.
2. Waktu pakan.
3. Jenis pakan.
4. Nama pakan.
5. Porsi pakan Kg.
6. Biaya per Kg.
7. Catatan.

#### Section 4 — Ringkasan Otomatis

Tampilkan card:

```txt
Total Pakan: 18 Kg
Biaya/Kg: Rp 1.500
Total Biaya: Rp 27.000
Estimasi per ekor: 2.25 Kg  # jika kelompok
```

#### Button Action

Sticky bottom di mobile:

- `Simpan Log Pakan`
- `Simpan Draft`
- `Batal`

### Validasi Form

1. Target wajib dipilih.
2. Tanggal wajib diisi.
3. Jenis pakan wajib dipilih.
4. Porsi wajib lebih dari 0.
5. Biaya per Kg tidak boleh kurang dari 0.
6. Jika target sapi, cattleId wajib ada.
7. Jika target kelompok, groupId wajib ada.

---

## 8.3 Halaman List Log Pakan

### Tujuan

Melihat semua riwayat pemberian pakan.

### Filter

1. Periode.
2. Sapi.
3. Kelompok kandang.
4. Jenis pakan.
5. Status log.

### Mobile Card

Setiap log ditampilkan sebagai card:

```txt
Pagi • 06 Mei 2026
SF-001 — Limousin
Hijauan • Rumput Gajah
18 Kg x Rp700
Total: Rp12.600
[Detail] [Edit]
```

Jika log kelompok:

```txt
Sore • 06 Mei 2026
KDG-A — 8 Sapi
Konsentrat Protein
64 Kg x Rp4.500
Total: Rp288.000
Estimasi/ekor: 8 Kg
[Detail] [Edit]
```

### Desktop Table Columns

| Tanggal | Waktu | Target | Jenis Pakan | Porsi | Biaya/Kg | Total | Status | Action |
|---|---|---|---|---:|---:|---:|---|---|

---

## 8.4 Halaman Detail Log Pakan

### Isi Detail

1. Header status.
2. Informasi target sapi/kelompok.
3. Detail pemberian pakan.
4. Perhitungan biaya.
5. Catatan peternak.
6. Audit info: dibuat oleh, dibuat tanggal.
7. Action:
   - Edit.
   - Void/Batalkan log.
   - Kembali.

---

## 8.5 Halaman Report Pakan Per Sapi

### Tujuan

Peternak dapat melihat apakah pakan yang diberikan kepada sapi tertentu sudah efektif.

### UI Mobile

1. Header mini profile sapi.
2. Periode selector:
   - 7 hari.
   - 30 hari.
   - Bulan ini.
   - Custom.
3. Summary cards:
   - Total pakan.
   - Total biaya.
   - Rata-rata pakan/hari.
   - Estimasi FCR.
4. Chart:
   - Grafik konsumsi pakan harian.
   - Grafik berat badan vs konsumsi pakan.
5. Feed composition:
   - Pie/bar progress berdasarkan jenis pakan.
6. Insight card:
   - `Pakan normal, pertumbuhan stabil.`
   - `Pakan tinggi tetapi ADG rendah, cek kesehatan.`
7. Timeline pakan.

### Data Dummy Contoh

```txt
SF-001
Total pakan 30 hari: 540 Kg
Total biaya pakan: Rp 1.124.000
Rata-rata pakan/hari: 18 Kg
Kenaikan berat 30 hari: 31 Kg
FCR: 17.4
Status: Perlu evaluasi ringan
```

---

## 8.6 Halaman Report Pakan Per Kelompok

### Tujuan

Owner atau mandor dapat melihat konsumsi dan biaya pakan per kandang.

### UI

1. Header kelompok kandang.
2. Summary:
   - Jumlah sapi.
   - Total pakan.
   - Total biaya.
   - Rata-rata biaya/ekor.
   - Rata-rata pakan/ekor.
3. Chart konsumsi harian.
4. Komposisi jenis pakan.
5. Ranking sapi dalam kelompok berdasarkan estimasi performa.
6. Alert kelompok.

---

## 8.7 Halaman Report Biaya dan FCR

### Tujuan

Membantu owner melihat biaya produksi pakan dan efisiensi.

### Komponen

1. Total biaya pakan bulan ini.
2. Biaya pakan per Kg kenaikan berat.
3. Estimasi FCR per sapi.
4. Ranking efisiensi:
   - Paling efisien.
   - Normal.
   - Perlu evaluasi.
5. Chart biaya pakan per hari.
6. Chart FCR per sapi.
7. Export button dummy.

---

## 9. Kalkulasi yang Dibutuhkan di Frontend Demo

### 9.1 Total Biaya Pakan

```ts
const totalCost = portionKg * costPerKg;
```

### 9.2 Estimasi Pakan Per Ekor untuk Kelompok

```ts
const portionPerCattle = totalGroupPortionKg / totalCattleInGroup;
```

### 9.3 Estimasi Biaya Per Ekor untuk Kelompok

```ts
const costPerCattle = totalGroupCost / totalCattleInGroup;
```

### 9.4 Total Pakan Per Periode

```ts
const totalFeedKg = logs.reduce((sum, log) => sum + log.portionKg, 0);
```

### 9.5 Total Biaya Per Periode

```ts
const totalFeedCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
```

### 9.6 Average Daily Feed

```ts
const avgDailyFeed = totalFeedKg / totalDays;
```

### 9.7 FCR

```ts
const fcr = totalFeedKg / weightGainKg;
```

Jika `weightGainKg <= 0`, tampilkan status `Tidak dapat dihitung`.

### 9.8 Feed Efficiency Label

Contoh rule demo:

```ts
if (fcr <= 12) return 'Efisien';
if (fcr <= 18) return 'Normal';
return 'Perlu Evaluasi';
```

Catatan: angka bisa disesuaikan kemudian berdasarkan standar peternakan yang digunakan.

---

## 10. Dummy Data Feeding Logs

Buat seed dummy minimal untuk demo UI. Gunakan sapi dari seed data 25 sapi pada modul Master Data Sapi.

### 10.1 Contoh Cattle IDs

Gunakan ID:

```txt
SF-001 sampai SF-025
```

### 10.2 Contoh Feeding Logs

```ts
export const feedingLogs = [
  {
    id: 'FL-0001',
    feedingDate: '2026-05-01',
    feedingTime: 'Pagi',
    targetType: 'SAPI',
    cattleId: 'SF-001',
    groupId: null,
    feedType: 'HIJAUAN',
    feedName: 'Rumput Gajah',
    portionKg: 18,
    costPerKg: 700,
    totalCost: 12600,
    notes: 'Pakan habis normal',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-01T07:00:00'
  },
  {
    id: 'FL-0002',
    feedingDate: '2026-05-01',
    feedingTime: 'Sore',
    targetType: 'SAPI',
    cattleId: 'SF-001',
    groupId: null,
    feedType: 'KONSENTRAT',
    feedName: 'Konsentrat Protein',
    portionKg: 4,
    costPerKg: 4500,
    totalCost: 18000,
    notes: 'Dicampur mineral',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-01T16:30:00'
  },
  {
    id: 'FL-0003',
    feedingDate: '2026-05-01',
    feedingTime: 'Pagi',
    targetType: 'KELOMPOK',
    cattleId: null,
    groupId: 'KDG-A',
    feedType: 'HIJAUAN',
    feedName: 'Rumput Gajah',
    portionKg: 144,
    costPerKg: 700,
    totalCost: 100800,
    notes: 'Distribusi untuk 8 sapi',
    status: 'Posted',
    createdBy: 'Admin Farm',
    createdAt: '2026-05-01T07:15:00'
  },
  {
    id: 'FL-0004',
    feedingDate: '2026-05-01',
    feedingTime: 'Sore',
    targetType: 'KELOMPOK',
    cattleId: null,
    groupId: 'KDG-A',
    feedType: 'KONSENTRAT',
    feedName: 'Konsentrat Penggemukan',
    portionKg: 40,
    costPerKg: 4500,
    totalCost: 180000,
    notes: 'Pakan sore kelompok A',
    status: 'Posted',
    createdBy: 'Admin Farm',
    createdAt: '2026-05-01T16:45:00'
  },
  {
    id: 'FL-0005',
    feedingDate: '2026-05-02',
    feedingTime: 'Pagi',
    targetType: 'SAPI',
    cattleId: 'SF-012',
    groupId: null,
    feedType: 'FERMENTASI',
    feedName: 'Fermentasi Gedebog',
    portionKg: 12,
    costPerKg: 1200,
    totalCost: 14400,
    notes: 'Sisa sedikit, pantau nafsu makan',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-02T07:20:00'
  },
  {
    id: 'FL-0006',
    feedingDate: '2026-05-02',
    feedingTime: 'Sore',
    targetType: 'SAPI',
    cattleId: 'SF-012',
    groupId: null,
    feedType: 'KONSENTRAT',
    feedName: 'Konsentrat Protein',
    portionKg: 3,
    costPerKg: 4500,
    totalCost: 13500,
    notes: 'Pakan tidak habis 100%',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-02T16:40:00'
  },
  {
    id: 'FL-0007',
    feedingDate: '2026-05-02',
    feedingTime: 'Pagi',
    targetType: 'KELOMPOK',
    cattleId: null,
    groupId: 'KDG-B',
    feedType: 'SILASE',
    feedName: 'Silase Jagung',
    portionKg: 112,
    costPerKg: 1800,
    totalCost: 201600,
    notes: 'Distribusi untuk 7 sapi',
    status: 'Posted',
    createdBy: 'Admin Farm',
    createdAt: '2026-05-02T07:05:00'
  },
  {
    id: 'FL-0008',
    feedingDate: '2026-05-03',
    feedingTime: 'Pagi',
    targetType: 'KELOMPOK',
    cattleId: null,
    groupId: 'KDG-C',
    feedType: 'HIJAUAN',
    feedName: 'Rumput Lapangan',
    portionKg: 70,
    costPerKg: 600,
    totalCost: 42000,
    notes: 'Kelompok perawatan, konsumsi lebih rendah',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-03T07:10:00'
  },
  {
    id: 'FL-0009',
    feedingDate: '2026-05-03',
    feedingTime: 'Sore',
    targetType: 'KELOMPOK',
    cattleId: null,
    groupId: 'KDG-D',
    feedType: 'KONSENTRAT',
    feedName: 'Konsentrat Finisher',
    portionKg: 35,
    costPerKg: 5200,
    totalCost: 182000,
    notes: 'Kelompok siap jual',
    status: 'Posted',
    createdBy: 'Admin Farm',
    createdAt: '2026-05-03T16:30:00'
  },
  {
    id: 'FL-0010',
    feedingDate: '2026-05-04',
    feedingTime: 'Pagi',
    targetType: 'SAPI',
    cattleId: 'SF-020',
    groupId: null,
    feedType: 'MINERAL',
    feedName: 'Mineral Mix',
    portionKg: 0.3,
    costPerKg: 9000,
    totalCost: 2700,
    notes: 'Tambahan mineral',
    status: 'Posted',
    createdBy: 'Mandor Kandang',
    createdAt: '2026-05-04T07:30:00'
  }
];
```

Developer boleh menambahkan generator dummy untuk membuat log 7-30 hari agar chart terlihat hidup.

---

## 11. Dummy Insight Rules

Untuk kebutuhan demo, tampilkan insight sederhana berdasarkan data dummy.

### 11.1 Belum Input Pakan Hari Ini

Jika sapi/kelompok tidak memiliki log hari ini:

```txt
Belum ada catatan pakan hari ini.
```

### 11.2 Konsumsi Rendah

Jika pakan hari ini lebih rendah 20% dari rata-rata 7 hari:

```txt
Konsumsi pakan lebih rendah dari rata-rata. Pantau nafsu makan dan kondisi kesehatan.
```

### 11.3 Biaya Tinggi

Jika biaya hari ini lebih tinggi 25% dari rata-rata 7 hari:

```txt
Biaya pakan meningkat. Cek jenis pakan dan perubahan harga pakan.
```

### 11.4 FCR Buruk

Jika FCR > 18:

```txt
Efisiensi pakan perlu dievaluasi. Bandingkan dengan ADG dan riwayat kesehatan sapi.
```

---

## 12. Komponen Frontend yang Dibutuhkan

Buat komponen reusable:

```txt
components/feeding/
  FeedingDashboardCards.tsx
  FeedingQuickActions.tsx
  FeedingAlertCard.tsx
  FeedingLogCard.tsx
  FeedingLogTable.tsx
  FeedingForm.tsx
  FeedingTargetSelector.tsx
  FeedingCostSummary.tsx
  FeedCompositionChart.tsx
  FeedTrendChart.tsx
  FcrIndicatorCard.tsx
  CattleFeedReport.tsx
  GroupFeedReport.tsx
  FeedingFilterBar.tsx
  FeedingMobileBottomAction.tsx
```

---

## 13. State Management Demo

Untuk tahap UI demo, data boleh disimpan di:

1. Static file TypeScript.
2. React state.
3. Local storage untuk simulasi CRUD.

Rekomendasi struktur:

```txt
/lib/dummy/cattle.ts
/lib/dummy/feed-types.ts
/lib/dummy/feeding-logs.ts
/lib/dummy/groups.ts
/lib/feeding/calculations.ts
/lib/feeding/insights.ts
/types/feeding.ts
```

---

## 14. TypeScript Types

Buat tipe minimal:

```ts
export type FeedingTargetType = 'SAPI' | 'KELOMPOK';
export type FeedingStatus = 'Draft' | 'Posted' | 'Voided';

export interface FeedingLog {
  id: string;
  feedingDate: string;
  feedingTime: 'Pagi' | 'Siang' | 'Sore' | 'Malam' | 'Custom';
  targetType: FeedingTargetType;
  cattleId?: string | null;
  groupId?: string | null;
  feedType: string;
  feedName: string;
  portionKg: number;
  costPerKg: number;
  totalCost: number;
  notes?: string;
  status: FeedingStatus;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedTypeMaster {
  code: string;
  name: string;
  defaultFeedName: string;
  defaultCostPerKg: number;
}

export interface FeedingSummary {
  totalFeedKg: number;
  totalCost: number;
  averageDailyFeedKg: number;
  fcr?: number | null;
  efficiencyLabel: 'Efisien' | 'Normal' | 'Perlu Evaluasi' | 'Tidak Dapat Dihitung';
}
```

---

## 15. Integrasi dengan Modul Lain

### 15.1 Integrasi dengan Master Data Sapi

Modul pakan harus mengambil:

1. ID sapi.
2. Foto sapi.
3. Jenis sapi.
4. Kandang/kelompok.
5. Status aktif sapi.

### 15.2 Integrasi dengan Monitoring Pertumbuhan

Untuk menghitung FCR, modul ini membutuhkan:

1. Berat awal periode.
2. Berat akhir periode.
3. Selisih berat badan.
4. ADG.

### 15.3 Integrasi dengan Kesehatan & Medis

Jika sapi sedang sakit atau dalam perawatan, report pakan harus menampilkan warning:

```txt
Sapi sedang dalam pemantauan kesehatan. Penurunan konsumsi pakan bisa terkait kondisi medis.
```

### 15.4 Integrasi dengan Dashboard Utama

Dashboard utama SmartFarm harus bisa menampilkan:

1. Total biaya pakan bulan ini.
2. Sapi dengan FCR buruk.
3. Pakan belum tercatat hari ini.
4. Komposisi biaya produksi.

### 15.5 Integrasi dengan Penjualan

Biaya pakan akan menjadi bagian dari total biaya produksi saat menghitung proyeksi keuntungan.

```txt
Total Biaya Produksi = Harga Beli + Total Biaya Pakan + Biaya Medis + Biaya Operasional Lain
```

---

## 16. Empty State, Loading State, Error State

### 16.1 Empty State Dashboard

Jika belum ada data:

```txt
Belum ada data pakan.
Mulai catat pemberian pakan pertama agar biaya dan efisiensi ternak dapat dipantau.
[Input Pakan Sekarang]
```

### 16.2 Empty State Report Sapi

```txt
Belum ada riwayat pakan untuk sapi ini.
Catat pakan harian untuk mulai melihat report konsumsi dan efisiensi.
```

### 16.3 Error State

```txt
Data pakan gagal dimuat.
Coba muat ulang halaman atau periksa koneksi.
```

### 16.4 Loading State

Gunakan skeleton card untuk:

1. Summary card.
2. Chart.
3. List log pakan.
4. Detail report.

---

## 17. Mobile UI Requirements

Karena digunakan peternak di lapangan, pastikan:

1. Tombol minimal tinggi 44px.
2. Form field besar dan jelas.
3. Sticky bottom action pada halaman input.
4. Card lebih dominan daripada table.
5. Gunakan label sederhana, bukan istilah terlalu teknis.
6. FCR boleh ditampilkan dengan penjelasan kecil:

```txt
FCR menunjukkan seberapa banyak pakan dibutuhkan untuk menaikkan berat sapi. Semakin rendah, semakin efisien.
```

7. Gunakan badge warna/indikator:
   - Efisien.
   - Normal.
   - Perlu Evaluasi.
8. Hindari tampilan form terlalu panjang tanpa section.

---

## 18. Desktop UI Requirements

Untuk admin/owner:

1. Gunakan table untuk log pakan.
2. Ada filter lengkap.
3. Ada summary biaya.
4. Ada chart tren.
5. Ada ranking efisiensi.
6. Action edit/detail tersedia di table.

---

## 19. Acceptance Criteria

### 19.1 Dashboard

- User dapat membuka halaman Manajemen Pakan.
- Dashboard menampilkan summary pakan hari ini.
- Dashboard menampilkan total biaya pakan.
- Dashboard menampilkan alert pakan.
- Dashboard responsive di mobile dan desktop.

### 19.2 Input Pakan

- User dapat memilih target per sapi atau per kelompok.
- User dapat mengisi jenis pakan, porsi, biaya per Kg, dan catatan.
- Sistem menghitung total biaya otomatis.
- Sistem menampilkan ringkasan sebelum simpan.
- Data baru muncul pada list log setelah disimpan dalam mode demo/local state.

### 19.3 List Log

- User dapat melihat riwayat pakan.
- User dapat filter berdasarkan periode, sapi, kelompok, dan jenis pakan.
- User dapat membuka detail log.
- User dapat edit log.
- User dapat void/delete log demo.

### 19.4 Report Per Sapi

- User dapat melihat total konsumsi pakan per sapi.
- User dapat melihat total biaya pakan per sapi.
- User dapat melihat chart konsumsi pakan.
- User dapat melihat estimasi FCR jika data berat tersedia.
- User dapat melihat insight sederhana.

### 19.5 Report Per Kelompok

- User dapat melihat total konsumsi dan biaya pakan per kelompok.
- User dapat melihat estimasi pakan per ekor.
- User dapat melihat komposisi jenis pakan.

---

## 20. Instruksi untuk Google Antigravity

Bangun UI/UX modul **Manajemen Pakan SmartFarm** menggunakan Next.js dan Tailwind CSS dengan pendekatan mobile-first. Modul ini harus menjadi bagian dari sistem SmartFarm yang sudah memiliki authentication, layout dashboard, QR scan, Master Data Sapi, Monitoring Pertumbuhan, dan Kesehatan & Medis.

Fokus pekerjaan:

1. Buat halaman `/feeding` sebagai dashboard manajemen pakan.
2. Buat halaman `/feeding/create` untuk input pakan harian.
3. Buat halaman `/feeding/logs` untuk list log pakan.
4. Buat halaman `/feeding/logs/[id]` untuk detail log pakan.
5. Buat halaman `/feeding/logs/[id]/edit` untuk edit log pakan.
6. Buat halaman `/feeding/cattle/[cattleId]` untuk report pakan per sapi.
7. Buat halaman `/feeding/groups/[groupId]` untuk report pakan per kelompok.
8. Buat halaman `/feeding/reports` untuk report biaya pakan dan FCR.
9. Gunakan dummy data cattle 25 sapi dari modul Master Data Sapi.
10. Tambahkan dummy data kelompok kandang dan feeding logs.
11. Buat kalkulasi frontend untuk total biaya pakan, rata-rata pakan harian, estimasi biaya per ekor, dan FCR.
12. Buat UI mobile yang sangat mudah digunakan peternak di kandang.
13. Gunakan card layout untuk mobile dan table layout untuk desktop.
14. Gunakan chart sederhana untuk tren pakan, biaya pakan, dan komposisi jenis pakan.
15. Siapkan komponen reusable agar mudah diintegrasikan dengan backend tahap 2.

UI harus terlihat modern, bersih, agriculture-tech, dan sesuai brand SmartFarm. Gunakan warna hijau natural, white space yang nyaman, rounded card, soft shadow, icon sederhana, dan tombol aksi besar.

Jangan buat backend nyata dulu. Gunakan dummy data/local state/local storage untuk simulasi CRUD.

---

## 21. Catatan Pengembangan Tahap Backend Nanti

Pada tahap backend, modul ini akan membutuhkan tabel:

1. `feed_types`
2. `feeding_logs`
3. `feeding_groups`
4. `cattle_group_members`
5. `feeding_cost_summaries` opsional/materialized summary

Relasi utama:

```txt
Cattle 1..n FeedingLog
CattleGroup 1..n FeedingLog
User 1..n FeedingLog
```

Modul backend juga perlu endpoint:

```txt
GET    /api/feeding/dashboard
GET    /api/feeding/logs
POST   /api/feeding/logs
GET    /api/feeding/logs/:id
PATCH  /api/feeding/logs/:id
DELETE /api/feeding/logs/:id
GET    /api/feeding/cattle/:cattleId/report
GET    /api/feeding/groups/:groupId/report
GET    /api/feeding/reports/fcr
```

Namun endpoint tersebut belum perlu dibuat pada Step 1.

---

## 22. Kesimpulan Modul

Modul Manajemen Pakan adalah modul penting untuk menghubungkan biaya produksi dengan pertumbuhan sapi. Modul ini bukan hanya mencatat pakan, tetapi juga membantu peternak memahami apakah pakan yang diberikan sudah efisien atau belum.

Pada UI demo Step 1, fokus utama adalah membuat pengalaman input yang cepat di ponsel, dashboard yang mudah dibaca, report per sapi yang informatif, dan fondasi data yang siap diintegrasikan dengan backend SmartFarm pada tahap berikutnya.
