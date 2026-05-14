"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { toast } from "sonner"
import { dummyUser } from "@/lib/dummy-data"

export function EditProfileForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: dummyUser.name,
    email: dummyUser.email,
    phone: dummyUser.phone,
    farmName: dummyUser.farmName,
    position: dummyUser.position,
    location: dummyUser.location,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Profil berhasil diperbarui.")
    }, 1000)
  }

  const handleReset = () => {
    setFormData({
      name: dummyUser.name,
      email: dummyUser.email,
      phone: dummyUser.phone,
      farmName: dummyUser.farmName,
      position: dummyUser.position,
      location: dummyUser.location,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Dasar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Nama Lengkap *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input 
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input 
              label="Nomor WhatsApp *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <Input 
              label="Nama Peternakan *"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              required
            />
            <Input 
              label="Jabatan"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Lokasi Peternakan
            </label>
            <textarea 
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="flex w-full rounded-xl border border-border-neutral bg-white px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green min-h-[100px] resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border-neutral">
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">
              Simpan Perubahan
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
