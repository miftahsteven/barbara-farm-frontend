'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize, RefreshCw, AlertTriangle, CheckCircle2, Loader2, Zap, X, Upload } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface QRScannerPanelProps {
  onScanSuccess: (cattleId: string) => void;
  onScanError: (errorType: 'invalid' | 'notFound' | 'camera') => void;
  onReset: () => void;
}

export const QRScannerPanel: React.FC<QRScannerPanelProps> = ({ 
  onScanSuccess, 
  onScanError, 
  onReset 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, []);

  const startScanning = async () => {
    if (isScanning || isTransitioning.current) return;
    
    isTransitioning.current = true;
    setIsInitializing(true);
    setIsScanning(true);
    
    // Small delay to ensure the div is rendered
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config: any = { 
          fps: 15, 
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          disableFlip: true,
          useBarCodeDetectorIfSupported: true, // Modern API support
        };

        // Try to start with the environment (back) camera
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Success
            onScanSuccess(decodedText);
            stopScanning();
          },
          (errorMessage) => {
            // Error (ignore common noisy errors)
          }
        );

        setIsInitializing(false);
        isTransitioning.current = false;
      } catch (err) {
        console.error("Scanner init error", err);
        // Fallback to any camera if environment camera fails
        try {
          if (html5QrCodeRef.current) {
             await html5QrCodeRef.current.start(
              { facingMode: "user" },
              { fps: 15, qrbox: { width: 250, height: 250 }, disableFlip: true, useBarCodeDetectorIfSupported: true } as any,
              (decodedText) => { onScanSuccess(decodedText); stopScanning(); },
              () => {}
            );
            setIsInitializing(false);
            isTransitioning.current = false;
            return;
          }
        } catch (fallbackErr) {
          console.error("Fallback scanner error", fallbackErr);
        }
        
        onScanError('camera');
        setIsScanning(false);
        setIsInitializing(false);
        isTransitioning.current = false;
        toast.error("Gagal mengaktifkan kamera. Pastikan izin diberikan.");
      }
    }, 100);
  };

  const stopScanning = async () => {
    if (isTransitioning.current) return;
    
    if (html5QrCodeRef.current) {
      try {
        isTransitioning.current = true;
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        setIsScanning(false);
        html5QrCodeRef.current = null;
        isTransitioning.current = false;
      } catch (err) {
        console.error("Stop error", err);
        setIsScanning(false);
        isTransitioning.current = false;
      }
    } else {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-[560px] bg-white rounded-3xl shadow-xl overflow-hidden border border-border-neutral">
      {/* Scanner Header */}
      <div className="p-6 border-b border-border-neutral flex items-center justify-between bg-page-background/50">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Scanner Kamera</h2>
          <p className="text-sm text-text-secondary">Arahkan kamera ke QR Code sapi</p>
        </div>
        <div className="p-2 bg-white rounded-full border border-border-neutral">
          <Camera className="w-5 h-5 text-primary-green" />
        </div>
      </div>

      {/* Viewport Area */}
      <div className="relative aspect-square bg-[#17211B] flex flex-col items-center justify-center overflow-hidden">
        {!isScanning ? (
          <div className="text-center p-8 space-y-6 w-full max-w-sm">
            <div className="w-20 h-20 bg-primary-green/20 rounded-full flex items-center justify-center mx-auto border border-primary-green/30">
              <Camera className="w-10 h-10 text-primary-green" />
            </div>
            
            <div className="space-y-4">
              {/* Desktop: Hidden, Mobile: Visible */}
              <button 
                onClick={startScanning}
                className="hidden md:flex w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl font-semibold transition-all items-center justify-center gap-2 border border-white/5 text-xs"
              >
                <Zap className="w-3 h-3" />
                Gunakan Kamera Laptop
              </button>

              <button 
                onClick={startScanning}
                className="md:hidden w-full px-6 py-3 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Aktifkan Kamera
              </button>

              <div className="relative md:hidden">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#17211B] px-2 text-white/40">Atau</span></div>
              </div>

              <label className="w-full px-6 py-4 bg-primary-green md:bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex flex-col md:flex-row items-center justify-center gap-3 cursor-pointer border border-white/10 shadow-lg">
                <Upload className="w-6 h-6 md:w-4 md:h-4" />
                <div className="text-center md:text-left">
                  <span className="block md:inline">Upload Foto QR</span>
                  <span className="block text-[10px] font-normal text-white/60 md:hidden">Ambil foto atau pilih dari galeri</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const html5QrCode = new Html5Qrcode("reader");
                      html5QrCode.scanFile(file, true)
                        .then(decodedText => onScanSuccess(decodedText))
                        .catch(err => toast.error("QR Code tidak ditemukan di foto tersebut."));
                    }
                  }}
                />
              </label>
            </div>

            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 md:hidden">
              <p className="text-[10px] text-warning leading-tight">
                Catatan: Kamera memerlukan koneksi HTTPS atau izin khusus pada browser untuk dapat aktif melalui IP lokal.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <div id="reader" className="w-full h-full"></div>
            {isInitializing && (
              <div className="absolute inset-0 bg-[#17211B] flex flex-col items-center justify-center z-10">
                <Loader2 className="w-12 h-12 text-primary-green animate-spin mb-4" />
                <p className="text-white font-medium">Menginisialisasi Kamera...</p>
              </div>
            )}
            <button 
              onClick={stopScanning}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      {/* QR Info / Demo */}
      <div className="p-6 bg-page-background/50">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <div className="p-2 bg-white rounded-lg border border-border-neutral">
            <Zap className="h-4 w-4 text-primary-green" />
          </div>
          <p>Scanner akan otomatis mendeteksi ID sapi dan membuka profil atau form registrasi.</p>
        </div>
      </div>

      {/* Global CSS for html5-qrcode UI cleanup */}
      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader__dashboard {
          display: none !important;
        }
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__status_span {
          display: none !important;
        }
      `}</style>
    </div>
  );
};
