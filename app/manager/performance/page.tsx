"use client"

import React, { useState, useEffect } from "react"
import { Download, Users, User, MapPin, TrendingUp } from "lucide-react"
import * as Papa from "papaparse"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { getManagerPerformance } from "@/lib/api"

export default function ManagerPerformancePage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [period, setPeriod] = useState("monthly") // default to monthly
  const [isMock, setIsMock] = useState(false)

  // Mock data for demo/visual purposes
  const mockDashboardData = {
    stats: {
      totalClients: 1234,
      mostActiveLocation: "Lagos",
    },
    individualPerformance: [
      { name: "Jane Doe", clients: 120 },
      { name: "John Smith", clients: 110 },
      { name: "Alice Johnson", clients: 90 },
    ],
    groupPerformance: [
      { name: "Alpha Team", teamLeader: "Jane Doe", members: 8, clients: 400, membersList: ["Jane Doe", "Bob", "Alice"] },
      { name: "Beta Squad", teamLeader: "John Smith", members: 7, clients: 350, membersList: ["John Smith", "Eve", "Charlie"] },
      { name: "Gamma Group", teamLeader: "Alice Johnson", members: 6, clients: 300, membersList: ["Alice Johnson", "Mallory", "Oscar"] },
    ],
    clientsCollected: [
      { name: "Jane Doe", group: "Alpha Team", clients: 120 },
      { name: "John Smith", group: "Beta Squad", clients: 110 },
      { name: "Alice Johnson", group: "Gamma Group", clients: 90 },
    ],
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

  const handleExport = () => {
    if (!dashboardData?.clientsCollected) return
    
    const csv = Papa.unparse(dashboardData.clientsCollected)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `performance_report_${period}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  // Map backend data to frontend format
  const kpiData = {
    totalClients: dashboardData.stats?.totalClients || 0,
    topAgent: dashboardData.individualPerformance?.[0] || { name: "-", clients: 0 },
    topGroup: dashboardData.groupPerformance?.[0] || { name: "-", clients: 0 },
    topLocation: dashboardData.stats?.mostActiveLocation || "-",
  }

  const groupPerformanceData = dashboardData.groupPerformance?.map((g: any, idx: number) => ({
    id: g.name || idx,
    name: g.name,
    leader: g.teamLeader || "-",
    membersCount: g.members || 0,
    totalClients: g.clients,
    members: g.membersList || [],
  })) || []

  const individualAgentData = dashboardData.individualPerformance || []

  const clientsCollectedData = dashboardData.clientsCollected || []

  // Create chart data from group performance
  const groupChartData = dashboardData.groupPerformance?.map((group: any) => ({
    name: group.name,
    clients: group.clients || 0,
  })) || []

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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients Collected</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Agent</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topAgent.name}</div>
            <p className="text-xs text-muted-foreground">{kpiData.topAgent.clients} clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Group</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topGroup.name}</div>
            <p className="text-xs text-muted-foreground">{kpiData.topGroup.clients} clients</p>
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
          <TabsTrigger value="clients_collected">Clients Collected</TabsTrigger>
        </TabsList>

        {/* Group Performance Tab */}
        <TabsContent value="group_performance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Group Breakdown</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Team Leader</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Total Clients</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupPerformanceData.map((group: any, groupIdx: number) => (
                    <React.Fragment key={group.id || group.name || groupIdx}>
                      <TableRow key={`group-${group.id || group.name || groupIdx}`} className="cursor-pointer" onClick={() => toggleGroupExpansion(group.id)}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.leader}</TableCell>
                        <TableCell>{group.membersCount}</TableCell>
                        <TableCell className="text-right">{group.totalClients}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            {expandedGroup === group.id ? 'Hide' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedGroup === group.id && (
                        <TableRow key={`expanded-${group.id || group.name || groupIdx}`}>
                          <TableCell colSpan={5}>
                            <div className="p-4 bg-muted rounded-md">
                              <h4 className="font-semibold mb-2">Members of {group.name}</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Member Name</TableHead>
                                    <TableHead className="text-right">Clients Collected</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.members.map((member: any, memberIdx: number) => (
                                    <TableRow key={member.id || member.name || memberIdx}>
                                      <TableCell>{member.name}</TableCell>
                                      <TableCell className="text-right">{member.clients}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="col-span-3 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Group Performance Chart</h3>
              <ChartContainer
                config={{
                  clients: { label: "Clients", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px]"
              >
                <BarChart data={groupChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="clients" fill="var(--color-primary)" radius={8} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>

        {/* Individual Agent Performance Tab */}
        <TabsContent value="individual_performance">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Individual Agent Performance</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Clients Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individualAgentData.map((agent: any, agentIdx: number) => (
                  <TableRow key={agent.id ? `agent-${agent.id}` : `agent-idx-${agentIdx}`} className="cursor-pointer">
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.clients}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Clients Collected Tab */}
        <TabsContent value="clients_collected">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Clients Collected</h3>
              <Button onClick={handleExport} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report (CSV)
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Client Name</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">National ID</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Phone</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Client Location</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Date of Birth</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Insurance Type</TableHead>
                    <TableHead className="px-2 py-2 text-right whitespace-nowrap">Amount</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Payment Method</TableHead>
                    <TableHead className="px-2 py-2 text-right whitespace-nowrap">Contract (Yrs)</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Agent</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Agent Work Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsCollectedData.map((client: any, clientIdx: number) => (
                    <TableRow key={client.nationalId ? `client-${client.nationalId}` : client.fullName ? `client-name-${client.fullName}-${clientIdx}` : clientIdx}>
                      <TableCell className="px-2 py-2 font-medium whitespace-nowrap">{client.fullName}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.nationalId}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.phoneNumber}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.location}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.dateOfBirth}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.insuranceType}</TableCell>
                      <TableCell className="px-2 py-2 text-right whitespace-nowrap">
                        {typeof client.payingAmount === 'number' ? `$${client.payingAmount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.payingMethod}</TableCell>
                      <TableCell className="px-2 py-2 text-right whitespace-nowrap">{client.contractYears}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.agentName}</TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap">{client.agentWorkLocation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
