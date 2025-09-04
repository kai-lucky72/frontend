"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // remove mock toggle
  const { toast } = useToast()

  // remove mock data

  useEffect(() => {
      const fetchPerformance = async () => {
        setLoading(true)
        setError(null)
        try {
          const token = localStorage.getItem('authToken')
          const res = await fetch(`https://apps.prime.rw/agentmanagementbackend/api/agent/performance?period=${selectedPeriod}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (!res.ok) throw new Error('Failed to fetch performance data')
          const data = await res.json()
          setPerformanceData(data)
        } catch (err: any) {
          setError(err.message || 'Failed to fetch performance data')
          toast({ title: 'Error', description: err.message, variant: 'destructive' })
        } finally {
          setLoading(false)
        }
      }
      fetchPerformance()
  }, [selectedPeriod])

  // removed mock toggles

  if (loading) return <div className="p-8 text-center">Loading performance data...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!performanceData) return <div className="p-8 text-center">No performance data available.</div>

  // Use real backend data with full structure
  const { agent, stats, chartData = [], trends, period, startDate, endDate } = performanceData;
  const agentName = agent ? `${agent.firstName} ${agent.lastName}` : 'Agent';

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">My Performance</h1>
          <p className="text-sm opacity-90">Review your attendance history</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-primary-foreground text-primary border-primary-foreground/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.attendanceRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Based on {stats?.totalAttendanceDays || 0} days</p>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Weekly Avg Hours</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.weeklyAvgHours?.toFixed?.(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Average hours present per week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trends?.weeklyGrowth?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Weekly performance growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.presentCount || 0}</div>
              <p className="text-xs text-muted-foreground">On-time attendance</p>
            </CardContent>
          </Card>
          {/* Late removed per backend contract */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.absentCount || 0}</div>
              <p className="text-xs text-muted-foreground">Missed days</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Info and Period Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
              <CardDescription>Your current profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{agentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Work ID</p>
                  {/* workId removed */}
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{agent?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground capitalize">{agent?.type || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Period Details</CardTitle>
              <CardDescription>Performance period information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{startDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{endDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Period</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedPeriod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Daily attendance status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
                  {/* Late removed per backend contract */}
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
