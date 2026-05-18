'use client';

import React, { useState } from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { Eye, Edit, QrCode, Archive, RotateCcw, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CattleTrackerModal } from './CattleTrackerModal';

interface CattleTableProps {
  cattle: Cattle[];
  onShowQr: (cattle: Cattle) => void;
  onArchive: (cattle: Cattle) => void;
  onUnarchive: (cattle: Cattle) => void;
}

export const CattleTable: React.FC<CattleTableProps> = ({ cattle, onShowQr, onArchive, onUnarchive }) => {
  const [trackerCattle, setTrackerCattle] = useState<Cattle | null>(null);
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-700 border-green-200';
      case 'SIAP_JUAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PEMANTAUAN': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ARSIP': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'TERJUAL': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
    <>
    <CattleTrackerModal cattle={trackerCattle} onClose={() => setTrackerCattle(null)} />
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7FAF8] border-b border-[#DDE7E1]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Foto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">ID Sapi</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Informasi</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Ras</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Pemilik/Investor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Berat</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Status</th>
              {(cattle.some(c => c.status === 'ARSIP') || cattle.some(c => c.status === 'TERJUAL')) && (
                <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Alasan</th>
              )}
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE7E1]">
            {cattle.map((item) => (
              <tr key={item.id} className="hover:bg-[#F7FAF8] transition-colors group">
                <td className="px-6 py-4">
                  <img 
                    src={item.photoUrl} 
                    alt={item.id} 
                    className="w-12 h-12 rounded-xl object-cover border border-[#DDE7E1]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className="font-black text-[#17211B] leading-tight mb-1 text-[13px] tracking-tight whitespace-nowrap">{item.id}</p>
                    <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider bg-[#F7FAF8] w-fit px-1.5 py-0.5 rounded border border-[#DDE7E1] opacity-80 whitespace-nowrap">TAG: {item.eartagNo || '-'}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className="font-bold text-[#17211B] mb-0.5 text-sm">{item.name || 'Tanpa Nama'}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[#006B3F] opacity-30" />
                      <p className="text-[11px] text-[#68746D] font-medium tracking-wide uppercase">{item.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-[#17211B] text-xs uppercase">{getBreedName(item.breed)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className="font-bold text-[#17211B] text-xs">
                      {item.investor ? item.investor.name : 'Barbara Farm'}
                    </p>
                    {item.investor && (
                      <p className="text-[9px] text-[#006B3F] font-bold">Share: {item.investor.profitSharePercent}%</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#17211B] text-[13px] whitespace-nowrap">{item.latestWeightKg || item.initialWeightKg} Kg</p>
                  <p className="text-[10px] text-[#68746D] whitespace-nowrap">Awal: {item.initialWeightKg} Kg</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                {(cattle.some(c => c.status === 'ARSIP') || cattle.some(c => c.status === 'TERJUAL')) && (
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#17211B]">{item.archiveReason || '-'}</p>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {item.status !== 'ARSIP' && item.status !== 'TERJUAL' && (
                      <button
                        onClick={() => setTrackerCattle(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006B3F]/10 hover:bg-[#006B3F]/20 text-[#006B3F] rounded-lg transition-all text-xs font-bold border border-[#006B3F]/20"
                        title="Lihat Posisi GPS"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Lihat Posisi
                      </button>
                    )}
                    <Link 
                      href={`/cattle/${encodeURIComponent(item.id)}`}
                      className="p-2 hover:bg-[#EAF6F0] text-[#006B3F] rounded-lg transition-all"
                      title="Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {item.status !== 'TERJUAL' && (
                      <Link 
                        href={`/cattle/${encodeURIComponent(item.id)}?edit=true`}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    <button 
                      onClick={() => onShowQr(item)}
                      className="p-2 hover:bg-[#F7FAF8] text-[#17211B] rounded-lg transition-all"
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    {(item.status === 'ARSIP' || item.status === 'TERJUAL') ? (
                      <button 
                        onClick={() => onUnarchive(item)}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-all"
                        title="Aktifkan Kembali"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onArchive(item)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                        title="Arsipkan"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};
