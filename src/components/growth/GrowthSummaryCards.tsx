'use client';

import React from 'react';
import { useGrowthStore } from '@/lib/useGrowthStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { Scale, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

export const GrowthSummaryCards: React.FC = () => {
  const logs = useGrowthStore((state) => state.logs);
  const cattle = useCattleStore((state) => state.cattle);

  // Get only active cattle
  const activeCattle = cattle.filter(c => c.status !== 'ARSIP');
  
  // Calculate average ADG for latest logs
  const latestLogs = activeCattle.map(c => {
    const cowLogs = logs.filter(l => l.cattleId === c.id).sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime());
    return cowLogs[0];
  }).filter(Boolean);

  const avgAdg = latestLogs.reduce((acc, curr) => acc + (curr.adgKgPerDay || 0), 0) / (latestLogs.length || 1);
  const slowGrowthCount = latestLogs.filter(l => l.status === 'slow' || l.status === 'attention').length;
  
  // Sapi belum ditimbang bulan ini
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "2024-05"
  const notWeighedThisMonth = activeCattle.length - latestLogs.filter(l => l.weighDate.startsWith(currentMonthStr)).length;

    const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long' });
    const cards = [
    { label: 'Rata-rata ADG', value: `${avgAdg.toFixed(2)} Kg`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pertumbuhan Lambat', value: slowGrowthCount, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    { label: `Belum Ditimbang (${currentMonthName})`, value: notWeighedThisMonth, icon: <Calendar className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Penimbangan', value: logs.length, icon: <Scale className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
          <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {card.icon}
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">{card.label}</p>
          <p className="text-2xl font-black text-[#17211B]">{card.value}</p>
        </div>
      ))}
    </div>
  );
};
