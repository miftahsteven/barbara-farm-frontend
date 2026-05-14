"use client"

import * as React from "react"
import { Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { UserDropdown } from "./UserDropdown"
import { NotificationDropdown } from "./NotificationDropdown"

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-neutral bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="mr-4 lg:hidden p-2 text-text-secondary hover:bg-page-background rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden sm:flex flex-1 max-w-md">
          <Input 
            placeholder="Cari data sapi, riwayat medis..." 
            leftIcon={<Search className="h-4 w-4" />}
            className="h-10 rounded-full bg-page-background border-transparent focus-visible:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <Button size="sm" className="hidden sm:inline-flex rounded-full">
          + Input Data
        </Button>
        <Button size="icon" variant="ghost" className="sm:hidden rounded-full h-10 w-10">
          <Search className="h-5 w-5 text-text-secondary" />
        </Button>
        <NotificationDropdown />
        <div className="h-6 w-px bg-border-neutral mx-1 hidden sm:block"></div>
        <UserDropdown />
      </div>
    </header>
  )
}
