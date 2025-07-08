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
import { TrendingUp, Target, Award, Calendar, Download, Trophy } from "lucide-react"
import { useState } from "react"

const weeklyData = [
  { name: "Mon", clients: 4, target: 6 },
  { name: "Tue", clients: 6, target: 6 },
  { name: "Wed", clients: 3, target: 6 },
  { name: "Thu", clients: 8, target: 6 },
  { name: "Fri", clients: 5, target: 6 },
  { name: "Sat", clients: 7, target: 6 },
  { name: "Sun", clients: 2, target: 6 },
]

const monthlyData = [
  { name: "Week 1", clients: 35, target: 40 },
  { name: "Week 2", clients: 42, target: 40 },
  { name: "Week 3", clients: 38, target: 40 },
  { name: "Week 4", clients: 45, target: 40 },
]

const achievements = [
  { title: "Top Performer", description: "Exceeded monthly target by 15%", date: "2024-01-15", type: "gold" },
  { title: "Consistency Award", description: "5 days perfect attendance", date: "2024-01-10", type: "silver" },
  { title: "Client Champion", description: "50+ clients collected", date: "2024-01-05", type: "bronze" },
]

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")

  const currentData = selectedPeriod === "weekly" ? weeklyData : monthlyData

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">My Performance</h1>
          <p className="text-sm text-muted-foreground">Track your performance metrics and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5/6</div>
              <Progress value={83.3} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">83% of daily target</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Target</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35/40</div>
              <Progress value={87.5} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">87.5% completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142/160</div>
              <Progress value={88.75} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">88.75% completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#3</div>
              <div className="text-xs text-muted-foreground">Out of 24 agents</div>
              <Badge variant="default" className="mt-1">
                Top 15%
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Your client collection progress over time</CardDescription>
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
                  <BarChart data={currentData}>
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

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div
                      className={`p-2 rounded-full ${
                        achievement.type === "gold"
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : achievement.type === "silver"
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-orange-100 dark:bg-orange-900"
                      }`}
                    >
                      <Trophy
                        className={`h-4 w-4 ${
                          achievement.type === "gold"
                            ? "text-yellow-600"
                            : achievement.type === "silver"
                              ? "text-gray-600"
                              : "text-orange-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">85%</div>
                    <div className="text-xs text-muted-foreground">Above average</div>
                  </div>
                </div>
                <Progress value={85} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">95%</div>
                    <div className="text-xs text-muted-foreground">Excellent</div>
                  </div>
                </div>
                <Progress value={95} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Target Achievement</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">112%</div>
                    <div className="text-xs text-muted-foreground">Exceeding target</div>
                  </div>
                </div>
                <Progress value={100} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Client Satisfaction</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">4.8/5</div>
                    <div className="text-xs text-muted-foreground">Excellent rating</div>
                  </div>
                </div>
                <Progress value={96} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Your current objectives and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Monthly Target</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Collect 160 clients this month</p>
                  <div className="flex justify-between text-sm">
                    <span>Progress: 142/160</span>
                    <span>88.75%</span>
                  </div>
                  <Progress value={88.75} className="mt-2" />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Attendance Goal</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Maintain 95% attendance rate</p>
                  <div className="flex justify-between text-sm">
                    <span>Current: 95%</span>
                    <span>Goal achieved!</span>
                  </div>
                  <Progress value={100} className="mt-2" />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Team Ranking</h4>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Reach top 3 in team rankings</p>
                  <div className="flex justify-between text-sm">
                    <span>Current: #3</span>
                    <span>Goal achieved!</span>
                  </div>
                  <Progress value={100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
