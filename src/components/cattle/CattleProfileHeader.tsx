'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { QrCode, Edit, Printer, ChevronLeft, MapPin, Calendar, Heart, Navigation } from 'lucide-react';
import Link from 'next/link';

interface CattleProfileHeaderProps {
  cattle: Cattle;
  onEdit?: () => void;
  onLocate?: () => void;
}

export const CattleProfileHeader: React.FC<CattleProfileHeaderProps> = ({ cattle, onEdit, onLocate }) => {
  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-700';
      case 'ARSIP': return 'bg-gray-100 text-gray-700';
      case 'TERJUAL': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="bg-white border-b border-[#DDE7E1]">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/cattle"
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-semibold">Kembali ke Daftar Sapi  </span>
        </Link>
        <div className="flex items-center gap-3">
          {cattle.status !== 'ARSIP' && cattle.status !== 'TERJUAL' && (
            <button
              onClick={onLocate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF6F0] hover:bg-[#D1F0E0] text-[#006B3F] rounded-xl font-bold transition-all border border-[#006B3F]/20"
            >
              <Navigation className="w-4 h-4" />
              Lokasi GPS
            </button>
          )}
          <button className="p-2.5 bg-[#F7FAF8] hover:bg-[#EAF6F0] rounded-xl border border-[#DDE7E1] text-[#006B3F] transition-all">
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-xl font-bold transition-all shadow-md shadow-[#006B3F]/20"
          >
            <Edit className="w-4 h-4" />
            Edit Data
          </button>
        </div>
      </div>

      {/* Profile Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
          {/* Large Image with QR Overlay */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] overflow-hidden border-4 border-[#EAF6F0] shadow-xl">
              <img
                src={cattle.photoUrl || '/placeholder.jpg'}
                alt={cattle.name || 'Sapi'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-[#DDE7E1]">
              <QrCode className="w-10 h-10 text-[#17211B]" />
            </div>
          </div>

          {/* Info Details */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[#EAF6F0] text-[#006B3F] text-xs font-bold rounded-full uppercase tracking-widest border border-[#006B3F]/10">
                  {cattle.breed}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5 ${getHealthBadgeColor(cattle.status)}`}>
                  <Heart className="w-3 h-3 fill-current" />
                  {cattle.status === 'AKTIF' ? 'Prima' : 'Pantauan'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#17211B] tracking-tight mb-2">
                {cattle.id}
              </h1>
              <p className="text-xl font-medium text-[#68746D]">{cattle.name}</p>
            </div>

            <div className="flex flex-wrap gap-8 py-2">
              <div className="flex items-center gap-3 text-[#17211B]">
                <div className="p-2.5 bg-[#F7FAF8] rounded-xl border border-[#DDE7E1]">
                  <MapPin className="w-5 h-5 text-[#006B3F]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Lokasi Kandang</p>
                  <p className="font-bold">{cattle.pen}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[#17211B]">
                <div className="p-2.5 bg-[#F7FAF8] rounded-xl border border-[#DDE7E1]">
                  <Calendar className="w-5 h-5 text-[#006B3F]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">Timbang Terakhir</p>
                  <p className="font-bold">{cattle.updatedAt ? new Date(cattle.updatedAt).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
