"use client"

import * as React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Bell } from "lucide-react"
import { dummyNotifications } from "@/lib/dummy-data"
import { Badge } from "@/components/ui/Badge"

export function NotificationDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-page-background rounded-full transition-colors focus:outline-none">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger border border-white"></span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-80 bg-white rounded-xl border border-border-neutral shadow-md p-1 mt-2 animate-in fade-in-80 zoom-in-95"
          align="end"
          sideOffset={5}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-neutral">
            <span className="font-semibold text-text-primary">Notifikasi</span>
            <span className="text-xs text-primary-green cursor-pointer hover:underline">Tandai sudah dibaca</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {dummyNotifications.length > 0 ? (
              dummyNotifications.map((notification) => (
                <DropdownMenu.Item key={notification.id} className="flex flex-col px-3 py-3 border-b border-border-neutral last:border-0 outline-none hover:bg-page-background cursor-pointer">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{notification.title}</span>
                    <Badge variant={notification.type as any}>{notification.type}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{notification.description}</p>
                  <span className="text-[10px] text-text-secondary mt-1">{notification.time}</span>
                </DropdownMenu.Item>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-text-secondary">Tidak ada notifikasi baru</div>
            )}
          </div>
          
          <div className="px-3 py-2 border-t border-border-neutral text-center">
            <span className="text-xs font-medium text-primary-green cursor-pointer hover:underline">Lihat semua notifikasi</span>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
