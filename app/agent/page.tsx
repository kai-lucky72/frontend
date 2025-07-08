"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
} from "lucide-react"

export default function AgentDashboard() {
  const [userInfo, setUserInfo] = useState({
    email: "",
    workId: "",
    agentType: "individual",
    groupName: "",
  })

  useEffect(() => {
    // Get user info from localStorage
    const email = localStorage.getItem("userEmail") || "agent@company.com"
    const workId = localStorage.getItem("workId") || "AGT001"
    const agentType = localStorage.getItem("agentType") || "individual"
    const groupName = localStorage.getItem("groupName") || ""

    setUserInfo({ email, workId, agentType, groupName })
  }, [])

  const stats = [
    {
      title: "Clients This Month",
      value: "24",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Target Progress",
      value: "78%",
      change: "+5%",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Revenue Generated",
      value: "$12,450",
      change: "+18%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Hours Worked",
      value: "156",
      change: "+3%",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      action: "Client meeting completed",
      client: "ABC Corp",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      action: "Proposal submitted",
      client: "XYZ Ltd",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: 3,
      action: "Follow-up call scheduled",
      client: "Tech Solutions",
      time: "1 day ago",
      status: "success",
    },
    {
      id: 4,
      action: "Contract signed",
      client: "Global Industries",
      time: "2 days ago",
      status: "success",
    },
  ]

  const targets = [
    { name: "Monthly Sales", current: 78, target: 100 },
    { name: "Client Meetings", current: 85, target: 100 },
    { name: "Revenue Target", current: 65, target: 100 },
    { name: "Follow-ups", current: 92, target: 100 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Header */}
      <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            {userInfo.agentType === "sales" ? "Sales Agent Dashboard" : "Agent Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Welcome back! Here's your performance overview.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-3 sm:p-4 lg:p-6">
        {/* Agent Profile Card - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="text-sm sm:text-lg">{userInfo.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center sm:text-left w-full">
                <h3 className="text-lg sm:text-xl font-semibold truncate">{userInfo.email}</h3>
                <p className="text-sm text-muted-foreground">Work ID: {userInfo.workId}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge variant={userInfo.agentType === "sales" ? "default" : "secondary"} className="text-xs">
                    {userInfo.agentType === "sales" ? "Sales Agent" : "Individual Agent"}
                  </Badge>
                  {userInfo.groupName && (
                    <Badge variant="outline" className="text-xs">
                      {userInfo.groupName}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{userInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-1">{stat.title}</CardTitle>
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid - Mobile Stacked */}
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Target Progress */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                Target Progress
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your performance against monthly targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targets.map((target, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{target.name}</span>
                    <span className="text-sm text-muted-foreground">{target.current}%</span>
                  </div>
                  <Progress value={target.current} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your latest client interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {activity.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.client} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="h-12 sm:h-10 flex-col sm:flex-row gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Mark</span> Attendance
              </Button>
              <Button
                variant="outline"
                className="h-12 sm:h-10 flex-col sm:flex-row gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span> Client
              </Button>
              <Button
                variant="outline"
                className="h-12 sm:h-10 flex-col sm:flex-row gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span> Follow-up
              </Button>
              <Button
                variant="outline"
                className="h-12 sm:h-10 flex-col sm:flex-row gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">View</span> Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
