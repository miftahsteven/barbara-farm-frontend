'use client';

import React from 'react';
import { GrowthLogForm } from '@/components/growth/GrowthLogForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Info } from 'lucide-react';
import { Suspense } from 'react';

function AddGrowthLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cowId = searchParams.get('cowId') || '';

  const handleSuccess = (cowId: string) => {
    router.push(`/growth/cow/${encodeURIComponent(cowId)}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-bold">Kembali</span>
      </button>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-[#17211B] tracking-tight">Catat Timbang Sapi</h1>
        <p className="text-[#68746D] leading-relaxed">
          Masukkan hasil penimbangan terbaru untuk menghitung ADG dan memantau kesehatan ternak.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#DDE7E1] shadow-xl">
        <GrowthLogForm cowId={cowId} onSuccess={handleSuccess} />
      </div>

      <div className="p-6 bg-[#EAF6F0] rounded-3xl border border-[#006B3F]/10 flex gap-4">
        <div className="p-2 bg-white rounded-xl h-fit">
          <Info className="w-5 h-5 text-[#006B3F]" />
        </div>
        <div>
          <h4 className="font-bold text-[#17211B] text-sm">Tips Penimbangan</h4>
          <p className="text-xs text-[#68746D] leading-relaxed mt-1">
            Lakukan penimbangan pada waktu yang sama (sebaiknya pagi hari sebelum diberi pakan) untuk mendapatkan data ADG yang paling akurat.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AddGrowthLogPage() {
  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <AddGrowthLogContent />
      </Suspense>
    </div>
  );
}
