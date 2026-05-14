'use client';

import React from 'react';
import { MedicalRecord } from '@/lib/useHealthStore';
import { 
  Stethoscope, 
  Syringe, 
  Pill, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Thermometer,
  Utensils,
  Eye
} from 'lucide-react';

interface MedicalTimelineProps {
  records: MedicalRecord[];
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ records }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return <Syringe className="w-5 h-5" />;
      case 'medicine': return <Pill className="w-5 h-5" />;
      case 'checkup': return <Stethoscope className="w-5 h-5" />;
      case 'deworming': return <Activity className="w-5 h-5" />;
      default: return <Stethoscope className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'treatment': return 'text-orange-600 bg-orange-50';
      case 'recovered': return 'text-emerald-600 bg-emerald-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:bg-[#DDE7E1]">
      {records.map((record, i) => (
        <div key={record.id} className="relative pl-14">
          <div className={`absolute left-0 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10 ${getStatusColor(record.status)}`}>
            {getIcon(record.actionType)}
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-[#DDE7E1] shadow-sm hover:border-[#006B3F] transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-black text-[#17211B]">{record.diagnosis}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#68746D]">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {record.checkDate}</span>
                  <span className="flex items-center gap-1 font-bold text-[#006B3F]"><CheckCircle2 className="w-3.5 h-3.5" /> {record.officerName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F7FAF8] rounded-xl border border-[#DDE7E1] h-fit">
                <span className="text-[10px] font-bold text-[#68746D] uppercase">Severity:</span>
                <span className={`text-xs font-black uppercase ${record.severity === 'emergency' ? 'text-red-600' : 'text-[#17211B]'}`}>
                  {record.severity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#68746D]" />
                  <p className="text-[10px] font-bold text-[#68746D] uppercase">Suhu</p>
                </div>
                <p className="text-sm font-black text-[#17211B]">{record.bodyTemperature || '--'} °C</p>
              </div>
              <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                <div className="flex items-center gap-2 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-[#68746D]" />
                  <p className="text-[10px] font-bold text-[#68746D] uppercase">Nafsu Makan</p>
                </div>
                <p className="text-sm font-black text-[#17211B] capitalize">{record.appetite}</p>
              </div>
              <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-3.5 h-3.5 text-[#68746D]" />
                  <p className="text-[10px] font-bold text-[#68746D] uppercase">Obat</p>
                </div>
                <p className="text-sm font-black text-[#17211B] truncate">{record.medicineName || '-'}</p>
              </div>
              <div className="p-3 bg-[#F7FAF8] rounded-2xl border border-[#DDE7E1]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#68746D]" />
                  <p className="text-[10px] font-bold text-[#68746D] uppercase">Withdrawal</p>
                </div>
                <p className={`text-sm font-black ${record.withdrawalDays ? 'text-purple-600' : 'text-[#17211B]'}`}>
                  {record.withdrawalDays ? `${record.withdrawalDays} Hari` : '-'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">Gejala & Catatan</p>
              <p className="text-sm text-[#17211B] leading-relaxed">{record.symptoms}</p>
              {record.notes && (
                <p className="text-xs text-[#68746D] italic bg-white/50 p-3 rounded-xl border border-dashed border-[#DDE7E1]">{record.notes}</p>
              )}
            </div>

            {record.safeToSellDate && record.status !== 'closed' && (
              <div className="mt-6 pt-6 border-t border-[#DDE7E1] flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-[#17211B]">Masa Henti Obat Aktif</p>
                    <p className="text-[10px] text-[#68746D]">Aman dijual setelah tanggal: <span className="font-black text-purple-600">{record.safeToSellDate}</span></p>
                 </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
