'use client';

import React from 'react';
import { SalesFormWizard } from '@/components/sales/SalesFormWizard';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info, ShoppingBag } from 'lucide-react';

export default function CreateSalePage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Batal & Kembali</span>
        </button>

        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-[#006B3F] rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-[#006B3F]/20">
              <ShoppingBag className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Jual Sapi Baru</h1>
              <p className="text-[#68746D]">Pilih sapi, tentukan harga, dan hitung keuntungan bersih.</p>
           </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#DDE7E1] shadow-xl">
          <SalesFormWizard onSuccess={() => router.push('/sales')} />
        </div>

        <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex gap-4">
          <div className="p-2 bg-white rounded-xl h-fit">
            <Info className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-[#17211B] text-sm">Validasi Pra-Jual</h4>
            <p className="text-xs text-[#68746D] leading-relaxed mt-1">
              Sistem secara otomatis memeriksa status kesehatan dan masa henti obat. Jika sapi belum aman dikonsumsi, tombol finalisasi akan dinonaktifkan demi menjaga standar kualitas Barbara Farm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
