'use client';

import React from 'react';
import { FeedingLog } from '@/lib/useFeedingStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { Clock, Scale, DollarSign, ChevronRight, User, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface FeedingLogCardProps {
  log: FeedingLog;
}

export const FeedingLogCard: React.FC<FeedingLogCardProps> = ({ log }) => {
  const { cattle } = useCattleStore();
  const { deleteLog } = useFeedingStore();
  const cow = log.cattleId ? cattle.find(c => c.id === log.cattleId) : null;

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pakan ini?')) {
      await deleteLog(log.id);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm hover:border-[#006B3F] transition-all group overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${log.feedingTime === 'Pagi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
              {log.feedingTime}
            </span>
            <span className="text-[10px] font-bold text-[#68746D]">
              {typeof log.feedingDate === 'string' ? log.feedingDate.split('T')[0] : new Date(log.feedingDate).toISOString().split('T')[0]}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-[#EAF6F0] text-[#006B3F] text-[10px] font-black rounded-lg uppercase border border-[#006B3F]/10">
            {log.feedType}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F7FAF8] flex items-center justify-center border border-[#DDE7E1] shrink-0">
             {cow ? (
               <img src={cow.photoUrl} className="w-full h-full rounded-2xl object-cover" alt="" />
             ) : (
               <span className="font-black text-[#006B3F] text-xs">{log.groupId}</span>
             )}
          </div>
          <div>
            <h3 className="font-black text-[#17211B]">{cow ? cow.id : log.groupId}</h3>
            <p className="text-xs text-[#68746D]">{log.feedName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-1.5 mb-1 opacity-60">
              <Scale className="w-3 h-3" />
              <p className="text-[10px] font-bold uppercase">Porsi</p>
            </div>
            <p className="text-sm font-black text-[#17211B]">{log.portionKg} <span className="text-[10px] font-normal">Kg</span></p>
          </div>
          <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-1.5 mb-1 opacity-60">
              <DollarSign className="w-3 h-3" />
              <p className="text-[10px] font-bold uppercase">Biaya</p>
            </div>
            <p className="text-sm font-black text-[#17211B]">Rp {log.totalCost.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#DDE7E1] pt-4 mt-auto">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3 text-[#68746D]" />
            <span className="text-[10px] font-bold text-[#68746D]">{log.createdBy}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href={`/feeding/${log.id}/edit`}
              className="text-[#68746D] hover:text-blue-600 transition-colors"
              title="Edit Data"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
            <button 
              onClick={handleDelete}
              className="text-[#68746D] hover:text-red-600 transition-colors"
              title="Hapus Data"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {log.cattleId && (
              <Link 
                href={`/cattle/${log.cattleId}/feeding`}
                className="text-[10px] font-black text-[#006B3F] flex items-center gap-1 hover:underline ml-2"
              >
                Report <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
