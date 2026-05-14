'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { GrowthLog } from '@/lib/useGrowthStore';
import { ChevronRight, TrendingUp, Scale, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CowGrowthCardProps {
  cow: Cattle;
  latestLog?: GrowthLog;
}

export const CowGrowthCard: React.FC<CowGrowthCardProps> = ({ cow, latestLog }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-100 text-emerald-700';
      case 'normal': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-amber-100 text-amber-700';
      case 'attention': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Sangat Baik';
      case 'normal': return 'Normal';
      case 'slow': return 'Lambat';
      case 'attention': return 'Perlu Perhatian';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden hover:border-[#006B3F] transition-all group h-full">
      <div className="p-5 flex flex-col h-full">
        <div className="flex gap-4 mb-6">
          <img 
            src={cow.photoUrl} 
            alt={cow.id} 
            className="w-16 h-16 rounded-2xl object-cover border border-[#EAF6F0]"
          />
          <div className="flex-1">
            <h3 className="font-black text-[#17211B] tracking-tight mb-1 leading-tight">{cow.id}</h3>
            {latestLog && (
              <div className="mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(latestLog.status)}`}>
                  {getStatusLabel(latestLog.status)}
                </span>
              </div>
            )}
            <p className="text-xs text-[#68746D]">{cow.breed} • {cow.pen}</p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-[#68746D]">
               <Scale className="w-3 h-3" />
               Timbang terakhir: {latestLog ? new Date(latestLog.weighDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'Belum ada'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Berat Kini</p>
            <p className="text-lg font-black text-[#17211B]">{latestLog?.weightKg || cow.initialWeightKg} <span className="text-[10px] font-normal text-[#68746D]">Kg</span></p>
          </div>
          <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">ADG</p>
            <p className="text-lg font-black text-[#17211B]">{latestLog?.adgKgPerDay?.toFixed(2) || '0.00'} <span className="text-[10px] font-normal text-[#68746D]">Kg/h</span></p>
          </div>
        </div>

        {/* Mini growth hint */}
        {latestLog && (latestLog.status === 'slow' || latestLog.status === 'attention') && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-[10px] font-bold text-red-600 leading-tight">Pertumbuhan di bawah target 0.8 Kg/hari.</p>
          </div>
        )}

        <Link 
          href={`/growth/cow/${cow.id}`}
          className="mt-auto w-full py-3 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#006B3F]/10 group-hover:shadow-lg"
        >
          Detail Pertumbuhan
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
