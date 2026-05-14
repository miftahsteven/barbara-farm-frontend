'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { MapPin, Calendar, Weight, ChevronRight, QrCode } from 'lucide-react';
import Link from 'next/link';

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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-[#17211B] tracking-tight">{cattle.id}</h3>
            <p className="text-sm font-medium text-[#68746D]">{cattle.name}</p>
          </div>
          <button 
            onClick={() => onShowQr(cattle)}
            className="p-2 bg-[#F7FAF8] hover:bg-[#EAF6F0] rounded-xl border border-[#DDE7E1] text-[#006B3F] transition-all"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-[#68746D]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{cattle.pen}</span>
          </div>
          <div className="flex items-center gap-2 text-[#68746D]">
            <Weight className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{cattle.latestWeightKg || cattle.initialWeightKg} Kg</span>
          </div>
          <div className="flex items-center gap-2 text-[#68746D]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{formatDate(cattle.entryDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#68746D]">
            <span className="text-[10px] font-bold text-[#006B3F] bg-[#EAF6F0] px-2 py-0.5 rounded-full uppercase whitespace-nowrap">
              {getBreedName(cattle.breed)}
            </span>
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
