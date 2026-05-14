'use client';

import React, { useState } from 'react';
import { Search, Hash, Loader2 } from 'lucide-react';

interface ManualCattleInputProps {
  onSearch: (id: string) => void;
}

export const ManualCattleInput: React.FC<ManualCattleInputProps> = ({ onSearch }) => {
  const [cattleId, setCattleId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattleId.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      onSearch(cattleId.trim());
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#DDE7E1] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#EAF6F0] rounded-xl">
          <Hash className="w-5 h-5 text-[#006B3F]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#17211B]">Input Manual ID Sapi</h3>
          <p className="text-sm text-[#68746D]">Gunakan jika kamera tidak dapat membaca QR</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={cattleId}
            onChange={(e) => setCattleId(e.target.value.toUpperCase())}
            placeholder="Contoh: BF-2026-0001"
            className="w-full pl-12 pr-4 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl text-[#17211B] font-bold placeholder:text-[#68746D]/50 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
        </div>

        <button
          type="submit"
          disabled={!cattleId.trim() || isSearching}
          className="w-full py-4 bg-[#006B3F] hover:bg-[#004D2E] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mencari...
            </>
          ) : (
            'Cari Sapi'
          )}
        </button>
      </form>
    </div>
  );
};
