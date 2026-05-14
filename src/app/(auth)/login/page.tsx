"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Fingerprint, Beef, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Checkbox, CheckboxIndicator } from "@radix-ui/react-checkbox"
import { QuickScanCard } from "@/components/auth/QuickScanCard"
import { toast } from "sonner"
import { useAuthStore, API_URL } from "@/lib/useAuthStore"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<{ email?: string, password?: string }>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: any = {}
    if (!email) newErrors.email = "Username atau email wajib diisi."
    if (!password) newErrors.password = "Password wajib diisi."
    else if (password.length < 6) newErrors.password = "Password minimal 6 karakter."

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      if (data.requiresSetup2FA) {
        useAuthStore.getState().setRequiresSetup2FA(data.userId);
        toast.info("Setup 2FA diperlukan");
        router.push("/verify-otp");
        return;
      }

      if (data.requires2FA) {
        useAuthStore.getState().setRequires2FA(data.userId);
        toast.info("Verifikasi 2FA diperlukan");
        router.push("/verify-otp");
        return;
      }

      useAuthStore.getState().setAuth(data.user, data.token);
      toast.success("Login berhasil");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden bg-deep-forest text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#062B1F]/95 to-[#01452A]/70 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599388377797-17eb4862551a?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40" />

        <div className="relative z-20 p-12">
          <div className="mb-20">
            <div className="relative h-32 w-80 -ml-12 mb-10">
              <Image
                src="/images/logo2.png"
                alt="Barbara Farm Logo"
                fill
                className="object-contain mix-blend-lighten contrast-[1.2] brightness-[1.1]"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">Kelola Kandang<br />Lebih Cerdas</h1>
          <p className="text-soft-green-surface text-lg max-w-md mb-12">
            Sistem manajemen ternak modern untuk peternakan yang lebih produktif.
          </p>

          <div className="space-y-6">
            {['Data Akurat', 'Aman & Terpercaya', 'Akses Cepat'].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-6 w-6 rounded-full bg-light-green-accent/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-light-green-accent" />
                </div>
                <span className="font-medium text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 p-12 text-sm text-white/60">
          © 2026 Barbara Farm. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center mb-10">
            <div className="relative h-20 w-48">
              <Image
                src="/images/logo2.jpeg"
                alt="Barbara Farm Logo"
                fill
                className="object-contain mix-blend-multiply contrast-[1.1] brightness-[1.1]"
              />
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Selamat datang kembali!</h2>
            <p className="text-text-secondary text-sm">Silakan masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Username / Email"
              type="text"
              placeholder="Username atau Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-text-secondary hover:text-text-primary focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    className="flex h-4 w-4 appearance-none items-center justify-center rounded border border-border-neutral bg-white data-[state=checked]:bg-primary-green data-[state=checked]:border-primary-green outline-none focus-visible:ring-2 focus-visible:ring-primary-green"
                  >
                    <CheckboxIndicator>
                      <Check className="h-3 w-3 text-white" />
                    </CheckboxIndicator>
                  </Checkbox>
                  <label htmlFor="remember" className="text-sm text-text-secondary cursor-pointer select-none">
                    Ingat saya
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm font-medium text-primary-green hover:underline">
                  Lupa password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-12 text-base mt-4" isLoading={isLoading}>
              Masuk
            </Button>
          </form>

          {/* <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-border-neutral flex-1" />
            <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">Atau masuk dengan</span>
            <div className="h-px bg-border-neutral flex-1" />
          </div> */}

          {/* <Button variant="outline" className="w-full h-12 mt-6" type="button" onClick={() => toast.info("Demo: Fitur sidik jari")}>
            <Fingerprint className="mr-2 h-5 w-5 text-text-secondary" />
            Login dengan Sidik Jari
          </Button> */}

          <QuickScanCard />

          {/* <div className="mt-12 flex items-center justify-between text-xs text-text-secondary">
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-text-primary">Bantuan</Link>
              <Link href="#" className="hover:text-text-primary">Privasi</Link>
              <Link href="#" className="hover:text-text-primary">Ketentuan</Link>
            </div>
            <div className="flex items-center cursor-pointer hover:text-text-primary">
              <span className="mr-1">🌐</span> Bahasa Indonesia
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
