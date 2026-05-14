'use client';

import React, { useState } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useGrowthStore } from '@/lib/useGrowthStore';
import { GrowthSummaryCards } from '@/components/growth/GrowthSummaryCards';
import { CowGrowthCard } from '@/components/growth/CowGrowthCard';
import { Search, Plus, Scan, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GrowthOverviewPage() {
  const { cattle, fetchCattle } = useCattleStore();
  const { logs, fetchLogs, isLoading } = useGrowthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  React.useEffect(() => {
    fetchCattle();
    fetchLogs();
  }, [fetchCattle, fetchLogs]);

  const activeCattle = cattle.filter(c => c.status !== 'ARSIP');

  // Filter Logic
  const filteredCattle = activeCattle.filter(c => {
    const cowLogs = logs.filter(l => l.cattleId === c.id).sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime());
    const latestLog = cowLogs[0];
    
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ATTENTION') return latestLog?.status === 'attention' || latestLog?.status === 'slow';
    if (activeFilter === 'EXCELLENT') return latestLog?.status === 'excellent';
    
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Monitoring Pertumbuhan</h1>
          <p className="text-[#68746D]">Analisis ADG dan tren berat badan ternak Barbara Farm.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/qr-scan"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all"
          >
            <Scan className="w-5 h-5 text-[#006B3F]" />
            Scan QR
          </Link>
          <Link 
            href="/growth/add"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Catat Timbang
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <GrowthSummaryCards />

      {/* Filter & Search */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID atau nama sapi..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl text-[#17211B] font-medium focus:outline-none focus:border-[#006B3F] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
             {[
               { id: 'ALL', label: 'Semua', icon: <TrendingUp className="w-3.5 h-3.5" /> },
               { id: 'ATTENTION', label: 'Perlu Perhatian', icon: <AlertCircle className="w-3.5 h-3.5" /> },
               { id: 'EXCELLENT', label: 'ADG Terbaik', icon: <TrendingUp className="w-3.5 h-3.5" /> },
             ].map((f) => (
               <button
                 key={f.id}
                 onClick={() => setActiveFilter(f.id)}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === f.id ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-white text-[#68746D] border-[#DDE7E1] hover:border-[#006B3F]'}`}
               >
                 {f.icon}
                 {f.label}
               </button>
             ))}
          </div>
        </div>

        {/* Growth Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700">
          {filteredCattle.map((cow) => {
            const cowLogs = logs.filter(l => l.cattleId === cow.id).sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime());
            return (
              <CowGrowthCard 
                key={cow.id} 
                cow={cow} 
                latestLog={cowLogs[0]}
              />
            );
          })}
          
          {filteredCattle.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center text-center opacity-60">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-[#DDE7E1]">
                <AlertCircle className="w-10 h-10 text-[#DDE7E1]" />
              </div>
              <h3 className="text-xl font-bold text-[#17211B]">Tidak Ada Data</h3>
              <p className="text-[#68746D] max-w-xs mt-2">
                Tidak ada data pertumbuhan yang sesuai dengan kriteria pencarian Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
