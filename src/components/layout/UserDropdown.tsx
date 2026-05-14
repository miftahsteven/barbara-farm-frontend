"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, User, Settings, Shield } from "lucide-react"
import { useAuthStore } from "@/lib/useAuthStore"

export function UserDropdown() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const displayName = user.email.split('@')[0]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center space-x-2 focus:outline-none">
        <div className="h-9 w-9 rounded-full bg-soft-green-surface text-primary-green flex items-center justify-center font-bold text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-medium text-text-primary capitalize">{displayName}</span>
          <span className="text-xs text-text-secondary capitalize">{user.role}</span>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] bg-white rounded-xl border border-border-neutral shadow-md p-1 mt-2 animate-in fade-in-80 zoom-in-95"
          align="end"
          sideOffset={5}
        >
          <div className="px-2 py-1.5 mb-1 border-b border-border-neutral md:hidden">
             <span className="block text-sm font-medium text-text-primary capitalize">{displayName}</span>
             <span className="block text-xs text-text-secondary capitalize">{user.role}</span>
          </div>

          <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-text-primary cursor-pointer hover:bg-page-background rounded-md outline-none" asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4 text-text-secondary" />
              <span className="flex-1">Lihat Profil</span>
            </Link>
          </DropdownMenu.Item>
          
          <DropdownMenu.Item className="flex items-center px-2 py-2 text-sm text-text-primary cursor-pointer hover:bg-page-background rounded-md outline-none" asChild>
            <Link href="/settings/security">
              <Shield className="mr-2 h-4 w-4 text-text-secondary" />
              <span className="flex-1">Pengaturan Keamanan</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border-neutral my-1" />
          
          <DropdownMenu.Item 
            className="flex items-center px-2 py-2 text-sm text-danger cursor-pointer hover:bg-danger/10 rounded-md outline-none"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
