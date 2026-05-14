export const dummyUser = {
  id: 'USR-001',
  name: 'Miftah Steven',
  email: 'owner@barbarafarm.id',
  phone: '+62 812-0000-0000',
  role: 'Owner',
  farmName: 'Barbara Farm',
  position: 'Pemilik Peternakan',
  location: 'Bekasi, Jawa Barat',
  status: 'Active',
  lastLogin: 'Hari ini, 09:42 WIB',
  twoFactorEnabled: true,
};

export const dummyNotifications = [
  {
    id: 'NTF-001',
    type: 'warning',
    title: 'ADG di bawah rata-rata',
    description: 'Sapi BF-0007 mengalami kenaikan berat di bawah rata-rata.',
    time: '10 menit lalu',
  },
  {
    id: 'NTF-002',
    type: 'info',
    title: 'Jadwal vaksinasi',
    description: 'Vaksinasi PMK untuk kandang A dijadwalkan besok pukul 09.00.',
    time: '1 jam lalu',
  },
  {
    id: 'NTF-003',
    type: 'danger',
    title: 'Data timbang belum lengkap',
    description: '12 sapi belum memiliki data penimbangan minggu ini.',
    time: '3 jam lalu',
  },
];

export const dashboardMetrics = [
  {
    label: 'Total Sapi Aktif',
    value: '128',
    suffix: 'ekor',
    trend: '+8 bulan ini',
  },
  {
    label: 'Rata-rata ADG',
    value: '0.82',
    suffix: 'kg/hari',
    trend: '+0.07 dari bulan lalu',
  },
  {
    label: 'Sapi Perlu Perhatian',
    value: '7',
    suffix: 'ekor',
    trend: 'Butuh pengecekan',
  },
  {
    label: 'Estimasi Profit',
    value: 'Rp 186.500.000',
    suffix: '',
    trend: 'Proyeksi berjalan',
  },
];
