"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { toast } from "sonner"

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errors, setErrors] = React.useState<{newPassword?: string, confirmPassword?: string}>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: any = {}
    if (newPassword.length < 8) newErrors.newPassword = "Password baru minimal 8 karakter."
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Konfirmasi password tidak sama."
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password berhasil diubah.")
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input 
            label="Password Saat Ini *"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            rightIcon={
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="focus:outline-none hover:text-text-primary text-text-secondary">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          
          <Input 
            label="Password Baru *"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            error={errors.newPassword}
            rightIcon={
              <button type="button" onClick={() => setShowNew(!showNew)} className="focus:outline-none hover:text-text-primary text-text-secondary">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input 
            label="Konfirmasi Password Baru *"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={errors.confirmPassword}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="focus:outline-none hover:text-text-primary text-text-secondary">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="pt-4 border-t border-border-neutral">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Perbarui Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
