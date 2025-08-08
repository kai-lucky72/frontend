"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AttendanceProvider } from "@/contexts/AttendanceContext"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AttendanceProvider>
        <AppSidebar userRole="agent" />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </AttendanceProvider>
    </SidebarProvider>
  )
}
