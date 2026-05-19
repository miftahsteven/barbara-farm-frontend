'use client';

import React from 'react';
import { X, Download, Printer, Copy, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CattleQrModalProps {
  cattle: any | null;
  onClose: () => void;
}

export const CattleQrModal: React.FC<CattleQrModalProps> = ({ cattle, onClose }) => {
  if (!cattle) return null;

  const profileUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/cattle/${encodeURIComponent(cattle.id)}`
    : (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}/cattle/${encodeURIComponent(cattle.id)}`
      : `https://barbarafarm.id/cattle/${encodeURIComponent(cattle.id)}`);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    alert('Link profil disalin!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#17211B]/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[#F7FAF8] rounded-full text-[#68746D] transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10 text-center">
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-[#EAF6F0] rounded-2xl flex items-center justify-center mb-2">
              <QrCode className="w-6 h-6 text-[#006B3F]" />
            </div>
            <h3 className="text-2xl font-black text-[#17211B] tracking-tight">QR Code Identitas</h3>
            <p className="text-sm text-[#68746D]">Gunakan kode ini untuk akses cepat profil sapi.</p>
          </div>

          {/* QR Container */}
          <div className="relative aspect-square max-w-[240px] mx-auto mb-8 bg-white rounded-3xl border-2 border-[#DDE7E1] p-6 flex flex-col items-center justify-center shadow-inner">
            <QRCodeSVG 
              value={profileUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
            <div className="absolute -bottom-3 bg-[#17211B] px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg border border-white/20">
              {cattle.id}
            </div>
          </div>

          <div className="bg-[#F7FAF8] p-4 rounded-2xl mb-8 border border-[#DDE7E1]">
            <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest mb-1">URL Profil Sapi</p>
            <div className="flex items-center justify-center gap-2 text-[#006B3F] font-bold text-sm">
              <span className="truncate max-w-[200px]">{profileUrl.replace(/^https?:\/\//, '')}</span>
              <Copy 
                onClick={copyToClipboard}
                className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform text-[#68746D]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold transition-all text-sm">
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all text-sm">
              <Printer className="w-4 h-4" />
              Cetak Label
            </button>
          </div>

          <button className="mt-6 flex items-center justify-center gap-2 mx-auto text-xs font-bold text-[#006B3F] hover:underline">
            Buka Halaman Publik <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
