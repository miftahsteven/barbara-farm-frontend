# PRD UI/UX SmartFarm — Modul Monitoring Pertumbuhan

**Project:** SmartFarm / Barbara Farm  
**Modul:** Monitoring Pertumbuhan / Log Penimbangan  
**Tahap:** Step 1 — Frontend UI/UX Demo  
**Target User:** Peternak, mandor kandang, admin farm, owner  
**Platform:** Web responsive, mobile-first  
**Stack Frontend:** Next.js, Tailwind CSS, TypeScript, Recharts, Lucide Icons, QR-ready routing  
**Backend Status:** Belum integrasi API, gunakan dummy data/seed data lokal  

---

## 1. Tujuan Modul

Modul **Monitoring Pertumbuhan** digunakan untuk mencatat, melihat, dan menganalisis perkembangan berat badan sapi secara berkala. Modul ini menjadi inti dari SmartFarm karena membantu peternak mengetahui apakah sapi tumbuh normal, lambat, stagnan, atau berisiko sakit.

Modul ini harus mudah digunakan di ponsel karena peternak kemungkinan besar melakukan pencatatan langsung di kandang setelah proses timbang.

Output utama dari modul ini:

1. Peternak dapat mencatat hasil timbang sapi.
2. Peternak dapat melihat grafik perkembangan berat per sapi.
3. Peternak dapat melihat ADG / Average Daily Gain.
4. Sistem menampilkan status pertumbuhan sapi: bagus, normal, lambat, atau perlu perhatian.
5. Owner dapat melihat ringkasan pertumbuhan seluruh sapi di dashboard report.

---

## 2. Prinsip UI/UX

Gunakan referensi visual dari gambar login Barbara Farm yang sudah diberikan:

- Warna utama hijau tua: `#065F46` atau sejenis emerald/deep green.
- Warna aksen hijau muda: `#10B981`.
- Background soft: `#F8FAF9`, `#EEF7F2`, putih bersih.
- Bentuk card modern dengan rounded besar.
- UI harus clean, natural, dan familiar untuk peternak.
- Mobile-first: tampilan utama harus nyaman di layar HP.
- Hindari tabel kompleks di mobile, gunakan **cow growth card**.
- Desktop boleh menggunakan table + chart + filter advanced.

---

## 3. Analisis Flow Modul Monitoring Pertumbuhan

### 3.1 Flow Utama: Melihat Report Pertumbuhan

1. User login ke SmartFarm.
2. User membuka menu **Monitoring Pertumbuhan**.
3. Sistem menampilkan halaman ringkasan:
   - Total sapi aktif.
   - Rata-rata berat terkini.
   - Rata-rata ADG.
   - Jumlah sapi dengan pertumbuhan lambat.
   - Jumlah sapi belum ditimbang bulan ini.
4. User melihat daftar sapi dalam bentuk card mobile.
5. User memilih salah satu sapi.
6. Sistem membuka halaman detail pertumbuhan sapi.
7. User melihat:
   - Foto sapi.
   - ID Sapi / QR Code ID.
   - Berat awal.
   - Berat terakhir.
   - Selisih berat.
   - ADG.
   - Grafik berat badan.
   - Riwayat penimbangan.
   - Rekomendasi sederhana.

### 3.2 Flow Input Log Penimbangan Baru

1. User klik tombol **+ Catat Timbang**.
2. User memilih metode:
   - Scan QR sapi.
   - Pilih dari daftar sapi.
   - Input manual ID sapi.
3. Sistem menampilkan identitas singkat sapi.
4. User mengisi data:
   - Tanggal timbang.
   - Berat badan sekarang.
   - Lingkar dada opsional.
   - Tinggi badan opsional.
   - BCS 1-5.
   - Catatan kondisi.
5. User klik **Simpan Log Timbang**.
6. Sistem menghitung otomatis:
   - Selisih berat dari log sebelumnya.
   - Jumlah hari antar timbang.
   - ADG.
   - Status pertumbuhan.
7. Sistem menampilkan success state.
8. User diarahkan ke detail pertumbuhan sapi.

### 3.3 Flow Edit Log Penimbangan

1. User masuk ke detail sapi.
2. User membuka tab **Riwayat Timbang**.
3. User memilih salah satu log.
4. User klik **Edit**.
5. Sistem menampilkan form edit.
6. User mengubah data timbang.
7. Sistem menghitung ulang ADG dan status.
8. Sistem menyimpan perubahan dummy state.

### 3.4 Flow Hapus Log Penimbangan

1. User membuka detail log timbang.
2. User klik **Hapus**.
3. Sistem menampilkan confirmation modal:
   - “Yakin ingin menghapus log timbang ini?”
   - Jelaskan bahwa grafik dan perhitungan ADG akan berubah.
4. User konfirmasi.
5. Sistem menghapus log dari dummy state.
6. Sistem menghitung ulang ringkasan pertumbuhan sapi.

### 3.5 Flow Alert Pertumbuhan Lambat

1. Sistem membandingkan ADG sapi dengan target minimal.
2. Jika ADG di bawah target, card sapi diberi status **Perlu Perhatian**.
3. User dapat klik card tersebut.
4. Detail sapi menampilkan alert:
   - “Kenaikan berat sapi ini di bawah target.”
   - “Cek pakan, kesehatan, dan kondisi kandang.”
5. User dapat klik shortcut ke:
   - Modul Kesehatan.
   - Modul Feeding.

---

## 4. Struktur Menu

Tambahkan menu pada sidebar/mobile bottom navigation:

```txt
Dashboard
Master Data Sapi
QR Scan
Monitoring Pertumbuhan
Kesehatan & Medis
Manajemen Pakan
Penjualan
Laporan
Profil
```

Untuk mobile, menu utama yang ditampilkan di bottom navigation:

```txt
Dashboard | Sapi | Scan | Growth | Profil
```

---

## 5. Route Halaman

Gunakan route berikut:

```txt
/growth
/growth/add
/growth/cow/[cowId]
/growth/cow/[cowId]/add-log
/growth/log/[logId]/edit
```

Optional route untuk demo:

```txt
/growth/alerts
/growth/report
```

---

## 6. Data Field Monitoring Pertumbuhan

### 6.1 Entity: GrowthLog

```ts
type GrowthLog = {
  id: string;
  cowId: string;
  weighDate: string;
  weightKg: number;
  chestCircumferenceCm?: number;
  heightCm?: number;
  bcs: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  previousWeightKg?: number;
  weightGainKg?: number;
  daysFromPrevious?: number;
  adgKgPerDay?: number;
  status: 'excellent' | 'normal' | 'slow' | 'attention';
  createdAt: string;
  updatedAt: string;
};
```

### 6.2 Field Input Form

| Field | Tipe | Wajib | Catatan UI |
|---|---|---:|---|
| Sapi | Select/Search/QR | Ya | Bisa scan QR atau pilih dari daftar |
| Tanggal Timbang | Date picker | Ya | Default hari ini |
| Berat Badan | Number | Ya | Satuan Kg, input besar dan mudah ditekan |
| Lingkar Dada | Number | Tidak | Satuan cm |
| Tinggi Badan | Number | Tidak | Satuan cm |
| BCS | Segmented/rating 1-5 | Ya | Gunakan visual sederhana |
| Catatan | Textarea | Tidak | Contoh: nafsu makan baik, baru pindah kandang |

---

## 7. Rumus dan Logika Demo

### 7.1 ADG / Average Daily Gain

```txt
ADG = (Berat Sekarang - Berat Sebelumnya) / Jumlah Hari
```

Contoh:

```txt
Berat sebelumnya: 300 kg
Berat sekarang: 315 kg
Jarak timbang: 15 hari
ADG = (315 - 300) / 15 = 1 kg/hari
```

### 7.2 Status Pertumbuhan

Gunakan rule dummy berikut:

| ADG | Status | Warna | Label |
|---:|---|---|---|
| >= 1.2 kg/hari | excellent | Emerald | Sangat Baik |
| 0.8 - 1.19 kg/hari | normal | Green | Normal |
| 0.4 - 0.79 kg/hari | slow | Amber | Lambat |
| < 0.4 kg/hari | attention | Red | Perlu Perhatian |

### 7.3 BCS / Body Condition Score

| BCS | Label | Keterangan |
|---:|---|---|
| 1 | Sangat Kurus | Butuh perhatian serius |
| 2 | Kurus | Perlu peningkatan pakan |
| 3 | Ideal | Kondisi baik |
| 4 | Gemuk | Monitor pakan |
| 5 | Terlalu Gemuk | Risiko metabolik |

---

## 8. Desain Halaman Mobile

### 8.1 Halaman `/growth` — Growth Overview Mobile

Layout mobile:

```txt
[Header]
Monitoring Pertumbuhan
Pantau kenaikan berat sapi secara berkala

[Search bar: Cari ID / nama sapi]
[Filter chips: Semua | Perlu Perhatian | Belum Ditimbang | ADG Terbaik]

[Summary Cards - horizontal scroll]
- Total Sapi Aktif
- Rata-rata ADG
- Perlu Perhatian
- Belum Timbang

[Quick Action]
+ Catat Timbang
Scan QR Timbang

[Daftar Card Sapi]
Card 1
Card 2
Card 3
...
```

### 8.2 Komponen Cow Growth Card Mobile

Setiap sapi ditampilkan sebagai card ringkas:

```txt
[Foto Sapi]  SF-0001 Limousin Jantan
            Kandang A-01
            Berat terakhir: 342 kg
            ADG: 0.92 kg/hari
            Status: Normal

[Mini progress bar]
[Terakhir timbang: 04 Mei 2026]
[Button: Detail]
```

Elemen penting:

- Foto kecil rounded.
- ID sapi tebal.
- Jenis sapi dan jenis kelamin.
- Berat terakhir besar.
- ADG sebagai badge.
- Status warna.
- Tombol detail mudah ditekan.

### 8.3 Empty State

Jika belum ada data timbang:

```txt
Belum Ada Data Penimbangan
Mulai catat berat sapi pertama Anda agar SmartFarm dapat menghitung pertumbuhan dan ADG.
[+ Catat Timbang]
```

---

## 9. Desain Halaman Detail Sapi `/growth/cow/[cowId]`

### 9.1 Layout Mobile Detail

```txt
[Back]
[Hero Cow Profile]
Foto sapi
ID Sapi: SF-0001
Jenis: Limousin
Kandang: A-01
Status: Normal

[Metric Cards 2x2]
Berat Awal
Berat Terakhir
Total Kenaikan
ADG

[Growth Chart]
Grafik berat badan per tanggal

[Insight Card]
Pertumbuhan sapi ini normal. Pertahankan pola pakan dan jadwal timbang.

[Tabs]
- Riwayat Timbang
- BCS
- Catatan

[Button Sticky Bottom]
+ Catat Timbang Baru
```

### 9.2 Metric Cards

Gunakan card besar dengan angka dominan:

1. **Berat Awal:** 280 kg.
2. **Berat Terakhir:** 342 kg.
3. **Total Kenaikan:** +62 kg.
4. **ADG:** 0.92 kg/hari.

### 9.3 Chart

Gunakan `recharts`:

- LineChart untuk perkembangan berat.
- X-axis: tanggal timbang.
- Y-axis: berat kg.
- Tooltip menampilkan tanggal, berat, ADG.
- Mobile height sekitar 220px.
- Desktop height 320px.

### 9.4 Riwayat Timbang

Di mobile gunakan timeline list:

```txt
04 Mei 2026
342 kg | BCS 3 | ADG 0.92 kg/hari
Catatan: Nafsu makan baik

20 Apr 2026
329 kg | BCS 3 | ADG 0.86 kg/hari
Catatan: Normal
```

Setiap item memiliki action menu:

```txt
Detail | Edit | Hapus
```

---

## 10. Halaman Tambah Log Timbang `/growth/add` atau `/growth/cow/[cowId]/add-log`

### 10.1 Mobile Form

Form harus sangat sederhana dan dapat digunakan di kandang.

```txt
[Header]
Catat Timbang Sapi

[Pilih Sapi]
- Scan QR
- Cari ID sapi

[Preview Sapi]
Foto, ID, jenis, berat terakhir

[Form]
Tanggal Timbang
Berat Badan Sekarang
Lingkar Dada
Tinggi Badan
BCS 1 2 3 4 5
Catatan

[Calculation Preview]
Selisih Berat: +12 kg
Jarak Hari: 14 hari
Estimasi ADG: 0.86 kg/hari
Status: Normal

[Sticky Button]
Simpan Log Timbang
```

### 10.2 UX Input Berat

Field berat harus dibuat besar:

```txt
[ 342 ] Kg
```

Gunakan numeric keyboard pada mobile:

```html
<input inputMode="decimal" />
```

### 10.3 BCS Selector

Gunakan segmented button:

```txt
1 Sangat Kurus | 2 Kurus | 3 Ideal | 4 Gemuk | 5 Terlalu Gemuk
```

Default pilihan: 3.

---

## 11. Desktop View

Untuk desktop, gunakan layout enterprise:

```txt
[Sidebar] [Topbar]

Monitoring Pertumbuhan
[Summary Cards]

[Left: Table daftar sapi]
[Right: Chart rata-rata ADG / alert panel]

[Advanced Filter]
Jenis Sapi | Kandang | Status | Tanggal Timbang | Range ADG

[Data Table]
ID Sapi | Jenis | Berat Awal | Berat Terakhir | ADG | Status | Terakhir Timbang | Action
```

Action table:

```txt
View Detail | Add Log | Edit Latest Log
```

---

## 12. Komponen UI yang Dibutuhkan

Buat komponen reusable:

```txt
/components/growth/GrowthSummaryCard.tsx
/components/growth/CowGrowthCard.tsx
/components/growth/GrowthStatusBadge.tsx
/components/growth/GrowthLineChart.tsx
/components/growth/GrowthLogTimeline.tsx
/components/growth/GrowthLogForm.tsx
/components/growth/BCSSelector.tsx
/components/growth/CowSelector.tsx
/components/growth/GrowthInsightCard.tsx
/components/growth/GrowthAlertPanel.tsx
/components/growth/GrowthFilterBar.tsx
```

---

## 13. Dummy Data / Seed Data

Gunakan 25 sapi dari modul Master Data Sapi sebelumnya. Tambahkan growth log minimal 4-6 data timbang per sapi.

### 13.1 Contoh Seed Data Growth Log

Buat file:

```txt
/src/data/growthLogs.ts
```

Contoh struktur:

```ts
export const growthLogs = [
  {
    id: 'GL-0001',
    cowId: 'SF-0001',
    weighDate: '2026-01-10',
    weightKg: 280,
    chestCircumferenceCm: 145,
    heightCm: 118,
    bcs: 3,
    notes: 'Berat awal setelah masuk kandang.',
    status: 'normal',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'GL-0002',
    cowId: 'SF-0001',
    weighDate: '2026-01-25',
    weightKg: 294,
    chestCircumferenceCm: 148,
    heightCm: 119,
    bcs: 3,
    notes: 'Nafsu makan baik.',
    status: 'normal',
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-01-25T08:00:00Z'
  },
  {
    id: 'GL-0003',
    cowId: 'SF-0001',
    weighDate: '2026-02-10',
    weightKg: 310,
    chestCircumferenceCm: 152,
    heightCm: 120,
    bcs: 3,
    notes: 'Pertumbuhan stabil.',
    status: 'excellent',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z'
  }
];
```

### 13.2 Generate Otomatis Seed 25 Sapi

Untuk demo, buat helper generator:

```ts
const cowIds = Array.from({ length: 25 }, (_, index) =>
  `SF-${String(index + 1).padStart(4, '0')}`
);

export function generateGrowthLogs() {
  return cowIds.flatMap((cowId, cowIndex) => {
    const baseWeight = 240 + cowIndex * 4;
    const dates = [
      '2026-01-10',
      '2026-01-25',
      '2026-02-10',
      '2026-02-25',
      '2026-03-12',
      '2026-03-28'
    ];

    return dates.map((date, logIndex) => {
      const gainPattern = cowIndex % 5 === 0 ? 5 : cowIndex % 4 === 0 ? 9 : 13;
      const weightKg = baseWeight + logIndex * gainPattern;

      return {
        id: `GL-${String(cowIndex * dates.length + logIndex + 1).padStart(4, '0')}`,
        cowId,
        weighDate: date,
        weightKg,
        chestCircumferenceCm: 135 + cowIndex + logIndex * 2,
        heightCm: 112 + Math.floor(cowIndex / 2),
        bcs: logIndex < 2 ? 3 : cowIndex % 6 === 0 ? 2 : 3,
        notes: logIndex === 0 ? 'Penimbangan awal.' : 'Penimbangan rutin.',
        status: 'normal',
        createdAt: `${date}T08:00:00Z`,
        updatedAt: `${date}T08:00:00Z`
      };
    });
  });
}
```

Setelah data dibuat, hitung ADG di helper terpisah agar UI selalu konsisten.

---

## 14. Helper Function

Buat file:

```txt
/src/lib/growth.ts
```

Isi fungsi:

```ts
export function calculateADG(currentWeight: number, previousWeight: number, days: number) {
  if (!previousWeight || !days || days <= 0) return 0;
  return Number(((currentWeight - previousWeight) / days).toFixed(2));
}

export function getGrowthStatus(adg: number) {
  if (adg >= 1.2) return 'excellent';
  if (adg >= 0.8) return 'normal';
  if (adg >= 0.4) return 'slow';
  return 'attention';
}

export function getGrowthStatusLabel(status: string) {
  const labels: Record<string, string> = {
    excellent: 'Sangat Baik',
    normal: 'Normal',
    slow: 'Lambat',
    attention: 'Perlu Perhatian'
  };
  return labels[status] || 'Tidak Diketahui';
}
```

---

## 15. Report yang Harus Ditampilkan

### 15.1 Report Per Sapi

Di halaman detail sapi tampilkan:

1. Grafik berat badan.
2. ADG terakhir.
3. ADG rata-rata.
4. Total kenaikan berat.
5. Riwayat BCS.
6. Tanggal timbang terakhir.
7. Alert jika pertumbuhan lambat.

### 15.2 Report Semua Sapi

Di halaman overview tampilkan:

1. Top 5 sapi dengan ADG tertinggi.
2. Sapi dengan ADG terendah.
3. Sapi belum ditimbang lebih dari 30 hari.
4. Rata-rata ADG semua sapi.
5. Distribusi status pertumbuhan.

### 15.3 Insight Sederhana untuk Peternak

Gunakan bahasa yang mudah dipahami:

```txt
Pertumbuhan sapi ini bagus. Berat naik stabil dalam 3 kali penimbangan terakhir.
```

```txt
Kenaikan berat sapi ini mulai melambat. Periksa pakan, kesehatan, dan kondisi kandang.
```

```txt
Sapi ini belum ditimbang lebih dari 30 hari. Segera lakukan penimbangan ulang.
```

---

## 16. Filter dan Search

### Mobile Filter Chips

```txt
Semua
Normal
Perlu Perhatian
ADG Terbaik
Belum Ditimbang
```

### Desktop Filter

```txt
Search ID sapi
Jenis sapi
Kandang
Status pertumbuhan
Range tanggal timbang
Range ADG
BCS
```

---

## 17. State UI

Wajib buat state berikut:

1. Loading state.
2. Empty state.
3. Error state.
4. Success save state.
5. Confirmation delete modal.
6. No camera permission state untuk scan QR.
7. No growth data state di detail sapi.

---

## 18. Integrasi dengan Modul Lain

Walaupun backend belum dibuat, UI harus disiapkan untuk terhubung dengan modul lain:

### 18.1 Master Data Sapi

Monitoring Pertumbuhan mengambil identitas dari Master Data Sapi:

```txt
cowId, foto, jenis, jenis kelamin, kandang, berat awal, tanggal masuk
```

### 18.2 QR Scan

Saat user scan QR sapi:

```txt
/qr-scan -> /growth/cow/SF-0001
```

Atau dari form timbang:

```txt
/growth/add -> scan QR -> sapi otomatis terpilih
```

### 18.3 Kesehatan & Medis

Jika pertumbuhan lambat, tampilkan shortcut:

```txt
Buat Catatan Kesehatan
```

### 18.4 Manajemen Pakan

Jika ADG rendah, tampilkan shortcut:

```txt
Cek Riwayat Pakan
```

---

## 19. Acceptance Criteria

### 19.1 Overview Page

- User dapat membuka halaman Monitoring Pertumbuhan.
- Summary card tampil dengan data dummy.
- Daftar sapi tampil dalam card mobile-friendly.
- Search ID sapi berjalan di frontend.
- Filter status berjalan di frontend.
- Card sapi dapat diklik untuk masuk detail.

### 19.2 Detail Page

- Detail sapi menampilkan foto, ID, jenis, status, dan metric.
- Grafik berat badan tampil menggunakan dummy data.
- Riwayat timbang tampil dalam timeline.
- ADG dan status dihitung otomatis.
- Tombol tambah log timbang tersedia.

### 19.3 Add Log Page

- User dapat memilih sapi.
- User dapat mengisi tanggal, berat, BCS, dan catatan.
- Sistem menampilkan preview perhitungan ADG sebelum simpan.
- Setelah simpan, tampil success state.
- Data dummy state berubah minimal di sisi frontend.

### 19.4 Mobile UX

- Semua tombol utama mudah ditekan di ponsel.
- Tidak ada tabel besar di mobile.
- Chart responsive.
- Sticky bottom button tidak menutup konten penting.
- Tampilan tetap nyaman untuk peternak yang menggunakan HP di kandang.

---

## 20. Instruksi Implementasi untuk Google Antigravity

Bangun UI/UX Modul Monitoring Pertumbuhan SmartFarm dengan Next.js, TypeScript, Tailwind CSS, dan Recharts. Fokus pada frontend demo tanpa backend. Gunakan brand style Barbara Farm: hijau tua, hijau emerald, putih bersih, card modern rounded, dan mobile-first. Buat halaman `/growth`, `/growth/add`, `/growth/cow/[cowId]`, dan `/growth/log/[logId]/edit`. Gunakan dummy data 25 sapi dan generate growth log 4-6 data per sapi. Buat komponen reusable untuk summary card, cow growth card, growth chart, BCS selector, growth log timeline, form tambah timbang, filter bar, status badge, dan insight card. Pastikan UI mudah digunakan peternak di ponsel, terutama untuk melihat report setiap sapi dan mencatat hasil timbang di kandang. Jangan integrasikan backend dulu, tetapi struktur data harus siap untuk integrasi Node.js, Prisma, PostgreSQL, dan JWT pada tahap berikutnya.

---

## 21. Prioritas Development UI

Urutan pengerjaan disarankan:

1. Buat dummy data sapi dan growth logs.
2. Buat helper kalkulasi ADG dan status.
3. Buat layout `/growth` mobile-first.
4. Buat CowGrowthCard.
5. Buat detail page per sapi.
6. Buat chart berat badan.
7. Buat form tambah log timbang.
8. Buat edit dan delete dummy interaction.
9. Buat responsive desktop table.
10. Polish visual sesuai brand Barbara Farm.

---

## 22. Catatan Visual Final

Modul ini harus terasa seperti aplikasi kandang modern, bukan aplikasi akuntansi yang rumit. Peternak harus bisa memahami kondisi sapi dalam 5 detik:

```txt
Sapi mana yang bagus?
Sapi mana yang lambat tumbuh?
Sapi mana yang harus dicek?
Kapan terakhir ditimbang?
Berapa kenaikan beratnya?
```

Gunakan angka besar, badge jelas, grafik sederhana, dan bahasa insight yang manusiawi.
