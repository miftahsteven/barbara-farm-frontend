'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Cattle } from '@/lib/useCattleStore';
import { KtpSapiGenerator } from '@/components/cattle/KtpSapiGenerator';
import { parseKtpSapi, BREED_OPTIONS } from '@/lib/generateKtpSapi';
import { useInvestorStore } from '@/lib/useInvestorStore';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Camera, 
  Info, 
  MapPin, 
  Scale,
  AlertCircle,
  CreditCard,
  Upload,
  X,
} from 'lucide-react';

const pens = ['Kandang A', 'Kandang B', 'Kandang C', 'Kandang D'];
const origins = ['Supplier Lokal', 'Supplier Luar', 'Pasar Hewan', 'Pembiakan Internal', 'Hibah/Hadiah'];

// ─── Currency formatting helpers ─────────────────────────────────────────────
const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('id-ID');
};

const parseCurrency = (display: string) => {
  const raw = display.replace(/\D/g, '');
  return raw === '' ? 0 : parseInt(raw, 10);
};

// ─── Age calculator ───────────────────────────────────────────────────────────
const calcAgeMonths = (birthDate?: string): string => {
  if (!birthDate) return '-';
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 0) return '-';
  if (months < 12) return `${months} bulan`;
  return `${Math.floor(months / 12)} tahun ${months % 12} bulan`;
};

interface CattleFormWizardProps {
  initialData?: Partial<Cattle>;
  onSubmit: (data: Partial<Cattle>) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const CattleFormWizard: React.FC<CattleFormWizardProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEdit = false 
}) => {
  const [step, setStep] = useState(1);
  const [generatedKtp, setGeneratedKtp] = useState(initialData?.id || '');
  const [image, setImage] = useState<string | null>(initialData?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [purchasePriceDisplay, setPurchasePriceDisplay] = useState(
    initialData?.purchasePrice ? formatCurrency(initialData.purchasePrice) : ''
  );

  const { investors, fetchInvestors } = useInvestorStore();

  React.useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  const [hasInsurance, setHasInsurance] = useState(!!initialData?.insurance);
  const [insuranceData, setInsuranceData] = useState({
    coverageType: initialData?.insurance?.coverageType || 'KEMATIAN',
    coveragePercent: initialData?.insurance?.coveragePercent || 100,
    sumAssured: initialData?.insurance?.sumAssured || initialData?.purchasePrice || 0,
    premiumCost: initialData?.insurance?.premiumCost || 0,
    premiumPaymentType: initialData?.insurance?.premiumPaymentType || 'DIAWAL',
    duration: initialData?.insurance?.duration || '1_TAHUN',
    startDate: initialData?.insurance?.startDate ? new Date(initialData.insurance.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: initialData?.insurance?.notes || '',
    status: initialData?.insurance?.status || 'AKTIF'
  });

  const [formData, setFormData] = useState<Partial<Cattle>>(() => {
    const data = initialData || {
      gender: 'JANTAN',
      status: 'AKTIF',
      breed: BREED_OPTIONS[0],
      pen: pens[0],
      originType: origins[0],
      entryDate: new Date().toISOString().split('T')[0],
    };

    // If edit and has ID, try to parse alias/breed/etc if missing
    if (isEdit && data.id) {
      const parsed = parseKtpSapi(data.id);
      if (parsed) {
        return {
          ...data,
          alias: (data as any).alias || parsed.alias,
          damAlias: (data as any).damAlias || parsed.damCode,
          breed: data.breed || parsed.breed,
          gender: data.gender || parsed.gender,
          birthDate: data.birthDate || (parsed.birthDate ? parsed.birthDate.toISOString().split('T')[0] : undefined),
        };
      }
    }
    return data;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!generatedKtp && !formData.id) newErrors.id = 'Harap lengkapi KTP Sapi (ID Indukan & Nama Panggilan)';
      if (!(formData as any).alias || (formData as any).alias.trim() === '') newErrors.alias = 'Nama Panggilan wajib diisi';
    } else if (currentStep === 2) {
      if (!formData.originName) newErrors.originName = 'Nama asal wajib diisi';
      if (!formData.pen) newErrors.pen = 'Kandang wajib dipilih';
    } else if (currentStep === 3) {
      if (!formData.initialWeightKg || formData.initialWeightKg <= 0) newErrors.initialWeightKg = 'Berat awal tidak valid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 1 && generatedKtp) {
        setFormData(p => ({ ...p, id: generatedKtp }));
      }
      setStep(s => s + 1);
    }
  };

  // prevStep does NOT reset formData — state is preserved
  const prevStep = () => setStep(s => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const price = raw === '' ? 0 : parseInt(raw, 10);
    setPurchasePriceDisplay(raw === '' ? '' : price.toLocaleString('id-ID'));
    setFormData(prev => ({ ...prev, purchasePrice: price }));
    
    // Auto-update sumAssured if unset or matching old price
    setInsuranceData(prev => ({
      ...prev,
      sumAssured: prev.sumAssured === 0 || prev.sumAssured === formData.purchasePrice ? price : prev.sumAssured
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKtpGenerated = useCallback((code: string, parts: any, damId?: string) => {
    setGeneratedKtp(code);
    if (!parts) return;
    
    setFormData(p => ({
      ...p,
      breed: parts.breedCode,
      gender: parts.genderCode === 'J' ? 'JANTAN' : 'BETINA',
      alias: parts.alias,
      damAlias: parts.damCode,
      damId: damId || p.damId,
      // Store the birth date from KTP (month/year from parts)
      birthDate: parts.birthMonth && parts.birthYear
        ? `20${parts.birthYear}-${String(parts.birthMonth).padStart(2, '0')}-01`
        : p.birthDate,
    }));
  }, []);

  const steps = [
    { id: 1, title: 'Identitas Sapi', icon: <Info className="w-4 h-4" /> },
    { id: 2, title: 'Asal & Lokasi', icon: <MapPin className="w-4 h-4" /> },
    { id: 3, title: 'Data Produksi', icon: <Scale className="w-4 h-4" /> },
    { id: 4, title: 'Foto & Review', icon: <Camera className="w-4 h-4" /> },
  ];

  // Persistent KTP banner for steps 2-4
  const KtpBanner = () => (
    generatedKtp || formData.id ? (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#17211B] to-[#006B3F] rounded-2xl mb-6">
        <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">KTP Sapi</p>
          <p className="font-black text-white font-mono text-sm break-all">{generatedKtp || formData.id}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-[#DDE7E1] shadow-xl overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Wizard Header */}
      <div className="bg-white border-b border-[#DDE7E1] px-8 py-6">
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

      <div className="p-8 md:p-12 bg-white">
        {/* Step 1: KTP Identitas */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <KtpSapiGenerator
              initialBreed={formData.breed || BREED_OPTIONS[0]}
              initialGender={(formData.gender as 'JANTAN' | 'BETINA') || 'JANTAN'}
              initialAlias={(formData as any).alias}
              initialDamCode={(formData as any).damAlias || formData.damId}
              initialBirthDate={formData.birthDate ? new Date(formData.birthDate) : undefined}
              excludeId={formData.id}
              onCodeGenerated={handleKtpGenerated}
            />
            {errors.id && (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {errors.id}
              </p>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">No. E-Artag (Opsional)</label>
              <input
                name="eartagNo" value={formData.eartagNo || ''} onChange={handleChange}
                placeholder="ID-ERT-XXXX"
                className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Asal & Lokasi */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <KtpBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Tipe Asal</label>
                <select 
                  name="originType" value={formData.originType} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                >
                  {origins.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Nama Asal / Supplier</label>
                <input 
                  name="originName" value={formData.originName || ''} onChange={handleChange}
                  placeholder="Contoh: CV Ternak Jaya"
                  className={`w-full px-5 py-3.5 bg-white border rounded-2xl font-bold focus:outline-none focus:border-[#006B3F] ${errors.originName ? 'border-red-500' : 'border-[#DDE7E1]'}`}
                />
                {errors.originName && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.originName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Kandang</label>
                <select 
                  name="pen" value={formData.pen} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                >
                  {pens.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Tanggal Masuk</label>
                <input 
                  type="date" name="entryDate" value={formData.entryDate} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Investor Pemilik Sapi (Opsional)</label>
                <select 
                  name="investorId" value={formData.investorId || ''} onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                >
                  <option value="">-- Milik Barbara Farm Sendiri --</option>
                  {investors.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#68746D]">Hubungkan sapi ini dengan investor jika ini merupakan sapi titipan.</p>
              </div>

              {formData.investorId && (
                <div className="space-y-4 col-span-1 md:col-span-2 border-t border-[#DDE7E1] pt-6 mt-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="hasInsurance"
                      checked={hasInsurance}
                      onChange={(e) => setHasInsurance(e.target.checked)}
                      className="w-5 h-5 accent-[#006B3F] rounded border-[#DDE7E1] focus:ring-0 focus:outline-none cursor-pointer"
                    />
                    <label htmlFor="hasInsurance" className="text-sm font-black text-[#17211B] cursor-pointer">
                      Aktifkan Proteksi Asuransi untuk Sapi Ini
                    </label>
                  </div>
                  <p className="text-[10px] text-[#68746D] pl-8">
                    Model asuransi dapat disesuaikan per sapi berdasarkan kesepakatan kerjasama.
                  </p>

                  {hasInsurance && (
                    <div className="pl-8 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-200">
                      {/* Tipe Asuransi */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Tipe Proteksi Asuransi</label>
                        <select 
                          value={insuranceData.coverageType}
                          onChange={e => setInsuranceData(prev => ({ ...prev, coverageType: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                        >
                          <option value="KEMATIAN">Asuransi Kematian (Modal Kembali)</option>
                          <option value="KEHILANGAN">Asuransi Kehilangan (Lepas Liar)</option>
                          <option value="KESEHATAN_KRITIS">Kesehatan Kritis & Medis Ekstrem</option>
                          <option value="GAGAL_TUMBUH">Proteksi Gagal Tumbuh / Stunting (FCR)</option>
                          <option value="LAINNYA">Perjanjian Custom Lainnya</option>
                        </select>
                      </div>

                      {/* Durasi Pertanggungan */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Durasi Pertanggungan</label>
                        <select 
                          value={insuranceData.duration}
                          onChange={e => setInsuranceData(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                        >
                          <option value="6_BULAN">6 Bulan</option>
                          <option value="1_TAHUN">1 Tahun</option>
                          <option value="2_TAHUN">2 Tahun</option>
                          <option value="SEUMUR_HIDUP">Seumur Hidup</option>
                        </select>
                      </div>

                      {/* Uang Pertanggungan */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Nilai Pertanggungan / Modal (Rp)</label>
                        <input 
                          type="number"
                          value={insuranceData.sumAssured || ''}
                          onChange={e => setInsuranceData(prev => ({ ...prev, sumAssured: Number(e.target.value) }))}
                          placeholder="Rp 0"
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                        />
                        <p className="text-[9px] text-[#68746D]">Nilai dasar modal yang akan dilindungi oleh asuransi.</p>
                      </div>

                      {/* Persentase Pertanggungan */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Batas Ganti Rugi (%)</label>
                        <div className="relative">
                          <input 
                            type="number" min="1" max="100"
                            value={insuranceData.coveragePercent}
                            onChange={e => setInsuranceData(prev => ({ ...prev, coveragePercent: Number(e.target.value) }))}
                            placeholder="100"
                            className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#68746D]">%</span>
                        </div>
                        <p className="text-[9px] text-[#68746D]">Persentase modal kembali jika sapi mati/hilang (misal 70% atau 100%).</p>
                      </div>

                      {/* Biaya Premi */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Biaya Premi Asuransi (Rp)</label>
                        <input 
                          type="number"
                          value={insuranceData.premiumCost || ''}
                          onChange={e => setInsuranceData(prev => ({ ...prev, premiumCost: Number(e.target.value) }))}
                          placeholder="Rp 0"
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                        />
                      </div>

                      {/* Metode Pembayaran Premi */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Metode Pembayaran Premi</label>
                        <select 
                          value={insuranceData.premiumPaymentType}
                          onChange={e => setInsuranceData(prev => ({ ...prev, premiumPaymentType: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-bold focus:outline-none focus:border-[#006B3F]"
                        >
                          <option value="DIAWAL">Dibayar di Awal (Upfront)</option>
                          <option value="DIAKHIR">Dibayar di Akhir (Potong Bagi Hasil)</option>
                        </select>
                      </div>

                      {/* Catatan Asuransi */}
                      <div className="space-y-2 col-span-1 sm:col-span-2">
                        <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Catatan Perjanjian Asuransi</label>
                        <textarea 
                          value={insuranceData.notes}
                          onChange={e => setInsuranceData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Detail kesepakatan khusus..."
                          rows={2}
                          className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-medium focus:outline-none focus:border-[#006B3F]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Data Produksi */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <KtpBanner />

            {/* Auto-calculated age from Step 1 birth date */}
            {formData.birthDate && (
              <div className="p-4 bg-[#EAF6F0] border border-[#006B3F]/20 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-[#006B3F]/10 rounded-xl">
                  <Info className="w-4 h-4 text-[#006B3F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#006B3F] uppercase tracking-wider">Umur Sapi (dari tanggal lahir KTP)</p>
                  <p className="font-black text-[#17211B]">{calcAgeMonths(formData.birthDate)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Berat Awal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Berat Awal (Kg)</label>
                <input 
                  type="number" name="initialWeightKg"
                  value={formData.initialWeightKg || ''}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full px-5 py-3.5 bg-white border rounded-2xl font-bold focus:outline-none focus:border-[#006B3F] ${errors.initialWeightKg ? 'border-red-500' : 'border-[#DDE7E1]'}`}
                />
                {errors.initialWeightKg && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.initialWeightKg}</p>}
              </div>

              {/* Harga Beli — Currency input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Harga Beli (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68746D] font-bold text-sm">Rp</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={purchasePriceDisplay}
                    onChange={handlePurchasePriceChange}
                    placeholder="0"
                    className={`w-full pl-12 pr-5 py-3.5 bg-white border rounded-2xl font-bold text-right focus:outline-none focus:border-[#006B3F] ${errors.purchasePrice ? 'border-red-500' : 'border-[#DDE7E1]'}`}
                  />
                </div>
                <p className="text-[10px] text-[#68746D]">Akan digunakan untuk perhitungan ROI.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Foto & Review */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="p-6 bg-[#EAF6F0] rounded-3xl border border-[#006B3F]/10 flex gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl border border-[#DDE7E1] flex items-center justify-center text-[#006B3F] flex-shrink-0 relative overflow-hidden">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-[#17211B] text-lg">Siap Menyimpan?</h4>
                <p className="text-sm text-[#68746D]">Unggah foto sapi dan periksa kembali data sebelum disimpan.</p>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Foto Sapi</label>
              {image ? (
                <div className="relative rounded-3xl overflow-hidden border-2 border-[#006B3F] aspect-video group">
                  <img src={image} alt="Sapi" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => setImage(null)}
                      className="p-3 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all"
                    >
                      <X className="w-5 h-5" /> Hapus Foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-3xl border-2 border-dashed border-[#DDE7E1] bg-white hover:bg-[#EAF6F0] hover:border-[#006B3F] transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[#006B3F]" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-[#17211B]">Klik untuk Unggah Foto</p>
                    <p className="text-xs text-[#68746D]">Mendukung JPG, PNG (Maks. 50MB)</p>
                  </div>
                </button>
              )}
            </div>

            {/* KTP Code */}
            <div className="p-5 bg-gradient-to-r from-[#17211B] to-[#006B3F] rounded-2xl">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">KTP Sapi / ID Resmi</p>
              <p className="font-black text-white text-xl font-mono break-all">{generatedKtp || formData.id}</p>
            </div>

            {/* Insurance Summary Card if Active */}
            {hasInsurance && formData.investorId && (
              <div className="p-5 bg-gradient-to-r from-emerald-950 to-[#17211B] rounded-3xl text-white space-y-3 shadow-md border border-[#006B3F]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Proteksi Asuransi Sapi Aktif</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="opacity-60 block text-[9px] uppercase tracking-wider">Tipe Proteksi</span>
                    <span className="font-bold">
                      {insuranceData.coverageType === 'KEMATIAN' ? 'Asuransi Kematian (Modal Kembali)' : (insuranceData.coverageType === 'KEHILANGAN' ? 'Asuransi Kehilangan (Lepas Liar)' : (insuranceData.coverageType === 'KESEHATAN_KRITIS' ? 'Kesehatan Kritis & Medis' : (insuranceData.coverageType === 'GAGAL_TUMBUH' ? 'Gagal Tumbuh / Stunting' : 'Custom')))}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[9px] uppercase tracking-wider">Nilai Pertanggungan</span>
                    <span className="font-bold">Rp {insuranceData.sumAssured.toLocaleString('id-ID')} ({insuranceData.coveragePercent}%)</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[9px] uppercase tracking-wider">Biaya Premi</span>
                    <span className="font-bold">Rp {insuranceData.premiumCost.toLocaleString('id-ID')} ({insuranceData.premiumPaymentType === 'DIAWAL' ? 'Di Awal' : 'Di Akhir'})</span>
                  </div>
                  <div>
                    <span className="opacity-60 block text-[9px] uppercase tracking-wider">Durasi</span>
                    <span className="font-bold">{insuranceData.duration.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Ras/Jenis', value: formData.breed },
                { label: 'Jenis Kelamin', value: formData.gender },
                { label: 'Kandang', value: formData.pen },
                { label: 'Asal', value: formData.originName || formData.originType },
                { label: 'Berat Awal', value: formData.initialWeightKg ? `${formData.initialWeightKg} Kg` : '-' },
                { label: 'Harga Beli', value: formData.purchasePrice ? `Rp ${formatCurrency(formData.purchasePrice)}` : '-' },
                { label: 'Tgl Masuk', value: formData.entryDate || '-' },
                { label: 'Umur Sapi', value: calcAgeMonths(formData.birthDate) },
                { label: 'Investor Pemilik', value: investors.find(inv => inv.id === formData.investorId)?.name || 'Barbara Farm (Milik Sendiri)' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-white rounded-2xl">
                  <p className="text-[10px] font-bold text-[#68746D] uppercase mb-1">{item.label}</p>
                  <p className="font-bold text-[#17211B] text-sm break-all">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Catatan Tambahan</label>
              <textarea 
                name="notes" value={formData.notes || ''} onChange={handleChange}
                rows={3}
                placeholder="Catatan kondisi awal sapi..."
                className="w-full px-5 py-3.5 bg-white border border-[#DDE7E1] rounded-2xl font-medium focus:outline-none focus:border-[#006B3F]"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#DDE7E1]">
          <button 
            type="button" 
            onClick={step === 1 ? onCancel : prevStep}
            className="flex items-center gap-2 px-6 py-3 font-bold text-[#68746D] hover:text-[#17211B] transition-colors"
          >
            {step === 1 ? 'Batal' : <><ChevronLeft className="w-5 h-5" /> Sebelumnya</>}
          </button>
          
          <button 
            type="button"
            onClick={step === 4 ? () => {
              // Extract alias since it's not in the Prisma schema
              // and damAlias which seems to be causing issues in some environments
              const { alias, damAlias, ...rest } = formData as any;
              
              // Calculate numeric estimatedAgeMonths
              let ageMonths = 0;
              if (formData.birthDate) {
                const birth = new Date(formData.birthDate);
                const now = new Date();
                ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
              }

              onSubmit({ 
                ...rest, 
                id: generatedKtp || formData.id, 
                photoUrl: image || undefined,
                name: alias || formData.name,
                isDam: formData.gender === 'BETINA',
                estimatedAgeMonths: ageMonths > 0 ? ageMonths : undefined,
                damId: formData.damId,
                notes: formData.notes,
                insurance: hasInsurance && formData.investorId ? insuranceData : null
              });
            } : nextStep}
            className="flex items-center gap-2 px-10 py-4 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-black transition-all shadow-lg shadow-[#006B3F]/20"
          >
            {step === 4 ? 'Simpan Data Sapi' : <>Selanjutnya <ChevronRight className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};
