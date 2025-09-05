"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Building2,
  Users,
  BarChart3,
  Bell,
  Settings,
  Shield,
  UserCheck,
  LogOut,
  Home,
  Clock,
  X,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: string
}

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Commercials", url: "/admin/managers", icon: Users },
  { title: "All Users", url: "/admin/users", icon: Shield },
  { title: "System Logs", url: "/admin/logs", icon: BarChart3 },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

const managerNavItems = [
  { title: "Dashboard", url: "/manager", icon: Home },
  { title: "Sales Agents", url: "/manager/agents", icon: Users },
  { title: "Performance", url: "/manager/performance", icon: BarChart3 },
  { title: "Attendance", url: "/manager/attendance", icon: Clock },
  { title: "Notifications", url: "/manager/notifications", icon: Bell },
]

const agentNavItems = [
  { title: "Dashboard", url: "/agent", icon: Home },
  { title: "My Clients", url: "/agent/clients", icon: Users },
  { title: "Attendance", url: "/agent/attendance", icon: UserCheck },
  { title: "My Performance", url: "/agent/performance", icon: BarChart3 },
  { title: "Notifications", url: "/agent/notifications", icon: Bell },
]

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return adminNavItems
      case "manager":
        return managerNavItems
      case "agent":
        return agentNavItems
      default:
        return []
    }
  }

  const handleLogout = () => {
    try { localStorage.clear() } catch {}
    router.push("/")
  }

  const getPortalTitle = () => {
    if (userRole === "agent") return "Agent"
    return `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
  }

  if (!mounted) return null

  return (
    <>
      {/* Render trigger always; CSS handles visibility on desktop */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <SidebarTrigger className="h-10 w-10 p-0 flex-shrink-0" />
      </div>
      <Sidebar variant="sidebar" collapsible="offcanvas" {...props}>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center px-3 py-4">
            <div className="flex items-center gap-3">
              <img src="https://prime.rw/public/themes/assets/img/Prime_Life_Insurance_Logo.PNG" alt="Prime Life Insurance" className="h-10 sm:h-12 w-auto object-contain flex-shrink-0" />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-medium">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getNavItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} className="h-12 px-3">
                      <button 
                        onClick={() => router.push(item.url)} 
                        className="flex items-center gap-3 w-full text-left"
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="p-3 space-y-3">
            <Button variant="outline" size="sm" className="w-full h-10 bg-transparent text-sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  )
}
