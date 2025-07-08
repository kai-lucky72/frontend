"use client"

import type * as React from "react"
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
  Group,
  TrendingUp,
  Clock,
  Target,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: string
}

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Managers", url: "/admin/managers", icon: Users },
  { title: "All Users", url: "/admin/users", icon: Shield },
  { title: "System Logs", url: "/admin/logs", icon: BarChart3 },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

const managerNavItems = [
  { title: "Dashboard", url: "/manager", icon: Home },
  { title: "My Agents", url: "/manager/agents", icon: Users },
  { title: "Groups", url: "/manager/groups", icon: Group },
  { title: "Performance", url: "/manager/performance", icon: TrendingUp },
  { title: "Attendance", url: "/manager/attendance", icon: Clock },
  { title: "Notifications", url: "/manager/notifications", icon: Bell },
]

// Individual Agent Navigation
const individualAgentNavItems = [
  { title: "Dashboard", url: "/agent", icon: Home },
  { title: "Attendance", url: "/agent/attendance", icon: UserCheck },
  { title: "Clients", url: "/agent/clients", icon: Target },
  { title: "My Performance", url: "/agent/performance", icon: BarChart3 },
  { title: "Notifications", url: "/agent/notifications", icon: Bell },
]

// Sales Agent Navigation (includes group performance)
const salesAgentNavItems = [
  { title: "Dashboard", url: "/agent", icon: Home },
  { title: "Attendance", url: "/agent/attendance", icon: UserCheck },
  { title: "Clients", url: "/agent/clients", icon: Target },
  { title: "My Performance", url: "/agent/performance", icon: BarChart3 },
  { title: "Group Performance", url: "/agent/group-performance", icon: Group },
  { title: "Notifications", url: "/agent/notifications", icon: Bell },
]

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return adminNavItems
      case "manager":
        return managerNavItems
      case "agent":
        // Check agent type from localStorage
        const agentType = localStorage.getItem("agentType") || "individual"
        return agentType === "sales" ? salesAgentNavItems : individualAgentNavItems
      default:
        return []
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const getUserInfo = () => {
    const email = localStorage.getItem("userEmail") || "user@company.com"
    const workId = localStorage.getItem("workId") || "EMP001"
    const agentType = localStorage.getItem("agentType") || "individual"
    const groupName = localStorage.getItem("groupName") || ""
    return { email, workId, agentType, groupName }
  }

  const { email, workId, agentType, groupName } = getUserInfo()

  const getPortalTitle = () => {
    if (userRole === "agent") {
      return agentType === "sales" ? `Sales Agent${groupName ? ` - ${groupName}` : ""}` : "Individual Agent"
    }
    return `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
  }

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold truncate">Prime Management</h2>
              <p className="text-xs text-muted-foreground truncate">{getPortalTitle()}</p>
            </div>
          </div>
          <SidebarTrigger className="h-8 w-8 p-0 flex-shrink-0">
            <X className="h-4 w-4" />
          </SidebarTrigger>
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
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="text-sm">{email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{email}</p>
              <p className="text-xs text-muted-foreground">{workId}</p>
              {userRole === "agent" && agentType === "sales" && groupName && (
                <p className="text-xs text-blue-600 truncate">{groupName}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full h-10 bg-transparent text-sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
