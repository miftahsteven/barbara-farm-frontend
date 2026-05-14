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
  latestWeightKg?: number; // Added for tracking
  purchasePrice: number;
  photoUrl: string;
  pen: string;
  status: CattleStatus;
  notes?: string;
  qrUrl: string;
  createdAt: string;
  updatedAt: string;
  healthBadge?: string; // For compatibility with QR Scan
  adg?: number; // For compatibility
}

export const breeds = ["Limousin", "Simental", "Bali", "Angus", "Brahman", "PO", "Madura", "Brangus"];
export const pens = ["Kandang A", "Kandang B", "Kandang C", "Kandang D", "Kandang A1", "Kandang A2"];
export const origins = ["Supplier", "Pasar Hewan", "Peternak Lokal", "Breeding Internal"];

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
    latestWeightKg: 415,
    purchasePrice: 18500000,
    photoUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=800',
    pen: 'Kandang A',
    status: 'AKTIF',
    notes: 'Sapi sehat, adaptasi pakan baik.',
    qrUrl: '/public/cattle/BF-2026-001',
    healthBadge: 'Normal',
    adg: 1.2,
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
    latestWeightKg: 420,
    purchasePrice: 21000000,
    photoUrl: 'https://images.unsplash.com/photo-1527153369174-43d75a6f9321?q=80&w=800',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Postur besar, cocok untuk penggemukan akhir.',
    qrUrl: '/public/cattle/BF-2026-002',
    healthBadge: 'Normal',
    adg: 1.5,
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
    latestWeightKg: 275,
    purchasePrice: 13200000,
    photoUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=800',
    pen: 'Kandang B',
    status: 'AKTIF',
    notes: 'Betina produktif, kondisi baik.',
    qrUrl: '/public/cattle/BF-2026-003',
    healthBadge: 'Normal',
    adg: 0.8,
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
    latestWeightKg: 260,
    purchasePrice: 11800000,
    photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800',
    pen: 'Kandang C',
    status: 'PEMANTAUAN',
    notes: 'Perlu monitoring nafsu makan.',
    qrUrl: '/public/cattle/BF-2026-004',
    healthBadge: 'ADG Rendah',
    adg: 0.4,
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
    latestWeightKg: 480,
    purchasePrice: 24500000,
    photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=800',
    pen: 'Kandang A',
    status: 'SIAP_JUAL',
    notes: 'Berat awal tinggi, prioritas program finishing.',
    qrUrl: '/public/cattle/BF-2026-005',
    healthBadge: 'Normal',
    adg: 1.8,
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-02-02T08:00:00.000Z'
  }
];

// Dynamically generate the remaining 20 seed data to match the 25 requested
const generateRemainingSeed = (startIdx: number, count: number): Cattle[] => {
  const breedsList = ["Limousin", "Simental", "Bali", "Angus", "Brahman", "PO", "Madura", "Brangus"];
  const pensList = ["Kandang A", "Kandang B", "Kandang C", "Kandang D"];
  const statusesList: CattleStatus[] = ['AKTIF', 'PEMANTAUAN', 'SIAP_JUAL', 'TERJUAL', 'ARSIP'];
  
  return Array.from({ length: count }, (_, i) => {
    const idx = startIdx + i;
    const id = `BF-2026-${idx.toString().padStart(3, '0')}`;
    const breed = breedsList[idx % breedsList.length];
    const status = idx === 25 ? 'ARSIP' : (idx % 10 === 0 ? 'SIAP_JUAL' : (idx % 7 === 0 ? 'PEMANTAUAN' : 'AKTIF'));
    const initialWeight = 200 + (idx * 5);
    
    return {
      id,
      eartagNo: `ID-ERT-260${idx.toString().padStart(3, '0')}`,
      name: `${breed} ${idx}`,
      breed,
      gender: idx % 5 === 0 ? 'BETINA' : 'JANTAN',
      originType: origins[idx % origins.length],
      originName: 'Supplier SmartFarm',
      entryDate: `2026-01-${(10 + (idx % 20)).toString().padStart(2, '0')}`,
      estimatedAgeMonths: 12 + (idx % 12),
      initialWeightKg: initialWeight,
      latestWeightKg: initialWeight + 40,
      purchasePrice: 10000000 + (idx * 500000),
      photoUrl: `https://images.unsplash.com/photo-${[
        "1546445317-29f4545e9d53",
        "1527153369174-43d75a6f9321",
        "1596733430284-f7437764b1a9",
        "1500595046743-cd271d694d30",
        "1570042225831-d98fa7577f1e"
      ][idx % 5]}?q=80&w=800`,
      pen: pensList[idx % pensList.length],
      status: status as CattleStatus,
      notes: 'Data seed otomatis untuk demo.',
      qrUrl: `/public/cattle/${id}`,
      healthBadge: status === 'PEMANTAUAN' ? 'Perlu Cek' : 'Normal',
      adg: 0.5 + (idx * 0.05),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

export const cattleData: Cattle[] = [
  ...cattleSeed,
  ...generateRemainingSeed(6, 20)
];
