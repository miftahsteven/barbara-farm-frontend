'use client';

import React, { use } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { useGrowthStore } from '@/lib/useGrowthStore';
import { FeedCompositionChart } from '@/components/feeding/FeedCompositionChart';
import { CattleProfileHeader } from '@/components/cattle/CattleProfileHeader';
import { useRouter } from 'next/navigation';
import { 
  Wheat, 
  History, 
  DollarSign, 
  TrendingUp, 
  ChevronLeft, 
  Scale,
  Plus,
  Info
} from 'lucide-react';

interface CattleFeedingReportPageProps {
  params: Promise<{ id: string }>;
}

export default function CattleFeedingReportPage({ params }: CattleFeedingReportPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { cattle, fetchCattle } = useCattleStore();
  const { logs: feedingLogsAll, fetchLogs: fetchFeedingLogs } = useFeedingStore();
  const { logs: growthLogsAll, fetchLogs: fetchGrowthLogs } = useGrowthStore();
  
  React.useEffect(() => {
    fetchCattle();
    fetchFeedingLogs();
    fetchGrowthLogs();
  }, [fetchCattle, fetchFeedingLogs, fetchGrowthLogs]);

  const cow = cattle.find(c => c.id === id);
  const feedingLogs = Array.isArray(feedingLogsAll) ? feedingLogsAll.filter(l => l.cattleId === id).sort((a, b) => new Date(b.feedingDate).getTime() - new Date(a.feedingDate).getTime()) : [];
  const growthLogs = Array.isArray(growthLogsAll) ? growthLogsAll.filter(l => l.cattleId === id).sort((a, b) => new Date(a.weighDate).getTime() - new Date(b.weighDate).getTime()) : [];

  if (!cow) return <div>Sapi tidak ditemukan</div>;

  // Analysis Logic
  const totalKg = feedingLogs.reduce((acc, curr) => acc + curr.portionKg, 0);
  const totalCost = feedingLogs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const weightGain = growthLogs.length >= 2 
    ? growthLogs[growthLogs.length - 1].weightKg - growthLogs[0].weightKg
    : 0;
  
  const fcr = weightGain > 0 ? (totalKg / weightGain).toFixed(1) : '--';

  // Header data mapping
  const headerCattle = {
    ...cow,
    image: cow.photoUrl,
    barn: cow.pen,
    lastWeighingDate: cow.updatedAt.split('T')[0],
    healthBadge: 'Sehat'
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <CattleProfileHeader cattle={headerCattle as any} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-[#DDE7E1] shadow-sm">
                <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-1">Total Konsumsi</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#17211B]">{totalKg.toLocaleString()}</span>
                  <span className="text-sm font-bold text-[#68746D]">Kg</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-[#DDE7E1] shadow-sm">
                <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-1">Total Biaya</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#17211B]">{totalCost.toLocaleString()}</span>
                  <span className="text-sm font-bold text-[#68746D]">Rupiah</span>
                </div>
              </div>
              <div className="bg-[#006B3F] p-8 rounded-[2rem] shadow-lg shadow-[#006B3F]/20 text-white">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Efisiensi Pakan (FCR)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{fcr}</span>
                  <span className="text-xs font-bold opacity-70">Ratio</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
               <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-[#17211B] flex items-center gap-3">
                  <History className="w-6 h-6 text-[#006B3F]" />
                  Riwayat Pakan Sapi
                </h3>
                <button 
                  onClick={() => router.push('/feeding/create')}
                  className="px-6 py-3 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-[#006B3F]/10"
                >
                  <Plus className="w-4 h-4" />
                  Input Baru
                </button>
              </div>

              <div className="space-y-4">
                {feedingLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-6 bg-[#F7FAF8] rounded-[2rem] border border-[#DDE7E1] hover:border-[#006B3F] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#006B3F] border border-[#EAF6F0]">
                        {log.feedingTime === 'Pagi' ? <Wheat className="w-6 h-6" /> : <Wheat className="w-6 h-6 rotate-180" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#17211B]">{log.feedName}</p>
                        <p className="text-[10px] text-[#68746D]">{log.feedingDate} • {log.feedingTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-[#17211B]">{log.portionKg} Kg</p>
                       <p className="text-[10px] font-bold text-[#006B3F]">Rp {log.totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="w-full md:w-80 space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
              <h4 className="text-xs font-bold text-[#68746D] uppercase tracking-widest mb-6">Komposisi Nutrisi</h4>
              <FeedCompositionChart logs={feedingLogs} />
            </section>

            <div className="p-8 bg-[#17211B] rounded-[2.5rem] text-white space-y-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-emerald-400" />
                 Feeding Insight
              </h4>
              <p className="text-xs opacity-70 leading-relaxed">
                 Sapi ini memiliki FCR {fcr}, yang termasuk kategori {parseFloat(fcr) <= 15 ? 'Sangat Efisien' : 'Normal'}. Pertahankan pola pemberian pakan hijauan di pagi hari.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
