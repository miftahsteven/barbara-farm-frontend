'use client';

import React from 'react';
import { History, CheckCircle2, XCircle, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCattleStore } from '@/lib/useCattleStore';

interface ScanHistoryItem {
  id: string;
  name: string;
  time: string;
  status: 'success' | 'failed';
  cattleId?: string;
}

export const RecentScanList: React.FC = () => {
  const { scanHistory } = useCattleStore();

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return new Date(timestamp).toLocaleDateString();
  };

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
        {scanHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#68746D]">Belum ada riwayat scan</p>
          </div>
        ) : (
          scanHistory.map((item) => (
            <div key={item.id} className="p-4 hover:bg-[#F7FAF8] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${item.status === 'success' ? 'bg-[#EAF6F0]' : 'bg-red-50'}`}>
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#006B3F]" />
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
                      <p className="text-[11px] text-[#68746D]/60">{getTimeAgo(item.timestamp)}</p>
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
          ))
        )}
      </div>

      <button className="w-full py-4 text-sm font-bold text-[#006B3F] hover:bg-[#EAF6F0] transition-colors border-t border-[#DDE7E1]">
        Lihat Semua Riwayat
      </button>
    </div>
  );
};
