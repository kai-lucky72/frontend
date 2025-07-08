"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Target, Clock, TrendingUp, UserPlus, Group, MapPin } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const performanceData = [
  { name: "Mon", individual: 12, group: 18 },
  { name: "Tue", individual: 15, group: 22 },
  { name: "Wed", individual: 8, group: 16 },
  { name: "Thu", individual: 20, group: 25 },
  { name: "Fri", individual: 18, group: 28 },
  { name: "Sat", individual: 14, group: 20 },
  { name: "Sun", individual: 10, group: 15 },
]

const groupPerformance = [
  { name: "Alpha Team", value: 85, color: "#8884d8" },
  { name: "Beta Team", value: 72, color: "#82ca9d" },
  { name: "Gamma Team", value: 91, color: "#ffc658" },
  { name: "Delta Team", value: 68, color: "#ff7c7c" },
]

const agentStats = [
  { name: "Total Agents", value: 24, change: "+3", icon: Users },
  { name: "Active Today", value: 18, change: "+2", icon: Clock },
  { name: "Clients Collected", value: 156, change: "+12", icon: Target },
  { name: "Groups", value: 4, change: "0", icon: Group },
]

export default function ManagerDashboard() {
  const [attendanceTimeframe, setAttendanceTimeframe] = useState({
    startTime: "06:00",
    endTime: "09:00",
  })
  const [isTimeframeDialogOpen, setIsTimeframeDialogOpen] = useState(false)
  const [tempTimeframe, setTempTimeframe] = useState(attendanceTimeframe)
  const { toast } = useToast()

  const handleUpdateTimeframe = () => {
    setAttendanceTimeframe(tempTimeframe)
    setIsTimeframeDialogOpen(false)
    toast({
      title: "Timeframe Updated",
      description: `Attendance window updated to ${tempTimeframe.startTime} - ${tempTimeframe.endTime}`,
    })
  }

  const handleTimeframeDialogOpen = (open: boolean) => {
    setIsTimeframeDialogOpen(open)
    if (open) {
      setTempTimeframe(attendanceTimeframe)
    }
  }

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
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {agentStats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  {stat.change} from yesterday
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Individual vs Group agent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  individual: {
                    label: "Individual Agents",
                    color: "hsl(var(--chart-1))",
                  },
                  group: {
                    label: "Group Agents",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="individual" fill="var(--color-individual)" name="Individual" />
                    <Bar dataKey="group" fill="var(--color-group)" name="Group" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Group Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Group Performance</CardTitle>
              <CardDescription>Team efficiency ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupPerformance.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{group.name}</span>
                      <span className="font-medium">{group.value}%</span>
                    </div>
                    <Progress value={group.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Activities</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    agent: "John Doe",
                    action: "Marked attendance",
                    location: "Downtown",
                    time: "8:30 AM",
                    status: "success",
                  },
                  {
                    agent: "Sarah Smith",
                    action: "Collected 3 clients",
                    location: "Uptown",
                    time: "9:15 AM",
                    status: "success",
                  },
                  {
                    agent: "Mike Johnson",
                    action: "Late attendance",
                    location: "Midtown",
                    time: "9:45 AM",
                    status: "warning",
                  },
                  {
                    agent: "Lisa Brown",
                    action: "Collected 5 clients",
                    location: "Eastside",
                    time: "10:20 AM",
                    status: "success",
                  },
                  {
                    agent: "Tom Wilson",
                    action: "Marked attendance",
                    location: "Westside",
                    time: "8:15 AM",
                    status: "success",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.agent}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {activity.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.status === "success" ? "default" : "destructive"} className="mb-1">
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Current attendance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Attendance Rate</span>
                  <span className="text-2xl font-bold text-green-600">75%</span>
                </div>
                <Progress value={75} className="h-3" />

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-xs text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
                    <div className="text-2xl font-bold text-red-600">6</div>
                    <div className="text-xs text-muted-foreground">Absent</div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="text-sm font-medium">Attendance Timeframe</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Window:</span>
                    <Badge variant="outline">
                      {attendanceTimeframe.startTime} - {attendanceTimeframe.endTime}
                    </Badge>
                  </div>

                  <Dialog open={isTimeframeDialogOpen} onOpenChange={handleTimeframeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Clock className="h-4 w-4 mr-2" />
                        Update Timeframe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Attendance Timeframe</DialogTitle>
                        <DialogDescription>Set the time window for agent attendance tracking.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="startTime" className="text-right">
                            Start Time
                          </Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={tempTimeframe.startTime}
                            onChange={(e) => setTempTimeframe((prev) => ({ ...prev, startTime: e.target.value }))}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="endTime" className="text-right">
                            End Time
                          </Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={tempTimeframe.endTime}
                            onChange={(e) => setTempTimeframe((prev) => ({ ...prev, endTime: e.target.value }))}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTimeframeDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleUpdateTimeframe}>
                          Update Timeframe
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
