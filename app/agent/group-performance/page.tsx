"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Users, Crown, Download, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function GroupPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [groupName, setGroupName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [groupData, setGroupData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get user info from localStorage
    const storedGroupName = localStorage.getItem("groupName") || "Unknown Group"
    const storedEmail = localStorage.getItem("userEmail") || "user@company.com"
    setGroupName(storedGroupName)
    setUserEmail(storedEmail)
  }, [])

  useEffect(() => {
    const fetchGroupPerformance = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('authToken')
        const res = await fetch(`http://localhost:5238/api/agent/group-performance?period=${selectedPeriod}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch group performance data')
        const data = await res.json()
        setGroupData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch group performance data')
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchGroupPerformance()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Group Performance - {groupName}</h1>
            <p className="text-sm text-muted-foreground">Track your team's collective performance and rankings</p>
          </div>
        </header>
        <div className="flex-1 space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Group Performance - {groupName}</h1>
            <p className="text-sm text-muted-foreground">Track your team's collective performance and rankings</p>
          </div>
        </header>
        <div className="flex-1 space-y-6 p-6">
          <Card className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">Error</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!groupData) {
    return (
      <div className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Group Performance - {groupName}</h1>
            <p className="text-sm text-muted-foreground">Track your team's collective performance and rankings</p>
          </div>
        </header>
        <div className="flex-1 space-y-6 p-6">
          <Card className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">No Data Available</p>
              <p className="text-muted-foreground">Group performance data is not available at the moment.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Extract data from backend response
  const { kpis, teamLeader, teamMembers = [], recentActivities = [] } = groupData

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Group Performance - {groupName}</h1>
          <p className="text-sm text-muted-foreground">Track your team's collective performance and rankings</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Group Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.totalClients || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis?.teamMembersCount || 0}</div>
              <div className="text-xs text-muted-foreground">Active agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{kpis?.teamRank?.rank || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Out of {kpis?.teamRank?.total || 0} teams</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Team Leader Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Team Leader
              </CardTitle>
              <CardDescription>Your group leader and contact person</CardDescription>
            </CardHeader>
            <CardContent>
              {teamLeader && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{teamLeader.name}</h4>
                      <p className="text-sm text-muted-foreground">Team Leader</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Clients:</span>
                      <span className="font-medium">{teamLeader.clients}</span>
                    </div>

                    <Badge variant="default" className="w-full justify-center">
                      Leading by Example
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members Performance</CardTitle>
            <CardDescription>Individual performance of all team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {member.isTeamLeader && <Crown className="h-4 w-4 text-yellow-600" />}
                      {member.name.toLowerCase().includes(userEmail.split("@")[0].toLowerCase()) && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{member.clients} clients</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Group Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Group Activities</CardTitle>
            <CardDescription>Latest team achievements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        Activity
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No recent activities available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
