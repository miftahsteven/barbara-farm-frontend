'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { ChevronRight, Weight, Activity, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';

interface ScanResultCardProps {
  cattle: Cattle;
  onScanAgain: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ cattle, onScanAgain }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-700 border-green-200';
      case 'TERJUAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#DDE7E1] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-1.5 bg-[#006B3F]">
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Sapi Ditemukan</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex gap-5 mb-6">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#EAF6F0] shrink-0">
            <img 
              src={cattle.photoUrl || '/placeholder.jpg'} 
              alt={cattle.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#006B3F] bg-[#EAF6F0] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {cattle.breed}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(cattle.status)}`}>
                {cattle.status}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#17211B]">{cattle.id}</h3>
            <p className="text-[#68746D] font-medium">{cattle.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-2 text-[#68746D] mb-1">
              <Weight className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Berat Terakhir</span>
            </div>
            <p className="text-xl font-bold text-[#17211B]">{cattle.latestWeightKg || cattle.initialWeightKg} <span className="text-sm font-normal text-[#68746D]">Kg</span></p>
          </div>
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-2 text-[#68746D] mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Eartag No</span>
            </div>
            <p className="text-base font-bold text-[#17211B]">{cattle.eartagNo || '-'}</p>
          </div>
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-2 text-[#68746D] mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Lokasi</span>
            </div>
            <p className="text-base font-bold text-[#17211B]">{cattle.pen}</p>
          </div>
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-2 text-[#68746D] mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Gender</span>
            </div>
            <p className="text-base font-bold text-[#17211B]">{cattle.gender}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href={`/cattle/${cattle.id}`}
            className="w-full py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#006B3F]/20 transition-all group"
          >
            Buka Profil Sapi
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={onScanAgain}
            className="w-full py-4 bg-white hover:bg-[#F7FAF8] text-[#006B3F] border-2 border-[#006B3F] rounded-2xl font-bold transition-all"
          >
            Scan Ulang
          </button>
        </div>
      </div>
    </div>
  );
};
