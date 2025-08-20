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
import { useIsMobile } from "@/hooks/use-mobile"

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
  { title: "Attendance", url: "/manager/attendance", icon: Clock },
  { title: "Notifications", url: "/manager/notifications", icon: Bell },
]

// Individual Agent Navigation
const individualAgentNavItems = [
  { title: "Dashboard", url: "/agent", icon: Home },
  { title: "Attendance", url: "/agent/attendance", icon: UserCheck },
  { title: "My Performance", url: "/agent/performance", icon: BarChart3 },
  { title: "Notifications", url: "/agent/notifications", icon: Bell },
]

// Sales Agent Navigation (includes group performance)
const salesAgentNavItems = [
  { title: "Dashboard", url: "/agent", icon: Home },
  { title: "Attendance", url: "/agent/attendance", icon: UserCheck },
  { title: "My Performance", url: "/agent/performance", icon: BarChart3 },
  { title: "Notifications", url: "/agent/notifications", icon: Bell },
]

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    email: "",
    agentType: "individual",
    groupName: "",
  })
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsUserLoggedIn(true)
    const email = localStorage.getItem("userEmail") || "user@company.com"
    const agentType = localStorage.getItem("agentType") || "individual"
    const groupName = localStorage.getItem("groupName") || ""
    setUserInfo({ email, agentType, groupName })
  }, [])

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return adminNavItems
      case "manager":
        return managerNavItems
      case "agent":
        return userInfo.agentType === "sales" ? salesAgentNavItems : individualAgentNavItems
      default:
        return []
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }



  const getPortalTitle = () => {
    if (userRole === "agent") {
      return userInfo.agentType === "sales"
        ? `Sales Agent${userInfo.groupName ? ` - ${userInfo.groupName}` : ""}`
        : "Individual Agent"
    }
    return `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
  }

  return (
    <>
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="h-10 w-10 p-0 flex-shrink-0" />
        </div>
      )}
      <Sidebar variant="sidebar" collapsible="offcanvas" {...props}>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between px-3 py-4">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-semibold truncate">Prime Management</h2>
                {isUserLoggedIn && <p className="text-xs text-muted-foreground truncate">{getPortalTitle()}</p>}
              </div>
            </div>
            {!isMobile && (
              <SidebarTrigger className="h-8 w-8 p-0 flex-shrink-0">
                <X className="h-4 w-4" />
              </SidebarTrigger>
            )}
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
            {isUserLoggedIn && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="text-sm">{userInfo.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{userInfo.email}</p>
                  {/* workId removed */}
                  {userRole === "agent" && userInfo.agentType === "sales" && userInfo.groupName && (
                    <p className="text-xs text-blue-600 truncate">{userInfo.groupName}</p>
                  )}
                </div>
              </div>
            )}
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
