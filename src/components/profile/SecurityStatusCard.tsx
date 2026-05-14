"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, MonitorSmartphone } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { dummyUser } from "@/lib/dummy-data"
import { 
  Modal, 
  ModalTrigger, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalFooter,
  ModalClose
} from "@/components/ui/Modal"

export function SecurityStatusCard() {
  const router = useRouter()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false)

  const handleLogout = () => {
    setIsLogoutModalOpen(false)
    router.push("/login")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan Akun</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start justify-between border-b border-border-neutral pb-4">
            <div className="flex space-x-3">
              <div className="mt-1 text-primary-green"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">2FA Google Authenticator</p>
                <p className="text-xs text-text-secondary mt-1">Status: {dummyUser.twoFactorEnabled ? "Aktif" : "Non-aktif"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Kelola 2FA</Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex space-x-3">
              <div className="mt-1 text-text-secondary"><MonitorSmartphone className="h-5 w-5" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Perangkat Aktif</p>
                <p className="text-xs text-text-secondary mt-1">MacBook Safari, Mobile Chrome</p>
                <p className="text-xs text-text-secondary mt-1">Login terakhir: {dummyUser.lastLogin}</p>
              </div>
            </div>
            
            <Modal open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
              <ModalTrigger asChild>
                <Button variant="danger" size="sm">Logout dari Semua</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Keluar dari Akun?</ModalTitle>
                  <ModalDescription>
                    Anda akan keluar dari sistem Barbara Farm di semua perangkat.
                  </ModalDescription>
                </ModalHeader>
                <ModalFooter>
                  <ModalClose asChild>
                    <Button variant="outline">Batal</Button>
                  </ModalClose>
                  <Button variant="danger" onClick={handleLogout}>Logout</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
