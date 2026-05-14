# PRD UI/UX SmartFarm — Modul Master Data Sapi / KTP Sapi

**Project:** SmartFarm / Barbara Farm  
**Modul:** Master Data Sapi / KTP Sapi  
**Tahap:** Step 2.0 — Frontend UI/UX Demo  
**Target Implementasi:** Google Antigravity  
**Frontend Stack:** Next.js, Tailwind CSS, shadcn/ui atau HeroUI, lucide-react, Recharts, QR Code library  
**Mode Data:** Dummy data + seed 25 sapi  
**Design Reference:** Mengikuti style login Barbara Farm: hijau tua, putih bersih, rounded card, shadow lembut, enterprise farm management, mobile-first.

---

## 1. Tujuan Modul

Modul **Master Data Sapi** adalah pusat data identitas ternak. Modul ini berfungsi seperti **KTP Sapi**, yaitu menyimpan data statis dan semi-statis yang digunakan oleh modul lain seperti QR Scan, Monitoring Pertumbuhan, Kesehatan, Feeding, Penjualan, dan Dashboard.

Pada tahap UI/UX demo, modul ini harus memberikan pengalaman yang mudah digunakan oleh peternak, terutama saat dibuka melalui ponsel. Peternak harus dapat melihat daftar sapi, mencari sapi, membuka profil sapi, melihat foto, status, QR Code, dan melakukan CRUD data sapi secara sederhana.

---

## 2. Prinsip UI/UX

1. **Mobile-first untuk peternak**  
   Tampilan daftar sapi harus nyaman dibuka dari HP saat berada di kandang.

2. **Data penting terlihat cepat**  
   ID sapi, foto, jenis sapi, gender, berat awal, umur, status, dan kandang harus langsung terlihat.

3. **Enterprise tapi tetap sederhana**  
   Gunakan layout profesional seperti sistem manajemen modern, tetapi hindari form yang membingungkan.

4. **QR-first identity**  
   Setiap sapi memiliki QR Code berbasis ID Sapi. QR ini dapat dicetak dan ditempel pada kandang atau tag sapi.

5. **Card view untuk mobile, table view untuk desktop**  
   Mobile menampilkan data dalam bentuk kartu. Desktop menampilkan tabel manajemen data.

---

## 3. Role dan Hak Akses

### 3.1 Owner / Admin Farm
- Melihat semua data sapi.
- Menambah data sapi.
- Edit data sapi.
- Hapus / arsipkan data sapi.
- Generate QR Code.
- Export data.
- Melihat harga beli dan data finansial.

### 3.2 Petugas Kandang
- Melihat data sapi.
- Scan QR sapi.
- Update foto sapi jika diberi akses.
- Tidak dapat melihat harga beli jika permission dibatasi.
- Tidak dapat menghapus data sapi.

### 3.3 Viewer / Public Scan
- Hanya melihat profil publik sapi.
- Tidak melihat harga beli, supplier, biaya, catatan internal, dan data finansial.

---

## 4. Analisis Flow Modul Master Data Sapi

### 4.1 Flow Melihat Daftar Sapi

1. User login ke aplikasi SmartFarm.
2. User masuk ke menu **Master Data > Data Sapi**.
3. Sistem menampilkan ringkasan statistik:
   - Total sapi aktif.
   - Total jantan.
   - Total betina.
   - Total sapi siap jual.
   - Total sapi dalam pemantauan.
4. Sistem menampilkan daftar sapi.
5. User dapat memilih mode tampilan:
   - **Card View** untuk mobile.
   - **Table View** untuk desktop.
6. User dapat mencari sapi berdasarkan:
   - ID Sapi.
   - Nama/Kode panggilan sapi.
   - No. E-Artag.
   - Jenis sapi.
   - Kandang.
   - Status.
7. User klik salah satu sapi.
8. Sistem membuka halaman **Detail KTP Sapi**.

### 4.2 Flow Tambah Data Sapi

1. User klik tombol **Tambah Sapi**.
2. Sistem membuka form wizard atau form bertahap.
3. User mengisi data identitas utama:
   - ID Sapi.
   - No. E-Artag Pemerintah.
   - Nama/Kode panggilan.
   - Jenis sapi.
   - Jenis kelamin.
   - Status kepemilikan.
   - Kandang/lokasi.
4. User mengisi data asal dan pembelian:
   - Asal sapi.
   - Supplier/peternak asal.
   - Tanggal masuk.
   - Harga beli.
   - Berat badan awal.
5. User mengisi data umur:
   - Tanggal lahir jika diketahui.
   - Estimasi umur jika tanggal lahir tidak diketahui.
6. User upload foto sapi.
7. Sistem menampilkan preview data.
8. User klik **Simpan Data Sapi**.
9. Sistem membuat data sapi dan QR Code otomatis.
10. Sistem menampilkan halaman detail sapi dengan notifikasi sukses.

### 4.3 Flow Edit Data Sapi

1. User membuka detail sapi.
2. User klik **Edit Data**.
3. Sistem membuka form edit dengan data yang sudah terisi.
4. User mengubah data yang diperlukan.
5. User klik **Simpan Perubahan**.
6. Sistem menampilkan dialog konfirmasi.
7. Sistem menyimpan perubahan.
8. Sistem mencatat aktivitas perubahan pada audit log dummy.
9. Sistem kembali ke halaman detail sapi.

### 4.4 Flow Hapus / Arsip Data Sapi

Master data sapi sebaiknya tidak langsung dihapus secara permanen karena berkaitan dengan histori penimbangan, kesehatan, pakan, dan penjualan.

1. User membuka detail sapi.
2. User klik menu **Arsipkan / Nonaktifkan**.
3. Sistem menampilkan modal konfirmasi.
4. User memilih alasan:
   - Terjual.
   - Mati.
   - Hilang.
   - Dipindahkan.
   - Data duplikat.
   - Lainnya.
5. User klik **Konfirmasi Arsipkan**.
6. Sistem mengubah status sapi menjadi archived/inactive.
7. Data tidak muncul di daftar aktif, tetapi tetap tersedia di filter arsip.

### 4.5 Flow Generate dan Cetak QR Code

1. User membuka detail sapi.
2. User klik **QR Code**.
3. Sistem menampilkan QR Code berisi URL profil sapi.
4. User dapat memilih:
   - Download PNG.
   - Print label.
   - Copy link profil sapi.
5. Saat QR dipindai, sistem membuka halaman profil sapi.

### 4.6 Flow Mobile Peternak di Kandang

1. Peternak membuka aplikasi dari ponsel.
2. Masuk menu **Data Sapi**.
3. Tampilan default adalah **Card View**.
4. Peternak melihat kartu sapi berisi:
   - Foto sapi.
   - ID Sapi.
   - Jenis sapi.
   - Gender.
   - Kandang.
   - Berat terakhir / berat awal.
   - Status cepat.
5. Peternak dapat tap kartu untuk membuka detail.
6. Peternak dapat klik tombol floating **Scan QR** atau **Tambah Sapi**.

---

## 5. Input — Process — Output

### 5.1 Input

| Input | Tipe | Wajib | Keterangan |
|---|---|---:|---|
| ID Sapi | Text | Ya | Kode unik sapi, contoh BF-2026-001 |
| No. E-Artag Pemerintah | Text | Tidak | Referensi tag pemerintah jika tersedia |
| Nama/Kode Panggilan | Text | Tidak | Contoh: Simental 01, Si Putih |
| Jenis Sapi | Select | Ya | Bali, Limousin, Simental, PO, Madura, Brahman, Brangus |
| Jenis Kelamin | Select | Ya | Jantan / Betina |
| Asal Sapi | Select/Text | Ya | Supplier, pasar, peternak asal, breeding internal |
| Supplier/Peternak Asal | Text | Tidak | Nama supplier atau peternak asal |
| Tanggal Masuk | Date | Ya | Tanggal sapi masuk kandang |
| Tanggal Lahir | Date | Tidak | Diisi jika diketahui |
| Estimasi Umur | Number/Text | Tidak | Contoh 18 bulan |
| Berat Badan Awal | Number | Ya | Dalam Kg |
| Harga Beli | Currency | Ya untuk admin | Untuk ROI dan kalkulasi produksi |
| Foto Sapi | Image Upload | Tidak | Foto identitas sapi |
| Kandang/Lokasi | Select | Ya | Contoh Kandang A, Kandang B |
| Status Sapi | Select | Ya | Aktif, Pemantauan, Siap Jual, Terjual, Arsip |
| Catatan Internal | Textarea | Tidak | Catatan tambahan |

### 5.2 Process

1. Validasi ID Sapi harus unik.
2. Validasi format angka untuk berat dan harga beli.
3. Generate QR Code berdasarkan ID Sapi.
4. Simpan foto sapi ke dummy object pada frontend.
5. Hitung umur otomatis jika tanggal lahir tersedia.
6. Tampilkan status sapi berdasarkan data status.
7. Sediakan data untuk modul lanjutan seperti monitoring pertumbuhan, kesehatan, feeding, dan penjualan.

### 5.3 Output

| Output | Keterangan |
|---|---|
| Daftar Data Sapi | Card/table berisi seluruh sapi |
| Detail KTP Sapi | Halaman detail identitas sapi |
| QR Code Sapi | QR unik untuk setiap sapi |
| Statistik Master Sapi | Total sapi, gender, status, jenis |
| Export Dummy | CSV/PDF button dummy untuk demo |
| Audit Log Dummy | Riwayat perubahan data sapi |

---

## 6. Struktur Menu

Tambahkan menu pada sidebar/dashboard:

```txt
Master Data
└── Data Sapi / KTP Sapi
    ├── Semua Sapi
    ├── Sapi Aktif
    ├── Dalam Pemantauan
    ├── Siap Jual
    └── Arsip Sapi
```

Tambahkan quick action pada header mobile:

```txt
[Scan QR] [Tambah Sapi]
```

---

## 7. Halaman yang Harus Dibuat

### 7.1 `/dashboard/cattle`

Halaman utama daftar sapi.

#### Komponen UI
- Page title: **Master Data Sapi**.
- Subtitle: **Kelola identitas, QR Code, dan data awal ternak.**
- Summary cards:
  - Total Sapi Aktif.
  - Sapi Jantan.
  - Sapi Betina.
  - Siap Jual.
  - Dalam Pemantauan.
- Search bar.
- Filter dropdown:
  - Jenis sapi.
  - Gender.
  - Kandang.
  - Status.
- Toggle view:
  - Card View.
  - Table View.
- Button **Tambah Sapi**.
- Button **Export** dummy.

#### Mobile UI
Pada layar mobile, tampilkan:
- Search sticky di atas.
- Card list satu kolom.
- Floating action button:
  - Tambah Sapi.
  - Scan QR.

---

### 7.2 `/dashboard/cattle/new`

Halaman tambah sapi.

#### Form Layout
Gunakan form wizard 4 step agar mudah diisi oleh peternak.

##### Step 1 — Identitas Sapi
- ID Sapi.
- No. E-Artag.
- Nama/Kode panggilan.
- Jenis sapi.
- Jenis kelamin.
- Status awal.

##### Step 2 — Asal dan Masuk Kandang
- Asal sapi.
- Supplier/peternak asal.
- Tanggal masuk.
- Kandang/lokasi.

##### Step 3 — Data Awal Produksi
- Berat badan awal.
- Tanggal lahir.
- Estimasi umur.
- Harga beli.

##### Step 4 — Foto dan Review
- Upload foto sapi.
- Catatan internal.
- Preview data.
- Button Simpan.

---

### 7.3 `/dashboard/cattle/[id]`

Halaman detail KTP Sapi.

#### Layout Detail
Gunakan layout 2 kolom pada desktop dan 1 kolom pada mobile.

##### Header Detail
- Foto sapi besar.
- ID Sapi.
- Jenis sapi.
- Gender badge.
- Status badge.
- Kandang.
- Button Edit.
- Button QR Code.
- Button Arsipkan.

##### Tab Detail
1. **Profil**
   - Identitas dasar.
   - Asal dan pembelian.
   - Umur dan berat awal.
2. **QR Code**
   - QR preview.
   - Download label dummy.
   - Copy link dummy.
3. **Riwayat Terkait**
   - Placeholder untuk penimbangan.
   - Placeholder untuk kesehatan.
   - Placeholder untuk pakan.
4. **Audit Log**
   - Created by.
   - Last updated.
   - Activity dummy.

---

### 7.4 `/dashboard/cattle/[id]/edit`

Halaman edit data sapi.

- Gunakan form yang sama dengan tambah data.
- Data sudah terisi.
- Tombol utama: **Simpan Perubahan**.
- Tombol sekunder: **Batal**.
- Tampilkan warning: perubahan master data akan memengaruhi modul terkait.

---

### 7.5 Modal QR Code

Modal QR muncul dari daftar atau detail.

Isi modal:
- QR Code besar.
- ID Sapi.
- URL profil sapi dummy.
- Button Download PNG.
- Button Print Label.
- Button Copy Link.

---

## 8. Komponen Card Mobile Data Sapi

Card harus nyaman dibaca pada ponsel.

### Informasi di Card
- Foto sapi thumbnail.
- ID Sapi.
- Nama/kode panggilan.
- Jenis sapi.
- Gender icon.
- Berat awal atau berat terakhir jika tersedia dummy.
- Kandang.
- Status badge.
- Tombol quick action:
  - Detail.
  - QR.
  - Edit.

### Contoh Tampilan Card

```txt
[Foto] BF-2026-001        Aktif
       Simental • Jantan
       Kandang A • 320 Kg
       Masuk: 12 Jan 2026
       [Detail] [QR]
```

---

## 9. Table View Desktop

Kolom tabel:

| Kolom | Keterangan |
|---|---|
| Foto | Thumbnail sapi |
| ID Sapi | Kode unik |
| E-Artag | Nomor e-artag |
| Jenis | Jenis sapi |
| Gender | Jantan/Betina |
| Kandang | Lokasi kandang |
| Tanggal Masuk | Tanggal sapi masuk |
| Berat Awal | Kg |
| Harga Beli | Currency, admin only |
| Status | Badge |
| Action | Detail, Edit, QR, Arsip |

Fitur tabel:
- Search.
- Sort by ID, tanggal masuk, berat.
- Filter status.
- Pagination dummy 10 data per page.

---

## 10. UI Style Guide

### 10.1 Warna

Gunakan warna yang sesuai dengan gambar login Barbara Farm.

```txt
Primary Green: #005B3A
Dark Green: #003B2A
Soft Green: #EAF5EF
Accent Green: #10B981
Text Dark: #1F2937
Text Muted: #6B7280
Border: #E5E7EB
Background: #F8FAF9
Danger: #DC2626
Warning: #F59E0B
Info: #2563EB
```

### 10.2 Visual

- Rounded card: `rounded-2xl`.
- Shadow: soft shadow.
- Font: Inter atau system font.
- Card background putih.
- Badge status dengan warna lembut.
- Icon gunakan `lucide-react`.
- Tombol primary hijau tua.

### 10.3 UX Mobile

- Jangan gunakan tabel di mobile sebagai default.
- Gunakan kartu sapi.
- Gunakan bottom sheet untuk filter.
- Gunakan floating action button.
- Form dibuat bertahap agar tidak panjang.

---

## 11. Dummy Data dan Seed 25 Sapi

Buat file seed dummy frontend:

```txt
/src/data/cattle-seed.ts
```

Gunakan struktur berikut:

```ts
export type CattleGender = 'JANTAN' | 'BETINA';
export type CattleStatus = 'AKTIF' | 'PEMANTAUAN' | 'SIAP_JUAL' | 'TERJUAL' | 'ARSIP';

export interface Cattle {
  id: string;
  eartagNo?: string;
  name: string;
  breed: string;
  gender: CattleGender;
  originType: string;
  originName: string;
  entryDate: string;
  birthDate?: string;
  estimatedAgeMonths?: number;
  initialWeightKg: number;
  purchasePrice: number;
  photoUrl: string;
  pen: string;
  status: CattleStatus;
  notes?: string;
  qrUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const cattleSeed: Cattle[] = [
  {
    id: 'BF-2026-001',
    eartagNo: 'ID-ERT-260001',
    name: 'Simental 01',
    breed: 'Simental',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'CV Ternak Makmur',
    entryDate: '2026-01-12',
    estimatedAgeMonths: 18,
    initialWeightKg: 320,
    purchasePrice: 18500000,
    photoUrl: '/images/cattle/cow-01.jpg',
    pen: 'Kandang A',
    status: 'AKTIF',
    notes: 'Sapi sehat, adaptasi pakan baik.',
    qrUrl: '/public/cattle/BF-2026-001',
    createdAt: '2026-01-12T08:00:00.000Z',
    updatedAt: '2026-01-12T08:00:00.000Z'
  },
  {
    id: 'BF-2026-002',
    eartagNo: 'ID-ERT-260002',
    name: 'Limousin 01',
    breed: 'Limousin',
    gender: 'JANTAN',
    originType: 'Pasar Hewan',
    originName: 'Pasar Hewan Jonggol',
    entryDate: '2026-01-13',
    estimatedAgeMonths: 20,
    initialWeightKg: 355,
    purchasePrice: 21000000,
    photoUrl: '/images/cattle/cow-02.jpg',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Postur besar, cocok untuk penggemukan akhir.',
    qrUrl: '/public/cattle/BF-2026-002',
    createdAt: '2026-01-13T08:00:00.000Z',
    updatedAt: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'BF-2026-003',
    eartagNo: 'ID-ERT-260003',
    name: 'PO 01',
    breed: 'PO',
    gender: 'BETINA',
    originType: 'Peternak Lokal',
    originName: 'Pak Ridwan Farm',
    entryDate: '2026-01-15',
    estimatedAgeMonths: 16,
    initialWeightKg: 245,
    purchasePrice: 13200000,
    photoUrl: '/images/cattle/cow-03.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Betina produktif, kondisi baik.',
    qrUrl: '/public/cattle/BF-2026-003',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'BF-2026-004',
    eartagNo: 'ID-ERT-260004',
    name: 'Bali 01',
    breed: 'Bali',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Bali Cattle Center',
    entryDate: '2026-01-16',
    estimatedAgeMonths: 15,
    initialWeightKg: 230,
    purchasePrice: 11800000,
    photoUrl: '/images/cattle/cow-04.jpg',
    pen: 'Kandang C',
    status: 'PEMANTAUAN',
    notes: 'Perlu monitoring nafsu makan.',
    qrUrl: '/public/cattle/BF-2026-004',
    createdAt: '2026-01-16T08:00:00.000Z',
    updatedAt: '2026-01-25T08:00:00.000Z'
  },
  {
    id: 'BF-2026-005',
    eartagNo: 'ID-ERT-260005',
    name: 'Brahman 01',
    breed: 'Brahman',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Nusantara Beef Farm',
    entryDate: '2026-01-18',
    estimatedAgeMonths: 22,
    initialWeightKg: 390,
    purchasePrice: 24500000,
    photoUrl: '/images/cattle/cow-05.jpg',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Berat awal tinggi, prioritas program finishing.',
    qrUrl: '/public/cattle/BF-2026-005',
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-02-02T08:00:00.000Z'
  },
  {
    id: 'BF-2026-006',
    eartagNo: 'ID-ERT-260006',
    name: 'Madura 01',
    breed: 'Madura',
    gender: 'BETINA',
    originType: 'Pasar Hewan',
    originName: 'Pasar Hewan Madura',
    entryDate: '2026-01-20',
    estimatedAgeMonths: 17,
    initialWeightKg: 225,
    purchasePrice: 11200000,
    photoUrl: '/images/cattle/cow-06.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Adaptasi kandang normal.',
    qrUrl: '/public/cattle/BF-2026-006',
    createdAt: '2026-01-20T08:00:00.000Z',
    updatedAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'BF-2026-007',
    eartagNo: 'ID-ERT-260007',
    name: 'Brangus 01',
    breed: 'Brangus',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Agro Beef Indonesia',
    entryDate: '2026-01-22',
    estimatedAgeMonths: 21,
    initialWeightKg: 370,
    purchasePrice: 23200000,
    photoUrl: '/images/cattle/cow-07.jpg',
    pen: 'Kandang C',
    status: 'AKTIF',
    notes: 'Respons pakan konsentrat baik.',
    qrUrl: '/public/cattle/BF-2026-007',
    createdAt: '2026-01-22T08:00:00.000Z',
    updatedAt: '2026-01-22T08:00:00.000Z'
  },
  {
    id: 'BF-2026-008',
    eartagNo: 'ID-ERT-260008',
    name: 'Simental 02',
    breed: 'Simental',
    gender: 'BETINA',
    originType: 'Breeding Internal',
    originName: 'Barbara Farm',
    entryDate: '2026-01-23',
    birthDate: '2025-03-10',
    estimatedAgeMonths: 10,
    initialWeightKg: 210,
    purchasePrice: 0,
    photoUrl: '/images/cattle/cow-08.jpg',
    pen: 'Kandang D',
    status: 'AKTIF',
    notes: 'Hasil breeding internal.',
    qrUrl: '/public/cattle/BF-2026-008',
    createdAt: '2026-01-23T08:00:00.000Z',
    updatedAt: '2026-01-23T08:00:00.000Z'
  },
  {
    id: 'BF-2026-009',
    eartagNo: 'ID-ERT-260009',
    name: 'Limousin 02',
    breed: 'Limousin',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'CV Ternak Makmur',
    entryDate: '2026-01-24',
    estimatedAgeMonths: 19,
    initialWeightKg: 345,
    purchasePrice: 20500000,
    photoUrl: '/images/cattle/cow-09.jpg',
    pen: 'Kandang A',
    status: 'AKTIF',
    notes: 'Kondisi awal baik.',
    qrUrl: '/public/cattle/BF-2026-009',
    createdAt: '2026-01-24T08:00:00.000Z',
    updatedAt: '2026-01-24T08:00:00.000Z'
  },
  {
    id: 'BF-2026-010',
    eartagNo: 'ID-ERT-260010',
    name: 'PO 02',
    breed: 'PO',
    gender: 'JANTAN',
    originType: 'Peternak Lokal',
    originName: 'Pak Ridwan Farm',
    entryDate: '2026-01-25',
    estimatedAgeMonths: 18,
    initialWeightKg: 275,
    purchasePrice: 14500000,
    photoUrl: '/images/cattle/cow-10.jpg',
    pen: 'Kandang B',
    status: 'PEMANTAUAN',
    notes: 'Perlu cek ulang pertambahan berat.',
    qrUrl: '/public/cattle/BF-2026-010',
    createdAt: '2026-01-25T08:00:00.000Z',
    updatedAt: '2026-02-03T08:00:00.000Z'
  },
  {
    id: 'BF-2026-011',
    eartagNo: 'ID-ERT-260011',
    name: 'Bali 02',
    breed: 'Bali',
    gender: 'BETINA',
    originType: 'Supplier',
    originName: 'Bali Cattle Center',
    entryDate: '2026-01-26',
    estimatedAgeMonths: 14,
    initialWeightKg: 205,
    purchasePrice: 10500000,
    photoUrl: '/images/cattle/cow-11.jpg',
    pen: 'Kandang C',
    status: 'AKTIF',
    notes: 'Cocok untuk pembesaran.',
    qrUrl: '/public/cattle/BF-2026-011',
    createdAt: '2026-01-26T08:00:00.000Z',
    updatedAt: '2026-01-26T08:00:00.000Z'
  },
  {
    id: 'BF-2026-012',
    eartagNo: 'ID-ERT-260012',
    name: 'Brahman 02',
    breed: 'Brahman',
    gender: 'JANTAN',
    originType: 'Pasar Hewan',
    originName: 'Pasar Hewan Jonggol',
    entryDate: '2026-01-27',
    estimatedAgeMonths: 23,
    initialWeightKg: 410,
    purchasePrice: 25800000,
    photoUrl: '/images/cattle/cow-12.jpg',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Siap untuk proses negosiasi jual.',
    qrUrl: '/public/cattle/BF-2026-012',
    createdAt: '2026-01-27T08:00:00.000Z',
    updatedAt: '2026-02-05T08:00:00.000Z'
  },
  {
    id: 'BF-2026-013',
    eartagNo: 'ID-ERT-260013',
    name: 'Madura 02',
    breed: 'Madura',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Madura Livestock',
    entryDate: '2026-01-28',
    estimatedAgeMonths: 16,
    initialWeightKg: 240,
    purchasePrice: 12300000,
    photoUrl: '/images/cattle/cow-13.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Data lengkap.',
    qrUrl: '/public/cattle/BF-2026-013',
    createdAt: '2026-01-28T08:00:00.000Z',
    updatedAt: '2026-01-28T08:00:00.000Z'
  },
  {
    id: 'BF-2026-014',
    eartagNo: 'ID-ERT-260014',
    name: 'Brangus 02',
    breed: 'Brangus',
    gender: 'BETINA',
    originType: 'Supplier',
    originName: 'Agro Beef Indonesia',
    entryDate: '2026-01-29',
    estimatedAgeMonths: 20,
    initialWeightKg: 340,
    purchasePrice: 21800000,
    photoUrl: '/images/cattle/cow-14.jpg',
    pen: 'Kandang C',
    status: 'AKTIF',
    notes: 'Sehat dan aktif.',
    qrUrl: '/public/cattle/BF-2026-014',
    createdAt: '2026-01-29T08:00:00.000Z',
    updatedAt: '2026-01-29T08:00:00.000Z'
  },
  {
    id: 'BF-2026-015',
    eartagNo: 'ID-ERT-260015',
    name: 'Simental 03',
    breed: 'Simental',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'CV Ternak Makmur',
    entryDate: '2026-01-30',
    estimatedAgeMonths: 21,
    initialWeightKg: 365,
    purchasePrice: 22500000,
    photoUrl: '/images/cattle/cow-15.jpg',
    pen: 'Kandang A',
    status: 'AKTIF',
    notes: 'Kandidat siap jual bulan depan.',
    qrUrl: '/public/cattle/BF-2026-015',
    createdAt: '2026-01-30T08:00:00.000Z',
    updatedAt: '2026-01-30T08:00:00.000Z'
  },
  {
    id: 'BF-2026-016',
    eartagNo: 'ID-ERT-260016',
    name: 'Limousin 03',
    breed: 'Limousin',
    gender: 'BETINA',
    originType: 'Breeding Internal',
    originName: 'Barbara Farm',
    entryDate: '2026-02-01',
    birthDate: '2025-02-15',
    estimatedAgeMonths: 11,
    initialWeightKg: 230,
    purchasePrice: 0,
    photoUrl: '/images/cattle/cow-16.jpg',
    pen: 'Kandang D',
    status: 'AKTIF',
    notes: 'Anakan internal, perkembangan baik.',
    qrUrl: '/public/cattle/BF-2026-016',
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'BF-2026-017',
    eartagNo: 'ID-ERT-260017',
    name: 'PO 03',
    breed: 'PO',
    gender: 'BETINA',
    originType: 'Peternak Lokal',
    originName: 'Pak Ridwan Farm',
    entryDate: '2026-02-02',
    estimatedAgeMonths: 15,
    initialWeightKg: 235,
    purchasePrice: 12000000,
    photoUrl: '/images/cattle/cow-17.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Tidak ada catatan khusus.',
    qrUrl: '/public/cattle/BF-2026-017',
    createdAt: '2026-02-02T08:00:00.000Z',
    updatedAt: '2026-02-02T08:00:00.000Z'
  },
  {
    id: 'BF-2026-018',
    eartagNo: 'ID-ERT-260018',
    name: 'Bali 03',
    breed: 'Bali',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Bali Cattle Center',
    entryDate: '2026-02-03',
    estimatedAgeMonths: 17,
    initialWeightKg: 255,
    purchasePrice: 12800000,
    photoUrl: '/images/cattle/cow-18.jpg',
    pen: 'Kandang C',
    status: 'PEMANTAUAN',
    notes: 'Pantau adaptasi pakan hijauan.',
    qrUrl: '/public/cattle/BF-2026-018',
    createdAt: '2026-02-03T08:00:00.000Z',
    updatedAt: '2026-02-06T08:00:00.000Z'
  },
  {
    id: 'BF-2026-019',
    eartagNo: 'ID-ERT-260019',
    name: 'Brahman 03',
    breed: 'Brahman',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Nusantara Beef Farm',
    entryDate: '2026-02-04',
    estimatedAgeMonths: 24,
    initialWeightKg: 430,
    purchasePrice: 27000000,
    photoUrl: '/images/cattle/cow-19.jpg',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Sapi premium untuk penjualan besar.',
    qrUrl: '/public/cattle/BF-2026-019',
    createdAt: '2026-02-04T08:00:00.000Z',
    updatedAt: '2026-02-08T08:00:00.000Z'
  },
  {
    id: 'BF-2026-020',
    eartagNo: 'ID-ERT-260020',
    name: 'Madura 03',
    breed: 'Madura',
    gender: 'BETINA',
    originType: 'Pasar Hewan',
    originName: 'Pasar Hewan Madura',
    entryDate: '2026-02-05',
    estimatedAgeMonths: 18,
    initialWeightKg: 250,
    purchasePrice: 12600000,
    photoUrl: '/images/cattle/cow-20.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Adaptasi normal.',
    qrUrl: '/public/cattle/BF-2026-020',
    createdAt: '2026-02-05T08:00:00.000Z',
    updatedAt: '2026-02-05T08:00:00.000Z'
  },
  {
    id: 'BF-2026-021',
    eartagNo: 'ID-ERT-260021',
    name: 'Brangus 03',
    breed: 'Brangus',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Agro Beef Indonesia',
    entryDate: '2026-02-06',
    estimatedAgeMonths: 22,
    initialWeightKg: 385,
    purchasePrice: 24000000,
    photoUrl: '/images/cattle/cow-21.jpg',
    pen: 'Kandang C',
    status: 'AKTIF',
    notes: 'Pertumbuhan diprediksi bagus.',
    qrUrl: '/public/cattle/BF-2026-021',
    createdAt: '2026-02-06T08:00:00.000Z',
    updatedAt: '2026-02-06T08:00:00.000Z'
  },
  {
    id: 'BF-2026-022',
    eartagNo: 'ID-ERT-260022',
    name: 'Simental 04',
    breed: 'Simental',
    gender: 'BETINA',
    originType: 'Supplier',
    originName: 'CV Ternak Makmur',
    entryDate: '2026-02-07',
    estimatedAgeMonths: 19,
    initialWeightKg: 330,
    purchasePrice: 19800000,
    photoUrl: '/images/cattle/cow-22.jpg',
    pen: 'Kandang D',
    status: 'AKTIF',
    notes: 'Data siap untuk monitoring pertumbuhan.',
    qrUrl: '/public/cattle/BF-2026-022',
    createdAt: '2026-02-07T08:00:00.000Z',
    updatedAt: '2026-02-07T08:00:00.000Z'
  },
  {
    id: 'BF-2026-023',
    eartagNo: 'ID-ERT-260023',
    name: 'Limousin 04',
    breed: 'Limousin',
    gender: 'JANTAN',
    originType: 'Supplier',
    originName: 'Nusantara Beef Farm',
    entryDate: '2026-02-08',
    estimatedAgeMonths: 20,
    initialWeightKg: 360,
    purchasePrice: 21500000,
    photoUrl: '/images/cattle/cow-23.jpg',
    pen: 'Kandang A',
    status: 'AKTIF',
    notes: 'Sapi aktif dan responsif.',
    qrUrl: '/public/cattle/BF-2026-023',
    createdAt: '2026-02-08T08:00:00.000Z',
    updatedAt: '2026-02-08T08:00:00.000Z'
  },
  {
    id: 'BF-2026-024',
    eartagNo: 'ID-ERT-260024',
    name: 'PO 04',
    breed: 'PO',
    gender: 'JANTAN',
    originType: 'Peternak Lokal',
    originName: 'Pak Ridwan Farm',
    entryDate: '2026-02-09',
    estimatedAgeMonths: 17,
    initialWeightKg: 265,
    purchasePrice: 13800000,
    photoUrl: '/images/cattle/cow-24.jpg',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Cocok untuk penggemukan standar.',
    qrUrl: '/public/cattle/BF-2026-024',
    createdAt: '2026-02-09T08:00:00.000Z',
    updatedAt: '2026-02-09T08:00:00.000Z'
  },
  {
    id: 'BF-2026-025',
    eartagNo: 'ID-ERT-260025',
    name: 'Bali 04',
    breed: 'Bali',
    gender: 'BETINA',
    originType: 'Supplier',
    originName: 'Bali Cattle Center',
    entryDate: '2026-02-10',
    estimatedAgeMonths: 15,
    initialWeightKg: 215,
    purchasePrice: 11000000,
    photoUrl: '/images/cattle/cow-25.jpg',
    pen: 'Kandang C',
    status: 'ARSIP',
    notes: 'Contoh data arsip untuk kebutuhan demo.',
    qrUrl: '/public/cattle/BF-2026-025',
    createdAt: '2026-02-10T08:00:00.000Z',
    updatedAt: '2026-02-15T08:00:00.000Z'
  }
];
```

---

## 12. State Management Frontend Demo

Untuk tahap UI demo, gunakan local state atau Zustand.

### Fungsi yang dibutuhkan

```ts
getAllCattle()
getCattleById(id)
createCattle(data)
updateCattle(id, data)
archiveCattle(id, reason)
deleteCattleDemoOnly(id)
filterCattle(params)
searchCattle(keyword)
generateQrUrl(id)
```

Catatan:
- `deleteCattleDemoOnly` hanya untuk demo internal.
- Default UX adalah **arsip**, bukan hapus permanen.

---

## 13. Validasi Form

Gunakan validasi frontend:

1. ID Sapi wajib dan unik.
2. Jenis sapi wajib dipilih.
3. Jenis kelamin wajib dipilih.
4. Tanggal masuk wajib.
5. Berat badan awal wajib dan harus lebih dari 0.
6. Harga beli wajib untuk role admin, boleh 0 untuk breeding internal.
7. Foto maksimal dummy 5 MB.
8. Kandang wajib dipilih.
9. Jika tanggal lahir diisi, estimasi umur otomatis dihitung.

---

## 14. Empty State dan Error State

### Empty State
Jika data sapi kosong:

```txt
Belum ada data sapi.
Mulai tambahkan sapi pertama untuk membuat KTP Sapi dan QR Code.
[Tambah Sapi]
```

### Error State
Jika ID sapi tidak ditemukan:

```txt
Data sapi tidak ditemukan.
Periksa kembali ID sapi atau gunakan fitur scan QR.
[Scan QR] [Kembali ke Daftar]
```

---

## 15. Integrasi dengan Modul Lain

Modul Master Data Sapi harus menjadi sumber data untuk:

1. **QR Scan**
   - QR membuka profil sapi berdasarkan ID.

2. **Monitoring Pertumbuhan**
   - Log penimbangan menggunakan ID sapi.
   - Berat awal berasal dari master data.

3. **Kesehatan & Medis**
   - Riwayat pengobatan menempel pada ID sapi.

4. **Feeding**
   - Biaya pakan dapat dikaitkan per sapi atau per kandang.

5. **Penjualan**
   - Data harga beli dan berat awal digunakan untuk menghitung keuntungan.

6. **Dashboard**
   - Statistik jumlah sapi, status, dan kandang berasal dari master data.

---

## 16. Acceptance Criteria

### 16.1 Daftar Sapi
- User dapat melihat 25 seed data sapi.
- User dapat mencari sapi berdasarkan ID, nama, jenis, atau kandang.
- User dapat memfilter berdasarkan status, jenis sapi, gender, dan kandang.
- Mobile menampilkan card view secara default.
- Desktop menampilkan table view yang rapi.

### 16.2 Tambah Sapi
- User dapat membuka halaman tambah sapi.
- Form dibuat dalam step/wizard.
- User dapat menyimpan data baru secara dummy.
- Setelah simpan, sistem menampilkan detail sapi.
- QR Code otomatis tersedia.

### 16.3 Detail Sapi
- User dapat melihat detail KTP Sapi.
- User dapat melihat QR Code.
- User dapat melihat placeholder riwayat modul terkait.
- User dapat melihat audit log dummy.

### 16.4 Edit Sapi
- User dapat mengubah data sapi.
- Sistem menampilkan konfirmasi sebelum simpan.
- Data berubah di UI setelah disimpan.

### 16.5 Arsip Sapi
- User dapat mengarsipkan sapi dengan alasan.
- Sapi arsip tidak tampil di filter aktif.
- Sapi arsip tetap bisa dilihat jika filter arsip dipilih.

---

## 17. Instruksi Implementasi untuk Google Antigravity

Bangun UI/UX modul **Master Data Sapi / KTP Sapi** untuk aplikasi SmartFarm dengan Next.js dan Tailwind CSS.

Prioritaskan tampilan mobile-first untuk peternak. Gunakan gaya visual Barbara Farm berdasarkan halaman login: warna hijau tua, putih bersih, soft green background, rounded card, icon modern, dan UX yang mudah digunakan saat berada di kandang.

Buat halaman:

1. `/dashboard/cattle` untuk daftar sapi.
2. `/dashboard/cattle/new` untuk tambah sapi dengan wizard form 4 step.
3. `/dashboard/cattle/[id]` untuk detail KTP Sapi dengan tab Profil, QR Code, Riwayat Terkait, dan Audit Log.
4. `/dashboard/cattle/[id]/edit` untuk edit sapi.

Gunakan seed data 25 sapi dari dokumen ini. Buat file `/src/data/cattle-seed.ts`. Implementasikan CRUD dummy menggunakan local state atau Zustand. Jangan gunakan backend dulu.

Pastikan UI memiliki:

- Summary statistic cards.
- Search dan filter.
- Card view mobile.
- Table view desktop.
- QR Code modal.
- Form validation.
- Empty state.
- Error state.
- Archive flow, bukan hard delete.
- Responsive layout.
- Dummy image fallback jika foto tidak tersedia.

Gunakan komponen reusable:

```txt
CattleCard
CattleTable
CattleFilters
CattleSummaryCards
CattleFormWizard
CattleDetailHeader
CattleQrModal
CattleStatusBadge
CattleAuditLog
ArchiveCattleDialog
```

Gunakan icon dari lucide-react:

```txt
Cow, QrCode, Search, Plus, Filter, Edit, Archive, Trash2, Calendar, MapPin, Weight, BadgeDollarSign, VenusAndMars, Camera, Download, Printer, Copy, Eye
```

Selesaikan sebagai UI demo yang terlihat siap dipresentasikan ke client peternakan.

---

## 18. Catatan Penting

- Jangan menggunakan istilah teknis yang terlalu rumit di UI peternak.
- Gunakan bahasa Indonesia.
- Harga beli hanya tampil untuk role admin/owner.
- Default data sapi aktif, bukan arsip.
- QR Code harus menjadi identitas utama sapi.
- Semua data dummy harus bisa dikembangkan menjadi API pada tahap backend.

