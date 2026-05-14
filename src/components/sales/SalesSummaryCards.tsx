'use client';

import React from 'react';
import { useSalesStore } from '@/lib/useSalesStore';
import { DollarSign, TrendingUp, ShoppingBag, PieChart } from 'lucide-react';

export const SalesSummaryCards: React.FC = () => {
  const sales = useSalesStore((state) => state.sales).filter(s => s.status === 'Final');
  
  const totalOmzet = sales.reduce((acc, curr) => acc + curr.salePrice, 0);
  const totalProfit = sales.reduce((acc, curr) => acc + curr.projectedProfit, 0);
  const avgMargin = sales.reduce((acc, curr) => acc + curr.marginPercent, 0) / (sales.length || 1);

  const cards = [
    { label: 'Total Omzet', value: `Rp ${totalOmzet.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Profit', value: `Rp ${totalProfit.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#006B3F]', bg: 'bg-[#EAF6F0]' },
    { label: 'Sapi Terjual', value: sales.length, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rata-rata Margin', value: `${avgMargin.toFixed(1)}%`, icon: <PieChart className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm flex flex-col group hover:border-[#006B3F] transition-all">
          <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {card.icon}
          </div>
          <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.2em] mb-1">{card.label}</p>
          <p className="text-xl font-black text-[#17211B]">{card.value}</p>
        </div>
      ))}
    </div>
  );
};
