"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShieldCheck, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Checkbox, CheckboxIndicator } from "@radix-ui/react-checkbox"
import { useAuthStore, API_URL } from "@/lib/useAuthStore"
import { toast } from "sonner"

export default function VerifyOTPPage() {
  const router = useRouter()
  const { requiresSetup2FA, tempUserId, qrCodeUrl, setQrCodeUrl, setAuth } = useAuthStore()
  
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isFetchingQR, setIsFetchingQR] = React.useState(false)
  const [error, setError] = React.useState("")
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (useAuthStore.getState().user) {
      router.push("/dashboard")
      return
    }

    if (!tempUserId) {
      router.push("/login")
      return
    }

    if (requiresSetup2FA && !qrCodeUrl) {
      fetchQRCode()
    }
  }, [tempUserId, requiresSetup2FA, qrCodeUrl])

  const fetchQRCode = async () => {
    setIsFetchingQR(true)
    try {
      const response = await fetch(`${API_URL}/auth/setup-2fa/${tempUserId}`);
      const data = await response.json();
      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        toast.error(data.message || "Gagal mengambil QR Code");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengambil QR Code");
    } finally {
      setIsFetchingQR(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length < 6) {
      setError("Kode OTP harus terdiri dari 6 digit.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpValue, userId: tempUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal');
      }

      setAuth(data.user, data.token);
      toast.success("Verifikasi berhasil");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false)
    }
  }

  const isComplete = otp.every(digit => digit !== "")

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-background p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-border-neutral p-8">
        <div className="flex justify-center mb-6">
          <div className="relative h-16 w-40">
            <Image 
              src="/images/logo2.jpeg" 
              alt="Barbara Farm Logo" 
              fill 
              className="object-contain mix-blend-multiply contrast-[1.1] brightness-[1.1]"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-soft-green-surface rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary-green" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Verifikasi Keamanan</h1>
          
          {requiresSetup2FA ? (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Gunakan aplikasi Google Authenticator untuk memindai kode QR di bawah ini.
              </p>
              <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                {isFetchingQR ? (
                  <div className="h-48 w-48 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary-green animate-spin" />
                  </div>
                ) : qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
                ) : (
                  <p className="text-xs text-danger">QR Code tidak tersedia</p>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Setelah memindai, masukkan kode 6 digit yang muncul di aplikasi Anda.
              </p>
            </div>
          ) : (
            <p className="text-text-secondary text-sm px-2">
              Masukkan 6 digit kode dari Google Authenticator untuk melanjutkan.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green transition-colors ${
                  error ? "border-danger focus-visible:ring-danger" : "border-border-neutral"
                }`}
              />
            ))}
          </div>
          
          {error && <p className="text-center text-sm text-danger">{error}</p>}
          
          <div className="bg-soft-green-surface/50 rounded-xl p-4 flex items-start space-x-3 border border-primary-green/10">
            <Checkbox 
              id="trust" 
              className="mt-0.5 flex h-4 w-4 shrink-0 appearance-none items-center justify-center rounded border border-border-neutral bg-white data-[state=checked]:bg-primary-green data-[state=checked]:border-primary-green outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
            >
              <CheckboxIndicator>
                <Check className="h-3 w-3 text-white" />
              </CheckboxIndicator>
            </Checkbox>
            <div>
              <label htmlFor="trust" className="text-sm font-medium text-text-primary cursor-pointer block mb-1">
                Perangkat terpercaya
              </label>
              <p className="text-xs text-text-secondary">
                Centang untuk tidak meminta kode 2FA selama 7 hari di perangkat ini.
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-12 text-base" 
            disabled={!isComplete || isLoading}
            isLoading={isLoading}
          >
            Verifikasi
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-neutral space-y-4">
          <p className="text-xs text-text-secondary text-center">
            Kode berubah setiap beberapa detik. Jangan berikan kode ini kepada siapa pun.
          </p>
          <div className="flex flex-col items-center space-y-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary">
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
