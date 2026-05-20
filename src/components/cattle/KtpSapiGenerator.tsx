'use client';

import React, { useState, useEffect } from 'react';
import { generateKtpSapi, DEFAULT_DAM_CODE, BREED_OPTIONS } from '@/lib/generateKtpSapi';
import { CreditCard, Copy, Check, RefreshCw, Info, ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/useAuthStore';

interface DamOption {
  id: string;
  alias: string;
  name?: string;
  breed?: string;
  isDam?: boolean;
}

interface KtpSapiGeneratorProps {
  onCodeGenerated?: (code: string, parts: any, damId?: string) => void;
  initialBreed?: string;
  initialGender?: 'JANTAN' | 'BETINA';
  initialBirthDate?: Date;
  initialAlias?: string;
  initialDamCode?: string;
  excludeId?: string;
}

const KTP_PARTS_INFO = [
  { key: 'farmCode',   label: 'Kode Farm',     color: 'bg-emerald-500', desc: 'Identitas Barbara Farm' },
  { key: 'damCode',    label: 'Kode Indukan',   color: 'bg-blue-500',   desc: 'Alias indukan (EXT = sapi beli)' },
  { key: 'breedCode',  label: 'Ras/Jenis',      color: 'bg-purple-500', desc: 'Kode jenis ras sapi' },
  { key: 'genderCode', label: 'Jenis Kelamin',  color: 'bg-orange-500', desc: 'J = Jantan, B = Betina' },
  { key: 'birthMonth', label: 'Bulan Lahir',    color: 'bg-pink-500',   desc: 'Bulan kelahiran (angka)' },
  { key: 'birthYear',  label: 'Tahun Lahir',    color: 'bg-red-500',    desc: 'Dua digit tahun lahir' },
  { key: 'alias',      label: 'Nama Panggilan', color: 'bg-yellow-500', desc: 'Short-code harian petugas' },
];

export const KtpSapiGenerator: React.FC<KtpSapiGeneratorProps> = ({
  onCodeGenerated,
  initialBreed = BREED_OPTIONS[0],
  initialGender = 'JANTAN',
  initialBirthDate,
  initialAlias = '',
  initialDamCode = DEFAULT_DAM_CODE,

  excludeId,
}) => {
  const [form, setForm] = useState({
    damCode: initialDamCode || DEFAULT_DAM_CODE,
    breed: initialBreed || BREED_OPTIONS[0],
    gender: (initialGender || 'JANTAN') as 'JANTAN' | 'BETINA',
    birthDate: initialBirthDate || new Date(),
    alias: initialAlias || '',
  });

  const [dams, setDams] = useState<DamOption[]>([]);
  const [selectedDam, setSelectedDam] = useState<DamOption | null>(null);
  const [useExt, setUseExt] = useState(initialDamCode === DEFAULT_DAM_CODE);
  const [damSearch, setDamSearch] = useState('');
  const [result, setResult] = useState<ReturnType<typeof generateKtpSapi> | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Fetch potential dams from backend
  useEffect(() => {
    const fetchDams = async () => {
      try {
        const res = await fetch(`${API_URL}/cattle/dams`);
        if (res.ok) {
          const data: DamOption[] = await res.json();
          setDams(data);
          
          // If we have an initial dam code that isn't EXT, try to find and select it
          if (initialDamCode !== DEFAULT_DAM_CODE) {
            const dam = data.find(d => d.alias.toUpperCase() === initialDamCode.toUpperCase());
            if (dam) {
              setSelectedDam(dam);
              setUseExt(false);
            }
          }
        }
      } catch (e) {
        // Silent fail – EXT mode still works
      }
    };
    fetchDams();
  }, [initialDamCode]);

  // Regenerate KTP code whenever form changes
  useEffect(() => {
    if (form.alias.trim() === '') {
      setResult(null);
      // Still notify parent about basic data changes even if code isn't fully ready
      onCodeGenerated?.('', null, selectedDam?.id);
      return;
    }
    const generated = generateKtpSapi(form);
    setResult(generated);
    onCodeGenerated?.(generated.fullCode, { ...generated.parts, ...form }, selectedDam?.id);
  }, [form, selectedDam]);

  const handleSelectDam = (dam: DamOption | null) => {
    setSelectedDam(dam);
    setForm(f => ({ ...f, damCode: dam ? dam.alias.toUpperCase() : DEFAULT_DAM_CODE }));
  };

  const handleUseExt = () => {
    setUseExt(true);
    setSelectedDam(null);
    setForm(f => ({ ...f, damCode: DEFAULT_DAM_CODE }));
  };

  const handlePickDam = () => {
    setUseExt(false);
  };

  const handleCopy = () => {
    if (result) {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(result.fullCode)
          .then(() => {
            setCopied(true);
            toast.success('Kode KTP disalin!');
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => fallbackCopyToClipboard());
      } else {
        fallbackCopyToClipboard();
      }
    }
  };

  const fallbackCopyToClipboard = () => {
    if (!result) return;
    try {
      const textArea = document.createElement('textarea');
      textArea.value = result.fullCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Kode KTP disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
      toast.error('Gagal menyalin secara otomatis. Silakan salin manual.');
    }
  };

  const filteredDams = dams.filter(d =>
    d.id !== excludeId && (
      d.alias.toLowerCase().includes(damSearch.toLowerCase()) ||
      (d.name || '').toLowerCase().includes(damSearch.toLowerCase())
    )
  );

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden">
      {/* Header with live preview */}
      <div className="bg-gradient-to-r from-[#17211B] to-[#006B3F] p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Generator KTP Sapi</h3>
              <p className="text-white/60 text-xs">Format Identitas Resmi Barbara Farm</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowInfo(!showInfo)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <Info className="w-4 h-4 text-white" />
          </button>
        </div>

        {result ? (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-2">Kode KTP Sapi</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xl font-black text-white tracking-wide font-mono break-all">{result.fullCode}</p>
              <div className="flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => { const g = generateKtpSapi(form); setResult(g); onCodeGenerated?.(g.fullCode, g.parts); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <button type="button" onClick={handleCopy} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                  {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
            {/* Color segments */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {KTP_PARTS_INFO.map((part) => {
                const val = result.parts[part.key as keyof typeof result.parts];
                if (!val) return null;
                return (
                  <span key={part.key} className={`px-2 py-0.5 rounded-lg text-white text-[10px] font-bold ${part.color}`}>
                    {val}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/20 text-center">
            <p className="text-white/40 text-sm">Isi Nama Panggilan (Alias) untuk menghasilkan KTP</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="border-b border-[#DDE7E1] bg-white p-4">
          <p className="text-xs font-bold text-[#17211B] mb-3">Arti Setiap Segmen Kode</p>
          <div className="space-y-2">
            {KTP_PARTS_INFO.map((part) => (
              <div key={part.key} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${part.color}`} />
                <span className="text-xs font-bold text-[#17211B] w-28 flex-shrink-0">{part.label}</span>
                <span className="text-xs text-[#68746D]">{part.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="p-6 space-y-5">

        {/* === DAM SELECTION === */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">
            Indukan (Dam) *
          </label>

          {/* Toggle Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[#DDE7E1]">
            <button
              type="button"
              onClick={handleUseExt}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${useExt ? 'bg-[#006B3F] text-white' : 'bg-white text-[#68746D] hover:bg-white'}`}
            >
              🚚 Sapi Masuk (EXT)
            </button>
            <button
              type="button"
              onClick={handlePickDam}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${!useExt ? 'bg-[#006B3F] text-white' : 'bg-white text-[#68746D] hover:bg-white'}`}
            >
              🐄 Pilih Indukan
            </button>
          </div>

          {/* EXT Mode */}
          {useExt && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-700">Kode Indukan: <span className="font-mono text-sm">EXT</span></p>
              <p className="text-[11px] text-amber-600 mt-0.5">Sapi ini berasal dari luar (pembelian/hibah), tidak ada induk di sistem.</p>
            </div>
          )}

          {/* Dam Picker */}
          {!useExt && (
            <div className="space-y-2">
              {dams.length === 0 ? (
                <div className="p-3 bg-white border border-[#DDE7E1] rounded-xl text-center">
                  <p className="text-xs text-[#68746D]">Belum ada sapi betina terdaftar di sistem.</p>
                  <button type="button" onClick={handleUseExt} className="text-xs font-bold text-[#006B3F] underline mt-1">Gunakan EXT</button>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68746D]" />
                    <input
                      type="text"
                      placeholder="Cari nama/alias indukan..."
                      value={damSearch}
                      onChange={(e) => setDamSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DDE7E1] bg-white text-sm focus:outline-none focus:border-[#006B3F]"
                    />
                  </div>

                  {/* Dam List */}
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-[#DDE7E1] divide-y divide-[#DDE7E1]">
                    {filteredDams.map(dam => (
                      <button
                        key={dam.id}
                        type="button"
                        onClick={() => handleSelectDam(dam)}
                        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all ${selectedDam?.id === dam.id ? 'bg-[#EAF6F0] border-l-4 border-[#006B3F]' : 'hover:bg-white'}`}
                      >
                        <div>
                          <p className="font-bold text-sm text-[#17211B]">{dam.name || dam.alias}</p>
                          <p className="text-[10px] text-[#68746D]">Alias: <span className="font-mono font-bold">{dam.alias}</span> · {dam.breed}</p>
                        </div>
                        {selectedDam?.id === dam.id && <Check className="w-4 h-4 text-[#006B3F] flex-shrink-0" />}
                      </button>
                    ))}
                    {filteredDams.length === 0 && (
                      <p className="px-4 py-3 text-xs text-[#68746D] text-center">Tidak ada hasil</p>
                    )}
                  </div>

                  {selectedDam && (
                    <div className="p-3 bg-[#EAF6F0] border border-[#006B3F]/20 rounded-xl">
                      <p className="text-xs font-bold text-[#006B3F]">
                        Kode Indukan: <span className="font-mono text-sm">{selectedDam.alias.toUpperCase()}</span>
                      </p>
                      <p className="text-[11px] text-[#68746D] mt-0.5">Kode ini akan tertera di nomor KTP anak.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Alias */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Nama Panggilan (Alias) *</label>
          <input
            type="text"
            placeholder="Contoh: BIXO, JAGO, CEMPAKA"
            value={form.alias}
            onChange={(e) => setForm({ ...form, alias: e.target.value.toUpperCase() })}
            className="w-full px-4 py-3 rounded-xl border border-[#DDE7E1] bg-white font-mono font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F] focus:ring-1 focus:ring-[#006B3F]/20 transition-all"
            maxLength={6}
          />
          <p className="text-[10px] text-[#68746D]">Nama harian untuk komunikasi petugas lapangan (maks. 6 karakter)</p>
        </div>

        {/* Breed */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Ras / Jenis Sapi</label>
          <div className="relative">
            <select
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#DDE7E1] bg-white font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F] appearance-none transition-all"
            >
              {BREED_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68746D] pointer-events-none" />
          </div>
        </div>

        {/* Gender + Birth Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Jenis Kelamin</label>
            <div className="flex gap-2">
              {(['JANTAN', 'BETINA'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                    form.gender === g ? 'bg-[#006B3F] text-white border-[#006B3F]' : 'bg-white text-[#68746D] border-[#DDE7E1] hover:bg-white'
                  }`}
                >
                  {g === 'JANTAN' ? '♂' : '♀'} {g === 'JANTAN' ? 'Jantan' : 'Betina'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Tanggal Lahir</label>
            <input
              type="date"
              value={form.birthDate.toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, birthDate: new Date(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-[#DDE7E1] bg-white font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F] transition-all"
            />
          </div>
        </div>

        {!form.alias.trim() && (
          <p className="text-xs text-orange-500 font-medium flex items-center gap-2">
            <Info className="w-3 h-3" />
            Isi Nama Panggilan (Alias) untuk menghasilkan Kode KTP
          </p>
        )}
      </div>
    </div>
  );
};
