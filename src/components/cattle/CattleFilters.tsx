'use client';

import React from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { breeds, pens } from '@/data/cattle';

export const CattleFilters: React.FC = () => {
  const { searchQuery, setSearchQuery, filters, setFilter, viewMode, setViewMode } = useCattleStore();

  const statuses = [
    { label: 'Semua Status', value: 'ALL' },
    { label: 'Aktif', value: 'AKTIF' },
    { label: 'Siap Jual', value: 'SIAP_JUAL' },
    { label: 'Pemantauan', value: 'PEMANTAUAN' },
    { label: 'Terjual', value: 'TERJUAL' },
    { label: 'Arsip', value: 'ARSIP' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search & View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, nama, atau e-artag..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl text-[#17211B] font-medium focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'card' ? 'bg-white text-[#006B3F] shadow-sm' : 'text-[#68746D] hover:bg-white/50'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kartu
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'table' ? 'bg-white text-[#006B3F] shadow-sm' : 'text-[#68746D] hover:bg-white/50'}`}
          >
            <List className="w-4 h-4" />
            Tabel
          </button>
        </div>
      </div>

      {/* Filter Chips/Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-[#006B3F]" />
          <span className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Filter:</span>
        </div>

        <select 
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="px-4 py-2 bg-white border border-[#DDE7E1] rounded-xl text-xs font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F]"
        >
          {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select 
          value={filters.breed}
          onChange={(e) => setFilter('breed', e.target.value)}
          className="px-4 py-2 bg-white border border-[#DDE7E1] rounded-xl text-xs font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F]"
        >
          <option value="ALL">Semua Ras</option>
          {breeds.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select 
          value={filters.pen}
          onChange={(e) => setFilter('pen', e.target.value)}
          className="px-4 py-2 bg-white border border-[#DDE7E1] rounded-xl text-xs font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F]"
        >
          <option value="ALL">Semua Kandang</option>
          {pens.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {(filters.status !== 'ALL' || filters.breed !== 'ALL' || filters.pen !== 'ALL' || searchQuery) && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilter('status', 'ALL');
              setFilter('breed', 'ALL');
              setFilter('pen', 'ALL');
            }}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
};
