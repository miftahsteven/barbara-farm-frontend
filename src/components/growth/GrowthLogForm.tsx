'use client';

import React, { useState } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useGrowthStore, GrowthLog } from '@/lib/useGrowthStore';
import { 
  Scale, 
  Calendar, 
  FileText, 
  Check, 
  ChevronRight, 
  Search, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GrowthLogFormProps {
  cowId?: string;
  onSuccess: (logId: string) => void;
}

export const GrowthLogForm: React.FC<GrowthLogFormProps> = ({ cowId: initialCowId, onSuccess }) => {
  const { cattle, fetchCattle } = useCattleStore();
  const { addLog, logs } = useGrowthStore();
  
  React.useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);
  
  const [selectedCowId, setSelectedCowId] = useState(initialCowId || '');
  const [weight, setWeight] = useState('');
  const [weighDate, setWeighDate] = useState(new Date().toISOString().split('T')[0]);
  const [bcs, setBcs] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCow = cattle.find(c => c.id === selectedCowId);
  
  // Calculate preview ADG
  const cowLogs = logs.filter(l => l.cattleId === selectedCowId).sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime());
  const lastLog = cowLogs[0];

  // Pre-fill weight with latest data
  React.useEffect(() => {
    if (selectedCow && (weight === '' || weight === '0')) {
      const initialWeight = lastLog ? lastLog.weightKg : selectedCow.initialWeightKg;
      setWeight(initialWeight.toString());
    }
  }, [selectedCow, lastLog]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCowId || !weight) return;

    setIsSubmitting(true);
    try {
      const result = await addLog({
        cattleId: selectedCowId,
        weightKg: parseFloat(weight),
        weighDate,
        bcs,
        notes
      });
      if (result) {
        onSuccess(selectedCowId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {/* Cow Selector */}
      {!initialCowId && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Pilih Sapi</label>
          <div className="relative">
            <select 
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold appearance-none focus:outline-none focus:border-[#006B3F]"
            >
              <option value="">-- Cari Sapi Berdasarkan ID --</option>
              {cattle.filter(c => c.status !== 'ARSIP').map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
              ))}
            </select>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
          </div>
        </div>
      )}

      {selectedCow && (
        <div className="p-6 bg-[#EAF6F0] rounded-3xl border border-[#006B3F]/10 flex items-center gap-4">
          <img src={selectedCow.photoUrl} className="w-14 h-14 rounded-xl object-cover" alt="" />
          <div>
            <p className="text-sm font-black text-[#17211B]">{selectedCow.id}</p>
            <p className="text-xs text-[#68746D]">{selectedCow.breed} • Berat Terakhir: {lastLog?.weightKg || selectedCow.initialWeightKg} Kg</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Tanggal Timbang</label>
          <div className="relative">
            <input 
              type="date" 
              value={weighDate}
              onChange={(e) => setWeighDate(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Berat Badan (Kg)</label>
          <div className="relative">
            <input 
              type="number" 
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-black text-xl focus:outline-none focus:border-[#006B3F]"
            />
            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">BCS (Body Condition Score)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setBcs(val)}
              className={`flex-1 py-4 rounded-2xl font-black transition-all border ${bcs === val ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-[#F7FAF8] text-[#68746D] border-[#DDE7E1] hover:bg-white'}`}
            >
              {val}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-tighter text-center">
          {bcs === 1 ? 'Sangat Kurus' : bcs === 2 ? 'Kurus' : bcs === 3 ? 'Ideal' : bcs === 4 ? 'Gemuk' : 'Terlalu Gemuk'}
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Catatan Kondisi</label>
        <div className="relative">
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Nafsu makan baik, baru pindah kandang..."
            rows={3}
            className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-medium focus:outline-none focus:border-[#006B3F]"
          />
          <FileText className="absolute left-4 top-6 w-5 h-5 text-[#68746D]" />
        </div>
      </div>

      <button
        type="submit"
        disabled={!selectedCowId || !weight || isSubmitting}
        className="w-full py-5 bg-[#006B3F] hover:bg-[#004D2E] disabled:bg-gray-200 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-[#006B3F]/20 flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Menyimpan...' : (
          <>
            Simpan Log Timbang
            <ChevronRight className="w-6 h-6" />
          </>
        )}
      </button>
    </form>
  );
};
