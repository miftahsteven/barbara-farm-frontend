'use client';

import React from 'react';
import { AlertCircle, Calendar, Info } from 'lucide-react';

interface WithdrawalAlertProps {
  safeToSellDate: string;
}

export const WithdrawalAlert: React.FC<WithdrawalAlertProps> = ({ safeToSellDate }) => {
  const isPast = new Date(safeToSellDate) < new Date();

  if (isPast) {
    return (
      <div className="bg-[#EAF6F0] border border-[#006B3F]/20 p-6 rounded-[2.5rem] flex gap-4 items-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-black text-[#17211B]">Aman Dijual</h4>
          <p className="text-sm text-[#68746D]">Masa henti obat telah berakhir pada {safeToSellDate}. Sapi layak untuk dipasarkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-[2.5rem] flex gap-4 items-center animate-pulse">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-black text-red-700">Jangan Dijual Dulu</h4>
          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase">Withdrawal</span>
        </div>
        <p className="text-sm text-red-600/80">Sapi masih dalam pengaruh obat hingga <span className="font-black underline">{safeToSellDate}</span>. Konsumsi daging berisiko residu antibiotik.</p>
      </div>
      <div className="hidden md:block">
         <Info className="w-6 h-6 text-red-300" />
      </div>
    </div>
  );
};
