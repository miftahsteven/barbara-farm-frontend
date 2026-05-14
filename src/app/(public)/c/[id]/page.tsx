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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dummyCattle, Cattle } from '@/data/dummy-cattle';
import { useAuthStore, apiFetch } from '@/lib/useAuthStore';

export default function CattlePublicProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [cattle, setCattle] = useState<Cattle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCattleData = async () => {
      try {
        const response = await apiFetch(`/cattle/${id}`);
        if (response.ok) {
          const data = await response.json();
          // Map backend schema to frontend expected format
          setCattle({
            ...data,
            image: data.photoUrl || '/placeholder.jpg',
            latestWeight: data.initialWeightKg,
            lastWeighingDate: data.updatedAt ? data.updatedAt.split('T')[0] : data.entryDate.split('T')[0],
            barn: data.pen,
            healthBadge: data.status === 'AKTIF' ? 'Normal' : 'Perlu Pantauan',
            medicalNotes: data.notes || 'Tidak ada catatan khusus'
          });
        }
      } catch (error) {
        console.error("Failed to fetch cattle data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCattleData();
  }, [id]);

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
            QR Code dengan ID <span className="font-mono font-bold text-primary-green">{id}</span> belum terdaftar di sistem Barbara Farm.
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
                onClick={() => router.push(`/qr-scan?id=${id}`)}
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
    <div className="min-h-screen bg-page-background pb-12">
      <div className="relative h-[40vh] w-full">
        <Image 
          src={cattle.image} 
          alt={cattle.name} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-page-background via-transparent to-black/20"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary-green text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
              {cattle.status}
            </span>
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-border-neutral">
              {cattle.breed}
            </span>
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">{cattle.name}</h1>
          <p className="text-text-secondary text-sm font-medium">ID: {cattle.id}</p>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-border-neutral shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="h-4 w-4 text-primary-green" />
              <span className="text-[10px] font-bold text-text-secondary uppercase">Berat Terakhir</span>
            </div>
            <p className="text-xl font-bold text-text-primary">{cattle.latestWeight} <span className="text-xs font-normal text-text-secondary">kg</span></p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-border-neutral shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary-green" />
              <span className="text-[10px] font-bold text-text-secondary uppercase">Update</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{cattle.lastWeighingDate}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border-neutral shadow-sm overflow-hidden text-center">
          <div className="p-4 bg-soft-green-surface/30 border-b border-border-neutral text-left">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">Informasi Ternak</h3>
          </div>
          <div className="divide-y divide-border-neutral">
            {[
              { icon: MapPin, label: 'Lokasi / Kandang', value: cattle.barn },
              { icon: Beef, label: 'Jenis Kelamin', value: cattle.gender },
              { icon: ShieldCheck, label: 'Kondisi Kesehatan', value: cattle.healthBadge },
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-page-background rounded-xl">
                    <item.icon className="h-4 w-4 text-primary-green" />
                  </div>
                  <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border-neutral shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-3">Catatan Medis</h3>
          <p className="text-sm text-text-secondary leading-relaxed italic">
            "{cattle.medicalNotes}"
          </p>
        </div>

        {!user && (
          <div className="p-6 bg-primary-green rounded-3xl text-white shadow-lg shadow-primary-green/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Login sebagai Staff</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-4">
                Akses fitur penuh seperti pendaftaran ternak dan riwayat medis lengkap.
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-white text-primary-green border-white hover:bg-white/90"
                onClick={() => router.push('/login')}
              >
                Masuk ke Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
