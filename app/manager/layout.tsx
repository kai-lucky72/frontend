"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userRole="manager" />
      <main className="flex-1 overflow-y-auto">
        <SidebarInset>{children}</SidebarInset>
      </main>
    </SidebarProvider>
  )
}
