'use client';

import React from 'react';
import { useCattleStore, Cattle } from '@/lib/useCattleStore';
import { CattleFormWizard } from '@/components/cattle/CattleFormWizard';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewCattlePage() {
  const addCattle = useCattleStore((state) => state.addCattle);
  const router = useRouter();

  const handleSubmit = async (data: Partial<Cattle>) => {
    try {
      const newCattle = await addCattle({
        ...data,
        photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=800',
        qrUrl: `/public/cattle/${data.id}`,
      });
      toast.success('Data sapi berhasil disimpan!');
      router.push(`/cattle/${newCattle.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data sapi');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Kembali ke Daftar</span>
        </button>

        <div>
          <h1 className="text-4xl font-black text-[#17211B] tracking-tight">Tambah Sapi Baru</h1>
          <p className="text-[#68746D] mt-2 leading-relaxed">
            Daftarkan ternak baru ke dalam sistem Barbara Farm. Gunakan KTP Sapi untuk identitas standar.
          </p>
        </div>

        <CattleFormWizard 
          onSubmit={handleSubmit}
          onCancel={() => router.push('/cattle')}
        />
      </div>
    </div>
  );
}
