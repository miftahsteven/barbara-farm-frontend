"use client"

import * as React from "react"
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard"
import { EditProfileForm } from "@/components/profile/EditProfileForm"
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm"
import { SecurityStatusCard } from "@/components/profile/SecurityStatusCard"

export default function ProfilePage() {
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
          <ProfileSummaryCard />
          <SecurityStatusCard />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <EditProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
