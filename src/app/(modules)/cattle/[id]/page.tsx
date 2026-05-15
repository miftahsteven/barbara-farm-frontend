'use client';

import React, { use, useState, useEffect } from 'react';
import { useCattleStore, type Cattle } from '@/lib/useCattleStore';
import { apiFetch } from '@/lib/useAuthStore';
import { CattleProfileHeader } from '@/components/cattle/CattleProfileHeader';
import { CattleQrModal } from '@/components/cattle/CattleQrModal';
import { CattleFormWizard } from '@/components/cattle/CattleFormWizard';
import { CattleTrackerModal } from '@/components/cattle/CattleTrackerModal';
import { 
  TrendingUp, 
  Stethoscope, 
  UtensilsCrossed, 
  ShoppingBag, 
  Info,
  AlertTriangle,
  History,
  UserCheck,
  CalendarDays,
  Loader2,
  X,
  ExternalLink,
  ChevronLeft,
  Navigation
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CattleDetailPageProps {
  params: Promise<{ id: string }>;
}

function CattleDetailPageContent({ params }: CattleDetailPageProps) {
  const resolvedParams = use(params);
  const id = decodeURIComponent(resolvedParams.id);
  const searchParams = useSearchParams();
  const { cattle } = useCattleStore();
  
  const [cattleData, setCattleData] = useState<Cattle | null>(
    cattle.find(c => c.id === id) || null
  );
  const [isFetching, setIsFetching] = useState(!cattleData);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');
  const [showQr, setShowQr] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);

  const { updateCattle } = useCattleStore();

  useEffect(() => {
    // Show cached data first for immediate rendering
    const fromStore = cattle.find(c => c.id === id);
    if (fromStore) {
      setCattleData(fromStore);
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }

    // Always fetch fresh data to get relations (like 'dam', 'growthLogs')
    apiFetch(`/cattle/${encodeURIComponent(id)}`)
      .then(res => {
        if (!res.ok) {
          if (!fromStore) setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setCattleData(data);
      })
      .catch(() => {
        if (!fromStore) setNotFound(true);
      })
      .finally(() => setIsFetching(false));
  }, [id, cattle]);

  const calculateDynamicAge = (birthDate?: string, estimatedMonthsAtEntry?: number, entryDate?: string) => {
    const now = new Date();
    
    if (birthDate) {
      const birth = new Date(birthDate);
      const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      if (months < 0) return '0 Bulan';
      if (months < 12) return `${months} Bulan`;
      return `${Math.floor(months / 12)} Tahun ${months % 12} Bulan`;
    }

    if (estimatedMonthsAtEntry !== undefined && entryDate) {
      const entry = new Date(entryDate);
      const monthsSinceEntry = (now.getFullYear() - entry.getFullYear()) * 12 + (now.getMonth() - entry.getMonth());
      const totalMonths = estimatedMonthsAtEntry + monthsSinceEntry;
      if (totalMonths < 12) return `${totalMonths} Bulan`;
      return `${Math.floor(totalMonths / 12)} Tahun ${totalMonths % 12} Bulan`;
    }

    return '-';
  };

  // Auto-open edit modal if query param is present
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setShowEditModal(true);
    }
  }, [searchParams]);

  const handleUpdate = async (data: Partial<Cattle>) => {
    try {
      const updated = await updateCattle(id, data);
      setShowEditModal(false);
      
      // If ID changed, we must redirect to the new URL
      if (updated && updated.id !== id) {
        window.location.href = `/cattle/${encodeURIComponent(updated.id)}`;
        return;
      }

      // Refresh local data if ID didn't change
      const response = await apiFetch(`/cattle/${encodeURIComponent(id)}`);
      if (response.ok) {
        const refreshed = await response.json();
        setCattleData(refreshed);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal memperbarui data sapi');
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Loader2 className="w-10 h-10 text-[#006B3F] animate-spin mb-4" />
        <p className="text-[#68746D]">Memuat data sapi...</p>
      </div>
    );
  }

  if (notFound || !cattleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-[#17211B] mb-2">Sapi Tidak Ditemukan</h1>
        <p className="text-[#68746D]">ID Sapi {id} tidak terdaftar.</p>
      </div>
    );
  }

  // Map to format expected by Header
  const headerCattle = {
    ...cattleData,
    image: cattleData.photoUrl,
    barn: cattleData.pen,
    lastWeighingDate: cattleData.updatedAt ? new Date(cattleData.updatedAt).toLocaleDateString('id-ID') : '-',
    healthBadge: cattleData.status === 'AKTIF' ? 'Normal' : (cattleData.status === 'PEMANTAUAN' ? 'Perlu Monitoring' : (cattleData.status === 'TERJUAL' ? 'Terjual' : 'Arsip'))
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const tabs = [
    { id: 'profil', label: 'Profil', icon: <Info className="w-4 h-4" /> },
    ...(cattleData.status !== 'ARSIP' && cattleData.status !== 'TERJUAL' 
      ? [{ id: 'lokasi', label: 'Lokasi GPS', icon: <Navigation className="w-4 h-4" /> }] 
      : []),
    { id: 'qr', label: 'QR Code', icon: <History className="w-4 h-4" /> },
    { id: 'riwayat', label: 'Riwayat Terkait', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <CattleProfileHeader 
        cattle={headerCattle as any} 
        onEdit={() => setShowEditModal(true)}
        onLocate={() => setShowTrackerModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-[#DDE7E1] shadow-sm overflow-hidden min-h-[500px]">
          <div className="flex border-b border-[#DDE7E1] overflow-x-auto no-scrollbar bg-[#F7FAF8]/50">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-5 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'border-[#006B3F] text-[#006B3F] bg-white' : 'border-transparent text-[#68746D] hover:bg-white/50'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-12 animate-in fade-in duration-500">
            {activeTab === 'profil' && (
              <div className="grid lg:grid-cols-2 gap-12">
                <section className="space-y-8">
                  <h3 className="text-xl font-bold text-[#17211B] flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
                    Identitas Utama
                  </h3>
                  <div className="grid grid-cols-2 gap-y-8">
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">No. E-Artag</p>
                      <p className="font-bold text-[#17211B]">{cattleData.eartagNo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Jenis Kelamin</p>
                      <p className="font-bold text-[#17211B]">{cattleData.gender}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Asal Sapi</p>
                      <p className="font-bold text-[#17211B]">{cattleData.originType}</p>
                    </div>
                    
                    {cattleData.dam ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Indukan (Dam)</p>
                        <Link 
                          href={`/cattle/${encodeURIComponent(cattleData.dam.id)}`}
                          className="flex items-center gap-2 group"
                        >
                          <span className="font-bold text-[#006B3F] group-hover:underline">{cattleData.dam.id}</span>
                          <ExternalLink className="w-3 h-3 text-[#006B3F]" />
                        </Link>
                        <p className="text-[10px] text-[#68746D] italic">Klik untuk lihat profil indukan</p>
                      </div>
                    ) : cattleData.damId ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Indukan (Dam)</p>
                        <Link 
                          href={`/cattle/${encodeURIComponent(cattleData.damId)}`}
                          className="flex items-center gap-2 group"
                        >
                          <span className="font-bold text-[#006B3F] group-hover:underline">{cattleData.damId}</span>
                          <ExternalLink className="w-3 h-3 text-[#006B3F]" />
                        </Link>
                        <p className="text-[10px] text-[#68746D] italic">ID Indukan Terdaftar</p>
                      </div>
                    ) : cattleData.damAlias ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Indukan (Dam)</p>
                        <p className="font-bold text-[#17211B]">{cattleData.damAlias}</p>
                        <p className="text-[10px] text-[#68746D] italic">Kode Alias Indukan</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Indukan (Dam)</p>
                        <p className="font-bold text-[#68746D]">-</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Nama Supplier</p>
                      <p className="font-bold text-[#17211B]">{cattleData.originName}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-xl font-bold text-[#17211B] flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
                    Data Pembelian & Umur
                  </h3>
                  <div className="grid grid-cols-2 gap-y-8">
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Tanggal Masuk</p>
                      <p className="font-bold text-[#17211B]">{formatDate(cattleData.entryDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Berat Awal</p>
                      <p className="font-bold text-[#17211B]">{cattleData.initialWeightKg} Kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Harga Beli</p>
                      <p className="font-bold text-[#006B3F]">Rp {cattleData.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1 tracking-widest">Estimasi Umur</p>
                      <p className="font-bold text-[#17211B]">
                        {calculateDynamicAge(cattleData.birthDate, cattleData.estimatedAgeMonths, cattleData.entryDate)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="lg:col-span-2 pt-8 border-t border-[#DDE7E1]">
                  <h3 className="text-xl font-bold text-[#17211B] mb-4">Catatan Master Data</h3>
                  <p className="text-sm text-[#68746D] leading-relaxed bg-[#F7FAF8] p-6 rounded-2xl border border-[#DDE7E1] whitespace-pre-wrap">
                    {cattleData.notes || 'Tidak ada catatan tambahan untuk sapi ini.'}
                  </p>
                </section>
              </div>
            )}

            {activeTab === 'lokasi' && (
              <div className="py-16 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#EAF6F0] rounded-full flex items-center justify-center mb-6 text-5xl">🐄</div>
                <h3 className="text-2xl font-black text-[#17211B] mb-3">Pelacak GPS Ternak</h3>
                <p className="text-[#68746D] max-w-sm mb-8 leading-relaxed">
                  Pantau pergerakan <strong>{cattleData.id}</strong> secara live atau lihat posisi terkini via kalung GPS yang terpasang.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowTrackerModal(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-500/20"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Live Tracking
                  </button>
                  <button
                    onClick={() => setShowTrackerModal(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
                  >
                    <Navigation className="w-5 h-5" />
                    Posisi Sekarang
                  </button>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-md">
                  {[{label:'Status Kalung', value:'Aktif ✓', color:'text-green-600'},{label:'Signal GPS', value:'Baik', color:'text-green-600'},{label:'Baterai', value:'78%', color:'text-[#006B3F]'}].map(s => (
                    <div key={s.label} className="bg-[#F7FAF8] rounded-2xl p-4 border border-[#DDE7E1]">
                      <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider mb-1">{s.label}</p>
                      <p className={`font-black text-sm ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="flex flex-col items-center py-12">
                <div className="p-8 bg-white rounded-[2.5rem] border-2 border-[#DDE7E1] mb-8 shadow-xl">
                  <div className="w-64 h-64 flex items-center justify-center">
                    <QRCodeSVG 
                      value={process.env.NEXT_PUBLIC_FRONTEND_URL ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/cattle/${encodeURIComponent(cattleData.id)}` : `https://barbara.mscode.id/cattle/${encodeURIComponent(cattleData.id)}`}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-[#17211B] mb-2">{cattleData.id}</h4>
                <p className="text-[#68746D] mb-8">ID ini adalah identitas unik permanen sapi.</p>
                <button 
                  onClick={() => setShowQr(true)}
                  className="px-8 py-4 bg-[#006B3F] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#004D2E] transition-all"
                >
                  Buka Label QR
                </button>
              </div>
            )}

            {activeTab === 'riwayat' && (
              <div className="py-20 flex flex-col items-center text-center opacity-50">
                <TrendingUp className="w-16 h-16 text-[#DDE7E1] mb-6" />
                <h3 className="text-xl font-bold text-[#17211B]">Riwayat Terintegrasi</h3>
                <p className="text-[#68746D] max-w-sm mt-2">
                  Riwayat penimbangan, medis, dan pakan akan muncul otomatis setelah modul terkait diimplementasikan.
                </p>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                  <div className="p-2 bg-white rounded-lg">
                    <CalendarDays className="w-5 h-5 text-[#006B3F]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#17211B]">Data Dibuat</p>
                    <p className="text-xs text-[#68746D]">Oleh Admin Barbara Farm • {formatDate(cattleData.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                  <div className="p-2 bg-white rounded-lg">
                    <History className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#17211B]">Update Terakhir</p>
                    <p className="text-xs text-[#68746D]">Sistem Sinkronisasi Otomatis • {formatDate(cattleData.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CattleQrModal 
        cattle={showQr ? cattleData : null} 
        onClose={() => setShowQr(false)} 
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[110] overflow-y-auto">
          {/* Fixed Backdrop */}
          <div 
            className="fixed inset-0 bg-[#17211B]/80 backdrop-blur-md animate-in fade-in duration-500" 
            onClick={() => setShowEditModal(false)}
          />
          
          {/* Scrollable Container */}
          <div className="relative min-h-screen flex items-start justify-center p-4 md:p-12 pointer-events-none">
            <div className="relative w-full max-w-4xl my-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 z-10 pointer-events-auto">
              {/* Direct Close Button */}
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute -top-12 right-0 md:-right-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all group shadow-xl"
                title="Tutup (Skip)"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <CattleFormWizard 
                initialData={{
                  ...cattleData,
                  entryDate: cattleData.entryDate.split('T')[0],
                  birthDate: cattleData.birthDate ? cattleData.birthDate.split('T')[0] : undefined,
                }}
                isEdit={true}
                onSubmit={handleUpdate}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      <CattleTrackerModal 
        cattle={showTrackerModal ? (cattle.find(c => c.id === cattleData.id) || cattleData) : null}
        onClose={() => setShowTrackerModal(false)}
      />
    </div>
  );
}

export default function CattleDetailPage(props: CattleDetailPageProps) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8]">
        <Loader2 className="w-12 h-12 animate-spin text-[#006B3F]" />
      </div>
    }>
      <CattleDetailPageContent {...props} />
    </React.Suspense>
  );
}
