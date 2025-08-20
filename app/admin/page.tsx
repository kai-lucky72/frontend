"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Shield, Activity, Bell, TrendingUp, TrendingDown, Plus, UserPlus } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tooltip, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getManagers, getUsers, getNotifications, getLogs } from "@/lib/api"

export default function AdminDashboard() {
  const router = useRouter()
  const [isCreateManagerOpen, setCreateManagerOpen] = useState(false)
  const [isNotificationOpen, setNotificationOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [managers, setManagers] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationStats, setNotificationStats] = useState<any>({ totalSent: 0, thisWeek: 0, readRate: 0 })
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getManagers(),
      getUsers(),
      getNotifications(),
      getLogs({ limit: 10 })
    ]).then(([mgrs, usrs, notifRes, logsRes]) => {
      setManagers(mgrs)
      setUsers(usrs)
      setNotifications(notifRes.notifications || [])
      setNotificationStats(notifRes.stats || { totalSent: 0, thisWeek: 0, readRate: 0 })
      setLogs(logsRes.logs || [])
    }).catch((e) => {
      setError(e.message || 'Failed to load dashboard data')
    }).finally(() => setLoading(false))
  }, [])

  // Stats
  const agents = users.filter(u => u.role === 'agent')
  const activeToday = users.filter(u => u.status === 'active')

  // Chart: notifications sent per month (fallback to sentAt month)
  const chartData = notifications.reduce((acc: any, n: any) => {
    const date = new Date(n.sentAt)
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    const key = `${month} ${year}`
    if (!acc[key]) acc[key] = { name: key, sent: 0 }
    acc[key].sent++
    return acc
  }, {})
  const systemMetrics = Object.values(chartData).sort((a: any, b: any) => new Date(a.name) > new Date(b.name) ? 1 : -1)

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">System overview and management</p>
        </div>
        {/* Create Manager button removed (creation disabled). */}
      </header>
      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Managers</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{managers.length}</div>
              <div className="flex items-center text-xs text-muted-foreground">Total managers</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Agents</CardTitle>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{agents.length}</div>
              <div className="flex items-center text-xs text-muted-foreground">Total agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{activeToday.length}</div>
              <div className="flex items-center text-xs text-muted-foreground">Active users today</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Notifications Sent</CardTitle>
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{notificationStats.totalSent}</div>
              <div className="flex items-center text-xs text-muted-foreground">Total notifications sent</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* System Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>Notifications sent per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sent: {
                    label: "Notifications Sent",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[250px] min-h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="var(--color-sent)"
                      strokeWidth={2}
                      name="Notifications Sent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activities</CardTitle>
              <CardDescription>Latest actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{log.message}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.user || log.category}</p>
                    </div>
                    <div className="text-right sm:text-left sm:ml-4">
                      <Badge
                        variant={
                          log.level === "success"
                            ? "default"
                            : log.level === "warning"
                            ? "destructive"
                            : "secondary"
                        }
                        className="mb-1 text-xs"
                      >
                        {log.level}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {/* Create Manager removed (403 from backend) */}
              {/* Send Notification Dialog */}
              <Dialog open={isNotificationOpen} onOpenChange={setNotificationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm">
                    <Bell className="h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-center">Send Notification</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="sr-only">Send Notification</DialogTitle>
                  </DialogHeader>
                  {/* You can import and use your notification form here, or a placeholder */}
                  <div className="text-lg font-semibold mb-2">Send Notification</div>
                  <p>Notification form goes here.</p>
                </DialogContent>
              </Dialog>
              {/* View System Logs */}
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
                onClick={() => router.push("/admin/logs")}
              >
                <Activity className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-center">View System Logs</span>
              </Button>
              {/* Security Settings */}
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm"
                onClick={() => router.push("/admin/settings")}
              >
                <Shield className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-center">Security Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
