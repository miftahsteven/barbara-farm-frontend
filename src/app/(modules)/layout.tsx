"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { useAuthStore } from "@/lib/useAuthStore"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const { token, user } = useAuthStore()
  const router = useRouter()

  React.useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
      return
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    return () => unsub()
  }, [])

  React.useEffect(() => {
    if (!isHydrated) return

    if (!token || !user) {
      router.replace("/login")
    }
  }, [isHydrated, token, user, router])

  if (!isHydrated || !token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-background">
        <div className="w-10 h-10 border-4 border-[#006B3F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-page-background">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-deep-forest/50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
