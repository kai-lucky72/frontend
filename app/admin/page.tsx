"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, Activity, Bell, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const systemMetrics = [
  { name: "Jan", users: 45, activity: 78 },
  { name: "Feb", users: 52, activity: 85 },
  { name: "Mar", users: 48, activity: 92 },
  { name: "Apr", users: 61, activity: 88 },
  { name: "May", users: 55, activity: 95 },
  { name: "Jun", users: 67, activity: 102 },
]

const userActivity = [
  { role: "Managers", count: 12, change: "+2" },
  { role: "Agents", count: 156, change: "+8" },
  { role: "Active Today", count: 89, change: "+12" },
  { role: "Notifications Sent", count: 234, change: "+45" },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Manager
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userActivity.map((stat, index) => (
            <Card key={stat.role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.role}</CardTitle>
                {index === 0 && <Users className="h-4 w-4 text-muted-foreground" />}
                {index === 1 && <Shield className="h-4 w-4 text-muted-foreground" />}
                {index === 2 && <Activity className="h-4 w-4 text-muted-foreground" />}
                {index === 3 && <Bell className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.change.startsWith("+") ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* System Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>User engagement and system usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  activity: {
                    label: "System Activity",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-users)"
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="activity"
                      stroke="var(--color-activity)"
                      strokeWidth={2}
                      name="System Activity"
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
              <div className="space-y-4">
                {[
                  { action: "New Manager Created", user: "John Smith", time: "2 minutes ago", type: "success" },
                  { action: "Agent Deactivated", user: "Sarah Johnson", time: "15 minutes ago", type: "warning" },
                  { action: "System Backup Completed", user: "System", time: "1 hour ago", type: "info" },
                  { action: "Password Reset", user: "Mike Wilson", time: "2 hours ago", type: "info" },
                  { action: "Notification Sent", user: "All Users", time: "3 hours ago", type: "success" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          activity.type === "success"
                            ? "default"
                            : activity.type === "warning"
                              ? "destructive"
                              : "secondary"
                        }
                        className="mb-1"
                      >
                        {activity.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Create Manager
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Bell className="h-6 w-6" />
                Send Notification
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Activity className="h-6 w-6" />
                View System Logs
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Shield className="h-6 w-6" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
