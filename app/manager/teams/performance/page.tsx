"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, LineChart } from "recharts"
import { getAllTeamsPerformance, getTeamPerformance } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, Users, Target, Calendar } from "lucide-react"

export default function TeamsPerformancePage() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("weekly")
  const [teamsData, setTeamsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog state for individual team view
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [teamDetails, setTeamDetails] = useState<any | null>(null)
  const [loadingTeamDetails, setLoadingTeamDetails] = useState(false)

  useEffect(() => {
    const fetchTeamsPerformance = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllTeamsPerformance(selectedPeriod)
        console.log('Teams performance data:', data) // Debug log
        setTeamsData(Array.isArray(data) ? data : [])
      } catch (err: any) {
        setError(err?.userFriendly || err?.message || "Failed to load teams performance")
        toast({ title: "Error", description: err?.userFriendly || err?.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchTeamsPerformance()
  }, [selectedPeriod])

  const handleViewTeamDetails = async (team: any) => {
    setSelectedTeam(team)
    setIsTeamDialogOpen(true)
    setLoadingTeamDetails(true)
    try {
      // Use team.id or team.team.id or fallback to team index
      const teamId = team.id || team.team?.id || team.teamId
      console.log('Team object:', team) // Debug log
      console.log('Extracted team ID:', teamId) // Debug log
      if (!teamId) {
        throw new Error("No valid team ID found")
      }
      const details = await getTeamPerformance(teamId, selectedPeriod)
      setTeamDetails(details)
    } catch (err: any) {
      console.log('Individual team endpoint failed, using team data directly:', err)
      // Fallback: use the team data directly if individual endpoint fails
      setTeamDetails(team)
      toast({ 
        title: "Using overview data", 
        description: "Individual team details unavailable, showing overview data instead." 
      })
    } finally {
      setLoadingTeamDetails(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading teams performance...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Teams Performance</h1>
          <p className="text-sm opacity-90">Overview of all teams performance</p>
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
        {/* Teams Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamsData.length}</div>
              <p className="text-xs text-muted-foreground">Active teams</p>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Avg Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamsData.length > 0 
                  ? (teamsData.reduce((sum, team) => sum + (team.stats?.attendanceRate || 0), 0) / teamsData.length).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Team average</p>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Clients</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamsData.reduce((sum, team) => sum + (team.stats?.totalClients || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">All teams combined</p>
            </CardContent>
          </Card>
        </div>

        {/* Teams Performance Table */}
        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Teams Performance</CardTitle>
            <CardDescription>Performance overview for all teams</CardDescription>
          </CardHeader>
          <CardContent>
            {teamsData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No teams found.</div>
            ) : (
              <div className="rounded-md border border-primary/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary font-medium">Team</TableHead>
                      <TableHead className="text-primary font-medium">Leader</TableHead>
                      <TableHead className="text-primary font-medium">Members</TableHead>
                      <TableHead className="text-primary font-medium">Attendance Rate</TableHead>
                      <TableHead className="text-primary font-medium">Total Clients</TableHead>
                      <TableHead className="text-primary font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamsData.map((team, index) => (
                      <TableRow key={team.id || team.team?.id || team.teamId || index}>
                        <TableCell>
                          <div className="font-medium">{team.team?.name || `Team ${team.id}`}</div>
                        </TableCell>
                        <TableCell>
                          {team.team?.leader ? 
                            `${team.team.leader.firstName} ${team.team.leader.lastName}` : 
                            "N/A"
                          }
                        </TableCell>
                        <TableCell>{team.team?.memberCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {team.stats?.attendanceRate?.toFixed(1) || 0}%
                            </div>
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(100, team.stats?.attendanceRate || 0)}%` }} 
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{team.stats?.totalClients || 0}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewTeamDetails(team)}
                            className="border-primary/20 text-primary hover:bg-primary/5"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Details Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Performance Details</DialogTitle>
            <DialogDescription>
              {selectedTeam ? `${selectedTeam.team?.name || `Team ${selectedTeam.id}`} - ${selectedPeriod} performance` : ""}
            </DialogDescription>
          </DialogHeader>
          {loadingTeamDetails ? (
            <div className="text-center py-6">Loading team details...</div>
          ) : teamDetails ? (
            <div className="space-y-6">
              {/* Team Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamDetails.stats?.attendanceRate?.toFixed(1) || 0}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamDetails.stats?.totalClients || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamDetails.stats?.presentCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamDetails.stats?.absentCount || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Attendance Days</TableHead>
                          <TableHead>Clients Collected</TableHead>
                          <TableHead>Attendance Rate</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamDetails.members?.map((member: any, idx: number) => (
                          <TableRow key={member.id || idx}>
                            <TableCell>{member.firstName} {member.lastName}</TableCell>
                            <TableCell>{member.attendanceDays || 0}</TableCell>
                            <TableCell>{member.clientsCollected || 0}</TableCell>
                            <TableCell>{member.attendanceRate?.toFixed(1) || 0}%</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded ${member.isLeader ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                {member.isLeader ? 'Leader' : 'Member'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Chart */}
              {teamDetails.chartData && teamDetails.chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={teamDetails.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                        <Line type="monotone" dataKey="clients" stroke="#3b82f6" name="Clients" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">No team details available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
