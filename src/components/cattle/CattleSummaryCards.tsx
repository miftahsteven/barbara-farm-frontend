'use client';

import React from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { Users, Venus, Mars, ShoppingBag, Activity } from 'lucide-react';

export const CattleSummaryCards: React.FC = () => {
  const cattle = useCattleStore((state) => state.cattle);

  const stats = {
    total: cattle.filter(c => c.status !== 'ARSIP' && c.status !== 'TERJUAL').length,
    jantan: cattle.filter(c => c.gender === 'JANTAN' && c.status !== 'ARSIP' && c.status !== 'TERJUAL').length,
    betina: cattle.filter(c => c.gender === 'BETINA' && c.status !== 'ARSIP' && c.status !== 'TERJUAL').length,
    siapJual: cattle.filter(c => c.status === 'SIAP_JUAL').length,
    pemantauan: cattle.filter(c => c.status === 'PEMANTAUAN').length,
  };

  const cards = [
    { label: 'Total Sapi Aktif', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-[#006B3F]', bg: 'bg-[#EAF6F0]' },
    { label: 'Jantan', value: stats.jantan, icon: <Mars className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Betina', value: stats.betina, icon: <Venus className="w-5 h-5" />, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Siap Jual', value: stats.siapJual, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pemantauan', value: stats.pemantauan, icon: <Activity className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-5 rounded-3xl border border-[#DDE7E1] shadow-sm flex flex-col items-center text-center group hover:border-[#006B3F] transition-all">
          <div className={`p-3 rounded-2xl ${card.bg} ${card.color} mb-3 group-hover:scale-110 transition-transform`}>
            {card.icon}
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-1">{card.label}</p>
          <p className="text-2xl font-black text-[#17211B]">{card.value}</p>
        </div>
      ))}
    </div>
  );
};
