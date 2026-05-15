"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Beef,
  TrendingUp,
  Stethoscope,
  Wheat,
  DollarSign,
  QrCode,
  Bell,
  FileText,
  Settings,
  Users,
  X
} from "lucide-react"
import { useAuthStore } from "@/lib/useAuthStore"

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

type MenuGroup = {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "QR Scan", href: "/qr-scan", icon: QrCode },
    ]
  },
  {
    title: "OPERASIONAL TERNAK",
    items: [
      { name: "Master Data Sapi", href: "/cattle", icon: Beef },
      { name: "Monitoring Pertumbuhan", href: "/growth", icon: TrendingUp },
      { name: "Kesehatan & Medis", href: "/health", icon: Stethoscope },
      { name: "Manajemen Pakan", href: "/feeding", icon: Wheat },
      { name: "Penjualan", href: "/sales", icon: DollarSign },
    ]
  },
  {
    title: "ANALITIK",
    items: [
      { name: "Laporan", href: "/reports", icon: FileText, disabled: true },
      { name: "Notifikasi", href: "/notifications", icon: Bell, disabled: true },
    ]
  },
  {
    title: "SISTEM",
    items: [
      { name: "Manajemen User", href: "/admin/users", icon: Users },
      { name: "Pengaturan", href: "/settings", icon: Settings },
    ]
  }
]

export function Sidebar({ className, onClose }: { className?: string, onClose?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const isAdmin = user?.role === 'admin'

  return (
    <div className={cn("flex h-full w-64 flex-col border-r border-border-neutral bg-white", className)}>
      <div className="flex h-20 items-center justify-between px-6 border-b border-border-neutral">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/logo3.png"
            alt="SmartFarm Logo"
            width={200}
            height={80}
            priority
            className="h-12 md:h-32 w-auto object-contain transition-all"
          />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-text-secondary hover:bg-page-background rounded-md">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-6 px-4">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="mb-2 px-2 text-xs font-semibold text-text-secondary tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items
                  .filter(item => item.name !== "Manajemen User" || isAdmin)
                  .map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return item.disabled ? (
                      <div
                        key={item.name}
                        className="group flex items-center rounded-xl px-3 py-2 text-sm font-medium text-text-secondary opacity-50 cursor-not-allowed"
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-soft-green-surface text-primary-green"
                            : "text-text-secondary hover:bg-page-background hover:text-text-primary"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary-green" : "text-text-secondary group-hover:text-text-primary"
                          )}
                        />
                        {item.name}
                      </Link>
                    )
                  })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border-neutral">
        <div className="rounded-xl bg-page-background p-3 text-center">
          <p className="text-xs text-text-secondary">© 2026 Barbara Farm</p>
          <p className="text-[10px] text-text-secondary mt-0.5">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
