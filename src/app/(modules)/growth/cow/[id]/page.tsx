'use client';

import React, { use } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useGrowthStore } from '@/lib/useGrowthStore';
import { GrowthLineChart } from '@/components/growth/GrowthLineChart';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Scale, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Calendar,
  Info,
  History,
  Loader2
} from 'lucide-react';

interface CowGrowthDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CowGrowthDetailPage({ params }: CowGrowthDetailPageProps) {
  const paramsData = use(params);
  const id = decodeURIComponent(paramsData.id);
  const router = useRouter();
  const { cattle, fetchCattle } = useCattleStore();
  const { fetchLogsByCowId } = useGrowthStore();
  const [cowLogs, setCowLogs] = React.useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  
  console.log('Growth Detail ID:', id);
  const cow = cattle.find(c => c.id === id);

  React.useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      await fetchCattle();
      const logs = await fetchLogsByCowId(id);
      setCowLogs(logs);
      setIsDataLoading(false);
    };
    loadData();
  }, [id, fetchCattle, fetchLogsByCowId]);

  const latestLog = cowLogs[0]; // Already sorted desc in backend/store
  const firstLog = [...cowLogs].reverse()[0];

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-[#006B3F]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">Memuat Analisis Pertumbuhan...</p>
      </div>
    );
  }

  if (!cow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-[#17211B]">Sapi Tidak Ditemukan</h1>
        <button onClick={() => router.back()} className="mt-4 text-[#006B3F] font-bold">Kembali</button>
      </div>
    );
  }

  const totalGain = (latestLog?.weightKg || cow.initialWeightKg) - cow.initialWeightKg;
  const avgAdg = cowLogs.length > 0 
    ? cowLogs.reduce((acc, curr) => acc + (curr.adgKgPerDay || 0), 0) / cowLogs.length 
    : 0;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/growth')}
              className="p-3 bg-white border border-[#DDE7E1] rounded-2xl text-[#68746D] hover:text-[#17211B] transition-all shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-[#17211B] tracking-tight">{cow.id}</h1>
                <span className="px-3 py-1 bg-[#EAF6F0] text-[#006B3F] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#006B3F]/10">
                  {cow.breed}
                </span>
              </div>
              <p className="text-[#68746D] text-sm">Analisis Pertumbuhan Mendalam • {cow.pen}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/growth/add?cowId=${encodeURIComponent(id)}`)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Catat Timbang Baru
          </button>
        </div>

        {/* Hero Section: Stats & Chart */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#17211B] flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
                Grafik Berat Badan
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F7FAF8] rounded-xl border border-[#DDE7E1]">
                <TrendingUp className="w-4 h-4 text-[#006B3F]" />
                <span className="text-xs font-bold text-[#17211B]">ADG: {latestLog?.adgKgPerDay?.toFixed(2) || '0.00'} Kg/hari</span>
              </div>
            </div>
            <GrowthLineChart logs={cowLogs} />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm flex flex-col items-center text-center">
              <img src={cow.photoUrl} className="w-24 h-24 rounded-3xl object-cover mb-4 border-2 border-[#EAF6F0]" alt="" />
              <h4 className="font-black text-[#17211B]">{cow.name}</h4>
              <p className="text-xs text-[#68746D] mb-6">{cow.gender} • Masuk {cow.entryDate}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                  <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Berat Awal</p>
                  <p className="text-xl font-black text-[#17211B]">{cow.initialWeightKg} <span className="text-[10px] font-normal text-[#68746D]">Kg</span></p>
                </div>
                <div className="p-4 bg-[#EAF6F0] rounded-2xl border border-[#006B3F]/10">
                  <p className="text-[10px] font-bold text-[#006B3F] uppercase mb-1">Berat Kini</p>
                  <p className="text-xl font-black text-[#17211B]">{latestLog?.weightKg || cow.initialWeightKg} <span className="text-[10px] font-normal text-[#68746D]">Kg</span></p>
                </div>
              </div>
            </div>

            <div className="bg-[#006B3F] p-8 rounded-[2.5rem] shadow-xl shadow-[#006B3F]/20 text-white space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">Insight Pertumbuhan</h4>
                <TrendingUp className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-lg font-bold leading-snug">
                {avgAdg >= 0.8 
                  ? 'Pertumbuhan sapi ini stabil dan berada di jalur yang benar.' 
                  : 'Pertumbuhan sapi ini melambat. Perlu evaluasi pakan atau kesehatan.'}
              </p>
              <div className="pt-4 flex items-center justify-between border-t border-white/20">
                <div>
                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Total Kenaikan</p>
                  <p className="text-2xl font-black">+{totalGain} Kg</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Rata-rata ADG</p>
                  <p className="text-2xl font-black">{avgAdg.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
          <h3 className="text-xl font-black text-[#17211B] flex items-center gap-3 mb-10">
            <History className="w-6 h-6 text-[#006B3F]" />
            Riwayat Penimbangan
          </h3>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#DDE7E1] before:to-transparent">
            {cowLogs.map((log, i) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#006B3F] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   <Calendar className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-[#F7FAF8] border border-[#DDE7E1] shadow-sm group-hover:border-[#006B3F] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <time className="font-black text-[#17211B]">{new Date(log.weighDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                      {log.status === 'excellent' ? 'Sangat Baik' : 'Normal'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl"><Scale className="w-4 h-4 text-[#006B3F]" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-[#68746D] uppercase">Berat</p>
                        <p className="text-sm font-black text-[#17211B]">{log.weightKg} Kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl"><TrendingUp className="w-4 h-4 text-[#006B3F]" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-[#68746D] uppercase">ADG</p>
                        <p className="text-sm font-black text-[#17211B]">{log.adgKgPerDay?.toFixed(2)} Kg/h</p>
                      </div>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-4 pt-4 border-t border-[#DDE7E1] flex gap-2">
                       <Info className="w-3.5 h-3.5 text-[#68746D] shrink-0" />
                       <p className="text-xs text-[#68746D] italic leading-relaxed">{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
