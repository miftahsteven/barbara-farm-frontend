"use client"

import * as React from "react"
import { QrCode, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/Button"
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

export function QuickScanCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>
        <div className="mt-8 flex items-center justify-between rounded-2xl bg-soft-green-surface p-4 cursor-pointer hover:bg-soft-green-surface/80 transition-colors border border-transparent hover:border-primary-green/20">
          <div>
            <h4 className="text-sm font-semibold text-primary-green">Quick Scan</h4>
            <p className="text-xs text-text-secondary mt-0.5">Scan QR Sapi untuk melihat data publik tanpa login</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary-green shadow-sm">
            <QrCode className="h-5 w-5" />
          </div>
        </div>
      </ModalTrigger>

      <ModalContent>
        <ModalHeader>
          <ModalTitle>Scan QR Sapi</ModalTitle>
          <ModalDescription>
            Arahkan kamera ke QR Code pada sapi untuk membuka profil publik.
          </ModalDescription>
        </ModalHeader>
        
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative h-64 w-64 rounded-2xl border-2 border-dashed border-primary-green/50 bg-soft-green-surface/50 flex flex-col items-center justify-center overflow-hidden">
            <ScanLine className="h-12 w-12 text-primary-green mb-4 opacity-50" />
            <span className="text-sm text-text-secondary">Kamera Placeholder</span>
          </div>
        </div>

        <ModalFooter className="sm:justify-between">
          <ModalClose asChild>
            <Button variant="outline">Tutup</Button>
          </ModalClose>
          <Button variant="primary" onClick={() => alert("Simulasi: Mengarahkan ke /cattle/public/BF-0001")}>
            Simulasi Hasil Scan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
