'use client';

import React, { useState } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useHealthStore } from '@/lib/useHealthStore';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { useGrowthStore } from '@/lib/useGrowthStore';
import { useSalesStore, SaleDestination, PaymentMethod, PaymentStatus, SaleStatus } from '@/lib/useSalesStore';
import { 
  Search, 
  Scan, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  DollarSign, 
  Scale, 
  Calendar,
  User,
  MapPin,
  Calculator
} from 'lucide-react';

interface SalesFormWizardProps {
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const SalesFormWizard: React.FC<SalesFormWizardProps> = ({ onSuccess, mode = 'create', initialData }) => {
  const { cattle, fetchCattle } = useCattleStore();
  const { records: healthRecords, fetchRecords: fetchHealthRecords } = useHealthStore();
  const { logs: feedingLogs, fetchLogs: fetchFeedingLogs } = useFeedingStore();
  const { logs: growthLogsAll, fetchLogs: fetchGrowthLogs } = useGrowthStore();
  const { addSale, updateSale } = useSalesStore();

  React.useEffect(() => {
    fetchCattle();
    fetchHealthRecords();
    fetchFeedingLogs();
    fetchGrowthLogs();
  }, [fetchCattle, fetchHealthRecords, fetchFeedingLogs, fetchGrowthLogs]);

  const [step, setStep] = useState(mode === 'edit' ? 2 : 1);
  const [selectedCattleId, setSelectedCattleId] = useState(initialData?.cattleId || '');
  
  const [formData, setFormData] = useState<any>({
    saleDate: initialData?.saleDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    finalWeightKg: initialData?.finalWeightKg?.toString() || '',
    salePrice: initialData?.salePrice?.toString() || '',
    destination: initialData?.destination || 'Jagal' as SaleDestination,
    buyerName: initialData?.buyerName || '',
    buyerPhone: initialData?.buyerPhone || '',
    deliveryAddress: initialData?.deliveryAddress || '',
    paymentMethod: initialData?.paymentMethod || 'Transfer' as PaymentMethod,
    paymentStatus: initialData?.paymentStatus || 'Lunas' as PaymentStatus,
    additionalOperationalCost: initialData?.additionalOperationalCost || 300000,
    notes: initialData?.notes || ''
  });

  const [displaySalePrice, setDisplaySalePrice] = useState(initialData?.salePrice ? parseInt(initialData.salePrice, 10).toLocaleString('id-ID') : '');

  const selectedCow = cattle.find(c => c.id === selectedCattleId);

  React.useEffect(() => {
    if (selectedCattleId && selectedCow && mode !== 'edit') {
      const cowGrowthLogs = Array.isArray(growthLogsAll) ? growthLogsAll.filter(l => l.cattleId === selectedCattleId).sort((a, b) => new Date(b.weighDate).getTime() - new Date(a.weighDate).getTime()) : [];
      const latestWeight = cowGrowthLogs.length > 0 ? cowGrowthLogs[0].weightKg : selectedCow.initialWeightKg;
      setFormData((prev: any) => ({ ...prev, finalWeightKg: latestWeight.toString() }));
    }
  }, [selectedCattleId, selectedCow, growthLogsAll, mode]);

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(rawValue, 10);
    
    if (isNaN(numValue)) {
      setDisplaySalePrice('');
      setFormData((prev: any) => ({ ...prev, salePrice: '' }));
    } else {
      setDisplaySalePrice(numValue.toLocaleString('id-ID'));
      setFormData((prev: any) => ({ ...prev, salePrice: numValue.toString() }));
    }
  };

  // Withdrawal Check
  const isUnderWithdrawal = healthRecords.some(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.cattleId === selectedCattleId && r.safeToSellDate && r.safeToSellDate > today && r.status !== 'closed';
  });

  // Cost Aggregation
  const cowFeedingCost = feedingLogs
    .filter(l => l.cattleId === selectedCattleId)
    .reduce((acc, curr) => acc + curr.totalCost, 0);
  
  const cowMedicalCost = healthRecords
    .filter(r => r.cattleId === selectedCattleId)
    .reduce((acc, curr) => acc + (curr.withdrawalDays ? 150000 : 50000), 0); // Simplified cost logic

  const purchasePrice = selectedCow?.purchasePrice || 0;
  const totalProductionCost = purchasePrice + cowFeedingCost + cowMedicalCost + (parseFloat(formData.additionalOperationalCost) || 0);
  const profit = (parseFloat(formData.salePrice) || 0) - totalProductionCost;
  const marginPercent = (parseFloat(formData.salePrice) || 0) > 0 ? (profit / parseFloat(formData.salePrice)) * 100 : 0;

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const payload = {
      cattleId: selectedCattleId,
      saleDate: formData.saleDate,
      finalWeightKg: parseFloat(formData.finalWeightKg),
      salePrice: parseFloat(formData.salePrice),
      destination: formData.destination,
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
      deliveryAddress: formData.deliveryAddress,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      purchasePrice,
      totalFeedCost: cowFeedingCost,
      totalMedicalCost: cowMedicalCost,
      additionalOperationalCost: parseFloat(formData.additionalOperationalCost),
      totalProductionCost,
      projectedProfit: profit,
      marginPercent,
      status: 'Final' as SaleStatus
    };

    let success = false;
    if (mode === 'edit' && initialData?.id) {
      success = await updateSale(initialData.id, payload);
    } else {
      success = await addSale(payload);
    }

    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Wizard Progress */}
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-[#006B3F] text-white shadow-lg shadow-[#006B3F]/20' : 'bg-[#F7FAF8] text-[#68746D] border border-[#DDE7E1]'}`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && <div className={`h-1 flex-1 mx-4 rounded-full ${step > s ? 'bg-[#006B3F]' : 'bg-[#DDE7E1]'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-widest">Pilih Sapi Siap Jual</label>
            <div className="relative">
              <select 
                value={selectedCattleId}
                onChange={(e) => setSelectedCattleId(e.target.value)}
                disabled={mode === 'edit'}
                className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold appearance-none focus:outline-none focus:border-[#006B3F] disabled:opacity-50"
              >
                <option value="">-- Cari ID Sapi --</option>
                {cattle.filter(c => c.status !== 'ARSIP').map(c => (
                  <option key={c.id} value={c.id}>{c.id} - {c.breed}</option>
                ))}
              </select>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
            </div>
          </div>

          {selectedCow && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
              <div className="p-6 bg-white border border-[#DDE7E1] rounded-3xl flex items-center gap-4">
                <img src={selectedCow.photoUrl} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                <div>
                  <h4 className="font-black text-[#17211B]">{selectedCow.id}</h4>
                  <p className="text-xs text-[#68746D]">{selectedCow.breed} • {selectedCow.pen}</p>
                </div>
              </div>
              
              {isUnderWithdrawal && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex gap-4 items-center">
                  <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-red-700 uppercase">Sapi Tidak Layak Jual</p>
                    <p className="text-xs text-red-600">Sapi masih dalam masa henti obat (Withdrawal Period). Penjualan tidak diizinkan.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#68746D] uppercase">Tanggal Jual</label>
                <input type="date" value={formData.saleDate} onChange={e => setFormData({...formData, saleDate: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#68746D] uppercase">Berat Akhir (Kg)</label>
                <input type="number" value={formData.finalWeightKg} onChange={e => setFormData({...formData, finalWeightKg: e.target.value})} placeholder="0.0" className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#68746D] uppercase">Harga Jual Total (Rp)</label>
              <input type="text" inputMode="numeric" value={displaySalePrice} onChange={handleSalePriceChange} placeholder="Masukkan nominal..." className="w-full px-5 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-black text-xl focus:border-[#006B3F] text-[#006B3F]" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#68746D] uppercase">Tujuan Penjualan</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Jagal', 'Reseller', 'Konsumen Langsung', 'Mitra'].map(dest => (
                  <button key={dest} type="button" onClick={() => setFormData({...formData, destination: dest})} className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${formData.destination === dest ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-white text-[#68746D] border-[#DDE7E1]'}`}>
                    {dest}
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Nama Pembeli</label>
                <input value={formData.buyerName} onChange={e => setFormData({...formData, buyerName: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">No. HP</label>
                <input value={formData.buyerPhone} onChange={e => setFormData({...formData, buyerPhone: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Metode Pembayaran</label>
              <div className="flex gap-2">
                {['Cash', 'Transfer', 'DP'].map(m => (
                  <button key={m} type="button" onClick={() => setFormData({...formData, paymentMethod: m})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold border transition-all ${formData.paymentMethod === m ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-white text-[#68746D] border-[#DDE7E1]'}`}>
                    {m}
                  </button>
                ))}
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Alamat Kirim</label>
              <textarea rows={2} value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-medium" />
           </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
           <div className="bg-[#17211B] p-8 rounded-[2.5rem] text-white space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Review ROI</h4>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${profit > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {profit > 0 ? 'UNTUNG' : 'RUGI'}
                </div>
              </div>
              
              <div className="space-y-3">
                 <div className="flex justify-between text-xs opacity-70">
                    <span>Total Produksi (Modal+Pakan+Medis)</span>
                    <span>Rp {totalProductionCost.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-lg font-black border-t border-white/10 pt-3">
                    <span>Harga Jual</span>
                    <span>Rp {(parseFloat(formData.salePrice) || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xl font-black text-emerald-400 pt-1">
                    <span>Keuntungan</span>
                    <span>Rp {profit.toLocaleString()}</span>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${marginPercent > 15 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {marginPercent.toFixed(0)}%
                 </div>
                 <p className="text-xs font-bold leading-tight">
                    {marginPercent > 15 ? 'Margin sangat sehat untuk skala penggemukan.' : 'Margin tipis, evaluasi biaya pakan kedepannya.'}
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-[#DDE7E1]">
        <button 
          type="button" 
          onClick={handlePrev}
          disabled={step === 1}
          className="px-6 py-3 font-bold text-[#68746D] disabled:opacity-0"
        >
          Sebelumnya
        </button>
        
        {step < 4 ? (
          <button 
            type="button"
            onClick={handleNext}
            disabled={!selectedCattleId || isUnderWithdrawal || (step === 2 && (!formData.finalWeightKg || !formData.salePrice))}
            className="flex items-center gap-2 px-10 py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20 disabled:opacity-50"
          >
            Lanjutkan
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-12 py-5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-[#006B3F]/20"
          >
            Finalkan Penjualan
            <Check className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
