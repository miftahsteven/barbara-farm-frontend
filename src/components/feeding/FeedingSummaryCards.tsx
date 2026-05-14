'use client';

import React from 'react';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { Scale, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

export const FeedingSummaryCards: React.FC = () => {
  const logs = useFeedingStore((state) => state.logs);
  const today = new Date().toISOString().split('T')[0];
  
  const todayLogs = logs.filter(l => (typeof l.feedingDate === 'string' ? l.feedingDate.split('T')[0] : new Date(l.feedingDate).toISOString().split('T')[0]) === today);
  const totalKg = todayLogs.reduce((acc, curr) => acc + curr.portionKg, 0);
  const totalCost = todayLogs.reduce((acc, curr) => acc + curr.totalCost, 0);
  const recordedCount = new Set(todayLogs.map(l => l.cattleId || l.groupId)).size;

  const cards = [
    { label: 'Total Pakan Hari Ini', value: `${totalKg.toLocaleString()} Kg`, icon: <Scale className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Biaya Pakan Hari Ini', value: `Rp ${totalCost.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-[#006B3F]', bg: 'bg-[#EAF6F0]' },
    { label: 'Sapi/Kelompok Tercatat', value: `${recordedCount}`, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Efisiensi (FCR)', value: '14.2', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
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
