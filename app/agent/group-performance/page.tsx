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
import { TrendingUp, Target, Users, Crown, Download, Trophy } from "lucide-react"
import { useState, useEffect } from "react"

const groupPerformanceData = [
  { name: "Week 1", clients: 185, target: 200 },
  { name: "Week 2", clients: 210, target: 200 },
  { name: "Week 3", clients: 195, target: 200 },
  { name: "Week 4", clients: 225, target: 200 },
]

const teamMembersData = [
  { name: "John Doe", clients: 45, target: 50, rate: 90, isTeamLeader: true },
  { name: "Sarah Smith", clients: 38, target: 40, rate: 95, isTeamLeader: false },
  { name: "Mike Johnson", clients: 42, target: 45, rate: 93, isTeamLeader: false },
  { name: "Lisa Brown", clients: 35, target: 40, rate: 87, isTeamLeader: false },
  { name: "Tom Davis", clients: 28, target: 35, rate: 80, isTeamLeader: false },
]

export default function GroupPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [groupName, setGroupName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get user info from localStorage
    const storedGroupName = localStorage.getItem("groupName") || "Alpha Team"
    const storedEmail = localStorage.getItem("userEmail") || "user@company.com"
    setGroupName(storedGroupName)
    setUserEmail(storedEmail)
  }, [])

  const totalClients = teamMembersData.reduce((sum, member) => sum + member.clients, 0)
  const totalTarget = teamMembersData.reduce((sum, member) => sum + member.target, 0)
  const groupAverageRate = Math.round((totalClients / totalTarget) * 100)
  const teamLeader = teamMembersData.find((member) => member.isTeamLeader)

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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Group Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupAverageRate}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Above target
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <div className="text-xs text-muted-foreground">Target: {totalTarget}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembersData.length}</div>
              <div className="text-xs text-muted-foreground">Active agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#2</div>
              <div className="text-xs text-muted-foreground">Out of 8 teams</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Group Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Group Performance Trends</CardTitle>
              <CardDescription>Your team's collective client collection progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  clients: { label: "Clients Collected", color: "hsl(var(--chart-1))" },
                  target: { label: "Target", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="target" fill="var(--color-target)" opacity={0.3} />
                    <Bar dataKey="clients" fill="var(--color-clients)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

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
                      <span>Performance:</span>
                      <span className="font-medium">{teamLeader.rate}%</span>
                    </div>
                    <Progress value={teamLeader.rate} />

                    <div className="flex justify-between text-sm">
                      <span>Clients:</span>
                      <span className="font-medium">
                        {teamLeader.clients}/{teamLeader.target}
                      </span>
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
              {teamMembersData.map((member, index) => (
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {member.clients}/{member.target} clients
                      </div>
                      <div className="text-xs text-muted-foreground">{member.rate}% of target</div>
                    </div>
                    <div className="w-24">
                      <Progress value={member.rate > 100 ? 100 : member.rate} />
                    </div>
                    <Badge variant={member.rate >= 90 ? "default" : member.rate >= 80 ? "secondary" : "destructive"}>
                      {member.rate >= 90 ? "Excellent" : member.rate >= 80 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Group Goals and Achievements */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Group Goals</CardTitle>
              <CardDescription>Current objectives and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Monthly Target</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Collect 800 clients as a team</p>
                  <div className="flex justify-between text-sm">
                    <span>Progress: {totalClients}/800</span>
                    <span>{Math.round((totalClients / 800) * 100)}%</span>
                  </div>
                  <Progress value={(totalClients / 800) * 100} className="mt-2" />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Team Ranking</h4>
                    <Badge variant="default">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Reach top 3 in company rankings</p>
                  <div className="flex justify-between text-sm">
                    <span>Current: #2</span>
                    <span>Goal achieved!</span>
                  </div>
                  <Progress value={100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Group Activities</CardTitle>
              <CardDescription>Latest team achievements and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    activity: "Team exceeded weekly target",
                    details: "225 clients collected (target: 200)",
                    time: "2 days ago",
                    type: "success",
                  },
                  {
                    activity: "New team member joined",
                    details: "Tom Davis added to Alpha Team",
                    time: "1 week ago",
                    type: "info",
                  },
                  {
                    activity: "Team ranking improved",
                    details: "Moved from #3 to #2 position",
                    time: "1 week ago",
                    type: "success",
                  },
                  {
                    activity: "Monthly target updated",
                    details: "Target increased to 800 clients",
                    time: "2 weeks ago",
                    type: "info",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.type === "success" ? "default" : "secondary"} className="mb-1">
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
      </div>
    </div>
  )
}
