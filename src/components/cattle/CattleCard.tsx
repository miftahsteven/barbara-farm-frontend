'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { MapPin, Calendar, Weight, ChevronRight, QrCode, TrendingUp, Scale } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface CattleCardProps {
  cattle: Cattle;
  onShowQr: (cattle: Cattle) => void;
}

export const CattleCard: React.FC<CattleCardProps> = ({ cattle, onShowQr }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-700 border-green-200';
      case 'SIAP_JUAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PEMANTAUAN': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ARSIP': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getBreedName = (breed: string) => {
    const breedMap: Record<string, string> = {
      'BALI': 'Bali',
      'BLIX': 'Bali Cross',
      'LIMS': 'Limousin',
      'LIMX': 'Limousin Cross',
      'SIMT': 'Simental',
      'SIMX': 'Simental Cross',
      'PO': 'Peranakan Ongole',
      'BRHM': 'Brahman',
      'BRHX': 'Brahman Cross',
      'ANGS': 'Angus',
      'ANGX': 'Angus Cross',
      'FH': 'Friesian Holstein',
    };
    return breedMap[breed.toUpperCase()] || breed;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={cattle.photoUrl} 
          alt={cattle.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider backdrop-blur-md ${getStatusStyle(cattle.status)}`}>
          {cattle.status.replace('_', ' ')}
        </div>
      </div>
      

      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-[14px] font-black text-[#17211B] leading-tight whitespace-nowrap truncate mb-2 tracking-tight" title={cattle.id}>
            {cattle.id}
          </h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#006B3F] opacity-40 shrink-0" />
              <p className="text-[11px] font-bold text-[#68746D] uppercase tracking-[0.05em] truncate">{cattle.name || 'Tanpa Nama'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => onShowQr(cattle)}
                className="p-1.5 bg-[#F7FAF8] hover:bg-[#EAF6F0] rounded-lg border border-[#DDE7E1] text-[#006B3F] transition-all"
                title="Lihat QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-[#006B3F]">
            <span className="text-[10px] font-bold bg-[#EAF6F0] px-2 py-0.5 rounded-full uppercase whitespace-nowrap">
              {getBreedName(cattle.breed)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#68746D]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{formatDate(cattle.entryDate)}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <div className="flex items-center gap-2 text-[#68746D]">
              <Weight className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{cattle.latestWeightKg || cattle.initialWeightKg} Kg</span>
              {cattle.latestWeightKg && cattle.latestWeightKg !== cattle.initialWeightKg && (
                <div className="w-16 h-6 ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { v: cattle.initialWeightKg },
                      { v: (cattle.initialWeightKg + cattle.latestWeightKg) / 2 },
                      { v: cattle.latestWeightKg }
                    ]}>
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Line 
                        type="monotone" 
                        dataKey="v" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        dot={false} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <Link 
          href={`/cattle/${cattle.id}`}
          className="w-full py-3 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all mt-auto"
        >
          Lihat KTP Sapi
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
