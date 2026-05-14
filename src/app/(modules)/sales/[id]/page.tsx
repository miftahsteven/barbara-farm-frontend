'use client';

import React, { use } from 'react';
import { useSalesStore } from '@/lib/useSalesStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { ProfitAnalysisCard } from '@/components/sales/ProfitAnalysisCard';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ShoppingBag, 
  Calendar, 
  User, 
  MapPin, 
  CreditCard,
  Scale,
  Beef,
  CheckCircle2,
  Info
} from 'lucide-react';

interface SaleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getSaleById, fetchSales, sales, deleteSale } = useSalesStore();
  const { cattle, fetchCattle } = useCattleStore();

  React.useEffect(() => {
    if (sales.length === 0) fetchSales();
    if (cattle.length === 0) fetchCattle();
  }, [fetchSales, fetchCattle, sales.length, cattle.length]);
  
  const sale = getSaleById(id);
  const cow = sale ? cattle.find(c => c.id === sale.cattleId) : null;

  if (!sale) return <div className="p-20 text-center font-bold">Transaksi tidak ditemukan</div>;

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini? Status sapi akan kembali Aktif.')) {
      const success = await deleteSale(id);
      if (success) {
        router.push('/sales');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/sales')}
              className="p-3 bg-white border border-[#DDE7E1] rounded-2xl text-[#68746D] hover:text-[#17211B] transition-all shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#17211B] tracking-tight">{sale.id}</h1>
                <span className="px-3 py-1 bg-[#EAF6F0] text-[#006B3F] text-[10px] font-bold rounded-full uppercase border border-[#006B3F]/10">
                   {sale.status}
                </span>
              </div>
              <p className="text-[#68746D] text-sm">Invoice Penjualan • {sale.saleDate.split('T')[0]}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleDelete}
              className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all"
            >
              Batalkan
            </button>
            <button 
              onClick={() => router.push(`/sales/${id}/edit`)}
              className="px-6 py-3 bg-white border border-[#DDE7E1] rounded-2xl font-bold text-sm hover:bg-[#F7FAF8]"
            >
              Edit
            </button>
            <button className="px-6 py-3 bg-white border border-[#DDE7E1] rounded-2xl font-bold text-sm hover:bg-[#F7FAF8]">Cetak</button>
            <button className="px-6 py-3 bg-[#006B3F] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#006B3F]/10">Bagikan</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Transaction Details */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-[#68746D] uppercase tracking-[0.2em]">Data Pembeli</h4>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F7FAF8] flex items-center justify-center text-[#006B3F]"><User className="w-5 h-5" /></div>
                            <div>
                               <p className="text-sm font-black text-[#17211B]">{sale.buyerName || 'Pembeli Umum'}</p>
                               <p className="text-[10px] text-[#68746D]">{sale.buyerPhone || '-'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F7FAF8] flex items-center justify-center text-[#006B3F]"><MapPin className="w-5 h-5" /></div>
                            <div>
                               <p className="text-sm font-black text-[#17211B]">{sale.destination}</p>
                               <p className="text-[10px] text-[#68746D] line-clamp-1">{sale.deliveryAddress || 'Ambil di Kandang'}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-[#68746D] uppercase tracking-[0.2em]">Informasi Sapi</h4>
                      <div className="flex items-center gap-4 p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                         <img src={cow?.photoUrl} className="w-14 h-14 rounded-xl object-cover" alt="" />
                         <div>
                            <p className="text-sm font-black text-[#17211B]">{sale.cattleId}</p>
                            <p className="text-[10px] text-[#68746D]">{cow?.breed} • {cow?.gender}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-[#68746D]" />
                            <span className="text-xs font-bold text-[#17211B]">Berat Jual: {sale.finalWeightKg} Kg</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-[#17211B]">Aman Jual</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-[#DDE7E1] grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-[#68746D] uppercase tracking-[0.2em]">Pembayaran</h4>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><CreditCard className="w-6 h-6" /></div>
                         <div>
                            <p className="text-sm font-black text-[#17211B]">{sale.paymentMethod}</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{sale.paymentStatus}</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-[#68746D] uppercase tracking-[0.2em]">Status Transaksi</h4>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-sm font-bold text-[#17211B]">Finalized - Sapi telah keluar kandang</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Transaksi ini telah mengupdate status sapi <strong>{sale.cattleId}</strong> menjadi <strong>TERJUAL</strong>. Riwayat ini tidak dapat dihapus demi audit finansial peternakan.
                </p>
             </div>
          </div>

          {/* Right Column: Profit Analysis */}
          <div className="space-y-8">
             <ProfitAnalysisCard sale={sale} />

             <div className="bg-[#17211B] p-8 rounded-[2.5rem] shadow-xl text-white">
                <h4 className="font-bold text-sm mb-4">Efisiensi ADG Jual</h4>
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs opacity-60">Pencapaian Berat</span>
                   <span className="text-xs font-bold">120% Target</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                   <div className="w-full h-full bg-emerald-400" />
                </div>
                <p className="text-[10px] mt-4 opacity-50 leading-relaxed">Sapi ini mencapai target berat jual lebih cepat dari estimasi pakan 90 hari.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
