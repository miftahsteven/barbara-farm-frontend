'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Beef, 
  Calendar, 
  Weight, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  QrCode, 
  LogIn,
  AlertCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Cattle } from '@/lib/useCattleStore';
import { useAuthStore } from '@/lib/useAuthStore';

export default function CattlePublicProfile() {
  const { id } = useParams();
  const decodedId = typeof id === 'string' ? decodeURIComponent(id) : '';
  const router = useRouter();
  const { user } = useAuthStore();
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!decodedId) return;
    const fetchCattleData = async () => {
      try {
        // Use relative URL → hits Next.js API route which proxies server-side.
        // This works from any device (mobile, desktop) without exposing localhost.
        const response = await fetch(`/api/public/cattle/${encodeURIComponent(decodedId)}`);
        if (response.ok) {
          const data = await response.json();
          setCattle(data);
        } else if (response.status === 404) {
          // Cattle not found — leave cattle as null
          setCattle(null);
        } else {
          console.error("Failed to fetch cattle data:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch cattle data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCattleData();
  }, [decodedId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary-green/20 rounded-full mb-4"></div>
          <p className="text-text-secondary">Memuat data sapi...</p>
        </div>
      </div>
    );
  }

  // CASE: Cattle Not Found
  if (!cattle) {
    return (
      <div className="min-h-screen bg-page-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border-neutral overflow-hidden p-8">
          <div className="h-20 w-20 bg-soft-green-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="h-10 w-10 text-primary-green" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Sapi Tidak Ditemukan</h1>
          <p className="text-text-secondary text-sm mb-8">
            QR Code dengan ID <span className="font-mono font-bold text-primary-green">{decodedId}</span> belum terdaftar di sistem Barbara Farm.
          </p>

          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-info/5 rounded-2xl border border-info/10 text-left mb-6">
                <p className="text-xs font-bold text-info uppercase mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Akun Staff Terdeteksi
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Anda dapat langsung mendaftarkan sapi ini ke dalam sistem.
                </p>
              </div>
              <Button 
                variant="primary" 
                className="w-full py-4 flex items-center justify-center gap-2"
                onClick={() => router.push(`/qr-scan?id=${encodeURIComponent(decodedId)}`)}
              >
                <Plus className="h-5 w-5" />
                Daftarkan Sapi
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-warning/5 rounded-2xl border border-warning/10 text-left mb-6">
                <p className="text-xs font-bold text-warning uppercase mb-1 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" /> Akses Terbatas
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Pendaftaran sapi baru hanya dapat dilakukan oleh staff resmi Barbara Farm.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full py-4 flex items-center justify-center gap-2"
                onClick={() => router.push('/login')}
              >
                <LogIn className="h-5 w-5" />
                Login sebagai Staff
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CASE: Cattle Found - Show Profile
  return (
    <div className="min-h-screen bg-[#F7FAF8] pb-20">
      {/* Hero Section with Glassmorphism Header */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <Image 
          src={cattle.photoUrl || '/placeholder.jpg'} 
          alt={cattle.name || 'Sapi'} 
          fill 
          className="object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FAF8] via-[#F7FAF8]/20 to-black/30"></div>
        
        {/* Navigation / Back - Subtle Glass */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          <button 
            onClick={() => router.back()}
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white shadow-xl"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
            Public View
          </div>
        </div>

        <div className="absolute bottom-10 left-6 right-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
              cattle.status === 'AKTIF' ? 'bg-[#006B3F] text-white' : 'bg-orange-500 text-white'
            }`}>
              {cattle.status}
            </span>
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[#17211B] text-[10px] font-black rounded-full uppercase tracking-widest border border-[#DDE7E1] shadow-lg">
              {cattle.breed}
            </span>
          </div>
          <h1 className="text-4xl font-black text-[#17211B] tracking-tight mb-1 drop-shadow-sm">{cattle.name || 'Sapi Tanpa Nama'}</h1>
          <div className="flex items-center gap-2 text-[#68746D]">
            <QrCode className="h-4 w-4" />
            <p className="text-sm font-mono font-bold">{cattle.id}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2.5rem] border border-[#DDE7E1] shadow-xl shadow-green-900/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#EAF6F0] rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#EAF6F0] rounded-xl">
                  <Weight className="h-4 w-4 text-[#006B3F]" />
                </div>
                <span className="text-[10px] font-black text-[#68746D] uppercase tracking-widest">Berat</span>
              </div>
              <p className="text-2xl font-black text-[#17211B]">{cattle.latestWeightKg || cattle.initialWeightKg} <span className="text-sm font-bold text-[#68746D]">kg</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[2.5rem] border border-[#DDE7E1] shadow-xl shadow-green-900/5 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-[10px] font-black text-[#68746D] uppercase tracking-widest">Update</span>
              </div>
              <p className="text-sm font-black text-[#17211B]">{new Date(cattle.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Info Card List */}
        <div className="bg-white rounded-[3rem] border border-[#DDE7E1] shadow-xl shadow-green-900/5 overflow-hidden">
          <div className="p-6 bg-[#F7FAF8] border-b border-[#DDE7E1]">
            <h3 className="text-xs font-black text-[#17211B] uppercase tracking-[0.2em] flex items-center gap-2">
              <Info className="h-4 w-4 text-[#006B3F]" />
              Detail Identitas
            </h3>
          </div>
          <div className="divide-y divide-[#DDE7E1]">
            {[
              { icon: MapPin, label: 'Lokasi Kandang', value: cattle.pen, color: 'text-orange-500', bg: 'bg-orange-50' },
              { icon: Beef, label: 'Jenis Kelamin', value: cattle.gender, color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: ShieldCheck, label: 'Kondisi Fisik', value: cattle.status === 'AKTIF' ? 'Prima' : 'Pemantauan', color: 'text-[#006B3F]', bg: 'bg-[#EAF6F0]' },
            ].map((item, i) => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${item.bg} rounded-2xl`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-wider">{item.label}</p>
                    <p className="text-base font-black text-[#17211B]">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white p-7 rounded-[3rem] border border-[#DDE7E1] shadow-xl shadow-green-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-[#EAF6F0]">
            <Plus className="h-12 w-12 rotate-45 opacity-20" />
          </div>
          <h3 className="text-xs font-black text-[#17211B] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            Catatan Peternak
          </h3>
          <div className="relative">
            <p className="text-sm text-[#68746D] leading-relaxed italic font-medium">
              "{cattle.notes || 'Sapi ini terdaftar dalam kondisi sehat dan dalam pengawasan rutin Barbara Farm. Tidak ada catatan khusus saat ini.'}"
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-8 bg-gradient-to-br from-[#17211B] to-[#006B3F] rounded-[3rem] text-white shadow-2xl shadow-[#006B3F]/30 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight">Akses Khusus Staff</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Barbara Farm Internal</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-8 font-medium">
              {!user 
                ? "Punya akses ke kandang? Login untuk mengedit profil, melihat riwayat medis lengkap, silsilah indukan, dan laporan pertumbuhan."
                : "Anda masuk sebagai Staff. Lanjutkan ke Dashboard untuk mengelola data dan mengedit profil sapi ini."}
            </p>
            {!user ? (
              <Button 
                variant="outline" 
                className="w-full py-5 bg-white text-[#006B3F] border-white hover:bg-[#F7FAF8] rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl"
                onClick={() => router.push('/login')}
              >
                Edit Data (Login Staff)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full py-5 bg-white text-[#006B3F] border-white hover:bg-[#F7FAF8] rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl"
                onClick={() => router.push(`/cattle/${encodeURIComponent(decodedId)}`)}
              >
                Kelola Data Sapi
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Footer Branding */}
      <div className="mt-12 text-center px-6">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-30 grayscale">
          <div className="w-8 h-8 bg-[#17211B] rounded-lg" />
          <span className="font-black text-[#17211B] tracking-tighter text-lg uppercase">SmartFarm</span>
        </div>
        <p className="text-[10px] font-bold text-[#68746D] uppercase tracking-[0.3em]">
          &copy; 2026 Barbara Farm Ecosystem
        </p>
      </div>
    </div>
  );
}
