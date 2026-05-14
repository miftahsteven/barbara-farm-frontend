'use client';

import React, { useState } from 'react';
import { Camera, Check, X, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { useCattleStore } from '@/lib/useCattleStore';
import { KtpSapiGenerator } from '@/components/cattle/KtpSapiGenerator';
import { BREED_OPTIONS } from '@/lib/generateKtpSapi';
import { useRef } from 'react';

interface AddCattleFormProps {
  qrCodeId: string;
  onCancel: () => void;
  onSuccess: (data: any) => void;
}

export const AddCattleForm: React.FC<AddCattleFormProps> = ({ qrCodeId, onCancel, onSuccess }) => {
  const { addCattle } = useCattleStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [generatedKtp, setGeneratedKtp] = useState<string>('');
  const [generatedParts, setGeneratedParts] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    breed: 'Bali',
    gender: 'JANTAN' as 'JANTAN' | 'BETINA',
    birthDate: new Date().toISOString().split('T')[0],
    initialWeight: '',
    barn: 'Kandang A',
    damCode: '',
    damId: '',
    alias: '',
  });

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before converting to base64
      const canvas = document.createElement('canvas');
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX_SIZE = 800;
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) { height = (height * MAX_SIZE) / width; width = MAX_SIZE; }
          else { width = (width * MAX_SIZE) / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error('Harap ambil foto sapi terlebih dahulu');
      return;
    }

    if (!generatedKtp) {
      toast.error('Harap lengkapi data (Nama Panggilan/Alias) untuk menghasilkan Kode KTP Sapi');
      return;
    }

    setIsSubmitting(true);
    try {
      // Derive the ID from QR code URL or use KTP code
      const qrId = qrCodeId.replace('SMARTFARM:CATTLE:', '').split('/').pop() || '';
      const cattleId = generatedKtp || qrId;

      const newCattle = {
        id: cattleId,
        name: formData.name || formData.alias,
        breed: formData.breed,
        gender: formData.gender,
        initialWeightKg: Number(formData.initialWeight),
        originType: 'Pembiakan Internal',
        entryDate: new Date().toISOString(),
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        purchasePrice: 0,
        photoUrl: image,
        pen: formData.barn,
        status: 'AKTIF',
        qrUrl: qrCodeId,
        damId: formData.damId || undefined,
        damAlias: formData.damCode || 'EXT',
        isDam: formData.gender === 'BETINA', // auto-mark females as potential dams
        notes: formData.alias ? `Nama panggilan: ${formData.alias}` : undefined,
      };

      const savedCattle = await addCattle(newCattle);
      toast.success('Data sapi berhasil disimpan!');
      onSuccess(savedCattle);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data sapi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DDE7E1] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-[#DDE7E1] bg-[#F7FAF8]">
        <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
          <Info className="h-5 w-5 text-[#006B3F]" />
          Registrasi Sapi Baru
        </h2>
        <p className="text-[#68746D] text-sm mt-1">
          Lengkapi data untuk QR ID:{' '}
          <span className="font-mono font-bold text-[#006B3F]">{qrCodeId.split('/').pop()}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">

        {/* === SECTION 1: KTP Generator === */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-[#006B3F] rounded-full" />
            <h3 className="font-black text-[#17211B]">Generate KTP Sapi</h3>
          </div>
          <KtpSapiGenerator
            initialBreed={formData.breed}
            initialGender={formData.gender}
            initialBirthDate={new Date(formData.birthDate)}
            onCodeGenerated={(code, parts, damId) => {
              setGeneratedKtp(code);
              setGeneratedParts(parts);
              
              if (parts) {
                setFormData(f => ({
                  ...f,
                  breed: parts.breed || f.breed,
                  gender: parts.gender || f.gender,
                  birthDate: parts.birthDate ? new Date(parts.birthDate).toISOString().split('T')[0] : f.birthDate,
                  alias: parts.alias || f.alias,
                  damCode: parts.damCode || f.damCode,
                  damId: damId || '',
                }));
              }
            }}
          />
        </div>

        {/* === SECTION 2: Data Tambahan === */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h3 className="font-black text-[#17211B]">Data Tambahan Sapi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Sapi (Opsional)"
              placeholder="Contoh: Si Jago"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Berat Awal (Kg)"
              type="number"
              placeholder="0"
              value={formData.initialWeight}
              onChange={(e) => setFormData({ ...formData, initialWeight: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#68746D] uppercase tracking-wider">Lokasi / Kandang</label>
              <div className="relative">
                <select
                  value={formData.barn}
                  onChange={(e) => setFormData({ ...formData, barn: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#DDE7E1] bg-[#F7FAF8] font-bold text-[#17211B] focus:outline-none focus:border-[#006B3F] appearance-none"
                >
                  {['Kandang A', 'Kandang B', 'Kandang C', 'Kandang D'].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68746D] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* === SECTION 3: Foto Sapi === */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
            <h3 className="font-black text-[#17211B]">Foto Sapi</h3>
          </div>
          <div
            className={`relative h-52 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${
              image
                ? 'border-[#006B3F] bg-[#006B3F]/5'
                : 'border-[#DDE7E1] bg-[#F7FAF8] hover:border-[#006B3F]/50'
            }`}
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {image ? (
              <>
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#006B3F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Check className="h-3 w-3" /> Foto Tersimpan
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#DDE7E1]">
                  <Camera className="h-8 w-8 text-[#006B3F]" />
                </div>
                <p className="text-sm font-bold text-[#17211B]">Ambil Foto atau Pilih File</p>
                <p className="text-xs text-[#68746D] mt-1">Gunakan kamera untuk mengambil foto secara langsung</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageCapture}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>
        </div>

        {/* KTP Preview Summary */}
        {generatedKtp && (
          <div className="p-4 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <p className="text-xs font-bold text-[#68746D] uppercase tracking-wider mb-1">KTP Sapi yang akan digunakan sebagai ID</p>
            <p className="font-mono font-black text-[#006B3F] text-lg">{generatedKtp}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} type="button" disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" className="flex-1 flex items-center justify-center gap-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Simpan & Daftarkan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
