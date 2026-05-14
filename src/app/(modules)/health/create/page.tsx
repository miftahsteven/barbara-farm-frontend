'use client';

import React, { useState } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { useHealthStore } from '@/lib/useHealthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Stethoscope, 
  Activity, 
  Pill, 
  Info,
  AlertCircle,
  Search,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Suspense } from 'react';

function CreateMedicalLogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cowId = searchParams.get('cowId') || '';
  const { cattle, fetchCattle } = useCattleStore();
  const { addRecord } = useHealthStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    cattleId: cowId,
    checkDate: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    severity: 'mild',
    bodyTemperature: '',
    appetite: 'normal',
    stoolCondition: 'normal',
    actionType: 'checkup',
    medicineName: '',
    dosage: '',
    withdrawalDays: 0,
    nextCheckupDate: '',
    status: 'active',
    officerName: 'Operator Kandang 1'
  });

  React.useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  // Sync cattleId if passed from URL
  React.useEffect(() => {
    if (cowId && cattle.length > 0 && !formData.cattleId) {
      setFormData((prev: any) => ({ ...prev, cattleId: cowId }));
    }
  }, [cowId, cattle, formData.cattleId]);

  const selectedCow = cattle.find(c => c.id === (formData.cattleId || cowId));

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    try {
      const result = await addRecord({
        ...formData,
        bodyTemperature: formData.bodyTemperature ? parseFloat(formData.bodyTemperature) : undefined,
        withdrawalDays: parseInt(formData.withdrawalDays),
        nextCheckupDate: formData.nextCheckupDate || null
      });
      if (result) {
        router.push('/health');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const steps = [
    { id: 1, title: 'Pilih Sapi', icon: <Search className="w-4 h-4" /> },
    { id: 2, title: 'Diagnosa', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 3, title: 'Tindakan', icon: <Pill className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Batal</span>
        </button>

        <div className="bg-white rounded-[2.5rem] border border-[#DDE7E1] shadow-xl overflow-hidden">
          {/* Header Wizard */}
          <div className="bg-[#F7FAF8] border-b border-[#DDE7E1] px-8 py-6">
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-[#006B3F] text-white' : 'bg-white text-[#68746D] border border-[#DDE7E1]'}`}>
                      {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${step >= s.id ? 'text-[#006B3F]' : 'text-[#68746D]'}`}>{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-4 ${step > s.id ? 'bg-[#006B3F]' : 'bg-[#DDE7E1]'}`} />
                  )}
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-black text-[#17211B]">{steps[step-1].title}</h2>
          </div>

          <div className="p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="relative">
                  <select 
                    value={formData.cattleId}
                    onChange={(e) => setFormData({...formData, cattleId: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold appearance-none focus:outline-none focus:border-[#006B3F]"
                  >
                    <option value="">{cattle.length === 0 ? '-- Memuat Data Sapi... --' : '-- Cari Sapi --'}</option>
                    {cattle.filter(c => c.status !== 'ARSIP').map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                    ))}
                  </select>
                  {cattle.length === 0 && !formData.cattleId && (
                    <p className="mt-2 text-[10px] text-red-500 font-bold italic">* Pastikan Anda sudah mengisi Master Data Sapi</p>
                  )}
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
                </div>
                {selectedCow && (
                  <div className="p-6 bg-[#EAF6F0] rounded-3xl border border-[#006B3F]/10 flex items-center gap-4">
                    <img src={selectedCow.photoUrl} className="w-14 h-14 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="text-sm font-black text-[#17211B]">{selectedCow.id}</p>
                      <p className="text-xs text-[#68746D]">{selectedCow.breed} • {selectedCow.pen}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#68746D] uppercase">Tanggal Cek</label>
                    <input type="date" value={formData.checkDate} onChange={e => setFormData({...formData, checkDate: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#68746D] uppercase">Suhu (°C)</label>
                    <input type="number" placeholder="38.5" value={formData.bodyTemperature} onChange={e => setFormData({...formData, bodyTemperature: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase">Gejala Utama</label>
                  <input placeholder="Contoh: Nafsu makan turun, batuk..." value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase">Diagnosa Sementara</label>
                  <input placeholder="Contoh: Flu ringan, gangguan pencernaan..." value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase">Tingkat Urgensi</label>
                  <div className="flex gap-2">
                    {['mild', 'moderate', 'severe', 'emergency'].map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, severity: s})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${formData.severity === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-[#68746D] border-[#DDE7E1]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase">Tindakan / Obat</label>
                  <div className="relative">
                    <input placeholder="Nama obat atau tindakan..." value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-[#F7FAF8] border border-[#DDE7E1] rounded-2xl font-bold focus:border-[#006B3F]" />
                    <Pill className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#68746D]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#68746D] uppercase">Dosis</label>
                    <input placeholder="Contoh: 10ml" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#68746D] uppercase">Masa Henti (Hari)</label>
                    <input type="number" value={formData.withdrawalDays} onChange={e => setFormData({...formData, withdrawalDays: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                  </div>
                </div>
                {formData.withdrawalDays > 0 && (
                   <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                      <p className="text-xs font-bold text-purple-700">Sapi akan masuk masa henti obat otomatis.</p>
                   </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase">Catatan Tambahan</label>
                  <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-medium focus:border-[#006B3F]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#68746D] uppercase flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" />
                    Jadwal Kontrol Berikutnya (Opsional)
                  </label>
                  <input type="date" value={formData.nextCheckupDate} onChange={e => setFormData({...formData, nextCheckupDate: e.target.value})} className="w-full px-5 py-3.5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-xl font-bold focus:border-[#006B3F]" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#DDE7E1]">
              <button 
                type="button" 
                onClick={step === 1 ? () => router.back() : handlePrev}
                className="flex items-center gap-2 px-6 py-3 font-bold text-[#68746D] hover:text-[#17211B]"
              >
                {step === 1 ? 'Batal' : 'Sebelumnya'}
              </button>
              
              <button 
                type="button"
                onClick={step === 3 ? handleSubmit : handleNext}
                disabled={step === 1 && !formData.cattleId}
                className="flex items-center gap-2 px-10 py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20 disabled:opacity-50"
              >
                {step === 3 ? 'Simpan Pemeriksaan' : 'Selanjutnya'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateMedicalLogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CreateMedicalLogContent />
    </Suspense>
  );
}
