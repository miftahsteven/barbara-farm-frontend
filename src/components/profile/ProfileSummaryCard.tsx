"use client"

import * as React from "react"
import { dummyUser } from "@/lib/dummy-data"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export function ProfileSummaryCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
          <div className="h-24 w-24 rounded-full bg-soft-green-surface flex items-center justify-center text-primary-green text-3xl font-bold mb-4 sm:mb-0 shrink-0">
            {dummyUser.name.charAt(0)}
          </div>
          
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h2 className="text-xl font-bold text-text-primary">{dummyUser.name}</h2>
              <div className="mt-2 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-2">
                <Badge variant="primary">{dummyUser.role}</Badge>
                <Badge variant="success">{dummyUser.status}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm w-full">
              <div>
                <span className="text-text-secondary block text-xs">Peternakan</span>
                <span className="font-medium text-text-primary">{dummyUser.farmName}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">Email</span>
                <span className="font-medium text-text-primary truncate block w-full">{dummyUser.email}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">No. WhatsApp</span>
                <span className="font-medium text-text-primary">{dummyUser.phone}</span>
              </div>
              <div>
                <span className="text-text-secondary block text-xs">Login Terakhir</span>
                <span className="font-medium text-text-primary">{dummyUser.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
