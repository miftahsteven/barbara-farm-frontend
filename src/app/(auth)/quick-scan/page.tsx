'use client';

import React, { useState } from 'react';
import { QRScannerPanel } from '@/components/qr/QRScannerPanel';
import { PublicCattleCard } from '@/components/qr/PublicCattleCard';
import { dummyCattle, Cattle } from '@/data/dummy-cattle';
import { ArrowLeft, Scan, Info, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function QuickScanPage() {
  const [scannedCattle, setScannedCattle] = useState<Cattle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = (id: string) => {
    const cattle = dummyCattle.find(c => c.id === id);
    if (cattle) {
      setScannedCattle(cattle);
      setError(null);
    } else {
      setError('Data sapi tidak ditemukan di sistem.');
    }
  };

  const handleScanError = (type: string) => {
    if (type === 'camera') setError('Kamera tidak dapat diakses.');
    else if (type === 'invalid') setError('Format QR Code tidak dikenali.');
    else setError('Data sapi tidak ditemukan.');
  };

  const handleReset = () => {
    setScannedCattle(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col">
      {/* Public Header */}
      <header className="bg-white border-b border-[#DDE7E1] px-4 py-4 sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/login" className="p-2 hover:bg-[#F7FAF8] rounded-full text-[#68746D] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006B3F] rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-[#17211B] tracking-tight uppercase">Quick Scan</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-[#17211B] tracking-tight">Cek Data Sapi</h1>
            <p className="text-[#68746D] text-sm md:text-base leading-relaxed">
              Scan QR Code pada kartu identitas atau ear tag sapi untuk melihat informasi publik.
            </p>
          </div>

          {!scannedCattle ? (
            <div className="space-y-6">
              <QRScannerPanel 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                onReset={handleReset}
              />
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-600">Terjadi Kesalahan</p>
                    <p className="text-xs text-red-500 mt-0.5">{error}</p>
                    <button 
                      onClick={handleReset}
                      className="mt-2 text-xs font-bold text-red-600 underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Coba Lagi
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 bg-white rounded-3xl border border-[#DDE7E1] flex items-start gap-4">
                <div className="p-2.5 bg-[#EAF6F0] rounded-xl shrink-0">
                  <Info className="w-5 h-5 text-[#006B3F]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#17211B] uppercase tracking-wider mb-1">Pemberitahuan</h3>
                  <p className="text-xs text-[#68746D] leading-relaxed">
                    Mode publik hanya menampilkan data terbatas seperti Ras, Jenis Kelamin, dan Lokasi Umum. 
                    Login sebagai staf untuk melihat data lengkap.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <PublicCattleCard cattle={scannedCattle} />
              <button 
                onClick={handleReset}
                className="w-full py-4 bg-white border-2 border-[#DDE7E1] text-[#68746D] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Scan Sapi Lain
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 text-center">
        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-widest">
          &copy; 2026 SmartFarm by Barbara Farm. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
