'use client';

import React from 'react';
import { useHealthStore } from '@/lib/useHealthStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { HealthSummaryCards } from '@/components/health/HealthSummaryCards';
import { MedicalCaseCard } from '@/components/health/MedicalCaseCard';
import { Plus, Scan, Search, ChevronRight, Filter, AlertTriangle, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HealthDashboardPage() {
  const { records, fetchRecords, isLoading } = useHealthStore();
  const { fetchCattle } = useCattleStore();

  React.useEffect(() => {
    fetchCattle();
    fetchRecords();
  }, [fetchCattle, fetchRecords]);

  const activeCases = Array.isArray(records) ? records.filter(r => r.status === 'treatment' || r.status === 'active').slice(0, 6) : [];
  const upcomingVaccines = Array.isArray(records) ? records.filter(r => r.actionType === 'vaccination' && (r.status === 'closed' || r.status === 'recovered')).slice(0, 3) : [];

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Kesehatan & Medis</h1>
          <p className="text-[#68746D]">Pantau kondisi medis, pengobatan, dan jadwal vaksinasi.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/qr-scan"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all"
          >
            <Scan className="w-5 h-5 text-[#006B3F]" />
            Scan QR
          </Link>
          <Link 
            href="/health/create"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Catat Pemeriksaan
          </Link>
        </div>
      </div>

      <HealthSummaryCards />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Section: Active Cases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#17211B] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
              Kasus Medis Aktif
            </h2>
            <Link href="/health/cases" className="text-sm font-bold text-[#006B3F] hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCases.map((record) => (
              <MedicalCaseCard key={record.id} record={record} />
            ))}
          </div>

          {activeCases.length === 0 && (
            <div className="py-20 bg-white rounded-[2.5rem] border border-[#DDE7E1] flex flex-col items-center text-center opacity-60">
              <div className="w-16 h-16 bg-[#F7FAF8] rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-[#DDE7E1]" />
              </div>
              <h3 className="text-lg font-bold text-[#17211B]">Tidak Ada Kasus Aktif</h3>
              <p className="text-sm text-[#68746D]">Seluruh ternak dalam kondisi sehat dan terpantau.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Schedules & Alerts */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
            <h3 className="text-lg font-black text-[#17211B] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#006B3F]" />
              Jadwal Terdekat
            </h3>
            <div className="space-y-4">
              {upcomingVaccines.map((v, i) => (
                <div key={i} className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1] flex items-center gap-4 group hover:border-[#006B3F] transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#006B3F] border border-[#EAF6F0]">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#17211B]">{v.diagnosis}</p>
                    <p className="text-[10px] text-[#68746D]">{v.cattleId} • Kandang A</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 text-xs font-bold text-[#006B3F] hover:bg-[#EAF6F0] rounded-xl transition-all">
                Lihat Semua Jadwal
              </button>
            </div>
          </section>

          <section className="bg-[#17211B] p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-lg font-black mb-4">Report Kesehatan</h3>
            <p className="text-sm opacity-70 leading-relaxed mb-6">
              95% ternak Barbara Farm dalam kondisi sehat bulan ini. Terjadi penurunan kasus pencernaan sebesar 12%.
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold opacity-60 uppercase">Penyakit Terbanyak</p>
                <p className="text-sm font-bold">Gangguan Pencernaan</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold opacity-60 uppercase">Obat Terbanyak</p>
                <p className="text-sm font-bold">Vitamin B Complex</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
