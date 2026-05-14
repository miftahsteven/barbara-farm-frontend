'use client';

import React from 'react';
import { History, CheckCircle2, XCircle, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface ScanHistoryItem {
  id: string;
  name: string;
  time: string;
  status: 'success' | 'failed';
  cattleId?: string;
}

export const RecentScanList: React.FC = () => {
  // Static dummy history as per PRD
  const history: ScanHistoryItem[] = [
    { id: '1', name: 'Sapi Aster', time: '2 menit lalu', status: 'success', cattleId: 'BF-2026-0001' },
    { id: '2', name: 'Sapi Bima', time: '12 menit lalu', status: 'success', cattleId: 'BF-2026-0002' },
    { id: '3', name: 'Tidak dikenal', time: '18 menit lalu', status: 'failed' },
    { id: '4', name: 'Sapi Cempaka', time: '1 jam lalu', status: 'success', cattleId: 'BF-2026-0003' },
    { id: '5', name: 'Sapi Drona', time: '2 jam lalu', status: 'success', cattleId: 'BF-2026-0004' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#DDE7E1] flex items-center justify-between bg-[#F7FAF8]">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-[#006B3F]" />
          <h3 className="font-bold text-[#17211B]">Riwayat Scan Terakhir</h3>
        </div>
        <span className="text-xs font-bold text-[#006B3F] bg-[#EAF6F0] px-2 py-1 rounded-md uppercase">Live</span>
      </div>

      <div className="divide-y divide-[#DDE7E1]">
        {history.map((item) => (
          <div key={item.id} className="p-4 hover:bg-[#F7FAF8] transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${item.status === 'success' ? 'bg-[#EAF6F0]' : 'bg-red-50'}`}>
                  {item.status === 'success' ? (
                    <CheckCircle2 className={`w-5 h-5 ${item.status === 'success' ? 'text-[#006B3F]' : 'text-red-600'}`} />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#17211B]">{item.cattleId || 'UNKNOWN'}</p>
                    <span className="text-[10px] text-[#68746D]">•</span>
                    <p className="text-sm font-medium text-[#68746D]">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#68746D]/60" />
                    <p className="text-[11px] text-[#68746D]/60">{item.time}</p>
                  </div>
                </div>
              </div>

              {item.status === 'success' && item.cattleId ? (
                <Link 
                  href={`/cattle/${item.cattleId}`}
                  className="p-2 hover:bg-[#006B3F] hover:text-white rounded-full text-[#68746D] transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <div className="p-2 opacity-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-4 text-sm font-bold text-[#006B3F] hover:bg-[#EAF6F0] transition-colors border-t border-[#DDE7E1]">
        Lihat Semua Riwayat
      </button>
    </div>
  );
};
