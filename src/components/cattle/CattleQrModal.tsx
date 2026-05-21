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

  // Always point to /c/[id] (public route) — not /cattle/[id] which requires auth.
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/c/${encodeURIComponent(cattle.id)}`
    : (process.env.NEXT_PUBLIC_FRONTEND_URL
      ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/c/${encodeURIComponent(cattle.id)}`
      : `https://barbarafarm.id/c/${encodeURIComponent(cattle.id)}`);

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profileUrl)
        .then(() => alert('Link profil disalin!'))
        .catch(() => fallbackCopyToClipboard());
    } else {
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = profileUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link profil disalin!');
    } catch (err) {
      console.error('Fallback copy failed', err);
      alert('Gagal menyalin link secara otomatis. Silakan salin URL secara manual.');
    }
  };

  const downloadPng = () => {
    const svgElement = document.getElementById('cattle-qr-svg');
    if (!svgElement) {
      alert('QR Code tidak ditemukan');
      return;
    }

    // Include xml namespace if missing
    if (!svgElement.getAttribute('xmlns')) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      // Create a canvas with ultra-high resolution (1200x1400) for clean laser print
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Disable image smoothing to ensure perfectly sharp/pixelated QR code edges
      ctx.imageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;

      // 1. Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw border (a beautiful card outline)
      ctx.strokeStyle = '#DDE7E1';
      ctx.lineWidth = 24;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(30, 30, canvas.width - 60, canvas.height - 60, 80);
      } else {
        ctx.rect(30, 30, canvas.width - 60, canvas.height - 60);
      }
      ctx.stroke();

      // 3. Draw the QR code (centered, size 800x800)
      const qrSize = 800;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 200;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // 4. Draw the ID Badge (like the pill in UI)
      const idText = cattle.id;
      ctx.font = '900 48px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      const textWidth = ctx.measureText(idText).width;
      const pillWidth = Math.max(textWidth + 120, 480);
      const pillHeight = 120;
      const pillX = (canvas.width - pillWidth) / 2;
      const pillY = qrY + qrSize - 60; // Overlapping the bottom of QR code just like UI!

      ctx.fillStyle = '#17211B';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 60);
      } else {
        ctx.rect(pillX, pillY, pillWidth, pillHeight);
      }
      ctx.fill();

      // Add thin white border to the pill
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Text inside the pill
      ctx.fillStyle = '#ffffff';
      ctx.fillText(idText, canvas.width / 2, pillY + pillHeight / 2);

      // 5. Draw Title or Info
      ctx.fillStyle = '#68746D';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('BARBARA FARM - IDENTITAS SAPI', canvas.width / 2, 100);

      // 6. Draw subtitle info at bottom
      ctx.fillStyle = '#17211B';
      ctx.font = '800 52px sans-serif';
      const displayName = cattle.name ? `${cattle.name}` : `${cattle.breed}`;
      ctx.fillText(displayName, canvas.width / 2, 1200);

      ctx.fillStyle = '#68746D';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${cattle.breed} • ${cattle.gender}`, canvas.width / 2, 1270);

      // Create download
      try {
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${cattle.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (err) {
        console.error('Failed to export canvas to PNG', err);
        alert('Gagal mengunduh gambar PNG');
      }
      
      URL.revokeObjectURL(blobURL);
    };
    img.onerror = (err) => {
      console.error('Image loading failed', err);
      alert('Gagal memproses gambar QR Code');
      URL.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
  };

  const printLabel = () => {
    const svgElement = document.getElementById('cattle-qr-svg');
    if (!svgElement) {
      alert('QR Code tidak ditemukan');
      return;
    }
    
    // Include xml namespace if missing
    if (!svgElement.getAttribute('xmlns')) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) {
      alert('Gagal mencetak label');
      return;
    }
    
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Cetak Label - ${cattle.id}</title>
          <style>
            @page {
              size: 80mm 80mm;
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              width: 100vw;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-card {
              border: 3px solid #17211B;
              border-radius: 24px;
              padding: 24px;
              width: 70mm;
              height: 70mm;
              text-align: center;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              background: #fff;
            }
            .header {
              font-size: 11px;
              font-weight: 800;
              color: #006B3F;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              margin: 0;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 8px 0;
            }
            .qr-container svg {
              width: 130px;
              height: 130px;
              /* Keep QR Code vector razor-sharp for printers */
              shape-rendering: crispEdges;
              image-rendering: pixelated;
            }
            .cattle-id {
              background-color: #17211B;
              color: #fff;
              font-size: 11px;
              font-weight: 900;
              padding: 4px 12px;
              border-radius: 9999px;
              letter-spacing: 0.05em;
              display: inline-block;
            }
            .cattle-name {
              font-size: 13px;
              font-weight: 800;
              color: #17211B;
              margin: 4px 0 2px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
            .cattle-details {
              font-size: 10px;
              color: #68746D;
              font-weight: 600;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">BARBARA FARM</div>
            <div class="qr-container">
              ${svgString}
            </div>
            <div>
              <div class="cattle-id">${cattle.id}</div>
              <div class="cattle-name">${cattle.name || cattle.breed}</div>
              <div class="cattle-details">${cattle.breed} &bull; ${cattle.gender}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    iframeDoc.close();

    const handleAfterPrint = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    iframe.contentWindow?.addEventListener('afterprint', handleAfterPrint);
    setTimeout(handleAfterPrint, 60000);
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
              id="cattle-qr-svg"
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
            <button 
              onClick={downloadPng}
              className="flex items-center justify-center gap-2 py-3.5 bg-[#006B3F] hover:bg-[#004D2E] text-white rounded-2xl font-bold transition-all text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button 
              onClick={printLabel}
              className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-[#DDE7E1] hover:bg-[#F7FAF8] text-[#17211B] rounded-2xl font-bold transition-all text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Label
            </button>
          </div>

          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 mx-auto text-xs font-bold text-[#006B3F] hover:underline"
          >
            Buka Halaman Publik <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
