'use client';

import React from 'react';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { FeedingSummaryCards } from '@/components/feeding/FeedingSummaryCards';
import { FeedingLogCard } from '@/components/feeding/FeedingLogCard';
import { FeedCompositionChart } from '@/components/feeding/FeedCompositionChart';
import { Plus, Scan, Search, ChevronRight, Filter, AlertCircle, History } from 'lucide-react';
import Link from 'next/link';

export default function FeedingDashboardPage() {
  const { logs, fetchLogs } = useFeedingStore();
  
  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Get latest 6 logs for display
  const latestLogs = logs.slice(0, 6);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Manajemen Pakan</h1>
          <p className="text-[#68746D]">Kontrol porsi, biaya, dan komposisi nutrisi ternak.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/qr-scan"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all"
          >
            <Scan className="w-5 h-5 text-[#006B3F]" />
            Scan Sapi
          </Link>
          <Link 
            href="/feeding/create"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Input Pakan
          </Link>
        </div>
      </div>

      <FeedingSummaryCards />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#17211B] flex items-center gap-3">
              <History className="w-6 h-6 text-[#006B3F]" />
              Riwayat Pakan Terbaru
            </h2>
            <button className="text-sm font-bold text-[#006B3F] hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestLogs.map((log) => (
              <FeedingLogCard key={log.id} log={log} />
            ))}
          </div>
        </div>

        {/* Sidebar: Charts & Insights */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
            <h3 className="text-lg font-black text-[#17211B] mb-2">Komposisi Pakan</h3>
            <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-6">Distribusi Nutrisi Farm</p>
            <FeedCompositionChart logs={logs.slice(0, 50)} />
          </section>

          <section className="bg-[#17211B] p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-emerald-400" />
               Feeding Insight
            </h3>
            <div className="space-y-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm font-bold">Kandang A (Penggemukan)</p>
                  <p className="text-xs opacity-60 mt-1 leading-relaxed">
                    Porsi konsentrat optimal. Pertumbuhan sapi stabil di angka 1.2Kg/hari.
                  </p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm font-bold text-orange-400">Kandang C (Perawatan)</p>
                  <p className="text-xs opacity-60 mt-1 leading-relaxed">
                    Sapi SF-012 butuh tambahan mineral mix untuk mempercepat pemulihan.
                  </p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
