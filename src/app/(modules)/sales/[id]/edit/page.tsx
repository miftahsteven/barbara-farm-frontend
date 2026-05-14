'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SalesFormWizard } from '@/components/sales/SalesFormWizard';
import { useSalesStore } from '@/lib/useSalesStore';
import { useCattleStore } from '@/lib/useCattleStore';

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export default function EditSalePage({ params }: EditSalePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getSaleById, fetchSales, sales } = useSalesStore();
  const { fetchCattle, cattle } = useCattleStore();

  React.useEffect(() => {
    if (sales.length === 0) fetchSales();
    if (cattle.length === 0) fetchCattle();
  }, [fetchSales, fetchCattle, sales.length, cattle.length]);

  const sale = getSaleById(id);

  if (!sale && sales.length > 0) return <div className="p-20 text-center font-bold">Data penjualan tidak ditemukan</div>;
  if (!sale) return <div className="p-20 text-center font-bold">Memuat data...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-[#DDE7E1] rounded-2xl text-[#68746D] hover:text-[#17211B] transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#17211B] tracking-tight">Edit Data Penjualan</h1>
            <p className="text-[#68746D]">Memperbarui data transaksi {sale.id}</p>
          </div>
        </div>

        <SalesFormWizard 
          mode="edit" 
          initialData={sale} 
          onSuccess={() => router.push(`/sales/${id}`)} 
        />
      </div>
    </div>
  );
}
