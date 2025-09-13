"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { getGroupPerformance, getTeamLeaderPerformance } from "@/lib/api"

export default function TeamLeaderPage() {
  const { toast } = useToast()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Try new team performance endpoint first, fallback to group performance
        const res = await getTeamLeaderPerformance("weekly")
        setData(res)
      } catch (e: any) {
        // Fallback to old endpoint if new one fails
        try {
          const res = await getGroupPerformance()
          setData(res)
        } catch (fallbackError: any) {
          setError(fallbackError?.userFriendly || fallbackError?.message || "Failed to load team data")
          toast({ title: "Error", description: fallbackError?.userFriendly || fallbackError?.message, variant: "destructive" })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading team data...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!data || (!data.teamLeader?.isTeamLeader && !data.team?.leader)) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">My Team</h1>
            <p className="text-sm opacity-90">You are not assigned as a team leader.</p>
          </div>
        </header>
        <div className="p-8 text-center text-muted-foreground">No team leadership assigned.</div>
      </div>
    )
  }

  const kpis = data.kpis || {}
  const leader = data.teamLeader || data.team?.leader || {}
  const members = Array.isArray(data.teamMembers) ? data.teamMembers : Array.isArray(data.members) ? data.members : []
  const trends = Array.isArray(data.performanceTrends) ? data.performanceTrends : []
  const chartData = Array.isArray(data.chartData) ? data.chartData : []

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{data.team?.name || data.groupName || "My Team"}</h1>
          <p className="text-sm opacity-90">Leader: {leader.firstName ? `${leader.firstName} ${leader.lastName}` : leader.name}</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Total Clients</CardTitle>
              <CardDescription>Team-wide totals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats?.totalClients ?? kpis.totalClients ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Team Members</CardTitle>
              <CardDescription>Count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.team?.memberCount ?? kpis.teamMembersCount ?? members.length}</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Attendance Rate</CardTitle>
              <CardDescription>Team average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats?.attendanceRate?.toFixed(1) ?? kpis?.teamRank?.rank ?? "-"}%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Members</CardTitle>
            <CardDescription>Assigned agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-primary/10 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-primary font-medium">Name</TableHead>
                    <TableHead className="text-primary font-medium">Clients</TableHead>
                    <TableHead className="text-primary font-medium">Attendance Rate</TableHead>
                    <TableHead className="text-primary font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m: any, idx: number) => (
                    <TableRow key={`${String(m.id)}-${idx}`}>
                      <TableCell>{m.firstName ? `${m.firstName} ${m.lastName}` : m.name}</TableCell>
                      <TableCell>{m.clientsCollected ?? m.clients ?? 0}</TableCell>
                      <TableCell>{m.attendanceRate?.toFixed(1) ?? m.rate ?? 0}%</TableCell>
                      <TableCell>{m.isLeader || m.isTeamLeader ? "Leader" : "Member"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        {chartData.length > 0 ? (
          <Card className="border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Daily Performance</CardTitle>
              <CardDescription>Attendance and clients by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clients" fill="#3b82f6" name="Clients" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : trends.length > 0 ? (
          <Card className="border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Performance Trends</CardTitle>
              <CardDescription>Attendance/clients by period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="clients" fill="#3b82f6" name="Clients" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}


