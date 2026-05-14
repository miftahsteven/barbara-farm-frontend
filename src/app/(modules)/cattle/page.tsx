'use client';

import React, { useState, useEffect } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { CattleSummaryCards } from '@/components/cattle/CattleSummaryCards';
import { CattleFilters } from '@/components/cattle/CattleFilters';
import { CattleCard } from '@/components/cattle/CattleCard';
import { CattleTable } from '@/components/cattle/CattleTable';
import { CattleQrModal } from '@/components/cattle/CattleQrModal';
import { Cattle } from '@/lib/useCattleStore';
import { Plus, Download, Scan, AlertTriangle, Archive, X, Loader2, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CattleListPage() {
  const { cattle, isLoading, fetchCattle, searchQuery, filters, setFilter, viewMode, setViewMode, archiveCattle, unarchiveCattle } = useCattleStore();
  const [selectedCattleForQr, setSelectedCattleForQr] = useState<Cattle | null>(null);
  const [cattleToArchive, setCattleToArchive] = useState<Cattle | null>(null);
  const [archiveReason, setArchiveReason] = useState('Terjual');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Filter Logic
  const filteredCattle = cattle.filter((c) => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.eartagNo && c.eartagNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filters.status === 'ALL' ? c.status !== 'ARSIP' && c.status !== 'TERJUAL' : c.status === filters.status;
    const matchesBreed = filters.breed === 'ALL' ? true : c.breed === filters.breed;
    const matchesPen = filters.pen === 'ALL' ? true : c.pen === filters.pen;
    const matchesGender = filters.gender === 'ALL' ? true : c.gender === filters.gender;
    
    return matchesSearch && matchesStatus && matchesBreed && matchesPen && matchesGender;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCattle.length / itemsPerPage);
  const paginatedCattle = filteredCattle.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmArchive = () => {
    if (cattleToArchive) {
      archiveCattle(cattleToArchive.id, archiveReason);
      setCattleToArchive(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Master Data Sapi</h1>
          <p className="text-[#68746D]">Kelola identitas, QR Code, dan data awal ternak Barbara Farm.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/qr-scan"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all"
          >
            <Scan className="w-5 h-5 text-[#006B3F]" />
            Scan QR
          </Link>
          <button 
            onClick={() => {
              setFilter('status', 'TERJUAL');
              setViewMode('table');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-emerald-50 hover:border-emerald-200 text-emerald-600 rounded-2xl font-bold transition-all"
          >
            <DollarSign className="w-5 h-5" />
            Sapi Terjual
          </button>
          <button 
            onClick={() => {
              setFilter('status', 'ARSIP');
              setViewMode('table');
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-red-50 hover:border-red-200 text-red-600 rounded-2xl font-bold transition-all"
          >
            <Archive className="w-5 h-5" />
            Arsip Sapi
          </button>
          <Link 
            href="/cattle/new"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Tambah Sapi
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <CattleSummaryCards />

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#006B3F] rounded-full" />
            <h2 className="text-xl font-black text-[#17211B]">Daftar Ternak</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-bold text-[#68746D] hover:text-[#006B3F] transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <CattleFilters />

        {/* Content View */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#006B3F]">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold">Memuat Data Sapi...</p>
          </div>
        ) : paginatedCattle.length > 0 ? (
          <div className="space-y-8">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {paginatedCattle.map((item) => (
                  <CattleCard 
                    key={item.id} 
                    cattle={item} 
                    onShowQr={setSelectedCattleForQr}
                  />
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <CattleTable 
                  cattle={paginatedCattle} 
                  onShowQr={setSelectedCattleForQr}
                  onArchive={setCattleToArchive}
                  onUnarchive={(c) => unarchiveCattle(c.id)}
                />
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-[#DDE7E1]">
                <p className="text-sm text-[#68746D]">
                  Menampilkan <span className="font-bold text-[#17211B]">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-[#17211B]">{Math.min(currentPage * itemsPerPage, filteredCattle.length)}</span> dari <span className="font-bold text-[#17211B]">{filteredCattle.length}</span> sapi
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-[#DDE7E1] rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7FAF8] transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          currentPage === i + 1 
                            ? 'bg-[#006B3F] text-white' 
                            : 'hover:bg-[#EAF6F0] text-[#68746D]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border-2 border-[#DDE7E1] rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F7FAF8] transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#F7FAF8] rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-[#DDE7E1]" />
            </div>
            <h3 className="text-xl font-bold text-[#17211B]">Sapi Tidak Ditemukan</h3>
            <p className="text-[#68746D] max-w-xs mt-2 leading-relaxed">
              Kami tidak dapat menemukan data sapi dengan kriteria tersebut. Silakan coba kata kunci lain.
            </p>
            <button 
              onClick={() => useCattleStore.getState().setSearchQuery('')}
              className="mt-6 text-sm font-bold text-[#006B3F] underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CattleQrModal 
        cattle={selectedCattleForQr} 
        onClose={() => setSelectedCattleForQr(null)} 
      />

      {/* Archive Confirmation Modal */}
      {cattleToArchive && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#17211B]/60 backdrop-blur-sm" onClick={() => setCattleToArchive(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setCattleToArchive(null)}
              className="absolute top-6 right-6 p-2 hover:bg-[#F7FAF8] rounded-full text-[#68746D]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Archive className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#17211B] mb-2">Arsip Sapi {cattleToArchive.id}?</h3>
              <p className="text-[#68746D] text-sm mb-8 leading-relaxed px-4">
                Memindahkan sapi ke arsip akan menonaktifkannya dari list operasional. Anda tetap dapat melihat datanya di filter arsip.
              </p>
              
              <div className="w-full space-y-4 mb-8">
                <label className="block text-left text-xs font-bold text-[#68746D] uppercase tracking-wider">Alasan Pengarsipan</label>
                <select 
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="Terjual">Terjual</option>
                  <option value="Mati">Mati</option>
                  <option value="Dipindahkan">Dipindahkan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => setCattleToArchive(null)}
                  className="py-4 bg-white border-2 border-[#DDE7E1] text-[#17211B] rounded-2xl font-bold transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmArchive}
                  className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-600/20"
                >
                  Arsipkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
