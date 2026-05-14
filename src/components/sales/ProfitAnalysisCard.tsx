'use client';

import React from 'react';
import { CattleSale } from '@/lib/useSalesStore';
import { ArrowUpRight, ArrowDownRight, Minus, Calculator } from 'lucide-react';

interface ProfitAnalysisCardProps {
  sale: CattleSale;
}

export const ProfitAnalysisCard: React.FC<ProfitAnalysisCardProps> = ({ sale }) => {
  const isProfit = sale.projectedProfit > 0;
  
  return (
    <div className="bg-white rounded-[2.5rem] border border-[#DDE7E1] overflow-hidden shadow-sm">
      <div className={`p-6 flex items-center justify-between ${isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5" />
          <h4 className="font-black text-sm uppercase tracking-wider">Analisis Profitabilitas</h4>
        </div>
        <div className="flex items-center gap-1 font-black">
          {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          {sale.marginPercent.toFixed(1)}%
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#68746D] font-medium">Harga Beli (Modal)</span>
            <span className="font-black text-[#17211B]">Rp {(sale.purchasePrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#68746D] font-medium">Total Biaya Pakan</span>
            <span className="font-black text-[#17211B]">Rp {(sale.totalFeedCost || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#68746D] font-medium">Total Biaya Medis</span>
            <span className="font-black text-[#17211B]">Rp {(sale.totalMedicalCost || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#68746D] font-medium">Biaya Ops. Tambahan</span>
            <span className="font-black text-[#17211B]">Rp {(sale.additionalOperationalCost || 0).toLocaleString()}</span>
          </div>
          <div className="pt-4 border-t border-[#DDE7E1] flex justify-between items-center">
            <span className="text-xs font-black text-[#17211B] uppercase tracking-widest">Total Produksi</span>
            <span className="text-lg font-black text-[#17211B]">Rp {(sale.totalProductionCost || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 bg-[#F7FAF8] rounded-3xl border-2 border-dashed border-[#DDE7E1] space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#68746D] uppercase">Harga Jual</span>
            <span className="text-xl font-black text-[#006B3F]">Rp {(sale.salePrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#DDE7E1]">
            <span className="text-xs font-bold text-[#68746D] uppercase">Keuntungan Bersih</span>
            <span className={`text-xl font-black ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''} Rp {(sale.projectedProfit || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
