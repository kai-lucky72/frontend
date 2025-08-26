"use client"

import type React from "react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AttendanceProvider } from "@/contexts/AttendanceContext"

const AppSidebarNoSSR = dynamic(() => import("@/components/app-sidebar").then(m => m.AppSidebar), { ssr: false })

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <SidebarProvider defaultOpen={false}>
      <AttendanceProvider>
        <AppSidebarNoSSR userRole="agent" />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </AttendanceProvider>
    </SidebarProvider>
  )
}
