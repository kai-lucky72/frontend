"use client"

import React, { useState, useEffect } from "react"
import { User, MapPin, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { getManagerPerformance } from "@/lib/api"

export default function ManagerPerformancePage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [period, setPeriod] = useState("monthly") // default to monthly
  const [isMock, setIsMock] = useState(false)

  // Mock data for demo/visual purposes (attendance-focused)
  const mockDashboardData = {
    stats: {
      mostActiveLocation: "Lagos",
    },
    individualPerformance: [],
    groupPerformance: [],
  }

  useEffect(() => {
    if (!isMock) {
      async function fetchData() {
        setLoading(true)
        setError(null)
        try {
          const data = await getManagerPerformance(period)
          setDashboardData(data)
        } catch (err) {
          setError("Failed to load performance data.")
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [period, isMock])

  const handleAddMockData = () => {
    setDashboardData(mockDashboardData)
    setError(null)
    setLoading(false)
    setIsMock(true)
  }

  const handleRemoveMockData = () => {
    setIsMock(false)
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId)
  }

  if (loading) {
    return <div className="p-8">Loading performance data...</div>
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  if (!dashboardData) {
    return <div className="p-8">No performance data available.</div>
  }

  // Map backend data to frontend format (placeholders for attendance-focused KPIs)
  const kpiData = {
    topAgent: dashboardData.individualPerformance?.[0] || { name: "-" },
    topGroup: dashboardData.groupPerformance?.[0] || { name: "-" },
    topLocation: dashboardData.stats?.mostActiveLocation || "-",
  }

  const groupPerformanceData = dashboardData.groupPerformance?.map((g: any, idx: number) => ({
    id: g.name || idx,
    name: g.name,
    leader: g.teamLeader || "-",
    membersCount: g.members || 0,
    members: g.membersList || [],
  })) || []

  const individualAgentData = dashboardData.individualPerformance || []

  // Period options - matching backend expectations
  const periodOptions = [
    { value: "weekly", label: "Last 7 days" },
    { value: "monthly", label: "Last 30 days" },
    { value: "all_time", label: "All Time" },
  ]

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Add Mock Data Button */}
      <div className="mb-4 flex justify-end">
        {isMock ? (
          <Button variant="destructive" onClick={handleRemoveMockData}>
            Remove Mock Data
          </Button>
        ) : (
          <Button variant="outline" onClick={handleAddMockData}>
            Add Mock Data
          </Button>
        )}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards (attendance-focused) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Agent</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topAgent.name}</div>
            <p className="text-xs text-muted-foreground">Top agent by attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Group</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topGroup.name}</div>
            <p className="text-xs text-muted-foreground">Best attendance group</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topLocation}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="group_performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="group_performance">Group Performance</TabsTrigger>
          <TabsTrigger value="individual_performance">Individual Agent Performance</TabsTrigger>
        </TabsList>

        {/* Group Performance Tab */}
        <TabsContent value="group_performance" className="space-y-4">
          <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Group Breakdown</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Team Leader</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupPerformanceData.map((group: any, groupIdx: number) => (
                  <TableRow key={group.id || group.name || groupIdx} className="cursor-pointer" onClick={() => toggleGroupExpansion(group.id)}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.leader}</TableCell>
                    <TableCell className="text-right">{group.membersCount}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
          </div>
        </TabsContent>

        {/* Individual Agent Performance Tab */}
        <TabsContent value="individual_performance">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Individual Agent Performance</h3>
            <p className="text-sm text-muted-foreground">Attendance-based performance coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
