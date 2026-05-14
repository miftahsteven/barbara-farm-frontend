"use client"

import * as React from "react"
import Link from "next/link"
import { Beef, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [contact, setContact] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact) {
      setError("Email atau No. WhatsApp wajib diisi.")
      return
    }
    setError("")
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page-background p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-border-neutral p-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 font-bold text-2xl tracking-tight text-primary-green">
            <Beef className="h-8 w-8" />
            <span>Barbara Farm</span>
          </div>
        </div>

        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">Lupa Password?</h1>
              <p className="text-text-secondary text-sm px-4">
                Masukkan email atau nomor WhatsApp yang terdaftar. Kami akan mengirim instruksi pemulihan akun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email atau No. WhatsApp"
                type="text"
                placeholder="contoh@email.com atau 0812..."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                error={error}
              />
              
              <Button type="submit" variant="primary" className="w-full h-12 text-base" isLoading={isLoading}>
                Kirim Instruksi
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 bg-soft-green-surface rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary-green" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Instruksi Terkirim!</h2>
            <p className="text-text-secondary text-sm mb-8 px-4">
              Instruksi pemulihan akun telah dikirim. Silakan cek email atau WhatsApp Anda.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  )
}
