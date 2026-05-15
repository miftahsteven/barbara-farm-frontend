'use client';

import React, { useState } from 'react';
import { QRScannerPanel } from '@/components/qr/QRScannerPanel';
import { ScanResultCard } from '@/components/qr/ScanResultCard';
import { ManualCattleInput } from '@/components/qr/ManualCattleInput';
import { RecentScanList } from '@/components/qr/RecentScanList';
import { ScannerTipsCard } from '@/components/qr/ScannerTipsCard';
import { AddCattleForm } from '@/components/qr/AddCattleForm';
import { useCattleStore, Cattle } from '@/lib/useCattleStore';
import { AlertCircle, RefreshCw, Plus, QrCode, ArrowLeft, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

import { useSearchParams } from 'next/navigation';

function QRScanPageContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [scannedCattle, setScannedCattle] = useState<Cattle | null>(null);
  const [isRegistering, setIsRegistering] = useState(initialId ? true : false);
  const [pendingQrId, setPendingQrId] = useState<string | null>(initialId ? `SMARTFARM:CATTLE:${initialId}` : null);
  const [error, setError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const { cattle, fetchCattle } = useCattleStore();

  // Load cattle data on mount
  React.useEffect(() => {
    fetchCattle();
  }, [fetchCattle]);

  // Re-sync if initialId changes
  React.useEffect(() => {
    if (initialId && !isRegistering) {
      setPendingQrId(`SMARTFARM:CATTLE:${initialId}`);
      setIsRegistering(true);
    }
  }, [initialId]);

  const handleScanSuccess = (result: string) => {
    // 1. Initial cleanup of the scan result
    let rawResult = result.trim();
    let cattleId = rawResult;

    // 2. Extract ID from various URL formats or protocols
    if (rawResult.includes('/cattle/')) {
      cattleId = rawResult.split('/cattle/').pop() || rawResult;
    } else if (rawResult.includes('/c/')) {
      cattleId = rawResult.split('/c/').pop() || rawResult;
    } else if (rawResult.includes(':')) {
      // Handles SMARTFARM:CATTLE:ID or other colon-separated formats
      const parts = rawResult.split(':');
      cattleId = parts[parts.length - 1] || rawResult;
    }
    
    // 3. Strip query parameters and trailing slashes
    cattleId = cattleId.split('?')[0].split('#')[0].replace(/\/$/, '');
    
    // 4. Robust decoding (handles multiple levels of encoding if necessary)
    try {
      cattleId = decodeURIComponent(cattleId);
      // Try one more time in case of double encoding (common in some QR generators)
      if (cattleId.includes('%')) {
        cattleId = decodeURIComponent(cattleId);
      }
    } catch (e) {
      console.warn("Failed to decode cattleId", cattleId);
    }

    cattleId = cattleId.trim();
    
    // 5. Look up in local store with normalized comparison
    const foundCattle = cattle.find(c => {
      const normalizedStoreId = c.id.trim();
      return normalizedStoreId === cattleId || c.qrUrl === rawResult || c.qrUrl === cattleId;
    });
    
    if (foundCattle) {
      setScannedCattle(foundCattle);
      setIsRegistering(false);
      setPendingQrId(null);
      setError(null);
      useCattleStore.getState().addToScanHistory({
        cattleId: foundCattle.id,
        name: foundCattle.name || 'Tanpa Nama',
        status: 'success'
      });
      toast.success("Sapi ditemukan!");
    } else {
      // ID not found - trigger registration flow
      // Use the cleaned cattleId for the registration ID
      setPendingQrId(`SMARTFARM:CATTLE:${cattleId}`);
      setIsRegistering(true);
      setScannedCattle(null);
      setError(null);
      useCattleStore.getState().addToScanHistory({
        cattleId: cattleId,
        name: 'Tidak dikenal',
        status: 'failed'
      });
      toast.info("ID baru terdeteksi. Silakan daftarkan sapi ini.");
    }
  };

  const handleScanError = (type: string) => {
    if (type === 'camera') setError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan.');
    else setError('Format QR Code tidak dikenali.');
  };

  const handleRegistrationSuccess = (newCattle: Cattle) => {
    setScannedCattle(newCattle);
    setIsRegistering(false);
    setPendingQrId(null);
  };

  const generateNewQr = () => {
    const newId = `BF-NEW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://barbara.mscode.id';
    setGeneratedQr(`${baseUrl}/c/${newId}`);
    setIsQrModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {(scannedCattle || isRegistering) && (
            <button 
              onClick={() => { setScannedCattle(null); setIsRegistering(false); }}
              className="p-2 hover:bg-soft-green-surface rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-secondary" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary-green" />
              QR Scan & Management
            </h1>
            <p className="text-text-secondary text-sm">
              Scan QRCode sapi untuk melihat riwayat atau mendaftarkan sapi baru.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-primary-green/30 text-primary-green"
            onClick={() => setIsDemoModalOpen(true)}
          >
            <Info className="h-4 w-4" />
            Lihat QR Demo
          </Button>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={generateNewQr}
          >
            <Plus className="h-4 w-4" />
            Generate QR Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-7 space-y-6">
          {isRegistering && pendingQrId ? (
            <AddCattleForm 
              qrCodeId={pendingQrId} 
              onCancel={() => setIsRegistering(false)}
              onSuccess={handleRegistrationSuccess}
            />
          ) : scannedCattle ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ScanResultCard 
                cattle={scannedCattle} 
                onScanAgain={() => setScannedCattle(null)} 
              />
            </div>
          ) : (
            <div className="space-y-6">
              <QRScannerPanel 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                onReset={() => setError(null)}
              />
              
              {error && (
                <div className="p-6 bg-danger/10 border border-danger/20 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-2">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <AlertCircle className="w-6 h-6 text-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-danger">Gagal Memindai</p>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-4 px-4 py-2 bg-danger text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-danger/90 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" /> Coba Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-5 space-y-6">
          <ManualCattleInput onSearch={handleScanSuccess} />
          <RecentScanList />
          <ScannerTipsCard />
        </div>
      </div>

      {/* QR Code Modal for New Cattle */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="QRCode Sapi Baru">
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 bg-white rounded-3xl border-2 border-primary-green shadow-xl">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQr}`} 
              alt="Generated QR" 
              className="h-48 w-48"
            />
          </div>
          <div>
            <p className="text-lg font-bold text-text-primary">ID: {generatedQr?.split(':').pop()}</p>
            <p className="text-sm text-text-secondary mt-1">Scan kode ini dengan HP untuk mendaftarkan data sapi baru.</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsQrModalOpen(false)}>Tutup</Button>
            <Button variant="primary" className="flex-1" onClick={() => window.print()}>Cetak QR</Button>
          </div>
        </div>
      </Modal>

      {/* Demo QR Code Modal */}
      <Modal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} title="Uji Coba Scan (Demo)">
        <div className="p-6 space-y-6 text-center">
          <p className="text-sm text-text-secondary">Scan salah satu kode di bawah ini menggunakan kamera HP Anda untuk mencoba fitur ini.</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-soft-green-surface/30 rounded-2xl border border-primary-green/20">
              <p className="text-xs font-bold text-primary-green uppercase">Sapi Terdaftar</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://barbara.mscode.id'}/c/BF-2026-0001`} 
                alt="Demo Valid" 
                className="mx-auto rounded-lg shadow-sm"
              />
              <p className="text-[10px] font-mono text-text-secondary">BF-2026-0001</p>
            </div>
            
            <div className="space-y-3 p-4 bg-info/5 rounded-2xl border border-info/20">
              <p className="text-xs font-bold text-info uppercase">Sapi Baru</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://barbara.mscode.id'}/c/BF-NEW-DEMO`} 
                alt="Demo New" 
                className="mx-auto rounded-lg shadow-sm"
              />
              <p className="text-[10px] font-mono text-text-secondary">BF-NEW-DEMO</p>
            </div>
          </div>
          
          <div className="bg-page-background p-4 rounded-xl text-left border border-border-neutral">
            <p className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
              <ExternalLink className="h-3 w-3" /> Tips Testing
            </p>
            <ul className="text-[11px] text-text-secondary space-y-1 list-disc pl-4">
              <li>Pastikan HP terhubung ke jaringan yang sama jika menggunakan IP lokal.</li>
              <li>Berikan izin akses kamera saat diminta browser.</li>
              <li>Scan kode "Sapi Baru" untuk mencoba alur pendaftaran foto.</li>
            </ul>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => setIsDemoModalOpen(false)}>Mengerti</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function QRScanPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><RefreshCw className="animate-spin w-8 h-8 text-primary-green" /></div>}>
      <QRScanPageContent />
    </React.Suspense>
  );
}
