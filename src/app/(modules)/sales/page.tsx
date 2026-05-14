'use client';

import React from 'react';
import { useSalesStore } from '@/lib/useSalesStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { SalesSummaryCards } from '@/components/sales/SalesSummaryCards';
import { Plus, Scan, ShoppingBag, History, ChevronRight, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function SalesDashboardPage() {
  const { sales, fetchSales } = useSalesStore();
  const { cattle, fetchCattle } = useCattleStore();

  React.useEffect(() => {
    fetchSales();
    fetchCattle();
  }, [fetchSales, fetchCattle]);

  const finalSales = sales.filter(s => s.status === 'Final').slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-[#F7FAF8]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Penjualan Sapi</h1>
          <p className="text-[#68746D]">Monitor omzet, profit, dan efisiensi bisnis Barbara Farm.</p>
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
            href="/sales/create"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            <Plus className="w-5 h-5" />
            Jual Sapi
          </Link>
        </div>
      </div>

      <SalesSummaryCards />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Sales History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#17211B] flex items-center gap-3">
              <History className="w-6 h-6 text-[#006B3F]" />
              Transaksi Terakhir
            </h2>
          </div>

          <div className="space-y-4">
            {finalSales.map((sale) => {
              const cow = cattle.find(c => c.id === sale.cattleId);
              return (
                <Link key={sale.id} href={`/sales/${sale.id}`}>
                  <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] hover:border-[#006B3F] transition-all flex items-center justify-between group shadow-sm mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F7FAF8] rounded-2xl flex items-center justify-center text-[#006B3F] font-black border border-[#DDE7E1]">
                        {cow ? <img src={cow.photoUrl} className="w-full h-full rounded-2xl object-cover" alt="" /> : <ShoppingBag />}
                      </div>
                      <div>
                        <h4 className="font-black text-[#17211B]">{sale.id}</h4>
                        <p className="text-xs text-[#68746D]">{sale.saleDate} • {sale.buyerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-[#006B3F]">Rp {sale.salePrice.toLocaleString()}</p>
                       <p className={`text-[10px] font-bold ${sale.projectedProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                         Profit: +Rp {sale.projectedProfit.toLocaleString()}
                       </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#DDE7E1] group-hover:text-[#006B3F] ml-4 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Profit Chart / Insights */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-[#DDE7E1] shadow-sm">
             <h3 className="text-lg font-black text-[#17211B] mb-6">Market Insights</h3>
             <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Target Jagal</p>
                   <p className="text-sm font-bold text-[#17211B]">Harga rata-rata naik 5% minggu ini untuk sapi bobot {'>'}400Kg.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                   <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Buyer Teraktif</p>
                   <p className="text-sm font-bold text-[#17211B]">CV Ternak Makmur telah melakukan 3 transaksi bulan ini.</p>
                </div>
             </div>
          </section>

          <section className="bg-[#17211B] p-8 rounded-[2.5rem] shadow-xl text-white">
            <h3 className="text-lg font-black mb-4">Efisiensi Bisnis</h3>
            <p className="text-xs opacity-60 leading-relaxed mb-6">
              Rata-rata margin Anda (18.2%) berada di atas rata-rata industri penggemukan lokal (12%).
            </p>
            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <p className="text-[10px] font-bold opacity-50 uppercase mb-1 tracking-widest">Growth ROI</p>
                  <p className="text-2xl font-black text-emerald-400">+12.4%</p>
               </div>
               <TrendingUp className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
