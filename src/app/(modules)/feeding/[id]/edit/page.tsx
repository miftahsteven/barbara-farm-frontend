'use client';

import React, { use } from 'react';
import { FeedingLogForm } from '@/components/feeding/FeedingLogForm';
import { useFeedingStore } from '@/lib/useFeedingStore';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit2, Wheat } from 'lucide-react';

interface EditFeedingLogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditFeedingLogPage({ params }: EditFeedingLogPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { logs, fetchLogs, isLoading } = useFeedingStore();

  React.useEffect(() => {
    if (logs.length === 0) {
      fetchLogs();
    }
  }, [fetchLogs, logs.length]);

  const logToEdit = logs.find(l => l.id === id);

  if (isLoading && !logToEdit) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#006B3F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!logToEdit) {
    return (
      <div className="min-h-screen bg-[#F7FAF8] flex items-center justify-center flex-col gap-4">
        <p className="font-bold text-[#68746D]">Data pakan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-[#006B3F] font-bold hover:underline">Kembali</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#F7FAF8] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#68746D] hover:text-[#17211B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Kembali ke Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Edit2 className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Edit Log Pakan</h1>
              <p className="text-[#68746D]">Perbarui data pakan untuk {logToEdit.cattleId || logToEdit.groupId}.</p>
           </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-[#DDE7E1] shadow-xl">
          <FeedingLogForm initialData={logToEdit} onSuccess={() => router.back()} />
        </div>
      </div>
    </div>
  );
}
