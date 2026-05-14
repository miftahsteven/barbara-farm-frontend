'use client';

import React from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { Eye, Edit, QrCode, Archive, RotateCcw, MoreVertical, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CattleTableProps {
  cattle: Cattle[];
  onShowQr: (cattle: Cattle) => void;
  onArchive: (cattle: Cattle) => void;
  onUnarchive: (cattle: Cattle) => void;
}

export const CattleTable: React.FC<CattleTableProps> = ({ cattle, onShowQr, onArchive, onUnarchive }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-700 border-green-200';
      case 'SIAP_JUAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PEMANTAUAN': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ARSIP': return 'bg-gray-100 text-gray-700 border-gray-200';
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
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7FAF8] border-b border-[#DDE7E1]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Foto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">ID Sapi</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Informasi</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Kandang</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Berat</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Status</th>
              {cattle.some(c => c.status === 'ARSIP') && (
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
                  <p className="font-black text-[#17211B]">{item.id}</p>
                  <p className="text-xs text-[#68746D]">{item.eartagNo || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#17211B]">{item.name}</p>
                  <p className="text-xs text-[#68746D]">{getBreedName(item.breed)} • {item.gender}</p>
                </td>
                <td className="px-6 py-4 font-bold text-[#17211B]">{item.pen}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#17211B]">{item.latestWeightKg || item.initialWeightKg} Kg</p>
                  <p className="text-[10px] text-[#68746D]">Awal: {item.initialWeightKg} Kg</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                {cattle.some(c => c.status === 'ARSIP') && (
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#17211B]">{item.archiveReason || '-'}</p>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/cattle/${encodeURIComponent(item.id)}`}
                      className="p-2 hover:bg-[#EAF6F0] text-[#006B3F] rounded-lg transition-all"
                      title="Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/cattle/${encodeURIComponent(item.id)}?edit=true`}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => onShowQr(item)}
                      className="p-2 hover:bg-[#F7FAF8] text-[#17211B] rounded-lg transition-all"
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    {item.status === 'ARSIP' ? (
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
  );
};
