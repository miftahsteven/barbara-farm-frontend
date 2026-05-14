'use client';

import React from 'react';
import { useHealthStore } from '@/lib/useHealthStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { Heart, Activity, AlertCircle, ShoppingCart } from 'lucide-react';

export const HealthSummaryCards: React.FC = () => {
  const records = useHealthStore((state) => state.records);
  const cattle = useCattleStore((state) => state.cattle);

  const activeCattle = cattle.filter(c => c.status !== 'ARSIP');
  
  // Logic to determine current health status
  const sickCount = activeCattle.filter(c => {
    const cowRecords = records.filter(r => r.cattleId === c.id);
    return cowRecords.some(r => r.status === 'treatment' || r.status === 'active');
  }).length;

  const withdrawalCount = activeCattle.filter(c => {
    const cowRecords = records.filter(r => r.cattleId === c.id);
    const today = new Date().toISOString().split('T')[0];
    return cowRecords.some(r => r.safeToSellDate && r.safeToSellDate > today);
  }).length;

  const healthyCount = activeCattle.length - sickCount;

  const cards = [
    { label: 'Sehat', value: healthyCount, icon: <Heart className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Sakit / Perawatan', value: sickCount, icon: <Activity className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Masa Henti Obat', value: withdrawalCount, icon: <AlertCircle className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Aman Dijual', value: activeCattle.length - withdrawalCount, icon: <ShoppingCart className="w-5 h-5" />, color: 'text-[#006B3F]', bg: 'bg-[#EAF6F0]' },
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
