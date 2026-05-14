import React from 'react';
import { MedicalRecord, useHealthStore } from '@/lib/useHealthStore';
import { useCattleStore } from '@/lib/useCattleStore';
import { AlertTriangle, Clock, MapPin, ChevronRight, Stethoscope, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface MedicalCaseCardProps {
  record: MedicalRecord;
}

export const MedicalCaseCard: React.FC<MedicalCaseCardProps> = ({ record }) => {
  const { cattle } = useCattleStore();
  const { updateRecord, deleteRecord } = useHealthStore();
  
  // Find cow from store or use the one included in record
  const cowFromStore = cattle.find(c => c.id === record.cattleId);
  const cow = cowFromStore || (record.cattle ? { ...record.cattle, id: record.cattleId } : null);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'moderate': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'severe': return 'bg-red-50 text-red-700 border-red-100';
      case 'emergency': return 'bg-red-600 text-white border-red-600';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'mild': return 'Ringan';
      case 'moderate': return 'Sedang';
      case 'severe': return 'Berat';
      case 'emergency': return 'DARURAT';
      default: return severity;
    }
  };

  const handleCloseCase = async () => {
    if (confirm('Tandai kasus ini sebagai Selesai/Sembuh?')) {
      await updateRecord(record.id, { 
        status: 'recovered',
        recoveryDate: new Date().toISOString()
      });
    }
  };

  const handleDelete = async () => {
    if (confirm('Hapus data pemeriksaan ini?')) {
      await deleteRecord(record.id);
    }
  };

  if (!cow) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#DDE7E1] shadow-sm hover:border-[#006B3F] transition-all group overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <img src={cow.photoUrl} className="w-14 h-14 rounded-2xl object-cover border border-[#EAF6F0]" alt="" />
            <div>
              <h3 className="font-black text-[#17211B]">{cow.id}</h3>
              <p className="text-xs text-[#68746D]">{cow.breed} • {cow.pen}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-[#006B3F]">
                 <Stethoscope className="w-3 h-3" />
                 {record.actionType.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSeverityStyle(record.severity)}`}>
              {getSeverityLabel(record.severity)}
            </span>
            <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-600 rounded-lg" title="Hapus">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-1">Gejala & Diagnosa</p>
            <p className="text-sm font-bold text-[#17211B] line-clamp-1">{record.symptoms}</p>
            <p className="text-xs text-[#68746D] italic mt-0.5">{record.diagnosis}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#68746D]" />
              <span className="text-[10px] font-bold text-[#68746D]">Cek Terakhir</span>
            </div>
            <span className="text-[10px] font-black text-[#17211B]">
               {new Date(record.checkDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleCloseCase}
            className="py-3 bg-[#EAF6F0] hover:bg-[#D4EADE] text-[#006B3F] rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all border border-[#006B3F]/10"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Selesai
          </button>
          <Link 
            href={`/cattle/${cow.id}/health`}
            className="py-3 bg-white hover:bg-[#F7FAF8] text-[#17211B] rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all border border-[#DDE7E1]"
          >
            Riwayat
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
