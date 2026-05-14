# PRD UI/UX SmartFarm — Modul Penjualan Sapi

**Nama Modul:** Penjualan / Output Ternak  
**Project:** SmartFarm  
**Tahap:** Step 1 — Frontend UI/UX Demo  
**Target Pengguna:** Peternak, Admin Peternakan, Owner, Supervisor Kandang  
**Platform:** Web responsive dan mobile-first  
**Frontend Stack:** Next.js, Tailwind CSS, React Hook Form, Zod, Recharts, QR Scanner integration-ready  
**Status Backend:** Dummy data / local mock state terlebih dahulu  

---

## 1. Tujuan Modul

Modul **Penjualan** digunakan untuk mencatat data saat sapi keluar dari peternakan, baik karena dijual ke jagal, reseller, konsumen langsung, mitra, atau pembeli lainnya.

Modul ini tidak hanya mencatat transaksi jual, tetapi juga membantu peternak mengetahui apakah satu sapi menghasilkan untung atau rugi berdasarkan:

1. Harga beli awal sapi.
2. Total biaya pakan selama masa pemeliharaan.
3. Total biaya kesehatan dan medis.
4. Berat awal, berat akhir, dan ADG.
5. Harga jual akhir.
6. Estimasi margin keuntungan.

Modul ini menjadi bagian penting untuk melihat performa bisnis peternakan secara sederhana, cepat, dan mudah dipahami melalui ponsel.

---

## 2. Prinsip UI/UX Modul Penjualan

Desain harus mengikuti karakter SmartFarm yang sudah dibentuk pada PRD sebelumnya:

- Mobile-first agar mudah digunakan oleh peternak di kandang.
- Warna utama mengikuti identitas brand pada referensi gambar: nuansa hijau peternakan, putih, aksen kuning/oranye, dan elemen natural.
- Bahasa UI sederhana, tidak terlalu akuntansi.
- Angka uang dan berat harus sangat jelas terbaca.
- Tombol aksi utama besar dan mudah ditekan.
- Semua status sapi harus langsung terlihat: **Siap Jual**, **Sudah Terjual**, **Belum Layak Jual**, **Tertahan Withdrawal Period**.
- Dashboard ringkas harus bisa menjawab: “Sapi ini untung atau rugi?”

---

## 3. Scope Modul

### 3.1 Included

Modul ini mencakup:

1. Daftar sapi siap jual.
2. Daftar sapi sudah terjual.
3. Form input penjualan sapi.
4. Detail transaksi penjualan.
5. Kalkulasi otomatis keuntungan.
6. Report penjualan per sapi.
7. Report performa penjualan keseluruhan.
8. Status validasi kesehatan sebelum dijual.
9. Integrasi data dari modul Master Data Sapi, Monitoring Pertumbuhan, Manajemen Pakan, dan Kesehatan & Medis.
10. Dummy data untuk UI demo.

### 3.2 Not Included pada Step 1

Belum termasuk:

1. Backend API real.
2. Database PostgreSQL real.
3. Export PDF invoice real.
4. Payment gateway.
5. Integrasi akuntansi.
6. Multi cabang peternakan.

Namun UI harus disiapkan agar mudah dikembangkan pada Step 2.

---

## 4. Role Pengguna

### 4.1 Peternak / Operator Kandang

- Melihat sapi siap jual.
- Input berat badan akhir.
- Input harga jual.
- Input tujuan penjualan.
- Scan QR untuk membuka profil sapi sebelum dijual.

### 4.2 Admin Peternakan

- Membuat transaksi penjualan.
- Edit transaksi selama status masih draft.
- Melihat riwayat penjualan.
- Validasi data biaya produksi.

### 4.3 Owner / Manajemen

- Melihat dashboard omzet.
- Melihat total keuntungan.
- Melihat sapi paling menguntungkan.
- Melihat sapi rugi atau margin rendah.
- Mengambil keputusan strategi pakan dan pembelian berikutnya.

---

## 5. Analisis Flow Modul Penjualan

### 5.1 Flow Utama Penjualan Sapi

1. User login ke SmartFarm.
2. User membuka menu **Penjualan**.
3. Sistem menampilkan dashboard ringkas:
   - Total sapi siap jual.
   - Total sapi terjual bulan ini.
   - Total omzet.
   - Estimasi keuntungan.
   - Sapi tertahan karena masa henti obat.
4. User memilih tombol **Jual Sapi**.
5. User memilih sapi melalui:
   - Scan QR.
   - Search ID sapi.
   - Pilih dari daftar sapi siap jual.
6. Sistem menampilkan preview profil sapi:
   - ID Sapi.
   - Foto sapi.
   - Jenis sapi.
   - Berat awal.
   - Berat terakhir.
   - ADG.
   - Harga beli.
   - Total biaya pakan.
   - Total biaya medis.
   - Status kesehatan.
   - Status withdrawal period.
7. Jika sapi masih dalam withdrawal period, sistem menampilkan warning dan transaksi tidak boleh disimpan sebagai final.
8. Jika sapi aman dijual, user mengisi form penjualan.
9. Sistem menghitung otomatis:
   - Total biaya produksi.
   - Proyeksi keuntungan.
   - Margin keuntungan.
   - Harga jual per kg.
   - Selisih berat dari awal ke akhir.
10. User menyimpan transaksi sebagai:
   - Draft.
   - Final / Sapi Terjual.
11. Jika final, status sapi berubah menjadi **Terjual**.
12. Sistem menampilkan detail transaksi dan ringkasan keuntungan.

---

### 5.2 Flow Scan QR dari Kandang

1. User membuka menu **QR Scan** atau tombol scan di halaman Penjualan.
2. User scan QR pada sapi.
3. Sistem membuka halaman profil ringkas sapi.
4. User klik tombol **Jual Sapi Ini**.
5. Sistem membuka form penjualan dengan data sapi sudah terisi otomatis.
6. User input berat akhir, harga jual, pembeli, dan tujuan.
7. Sistem menghitung untung/rugi.
8. User menyimpan transaksi.

---

### 5.3 Flow Sapi Tidak Layak Jual

Sapi tidak layak dijual jika:

1. Masih dalam masa henti obat.
2. Berat belum mencapai target jual.
3. Status kesehatan masih sakit/perawatan.
4. Data berat terakhir belum tersedia.
5. Data harga beli belum tersedia.

Flow:

1. User memilih sapi.
2. Sistem melakukan validasi.
3. Sistem menampilkan status **Belum Layak Jual**.
4. Tombol finalisasi penjualan dinonaktifkan.
5. User tetap bisa membuat draft catatan rencana penjualan.

---

### 5.4 Flow Edit Transaksi

1. User membuka daftar transaksi.
2. User memilih transaksi dengan status **Draft**.
3. User mengubah data:
   - Berat badan akhir.
   - Harga jual.
   - Tujuan penjualan.
   - Pembeli.
   - Catatan transaksi.
4. Sistem menghitung ulang proyeksi keuntungan.
5. User menyimpan kembali.

Catatan: transaksi dengan status **Final / Terjual** hanya dapat dilihat, bukan diedit, kecuali user Admin memiliki permission khusus.

---

### 5.5 Flow Pembatalan Penjualan

1. User membuka detail transaksi final.
2. User klik **Batalkan Penjualan**.
3. Sistem meminta alasan pembatalan.
4. Status transaksi menjadi **Dibatalkan**.
5. Status sapi kembali menjadi **Aktif** atau **Siap Jual**.
6. Riwayat pembatalan tetap disimpan.

Untuk UI demo, cukup tampilkan modal konfirmasi pembatalan.

---

## 6. Analisis Input — Proses — Output

### 6.1 Input

Data input utama:

| Field | Tipe | Wajib | Keterangan |
|---|---:|---:|---|
| ID Transaksi | Auto | Ya | Auto-generated, contoh SALE-2026-0001 |
| ID Sapi | Relation | Ya | Diambil dari Master Data Sapi |
| Tanggal Keluar/Jual | Date | Ya | Tanggal sapi keluar dari peternakan |
| Berat Badan Akhir | Number | Ya | Berat terakhir saat dijual dalam Kg |
| Harga Jual | Currency | Ya | Harga jual total sapi |
| Tujuan Penjualan | Select | Ya | Jagal, Reseller, Konsumen Langsung, Mitra, Lainnya |
| Nama Pembeli | Text | Opsional | Nama pembeli atau perusahaan |
| No. HP Pembeli | Text | Opsional | Kontak pembeli |
| Alamat/Tujuan Kirim | Textarea | Opsional | Alamat pengiriman jika ada |
| Metode Pembayaran | Select | Opsional | Cash, Transfer, Tempo, DP |
| Status Pembayaran | Select | Opsional | Lunas, DP, Belum Lunas |
| Nominal DP | Currency | Opsional | Jika pembayaran DP |
| Catatan Penjualan | Textarea | Opsional | Catatan tambahan |
| Foto Bukti Timbang | Upload | Opsional | Untuk verifikasi berat akhir |
| Foto Bukti Pembayaran | Upload | Opsional | Untuk arsip transaksi |

---

### 6.2 Data Referensi yang Dibutuhkan dari Modul Lain

| Modul Sumber | Data yang Dipakai | Fungsi |
|---|---|---|
| Master Data Sapi | ID sapi, foto, jenis, gender, tanggal masuk, harga beli, berat awal | Dasar identitas dan modal awal |
| Monitoring Pertumbuhan | Berat terakhir, riwayat timbang, ADG | Menentukan performa pertumbuhan |
| Manajemen Pakan | Total pakan, total biaya pakan | Menghitung biaya produksi |
| Kesehatan & Medis | Total biaya medis, status sehat, withdrawal period | Validasi aman jual |
| QR Scan | ID sapi dari QR | Mempercepat input penjualan |

---

### 6.3 Proses Sistem

Sistem melakukan proses berikut:

1. Mengambil data sapi berdasarkan ID.
2. Mengambil berat awal dari master data.
3. Mengambil berat terakhir dari log penimbangan.
4. Mengambil total biaya pakan dari feeding log.
5. Mengambil total biaya medis dari log kesehatan.
6. Mengecek apakah sapi masih dalam withdrawal period.
7. Mengecek apakah sapi memiliki status kesehatan sakit/perawatan.
8. Menghitung ADG.
9. Menghitung total biaya produksi.
10. Menghitung harga jual per kg.
11. Menghitung proyeksi keuntungan.
12. Menghitung margin keuntungan.
13. Mengubah status sapi menjadi **Terjual** jika transaksi final.
14. Menampilkan alert jika penjualan rugi atau margin rendah.

---

### 6.4 Output

Output modul:

1. Data transaksi penjualan.
2. Status sapi berubah menjadi Terjual.
3. Ringkasan keuntungan per sapi.
4. Report omzet dan margin.
5. Detail biaya produksi per sapi.
6. Riwayat penjualan.
7. Alert sapi rugi / margin rendah.
8. Alert sapi tidak boleh dijual karena withdrawal period.

---

## 7. Kalkulator Otomatis

### 7.1 ADG — Average Daily Gain

Rumus:

```ts
ADG = (beratSekarang - beratSebelumnya) / jumlahHari
```

Untuk report penjualan, gunakan dua pendekatan:

#### ADG Antar Penimbangan Terakhir

```ts
adgTerakhir = (beratTimbangTerakhir - beratTimbangSebelumnya) / jumlahHariAntarTimbang
```

#### ADG Total dari Masuk sampai Jual

```ts
adgTotal = (beratAkhir - beratAwal) / jumlahHariPemeliharaan
```

Contoh:

- Berat awal: 280 kg.
- Berat akhir: 385 kg.
- Lama pemeliharaan: 120 hari.
- ADG total = (385 - 280) / 120 = 0,875 kg/hari.

---

### 7.2 Total Biaya Produksi

Rumus:

```ts
totalBiayaProduksi = hargaBeli + totalBiayaPakan + totalBiayaMedis + biayaOperasionalTambahan
```

Komponen:

| Komponen | Keterangan |
|---|---|
| Harga Beli | Modal awal sapi |
| Total Biaya Pakan | Akumulasi feeding log |
| Total Biaya Medis | Akumulasi kesehatan dan obat |
| Biaya Operasional Tambahan | Transport, tenaga kerja, vitamin, kandang, dll |

---

### 7.3 Proyeksi Keuntungan

Rumus:

```ts
proyeksiKeuntungan = hargaJual - totalBiayaProduksi
```

Status:

| Kondisi | Status UI |
|---|---|
| Profit > 0 | Untung |
| Profit = 0 | Impas |
| Profit < 0 | Rugi |

---

### 7.4 Margin Keuntungan

Rumus:

```ts
marginPersen = (proyeksiKeuntungan / hargaJual) * 100
```

Status margin:

| Margin | Label |
|---:|---|
| > 20% | Sangat Baik |
| 10% - 20% | Baik |
| 1% - 9% | Tipis |
| 0% | Impas |
| < 0% | Rugi |

---

### 7.5 Harga Jual per Kg

Rumus:

```ts
hargaJualPerKg = hargaJual / beratBadanAkhir
```

Digunakan agar peternak tahu apakah harga jual sudah wajar terhadap berat sapi.

---

## 8. Struktur Menu

Tambahkan menu baru di sidebar/bottom navigation:

```txt
Penjualan
├── Dashboard Penjualan
├── Sapi Siap Jual
├── Transaksi Penjualan
├── Tambah Penjualan
└── Report Penjualan
```

Untuk mobile bottom nav:

```txt
Home | Sapi | Scan | Jual | Profil
```

---

## 9. Halaman UI yang Dibutuhkan

### 9.1 `/sales`

Dashboard penjualan.

Komponen:

1. Header mobile:
   - Title: Penjualan Sapi.
   - Subtitle: Pantau sapi keluar dan keuntungan.
   - Button: `+ Jual Sapi`.
2. Summary cards:
   - Sapi siap jual.
   - Sapi terjual bulan ini.
   - Total omzet.
   - Estimasi keuntungan.
3. Alert card:
   - Sapi tertahan withdrawal period.
   - Sapi margin rendah.
4. Tab:
   - Siap Jual.
   - Terjual.
   - Draft.
   - Tertahan.
5. List transaksi terbaru.
6. Mini chart omzet 6 bulan terakhir.

Mobile layout:

```txt
[Penjualan Sapi]
Pantau sapi keluar & keuntungan

[+ Jual Sapi]

[Omzet Bulan Ini]
Rp 86.500.000
Estimasi profit Rp 14.250.000

[Siap Jual] [Terjual] [Draft] [Tertahan]

Card Sapi/Transaksi
```

---

### 9.2 `/sales/ready`

Daftar sapi siap jual.

Komponen card mobile:

```txt
[Foto Sapi]
SF-0007 • Limousin Jantan
Berat terakhir: 412 kg
ADG total: 0.92 kg/hari
Estimasi biaya produksi: Rp 21.300.000
Status: Siap Jual

[Detail] [Jual]
```

Filter:

1. Jenis sapi.
2. Berat minimum.
3. Status kesehatan.
4. Status withdrawal.
5. Range ADG.
6. Estimasi margin.

---

### 9.3 `/sales/create`

Form tambah penjualan.

Gunakan model wizard mobile 4 step agar tidak membingungkan peternak.

#### Step 1 — Pilih Sapi

Metode:

1. Scan QR.
2. Search ID sapi.
3. Pilih dari list sapi siap jual.

Preview setelah sapi dipilih:

```txt
SF-0012
Simental Jantan
Berat awal: 295 kg
Berat terakhir: 410 kg
Status: Aman Dijual
```

Jika tidak aman:

```txt
⚠ Sapi belum aman dijual
Masih dalam masa henti obat sampai 20 Mei 2026.
```

#### Step 2 — Data Penjualan

Field:

1. Tanggal keluar/jual.
2. Berat badan akhir.
3. Harga jual.
4. Tujuan penjualan.
5. Nama pembeli.
6. No. HP pembeli.
7. Alamat tujuan.

#### Step 3 — Pembayaran & Bukti

Field:

1. Metode pembayaran.
2. Status pembayaran.
3. Nominal DP.
4. Upload bukti timbang.
5. Upload bukti pembayaran.
6. Catatan.

#### Step 4 — Review Untung/Rugi

Tampilkan ringkasan:

```txt
Harga Beli: Rp 16.500.000
Biaya Pakan: Rp 3.850.000
Biaya Medis: Rp 450.000
Operasional Tambahan: Rp 300.000
Total Produksi: Rp 21.100.000
Harga Jual: Rp 25.800.000
Profit: Rp 4.700.000
Margin: 18.2% - Baik
```

CTA:

1. Simpan Draft.
2. Finalkan Penjualan.

---

### 9.4 `/sales/[id]`

Detail transaksi penjualan.

Komponen:

1. Header status:
   - Draft.
   - Terjual.
   - Dibatalkan.
2. Foto dan identitas sapi.
3. Data transaksi.
4. Data pembeli.
5. Data pembayaran.
6. Kalkulasi biaya produksi.
7. Grafik berat sapi.
8. Timeline pemeliharaan:
   - Tanggal masuk.
   - Penimbangan penting.
   - Riwayat medis penting.
   - Tanggal jual.
9. Tombol:
   - Edit Draft.
   - Finalkan.
   - Batalkan.
   - Lihat Profil Sapi.

---

### 9.5 `/sales/report`

Report penjualan.

Komponen:

1. Filter periode.
2. Total sapi terjual.
3. Total omzet.
4. Total biaya produksi.
5. Total keuntungan.
6. Rata-rata margin.
7. Top 5 sapi paling untung.
8. Top 5 sapi margin rendah.
9. Chart omzet bulanan.
10. Chart profit bulanan.
11. Report berdasarkan tujuan penjualan:
    - Jagal.
    - Reseller.
    - Konsumen langsung.
    - Mitra.

---

## 10. Data Model Frontend Dummy

Buat file:

```txt
/src/data/sales.seed.ts
/src/types/sales.ts
/src/lib/sales-calculator.ts
```

### 10.1 TypeScript Types

```ts
export type SaleDestination =
  | 'Jagal'
  | 'Reseller'
  | 'Konsumen Langsung'
  | 'Mitra'
  | 'Lainnya';

export type PaymentMethod = 'Cash' | 'Transfer' | 'Tempo' | 'DP';

export type PaymentStatus = 'Lunas' | 'DP' | 'Belum Lunas';

export type SaleStatus = 'Draft' | 'Final' | 'Dibatalkan';

export interface CattleSale {
  id: string;
  cattleId: string;
  saleDate: string;
  finalWeightKg: number;
  salePrice: number;
  destination: SaleDestination;
  buyerName?: string;
  buyerPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  downPayment?: number;
  purchasePrice: number;
  totalFeedCost: number;
  totalMedicalCost: number;
  additionalOperationalCost: number;
  totalProductionCost: number;
  projectedProfit: number;
  marginPercent: number;
  sellingPricePerKg: number;
  totalAdg: number;
  status: SaleStatus;
  notes?: string;
  weighProofUrl?: string;
  paymentProofUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 11. Helper Kalkulasi

Buat file:

```txt
/src/lib/sales-calculator.ts
```

Isi fungsi:

```ts
export function calculateADG(
  firstWeight: number,
  lastWeight: number,
  totalDays: number
): number {
  if (!totalDays || totalDays <= 0) return 0;
  return Number(((lastWeight - firstWeight) / totalDays).toFixed(2));
}

export function calculateTotalProductionCost(params: {
  purchasePrice: number;
  totalFeedCost: number;
  totalMedicalCost: number;
  additionalOperationalCost?: number;
}): number {
  return (
    params.purchasePrice +
    params.totalFeedCost +
    params.totalMedicalCost +
    (params.additionalOperationalCost || 0)
  );
}

export function calculateProjectedProfit(
  salePrice: number,
  totalProductionCost: number
): number {
  return salePrice - totalProductionCost;
}

export function calculateMarginPercent(
  projectedProfit: number,
  salePrice: number
): number {
  if (!salePrice || salePrice <= 0) return 0;
  return Number(((projectedProfit / salePrice) * 100).toFixed(1));
}

export function calculateSellingPricePerKg(
  salePrice: number,
  finalWeightKg: number
): number {
  if (!finalWeightKg || finalWeightKg <= 0) return 0;
  return Math.round(salePrice / finalWeightKg);
}

export function getProfitStatus(profit: number): 'Untung' | 'Impas' | 'Rugi' {
  if (profit > 0) return 'Untung';
  if (profit === 0) return 'Impas';
  return 'Rugi';
}

export function getMarginLabel(margin: number): string {
  if (margin > 20) return 'Sangat Baik';
  if (margin >= 10) return 'Baik';
  if (margin > 0) return 'Tipis';
  if (margin === 0) return 'Impas';
  return 'Rugi';
}
```

---

## 12. Dummy Seed Data Penjualan

Buat seed minimal 12 transaksi penjualan untuk demo.

```ts
import { CattleSale } from '@/types/sales';

export const cattleSalesSeed: CattleSale[] = [
  {
    id: 'SALE-2026-0001',
    cattleId: 'SF-0001',
    saleDate: '2026-05-02',
    finalWeightKg: 405,
    salePrice: 25500000,
    destination: 'Jagal',
    buyerName: 'Pak Rahmat',
    buyerPhone: '081234567001',
    deliveryAddress: 'Pasar Hewan Bekasi',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 16500000,
    totalFeedCost: 3650000,
    totalMedicalCost: 450000,
    additionalOperationalCost: 300000,
    totalProductionCost: 20900000,
    projectedProfit: 4600000,
    marginPercent: 18,
    sellingPricePerKg: 62963,
    totalAdg: 0.86,
    status: 'Final',
    notes: 'Sapi keluar dalam kondisi sehat dan sudah lunas.',
    createdAt: '2026-05-02T08:00:00.000Z',
    updatedAt: '2026-05-02T08:00:00.000Z'
  },
  {
    id: 'SALE-2026-0002',
    cattleId: 'SF-0002',
    saleDate: '2026-05-04',
    finalWeightKg: 432,
    salePrice: 28600000,
    destination: 'Reseller',
    buyerName: 'CV Ternak Jaya',
    buyerPhone: '081234567002',
    deliveryAddress: 'Cikarang',
    paymentMethod: 'DP',
    paymentStatus: 'DP',
    downPayment: 10000000,
    purchasePrice: 17800000,
    totalFeedCost: 4200000,
    totalMedicalCost: 300000,
    additionalOperationalCost: 400000,
    totalProductionCost: 22700000,
    projectedProfit: 5900000,
    marginPercent: 20.6,
    sellingPricePerKg: 66204,
    totalAdg: 0.94,
    status: 'Final',
    notes: 'Sisa pembayaran tempo 7 hari.',
    createdAt: '2026-05-04T09:00:00.000Z',
    updatedAt: '2026-05-04T09:00:00.000Z'
  },
  {
    id: 'SALE-2026-0003',
    cattleId: 'SF-0003',
    saleDate: '2026-05-05',
    finalWeightKg: 388,
    salePrice: 23200000,
    destination: 'Konsumen Langsung',
    buyerName: 'Ibu Sari',
    buyerPhone: '081234567003',
    deliveryAddress: 'Tambun Selatan',
    paymentMethod: 'Cash',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 15800000,
    totalFeedCost: 3500000,
    totalMedicalCost: 700000,
    additionalOperationalCost: 250000,
    totalProductionCost: 20250000,
    projectedProfit: 2950000,
    marginPercent: 12.7,
    sellingPricePerKg: 59794,
    totalAdg: 0.76,
    status: 'Final',
    notes: 'Margin cukup, biaya medis agak tinggi.',
    createdAt: '2026-05-05T10:00:00.000Z',
    updatedAt: '2026-05-05T10:00:00.000Z'
  },
  {
    id: 'SALE-2026-0004',
    cattleId: 'SF-0004',
    saleDate: '2026-05-06',
    finalWeightKg: 455,
    salePrice: 31500000,
    destination: 'Mitra',
    buyerName: 'PT Mitra Daging Nusantara',
    buyerPhone: '081234567004',
    deliveryAddress: 'Jakarta Timur',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 19000000,
    totalFeedCost: 4800000,
    totalMedicalCost: 500000,
    additionalOperationalCost: 500000,
    totalProductionCost: 24800000,
    projectedProfit: 6700000,
    marginPercent: 21.3,
    sellingPricePerKg: 69231,
    totalAdg: 1.02,
    status: 'Final',
    notes: 'Performa pertumbuhan sangat baik.',
    createdAt: '2026-05-06T11:00:00.000Z',
    updatedAt: '2026-05-06T11:00:00.000Z'
  },
  {
    id: 'SALE-2026-0005',
    cattleId: 'SF-0005',
    saleDate: '2026-05-07',
    finalWeightKg: 370,
    salePrice: 21000000,
    destination: 'Jagal',
    buyerName: 'Pak Deden',
    buyerPhone: '081234567005',
    deliveryAddress: 'Bogor',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 15750000,
    totalFeedCost: 3900000,
    totalMedicalCost: 950000,
    additionalOperationalCost: 300000,
    totalProductionCost: 20900000,
    projectedProfit: 100000,
    marginPercent: 0.5,
    sellingPricePerKg: 56757,
    totalAdg: 0.55,
    status: 'Final',
    notes: 'Margin sangat tipis, perlu evaluasi pakan dan kesehatan.',
    createdAt: '2026-05-07T12:00:00.000Z',
    updatedAt: '2026-05-07T12:00:00.000Z'
  },
  {
    id: 'SALE-2026-0006',
    cattleId: 'SF-0006',
    saleDate: '2026-05-08',
    finalWeightKg: 398,
    salePrice: 23800000,
    destination: 'Reseller',
    buyerName: 'UD Barokah Ternak',
    buyerPhone: '081234567006',
    deliveryAddress: 'Karawang',
    paymentMethod: 'Tempo',
    paymentStatus: 'Belum Lunas',
    downPayment: 0,
    purchasePrice: 16800000,
    totalFeedCost: 4100000,
    totalMedicalCost: 400000,
    additionalOperationalCost: 350000,
    totalProductionCost: 21650000,
    projectedProfit: 2150000,
    marginPercent: 9,
    sellingPricePerKg: 59799,
    totalAdg: 0.72,
    status: 'Final',
    notes: 'Pembayaran tempo, perlu follow up.',
    createdAt: '2026-05-08T13:00:00.000Z',
    updatedAt: '2026-05-08T13:00:00.000Z'
  },
  {
    id: 'SALE-2026-0007',
    cattleId: 'SF-0007',
    saleDate: '2026-05-09',
    finalWeightKg: 420,
    salePrice: 27600000,
    destination: 'Konsumen Langsung',
    buyerName: 'Pak Hendra',
    buyerPhone: '081234567007',
    deliveryAddress: 'Bekasi Utara',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 17200000,
    totalFeedCost: 4300000,
    totalMedicalCost: 350000,
    additionalOperationalCost: 300000,
    totalProductionCost: 22150000,
    projectedProfit: 5450000,
    marginPercent: 19.7,
    sellingPricePerKg: 65714,
    totalAdg: 0.91,
    status: 'Final',
    notes: 'Penjualan langsung dengan margin baik.',
    createdAt: '2026-05-09T14:00:00.000Z',
    updatedAt: '2026-05-09T14:00:00.000Z'
  },
  {
    id: 'SALE-2026-0008',
    cattleId: 'SF-0008',
    saleDate: '2026-05-10',
    finalWeightKg: 360,
    salePrice: 19800000,
    destination: 'Jagal',
    buyerName: 'Pak Udin',
    buyerPhone: '081234567008',
    deliveryAddress: 'Pasar Cibitung',
    paymentMethod: 'Cash',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 16000000,
    totalFeedCost: 3800000,
    totalMedicalCost: 650000,
    additionalOperationalCost: 250000,
    totalProductionCost: 20700000,
    projectedProfit: -900000,
    marginPercent: -4.5,
    sellingPricePerKg: 55000,
    totalAdg: 0.48,
    status: 'Final',
    notes: 'Transaksi rugi, perlu evaluasi pembelian dan perawatan.',
    createdAt: '2026-05-10T15:00:00.000Z',
    updatedAt: '2026-05-10T15:00:00.000Z'
  },
  {
    id: 'SALE-2026-0009',
    cattleId: 'SF-0009',
    saleDate: '2026-05-11',
    finalWeightKg: 445,
    salePrice: 29900000,
    destination: 'Mitra',
    buyerName: 'Mitra Qurban Sejahtera',
    buyerPhone: '081234567009',
    deliveryAddress: 'Depok',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 18500000,
    totalFeedCost: 4650000,
    totalMedicalCost: 450000,
    additionalOperationalCost: 400000,
    totalProductionCost: 24000000,
    projectedProfit: 5900000,
    marginPercent: 19.7,
    sellingPricePerKg: 67191,
    totalAdg: 0.98,
    status: 'Final',
    notes: 'Cocok untuk pembeli mitra rutin.',
    createdAt: '2026-05-11T16:00:00.000Z',
    updatedAt: '2026-05-11T16:00:00.000Z'
  },
  {
    id: 'SALE-2026-0010',
    cattleId: 'SF-0010',
    saleDate: '2026-05-12',
    finalWeightKg: 410,
    salePrice: 24800000,
    destination: 'Reseller',
    buyerName: 'Ternak Mandiri',
    buyerPhone: '081234567010',
    deliveryAddress: 'Cileungsi',
    paymentMethod: 'DP',
    paymentStatus: 'DP',
    downPayment: 8000000,
    purchasePrice: 17000000,
    totalFeedCost: 4250000,
    totalMedicalCost: 550000,
    additionalOperationalCost: 350000,
    totalProductionCost: 22150000,
    projectedProfit: 2650000,
    marginPercent: 10.7,
    sellingPricePerKg: 60488,
    totalAdg: 0.8,
    status: 'Draft',
    notes: 'Menunggu pelunasan sebelum sapi keluar.',
    createdAt: '2026-05-12T17:00:00.000Z',
    updatedAt: '2026-05-12T17:00:00.000Z'
  },
  {
    id: 'SALE-2026-0011',
    cattleId: 'SF-0011',
    saleDate: '2026-05-13',
    finalWeightKg: 462,
    salePrice: 32600000,
    destination: 'Konsumen Langsung',
    buyerName: 'Pak Fajar',
    buyerPhone: '081234567011',
    deliveryAddress: 'Jakarta Selatan',
    paymentMethod: 'Transfer',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 19500000,
    totalFeedCost: 5000000,
    totalMedicalCost: 300000,
    additionalOperationalCost: 450000,
    totalProductionCost: 25250000,
    projectedProfit: 7350000,
    marginPercent: 22.5,
    sellingPricePerKg: 70563,
    totalAdg: 1.05,
    status: 'Draft',
    notes: 'Draft transaksi, menunggu bukti timbang final.',
    createdAt: '2026-05-13T18:00:00.000Z',
    updatedAt: '2026-05-13T18:00:00.000Z'
  },
  {
    id: 'SALE-2026-0012',
    cattleId: 'SF-0012',
    saleDate: '2026-05-14',
    finalWeightKg: 390,
    salePrice: 22500000,
    destination: 'Jagal',
    buyerName: 'Pak Somad',
    buyerPhone: '081234567012',
    deliveryAddress: 'Tambelang',
    paymentMethod: 'Cash',
    paymentStatus: 'Lunas',
    downPayment: 0,
    purchasePrice: 16200000,
    totalFeedCost: 3950000,
    totalMedicalCost: 850000,
    additionalOperationalCost: 300000,
    totalProductionCost: 21300000,
    projectedProfit: 1200000,
    marginPercent: 5.3,
    sellingPricePerKg: 57692,
    totalAdg: 0.62,
    status: 'Dibatalkan',
    notes: 'Dibatalkan karena pembeli mengganti jadwal.',
    createdAt: '2026-05-14T19:00:00.000Z',
    updatedAt: '2026-05-14T19:00:00.000Z'
  }
];
```

---

## 13. UI Components

Buat komponen reusable berikut:

```txt
/src/components/sales/SalesSummaryCard.tsx
/src/components/sales/SaleStatusBadge.tsx
/src/components/sales/ReadyCattleCard.tsx
/src/components/sales/SaleTransactionCard.tsx
/src/components/sales/SaleCalculatorPanel.tsx
/src/components/sales/SaleWizard.tsx
/src/components/sales/SaleFormStepCattle.tsx
/src/components/sales/SaleFormStepTransaction.tsx
/src/components/sales/SaleFormStepPayment.tsx
/src/components/sales/SaleFormStepReview.tsx
/src/components/sales/SalesChart.tsx
/src/components/sales/ProfitBadge.tsx
/src/components/sales/WithdrawalWarningCard.tsx
```

---

## 14. Tampilan Mobile yang Wajib Nyaman untuk Peternak

### 14.1 Card Sapi Siap Jual

Desain card harus besar dan informatif:

```txt
┌────────────────────────────┐
│ [Foto] SF-0007             │
│ Limousin • Jantan          │
│ Berat: 420 kg              │
│ ADG: 0.91 kg/hari          │
│ Est. Biaya: Rp 22.150.000  │
│ Status: Siap Jual          │
│                            │
│ [Lihat]        [Jual]      │
└────────────────────────────┘
```

### 14.2 Card Transaksi

```txt
┌────────────────────────────┐
│ SALE-2026-0007             │
│ SF-0007 • 420 kg           │
│ Harga Jual: Rp 27.600.000  │
│ Profit: Rp 5.450.000       │
│ Margin: 19.7% - Baik       │
│ Pembeli: Pak Hendra        │
│ Status: Terjual            │
│                            │
│ [Detail]                   │
└────────────────────────────┘
```

### 14.3 Kalkulator Panel

Gunakan visual seperti receipt/ringkasan kasir:

```txt
Ringkasan Keuntungan
Harga beli              Rp 17.200.000
Biaya pakan             Rp 4.300.000
Biaya medis             Rp 350.000
Operasional             Rp 300.000
-------------------------------------
Total produksi          Rp 22.150.000
Harga jual              Rp 27.600.000
-------------------------------------
Profit                  Rp 5.450.000
Margin                  19.7%
```

---

## 15. Validasi Form

Gunakan Zod validation.

Rules:

1. ID sapi wajib dipilih.
2. Tanggal jual wajib.
3. Berat akhir wajib dan harus lebih dari 0.
4. Harga jual wajib dan harus lebih dari 0.
5. Tujuan penjualan wajib.
6. Jika metode pembayaran DP, nominal DP wajib lebih dari 0.
7. Jika status pembayaran Lunas, nominal DP boleh 0.
8. Jika sapi masih withdrawal period, finalisasi ditolak.
9. Jika sapi status sakit/perawatan, tampil warning.
10. Jika profit negatif, tampil modal konfirmasi: “Transaksi ini rugi. Tetap simpan?”

---

## 16. Status dan Badge

### 16.1 Status Sapi

| Status | Warna UI | Keterangan |
|---|---|---|
| Siap Jual | Hijau | Sapi aman dijual |
| Belum Layak | Abu/Kuning | Berat atau data belum cukup |
| Tertahan Obat | Merah/Oranye | Masih withdrawal period |
| Terjual | Biru/Hijau Gelap | Sapi sudah keluar |

### 16.2 Status Transaksi

| Status | Keterangan |
|---|---|
| Draft | Data belum final |
| Final | Sapi sudah terjual |
| Dibatalkan | Transaksi dibatalkan |

### 16.3 Status Profit

| Status | Keterangan |
|---|---|
| Untung | Profit positif |
| Impas | Profit 0 |
| Rugi | Profit negatif |

---

## 17. Dashboard Metrics

Pada halaman `/sales`, tampilkan:

1. Total omzet bulan ini.
2. Total profit bulan ini.
3. Jumlah sapi terjual.
4. Rata-rata margin.
5. Rata-rata harga jual per kg.
6. Total sapi siap jual.
7. Total transaksi draft.
8. Total transaksi belum lunas.
9. Total sapi margin rendah.
10. Total sapi rugi.

---

## 18. Integrasi dengan Modul Lain

### 18.1 Master Data Sapi

Ketika sapi final dijual:

- `status = Terjual`
- `tanggalKeluar = saleDate`
- `beratAkhir = finalWeightKg`
- `hargaJual = salePrice`

### 18.2 Monitoring Pertumbuhan

- Ambil berat terakhir sebagai default berat akhir.
- Tampilkan grafik pertumbuhan di detail penjualan.
- Hitung ADG total.

### 18.3 Kesehatan & Medis

- Cek withdrawal period.
- Cek status sapi sakit/perawatan.
- Tampilkan warning jika ada riwayat pengobatan aktif.

### 18.4 Manajemen Pakan

- Hitung total biaya pakan.
- Tampilkan kontribusi biaya pakan terhadap total produksi.

### 18.5 QR Scan

- Dari QR scan, user bisa langsung klik **Jual Sapi Ini**.
- Form penjualan otomatis memuat ID sapi.

---

## 19. Empty State

### 19.1 Belum Ada Penjualan

Tampilkan:

```txt
Belum ada transaksi penjualan
Mulai catat penjualan sapi agar keuntungan peternakan bisa dihitung otomatis.

[+ Tambah Penjualan]
```

### 19.2 Tidak Ada Sapi Siap Jual

Tampilkan:

```txt
Belum ada sapi siap jual
Sapi akan muncul di sini jika berat, kesehatan, dan statusnya sudah memenuhi syarat jual.

[Lihat Data Sapi]
```

---

## 20. Error State

1. Data sapi tidak ditemukan.
2. QR tidak valid.
3. Data berat terakhir tidak tersedia.
4. Harga beli belum diisi.
5. Data pakan belum tersedia.
6. Sapi masih masa henti obat.
7. Gagal menyimpan transaksi dummy.

Untuk Step 1, tampilkan toast dan alert card.

---

## 21. Acceptance Criteria

Modul dianggap selesai untuk UI demo jika:

1. User dapat membuka halaman dashboard penjualan.
2. User dapat melihat sapi siap jual dalam card mobile.
3. User dapat membuat transaksi penjualan dengan wizard 4 step.
4. Sistem menghitung otomatis total biaya produksi.
5. Sistem menghitung otomatis ADG.
6. Sistem menghitung otomatis profit dan margin.
7. Sistem menampilkan status untung/rugi.
8. Sistem menampilkan warning jika sapi tidak boleh dijual.
9. User dapat melihat detail transaksi.
10. User dapat melihat report penjualan.
11. UI nyaman digunakan dari layar ponsel.
12. Dummy seed data transaksi tampil tanpa backend.
13. Semua halaman responsive untuk desktop dan mobile.

---

## 22. Instruksi Implementasi untuk Google Antigravity

Bangun modul **Penjualan SmartFarm** dengan Next.js dan Tailwind CSS berdasarkan PRD ini.

Prioritas implementasi:

1. Buat routing halaman:
   - `/sales`
   - `/sales/ready`
   - `/sales/create`
   - `/sales/[id]`
   - `/sales/report`
2. Buat TypeScript types untuk transaksi penjualan.
3. Buat dummy seed data `cattleSalesSeed`.
4. Buat helper kalkulasi ADG, total biaya produksi, profit, margin, dan harga jual per kg.
5. Buat dashboard penjualan mobile-first.
6. Buat card sapi siap jual.
7. Buat wizard tambah penjualan 4 step.
8. Buat detail transaksi dengan panel kalkulator.
9. Buat report penjualan dengan chart sederhana.
10. Gunakan style SmartFarm yang clean, modern, natural, dan mudah dipakai peternak.

Gunakan komponen dummy terlebih dahulu. Jangan membuat backend API pada tahap ini.

---

## 23. Catatan Desain Visual

Gunakan gaya visual:

- Background utama: putih atau hijau sangat muda.
- Primary: hijau farm/natural.
- Accent: kuning/oranye untuk highlight profit dan CTA.
- Danger: merah/oranye untuk withdrawal period, rugi, dan warning.
- Card: rounded besar, shadow halus.
- Font: modern, mudah dibaca.
- Angka uang gunakan format Rupiah.
- Tombol utama harus besar untuk mobile.
- Dashboard tidak boleh terlalu ramai.

---

## 24. Future Backend Preparation

Walaupun Step 1 hanya UI, struktur data harus siap untuk backend:

Entity backend yang nanti dibutuhkan:

1. `Cattle`
2. `WeightLog`
3. `HealthLog`
4. `FeedLog`
5. `Sale`
6. `SaleAttachment`
7. `Buyer`
8. `PaymentRecord`

Endpoint backend yang nanti dibutuhkan:

```txt
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales
PUT    /api/sales/:id
DELETE /api/sales/:id
POST   /api/sales/:id/finalize
POST   /api/sales/:id/cancel
GET    /api/sales/report/summary
GET    /api/cattle/ready-to-sell
```

---

## 25. Penutup

Modul Penjualan harus menjadi modul yang membantu peternak melihat hasil akhir dari proses pemeliharaan sapi. UI tidak boleh terasa seperti aplikasi akuntansi yang berat, tetapi harus tetap cukup kuat untuk menghitung modal, biaya, harga jual, dan keuntungan.

Target pengalaman pengguna:

> Peternak cukup pilih sapi, isi berat akhir dan harga jual, lalu SmartFarm langsung memberi tahu apakah sapi tersebut untung, impas, atau rugi.
