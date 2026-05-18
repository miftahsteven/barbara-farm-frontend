"use client"

import * as React from "react"
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard"
import { EditProfileForm } from "@/components/profile/EditProfileForm"
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"
import { SecurityStatusCard } from "@/components/profile/SecurityStatusCard"
import { apiFetch } from "@/lib/useAuthStore"
import { toast } from "sonner"

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  farmName: string | null;
  position: string | null;
  location: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchProfile = React.useCallback(async () => {
    try {
      const response = await apiFetch("/auth/profile")
      if (!response.ok) throw new Error("Gagal mengambil data profil")
      const data = await response.json()
      setProfile(data)
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat profil pengguna")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#006B3F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Profil Pengguna</h1>
        <p className="text-text-secondary mt-1 text-sm sm:text-base">
          Kelola informasi pribadi dan pengaturan keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ProfileSummaryCard profile={profile} />
          <SecurityStatusCard />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <EditProfileForm profile={profile} onUpdate={fetchProfile} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
