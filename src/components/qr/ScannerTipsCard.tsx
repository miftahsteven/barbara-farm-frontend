'use client';

import React from 'react';
import { Lightbulb, MousePointer2, Sun, Camera } from 'lucide-react';

export const ScannerTipsCard: React.FC = () => {
  const tips = [
    { 
      icon: <MousePointer2 className="w-4 h-4" />, 
      title: 'Posisikan Sejajar', 
      desc: 'Arahkan kamera tepat di depan QR Code.' 
    },
    { 
      icon: <Sun className="w-4 h-4" />, 
      title: 'Cahaya Cukup', 
      desc: 'Pastikan area scan tidak terlalu gelap.' 
    },
    { 
      icon: <Camera className="w-4 h-4" />, 
      title: 'Bersihkan Lensa', 
      desc: 'Lensa kotor bisa membuat scan blur.' 
    },
  ];

  return (
    <div className="bg-[#EAF6F0] p-6 rounded-3xl border border-[#DDE7E1] relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#006B3F]/5 rounded-full blur-2xl" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Lightbulb className="w-5 h-5 text-[#1FA463]" />
        </div>
        <h3 className="font-bold text-[#006B3F]">Tips Scanning</h3>
      </div>

      <div className="space-y-5 relative z-10">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="mt-1 p-1.5 bg-white rounded-lg shadow-sm text-[#006B3F] group-hover:scale-110 transition-transform">
              {tip.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-[#17211B]">{tip.title}</p>
              <p className="text-xs text-[#68746D] leading-relaxed mt-0.5">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[#006B3F]/10 text-center">
        <p className="text-[11px] font-medium text-[#006B3F]/70 italic leading-relaxed">
          "Pastikan kotoran pada ear tag dibersihkan terlebih dahulu agar kode terbaca sempurna."
        </p>
      </div>
    </div>
  );
};
