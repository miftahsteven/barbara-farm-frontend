'use client';

import React, { use } from 'react';
import { useCattleStore } from '@/lib/useCattleStore';
import { CattleFormWizard } from '@/components/cattle/CattleFormWizard';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

interface EditCattlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCattlePage({ params }: EditCattlePageProps) {
  const { id } = use(params);
  const { cattle, updateCattle } = useCattleStore();
  const router = useRouter();

  const cattleData = cattle.find(c => c.id === id);

  if (!cattleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-[#17211B] mb-2">Sapi Tidak Ditemukan</h1>
        <p className="text-[#68746D]">ID Sapi {id} tidak terdaftar.</p>
      </div>
    );
  }

  const handleSubmit = (data: any) => {
    updateCattle(id, data);
    router.push(`/cattle/${id}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Batal Edit</span>
        </button>

        <div className="p-6 bg-orange-50 border border-orange-200 rounded-3xl flex gap-4">
          <div className="p-2 bg-white rounded-xl h-fit">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-orange-800">Mode Edit: {id}</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Perubahan pada master data akan memengaruhi seluruh modul terkait (QR Scan, Pertumbuhan, dan Kesehatan).
            </p>
          </div>
        </div>

        <CattleFormWizard 
          initialData={cattleData}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/cattle/${id}`)}
          isEdit={true}
        />
      </div>
    </div>
  );
}
