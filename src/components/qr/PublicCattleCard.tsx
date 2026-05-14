'use client';

import React from 'react';
import { Cattle } from '@/data/dummy-cattle';
import { Lock, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PublicCattleCardProps {
  cattle: Cattle;
}

export const PublicCattleCard: React.FC<PublicCattleCardProps> = ({ cattle }) => {
  return (
    <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-[#DDE7E1] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-[#EAF6F0] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#006B3F]" />
          <span className="text-xs font-bold text-[#006B3F] uppercase tracking-wider">Informasi Publik</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border border-[#DDE7E1]">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-[10px] font-bold text-[#17211B] uppercase tracking-tight">Verified cattle</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <img 
            src={cattle.image} 
            alt={cattle.name} 
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F7FAF8]"
          />
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold text-[#17211B]">{cattle.id}</h3>
            <p className="text-[#68746D]">{cattle.breed} • {cattle.gender}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-[#F7FAF8] rounded-xl">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Status Umum</p>
            <p className="font-bold text-[#17211B]">{cattle.status}</p>
          </div>
          <div className="p-3 bg-[#F7FAF8] rounded-xl">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Lokasi</p>
            <p className="font-bold text-[#17211B]">{cattle.barn}</p>
          </div>
          <div className="p-3 bg-[#F7FAF8] rounded-xl">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Terakhir Update</p>
            <p className="font-bold text-[#17211B]">{cattle.lastWeighingDate}</p>
          </div>
          <div className="p-3 bg-[#F7FAF8] rounded-xl">
            <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">Pemilik</p>
            <p className="font-bold text-[#17211B]">Barbara Farm</p>
          </div>
        </div>

        {/* Locked Internal Data Simulation */}
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 relative group overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-100 transition-opacity">
            <Lock className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-[10px] font-bold text-gray-500 uppercase">Data Terkunci</p>
          </div>
          <div className="blur-[4px] select-none">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-center text-[#68746D] leading-relaxed px-4">
            Mode publik hanya menampilkan informasi terbatas. Login diperlukan untuk melihat riwayat lengkap medis, biaya, dan performa ADG.
          </p>
          <Link 
            href="/login"
            className="w-full py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            Login untuk Detail Lengkap
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
