"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Target, Clock, TrendingUp, UserPlus, Group, MapPin, AlertCircle } from "lucide-react"
import { ChartTooltipContent } from "@/components/ui/chart"
import { Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getManagerDashboardData, patchManagerDashboardTimeframe } from "@/lib/api"
import { ManagerDashboardData } from "@/lib/types"

const PIE_CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#a4de6c", "#d0ed57", "#ffc0cb"];

export default function ManagerDashboard() {
  const router = useRouter()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<ManagerDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  const [isTimeframeDialogOpen, setIsTimeframeDialogOpen] = useState(false)
  const [tempTimeframe, setTempTimeframe] = useState({ startTime: "", endTime: "" })

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getManagerDashboardData()
      setDashboardData(data)
      setTempTimeframe(data.attendance.timeframe)
      setIsMock(false)
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleUpdateTimeframe = async () => {
    try {
      const updatedTimeframe = await patchManagerDashboardTimeframe({
        startTime: tempTimeframe.startTime,
        endTime: tempTimeframe.endTime,
      })
      setDashboardData(prevData => prevData ? { ...prevData, attendance: { ...prevData.attendance, timeframe: updatedTimeframe } } : null)
      setIsTimeframeDialogOpen(false)
      toast({
        title: "Timeframe Updated",
        description: `Attendance window updated to ${updatedTimeframe.startTime} - ${updatedTimeframe.endTime}`,
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update the attendance timeframe. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddMockData = () => {
    setDashboardData(mockDashboardData)
    setIsMock(true)
  }
  const handleRemoveMockData = () => {
    fetchDashboardData()
    setIsMock(false)
  }

  // Mock data fallback
  const mockDashboardData = {
    stats: {
      totalAgents: 12,
      activeToday: 8,
      clientsCollected: 320,
      groupsCount: 3,
    },
    recentActivities: [
      { id: 1, agentName: "John Doe", action: "Collected 5 clients", location: "Downtown", status: "success", timestamp: "2024-07-10 09:00" },
      { id: 2, agentName: "Sarah Smith", action: "Marked attendance late", location: "Uptown", status: "warning", timestamp: "2024-07-10 09:15" },
    ],
    attendance: {
      rate: 85,
      presentCount: 8,
      absentCount: 4,
      presentAgents: [
        { name: "John Doe", time: "08:30" },
        { name: "Sarah Smith", time: "08:45" },
      ],
      timeframe: { startTime: "09:00", endTime: "10:00" },
    },
    groupPerformance: [
      { name: "Alpha Team", clients: 120 },
      { name: "Beta Team", clients: 100 },
      { name: "Gamma Team", clients: 100 },
    ],
    individualPerformance: [
      { name: "John Doe", clients: 120 },
      { name: "Sarah Smith", clients: 100 },
      { name: "Mike Johnson", clients: 100 },
    ],
  }
  const dataToUse = dashboardData && dashboardData.stats ? dashboardData : mockDashboardData;

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Loading Failed</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button onClick={fetchDashboardData} className="mt-6">Retry</Button>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return null // Or some other placeholder for no data
  }

  const statsCards = [
    { name: "Total Agents", value: dataToUse.stats.totalAgents, icon: Users },
    { name: "Active Today", value: dataToUse.stats.activeToday, icon: Clock },
    { name: "Clients Collected", value: dataToUse.stats.clientsCollected, icon: Target },
    { name: "Groups", value: dataToUse.stats.groupsCount, icon: Group },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Manager Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your agents and monitor performance</p>
        </div>
        <div className="flex items-center gap-2">
          {isMock ? (
            <Button variant="destructive" size="sm" onClick={handleRemoveMockData}>
              Remove Mock Data
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleAddMockData}>
              Add Mock Data
            </Button>
          )}
          <Button size="sm" onClick={() => router.push("/manager/agents")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">Live data overview</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Activities</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {dataToUse.recentActivities.length > 0 ? (
                  dataToUse.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{activity.agentName}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                      </div>
                      <div className="text-right sm:text-left sm:ml-4">
                        <Badge variant={activity.status === "success" ? "default" : activity.status === 'warning' ? 'secondary' : "destructive"} className="mb-1 text-xs">
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activities.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Current attendance status and list of present agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Attendance Rate</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">{dataToUse.attendance.rate.toFixed(0)}%</span>
                </div>
                <Progress value={dataToUse.attendance.rate} className="h-3" />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{dataToUse.attendance.presentCount}</div>
                    <div className="text-xs text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{dataToUse.attendance.absentCount}</div>
                    <div className="text-xs text-muted-foreground">Absent</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Present Agents</h4>
                  <ul className="space-y-2 text-sm max-h-24 overflow-y-auto">
                    {dataToUse.attendance.presentAgents.length > 0 ? (
                      dataToUse.attendance.presentAgents.map((agent) => (
                        <li key={agent.name} className="flex justify-between">
                          <span className="truncate">{agent.name}</span>
                          <span className="text-muted-foreground flex-shrink-0 ml-2">{agent.time}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground text-center">No agents present yet.</li>
                    )}
                  </ul>
                </div>

                <Dialog open={isTimeframeDialogOpen} onOpenChange={setIsTimeframeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-transparent !mt-6 h-10 sm:h-9">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="truncate">Update Timeframe ({dataToUse.attendance.timeframe.startTime} - {dataToUse.attendance.timeframe.endTime})</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] w-[95vw]">
                    <DialogHeader>
                      <DialogTitle>Update Attendance Timeframe</DialogTitle>
                      <DialogDescription>Set the time window for agent attendance tracking.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right text-sm">Start Time</Label>
                        <Input id="startTime" type="time" value={tempTimeframe.startTime} onChange={(e) => setTempTimeframe((prev) => ({ ...prev, startTime: e.target.value }))} className="col-span-3 h-10 sm:h-9" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right text-sm">End Time</Label>
                        <Input id="endTime" type="time" value={tempTimeframe.endTime} onChange={(e) => setTempTimeframe((prev) => ({ ...prev, endTime: e.target.value }))} className="col-span-3 h-10 sm:h-9" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsTimeframeDialogOpen(false)} className="h-10 sm:h-9">Cancel</Button>
                      <Button type="button" onClick={handleUpdateTimeframe} className="h-10 sm:h-9">Update Timeframe</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Group Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Group Performance</CardTitle>
              <CardDescription>Total clients collected per group</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
                <BarChart data={dataToUse.groupPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Individual Performance Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>Client distribution among top agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="min-h-[250px]">
                <PieChart>
                  <Pie data={dataToUse.individualPerformance} dataKey="clients" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dataToUse.individualPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-8 w-8" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <Skeleton className="h-9 w-28" />
      </header>
      <main className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-7 w-1/4" />
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
