'use client';

import React, { useState, useEffect } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useFeedingStore, FeedType, FeedingTarget, FeedingTime } from '@/lib/useFeedingStore';
import { 
  Scale, 
  DollarSign, 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  ChevronRight,
  Info,
  Users
} from 'lucide-react';

interface FeedingLogFormProps {
  onSuccess: () => void;
  initialData?: any;
}

const feedTypes: { id: FeedType, label: string, cost: number }[] = [
  { id: 'HIJAUAN', label: 'Hijauan', cost: 700 },
  { id: 'KONSENTRAT', label: 'Konsentrat', cost: 4500 },
  { id: 'FERMENTASI', label: 'Fermentasi', cost: 1200 },
  { id: 'SILASE', label: 'Silase', cost: 1800 },
  { id: 'MINERAL', label: 'Mineral', cost: 9000 },
  { id: 'TAMBAHAN', label: 'Tambahan', cost: 1500 },
];

const groups = [
  { id: 'KDG-A', name: 'Kandang A - Penggemukan 1', cows: 8 },
  { id: 'KDG-B', name: 'Kandang B - Penggemukan 2', cows: 7 },
  { id: 'KDG-C', name: 'Kandang C - Perawatan', cows: 5 },
  { id: 'KDG-D', name: 'Kandang D - Siap Jual', cows: 5 },
];

export const FeedingLogForm: React.FC<FeedingLogFormProps> = ({ onSuccess, initialData }) => {
  const { cattle, fetchCattle } = useCattleStore();
  const { addLog, updateLog } = useFeedingStore();

  useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  const [targetType, setTargetType] = useState<FeedingTarget>(initialData?.targetType || 'SAPI');
  const [targetId, setTargetId] = useState(initialData?.cattleId || initialData?.groupId || '');
  const [date, setDate] = useState(initialData?.feedingDate ? (typeof initialData.feedingDate === 'string' ? initialData.feedingDate.split('T')[0] : new Date(initialData.feedingDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<FeedingTime>(initialData?.feedingTime || 'Pagi');
  const [feedType, setFeedType] = useState<FeedType>(initialData?.feedType || 'HIJAUAN');
  const [portion, setPortion] = useState(initialData?.portionKg?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const selectedFeed = feedTypes.find(f => f.id === feedType)!;
  const totalCost = (parseFloat(portion) || 0) * selectedFeed.cost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !portion) return;

    const payload = {
      feedingDate: date,
      feedingTime: time,
      targetType,
      cattleId: targetType === 'SAPI' ? targetId : undefined,
      groupId: targetType === 'KELOMPOK' ? targetId : undefined,
      feedType,
      feedName: selectedFeed.label,
      portionKg: parseFloat(portion),
      costPerKg: selectedFeed.cost,
      notes,
      status: 'Posted' as const,
      createdBy: 'Mandor Kandang'
    };

    let success;
    if (initialData?.id) {
      success = await updateLog(initialData.id, payload);
    } else {
      success = await addLog(payload);
    }
    
    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Target Type Toggle */}
      <div className="flex p-1.5 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
        <button
          type="button"
          onClick={() => { setTargetType('SAPI'); setTargetId(''); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${targetType === 'SAPI' ? 'bg-white text-[#006B3F] shadow-sm border border-[#DDE7E1]' : 'text-[#68746D]'}`}
        >
          Per Sapi
        </button>
        <button
          type="button"
          onClick={() => { setTargetType('KELOMPOK'); setTargetId(''); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${targetType === 'KELOMPOK' ? 'bg-white text-[#006B3F] shadow-sm border border-[#DDE7E1]' : 'text-[#68746D]'}`}
        >
          Per Kelompok
        </button>
      </div>

      <div className="space-y-6">
        {/* Target Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Pilih {targetType === 'SAPI' ? 'Sapi' : 'Kelompok Kandang'}</label>
          <div className="relative">
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold appearance-none focus:outline-none focus:border-[#006B3F]"
            >
              <option value="">-- Cari {targetType === 'SAPI' ? 'Sapi' : 'Kandang'} --</option>
              {targetType === 'SAPI' 
                ? cattle.filter(c => c.status !== 'ARSIP').map(c => <option key={c.id} value={c.id}>{c.id} - {c.name}</option>)
                : groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.cows} Sapi)</option>)
              }
            </select>
            {targetType === 'SAPI' ? <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" /> : <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Tanggal & Waktu</label>
            <div className="flex gap-2">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 px-4 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold focus:border-[#006B3F]" />
              <select value={time} onChange={e => setTime(e.target.value as FeedingTime)} className="w-32 px-4 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold focus:border-[#006B3F]">
                {['Pagi', 'Siang', 'Sore', 'Malam'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Jenis Pakan</label>
            <div className="relative">
              <select 
                value={feedType} 
                onChange={e => setFeedType(e.target.value as FeedType)} 
                className="w-full pl-4 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold appearance-none focus:border-[#006B3F]"
              >
                {feedTypes.map(f => <option key={f.id} value={f.id}>{f.label} (Rp {f.cost}/Kg)</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Porsi (Kg)</label>
            <div className="relative">
              <input 
                type="number" 
                inputMode="decimal"
                value={portion} 
                onChange={e => setPortion(e.target.value)} 
                placeholder="0.0"
                className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-black text-xl focus:border-[#006B3F]" 
              />
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
            </div>
          </div>

          <div className="p-6 bg-[#EAF6F0] rounded-[2rem] border border-[#006B3F]/10 flex flex-col justify-center">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Estimasi Biaya</p>
                <DollarSign className="w-4 h-4 text-[#006B3F]" />
             </div>
             <p className="text-2xl font-black text-[#17211B] mt-1">Rp {totalCost.toLocaleString()}</p>
             {targetType === 'KELOMPOK' && targetId && (
               <p className="text-[10px] text-[#006B3F] font-bold mt-1 uppercase">
                 ~ Rp {(totalCost / (groups.find(g => g.id === targetId)?.cows || 1)).toLocaleString()} / Ekor
               </p>
             )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Catatan (Opsional)</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Contoh: Pakan dicampur mineral, nafsu makan tinggi..." 
            className="w-full px-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-medium focus:border-[#006B3F]"
            rows={2}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!targetId || !portion}
        className="w-full py-5 bg-[#006B3F] hover:bg-[#004D2E] disabled:bg-gray-200 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-[#006B3F]/20 flex items-center justify-center gap-2"
      >
        Simpan Log Pakan
        <ChevronRight className="w-6 h-6" />
      </button>
    </form>
  );
};
