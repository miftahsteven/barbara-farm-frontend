"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import type { UserProfile } from "@/app/(modules)/profile/page"

export function ProfileSummaryCard({ profile }: { profile: UserProfile | null }) {
  if (!profile) return null;

  const displayName = profile.name || profile.email.split('@')[0];
  const displayFarmName = profile.farmName || "Barbara Farm";
  const displayPhone = profile.phone || "-";
  const displayRole = profile.role || "User";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
          <div className="h-24 w-24 rounded-full bg-soft-green-surface flex items-center justify-center text-primary-green text-3xl font-bold mb-4 sm:mb-0 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h2 className="text-xl font-bold text-text-primary capitalize">{displayName}</h2>
              <div className="mt-2 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-2">
                <Badge variant="primary" className="capitalize">{displayRole}</Badge>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm w-full">
              <div>
                <span className="text-text-secondary block text-xs">Peternakan</span>
                <span className="font-medium text-text-primary">{displayFarmName}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">Email</span>
                <span className="font-medium text-text-primary truncate block w-full">{profile.email}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">No. WhatsApp</span>
                <span className="font-medium text-text-primary">{displayPhone}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">Jabatan</span>
                <span className="font-medium text-text-primary">{profile.position || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
