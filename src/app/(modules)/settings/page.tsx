"use client"

import * as React from "react"
import { Shield, ShieldAlert, Sparkles, Building, Image as ImageIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card"
import { toast } from "sonner"
import { apiFetch } from "@/lib/useAuthStore"
import Image from "next/image"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  
  const [farmName, setFarmName] = React.useState("")
  const [farmLogo, setFarmLogo] = React.useState("")
  const [enableGlobal2FA, setEnableGlobal2FA] = React.useState(true)

  // Pre-defined premium logo options for ease of choice
  const logoOptions = [
    { name: "Default Barbara Logo", url: "/images/logo3.png" },
    { name: "Alternative Emerald Logo", url: "/images/logo2.png" },
    { name: "Minimalist Forest Logo", url: "/images/logo.png" }
  ]

  React.useEffect(() => {
    setIsLoading(true)
    apiFetch("/settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFarmName(data.farmName || "Barbara Farm")
          setFarmLogo(data.farmLogo || "/images/logo3.png")
          setEnableGlobal2FA(data.enableGlobal2FA === "true")
        }
      })
      .catch(err => {
        console.error("Gagal memuat pengaturan:", err)
        toast.error("Gagal memuat pengaturan sistem.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await apiFetch("/settings", {
        method: "PUT",
        body: JSON.stringify({
          farmName,
          farmLogo,
          enableGlobal2FA: String(enableGlobal2FA)
        })
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan pengaturan")
      }

      toast.success("Pengaturan sistem berhasil diperbarui.")
      
      // Optionally trigger sidebar/header logo and title sync by reloading
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui pengaturan.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#006B3F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#006B3F]" />
          Pengaturan Sistem
        </h1>
        <p className="text-[#68746D] mt-1 text-sm sm:text-base font-medium">
          Kelola konfigurasi identitas peternakan dan sistem keamanan global Barbara Farm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Farm Profile Settings */}
            <Card className="border border-[#DDE7E1] rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-[#F7FAF8] border-b border-[#DDE7E1] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Building className="w-5 h-5 text-[#006B3F]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-[#17211B]">Profil & Identitas Peternakan</CardTitle>
                    <CardDescription className="text-xs font-medium text-[#68746D]">Tentukan nama peternakan dan logo utama sistem.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <Input
                  label="Nama Peternakan *"
                  placeholder="Masukkan nama peternakan"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                />

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#68746D] uppercase tracking-wider">Logo Peternakan</label>
                  
                  {/* Select Preset Logos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {logoOptions.map((opt) => (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() => setFarmLogo(opt.url)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                          farmLogo === opt.url
                            ? "border-[#006B3F] bg-emerald-50/50 text-[#006B3F] font-bold ring-2 ring-[#006B3F]/10"
                            : "border-[#DDE7E1] bg-white text-[#17211B] hover:border-[#68746D]"
                        }`}
                      >
                        <span className="text-xs">{opt.name}</span>
                        {farmLogo === opt.url && <Check className="w-4 h-4 text-[#006B3F]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Input
                      label="Custom Logo URL"
                      placeholder="Masukkan URL custom logo (opsional)"
                      value={farmLogo}
                      onChange={(e) => setFarmLogo(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Security Settings */}
            <Card className="border border-[#DDE7E1] rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-[#F7FAF8] border-b border-[#DDE7E1] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Shield className="w-5 h-5 text-[#006B3F]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-[#17211B]">Gerbang Keamanan & 2FA Global</CardTitle>
                    <CardDescription className="text-xs font-medium text-[#68746D]">Konfigurasi kontrol autentikasi dua faktor untuk seluruh pengguna.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4 p-5 bg-[#F7FAF8] border border-[#DDE7E1] rounded-[1.5rem]">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#17211B]">Wajibkan Google Authenticator 2FA</p>
                    <p className="text-xs text-[#68746D] font-medium leading-relaxed max-w-md">
                      Bila diaktifkan, seluruh pengguna (termasuk Admin, Operator, dan Viewer) diwajibkan melewati verifikasi OTP Google Authenticator saat login.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableGlobal2FA(!enableGlobal2FA)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enableGlobal2FA ? "bg-[#006B3F]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enableGlobal2FA ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {!enableGlobal2FA && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Peringatan Keamanan</p>
                      <p className="mt-0.5 leading-relaxed font-medium">
                        Menonaktifkan 2FA global menurunkan tingkat keamanan akses data sensitif Barbara Farm. Gunakan opsi ini hanya saat pengujian atau keadaan darurat.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right side preview block */}
          <div className="md:col-span-1">
            <Card className="border border-[#DDE7E1] rounded-[2rem] overflow-hidden shadow-sm sticky top-6 bg-[#F7FAF8]">
              <CardContent className="p-8 text-center space-y-6">
                <p className="text-xs font-black text-[#68746D] uppercase tracking-widest">Pratinjau Logo Utama</p>
                <div className="flex items-center justify-center p-6 bg-white border border-[#DDE7E1] rounded-2xl shadow-inner min-h-[140px]">
                  {farmLogo ? (
                    <Image
                      src={farmLogo}
                      alt="Pratinjau Logo"
                      width={180}
                      height={60}
                      className="max-h-20 w-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs mt-2 font-bold">Belum Ada Logo</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-[#DDE7E1]">
                  <p className="text-xs font-medium text-[#68746D]">Identitas Terpilih:</p>
                  <p className="text-lg font-black text-[#17211B] mt-0.5">{farmName || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#DDE7E1]">
          <Button
            type="submit"
            variant="primary"
            className="px-8 py-3 bg-[#006B3F] hover:bg-[#004D2E] rounded-xl font-bold cursor-pointer transition-all"
            isLoading={isSaving}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  )
}
