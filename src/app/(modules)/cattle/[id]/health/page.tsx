'use client';

import React, { use } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useHealthStore } from '@/lib/useHealthStore';
import { MedicalTimeline } from '@/components/health/MedicalTimeline';
import { WithdrawalAlert } from '@/components/health/WithdrawalAlert';
import { CattleProfileHeader } from '@/components/cattle/CattleProfileHeader';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  History, 
  Stethoscope, 
  ChevronLeft, 
  Plus, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface CattleHealthDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CattleHealthDetailPage({ params }: CattleHealthDetailPageProps) {
  const { id: rawId } = use(params);
  const id = decodeURIComponent(rawId);
  const router = useRouter();
  const { cattle, fetchCattle, isLoading: cattleLoading } = useCattleStore();
  const { records, fetchRecords, isLoading: healthLoading } = useHealthStore();
  
  React.useEffect(() => {
    fetchCattle();
    fetchRecords();
  }, [fetchCattle, fetchRecords]);

  if (cattleLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#68746D] font-bold">Memuat Data Kesehatan...</p>
        </div>
      </div>
    );
  }

  const cow = cattle.find(c => c.id === id);
  const cowRecords = Array.isArray(records) ? records.filter(r => r.cattleId === id) : [];
  
  const isSick = cowRecords.some(r => r.status === 'active' || r.status === 'treatment');
  const activeWithdrawal = cowRecords.find(r => {
    const today = new Date();
    return r.safeToSellDate && new Date(r.safeToSellDate) > today && r.status !== 'closed';
  });

  if (!cow) return <div>Sapi tidak ditemukan</div>;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Header data mapping
  const headerCattle = {
    ...cow,
    image: cow.photoUrl,
    barn: cow.pen,
    lastWeighingDate: cow.updatedAt.split('T')[0],
    healthBadge: isSick ? 'Sakit / Perawatan' : 'Sehat'
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <CattleProfileHeader cattle={headerCattle as any} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {activeWithdrawal && (
              <WithdrawalAlert safeToSellDate={formatDate(activeWithdrawal.safeToSellDate! as any)} />
            )}

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-[#17211B] flex items-center gap-3">
                  <History className="w-6 h-6 text-[#006B3F]" />
                  Riwayat Medis
                </h3>
                <button 
                  onClick={() => router.push(`/health/create?cowId=${encodeURIComponent(id)}`)}
                  className="px-6 py-3 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-[#006B3F]/10"
                >
                  <Plus className="w-4 h-4" />
                  Catat Baru
                </button>
              </div>

              {cowRecords.length > 0 ? (
                <MedicalTimeline records={cowRecords} />
              ) : (
                <div className="py-20 flex flex-col items-center text-center opacity-50">
                  <FileText className="w-16 h-16 text-[#DDE7E1] mb-4" />
                  <h4 className="font-bold text-[#17211B]">Belum Ada Riwayat Medis</h4>
                  <p className="text-sm text-[#68746D] max-w-xs mt-2">Sapi ini belum pernah dicatat sakit atau mendapatkan tindakan medis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="w-full md:w-80 space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
              <h4 className="text-xs font-bold text-[#68746D] uppercase tracking-widest mb-6">Analisis Medis</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#68746D] uppercase">Kesehatan</p>
                    <p className={`text-sm font-black ${isSick ? 'text-red-600' : 'text-[#17211B]'}`}>
                      {isSick ? 'Sakit / Perawatan' : 'Sehat'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#68746D] uppercase">Total Periksa</p>
                    <p className="text-sm font-black text-[#17211B]">{cowRecords.length} Kali</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#68746D] uppercase">Aman Jual</p>
                    <p className="text-sm font-black text-[#17211B]">
                      {activeWithdrawal ? formatDate(activeWithdrawal.safeToSellDate! as any) : 'Layak Jual'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="p-6 bg-[#17211B] rounded-[2.5rem] text-white">
              <h4 className="font-bold mb-2">Vaksinasi Terakhir</h4>
              <p className="text-xs opacity-70 mb-4">Aftopor (PMK) - 10 Apr 2026</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#006B3F]" />
              </div>
              <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-widest">Sangat Terlindungi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
