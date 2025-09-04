"use client"

import { useEffect, useState, ChangeEvent, FC } from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAttendance } from "@/contexts/AttendanceContext"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AgentProfileCard } from "@/components/ui/agent-profile-card"
import { getAgentDashboardData, getAgentAttendanceTimeframe, getAgentAttendanceStatus, markAgentAttendance } from "@/lib/api"
import { IndividualAgentDashboardData, SalesAgentDashboardData, Activity } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Clock, Calendar, Check, X, TrendingUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Removed client add state (feature deprecated)

// --- Main Component ---
export default function AgentDashboard() {
  const [dashboardData, setDashboardData] = useState<IndividualAgentDashboardData | SalesAgentDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // remove mock toggle
  const { isAttendanceMarked, attendanceTime, refreshAttendanceStatus } = useAttendance()
  const { toast } = useToast()

  useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true)
          const data = await getAgentDashboardData()
          setDashboardData(data)
          // Check attendance status for today
          const status = await getAgentAttendanceStatus()
          await refreshAttendanceStatus()
        } catch (err) {
          setError("Failed to load dashboard data. Please try refreshing the page.")
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchDashboardData()
  }, [])

  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState({ location: "", sector: "" })
  const [attendanceTimeframe, setAttendanceTimeframe] = useState<{ start: string; end: string }>({ start: "-", end: "-" })
  // Use the fetched attendanceTimeframe for all logic
  const [timeState, setTimeState] = useState({ isActive: false, isWarning: false, isExpired: false })
  

  useEffect(() => {
    const checkTimeframe = () => {
      // Don't check if timeframe is not loaded yet
      if (attendanceTimeframe.start === "-" || attendanceTimeframe.end === "-") {
        return
      }

      const now = new Date()
      
      // Parse time strings (handle "HH:MM AM/PM" format)
      const parseTime = (timeStr: string) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (match) {
          let hour = parseInt(match[1], 10)
          const minute = parseInt(match[2], 10)
          const period = match[3].toUpperCase()
          
          if (period === 'PM' && hour !== 12) {
            hour += 12
          } else if (period === 'AM' && hour === 12) {
            hour = 0
          }
          
          return { hour, minute }
        }
        
        // Fallback for "HH:MM" format
        const parts = timeStr.split(":")
        const hour = parseInt(parts[0], 10)
        const minute = parseInt(parts[1], 10)
        return { hour, minute }
      }

      try {
        const startTime = parseTime(attendanceTimeframe.start)
        const endTime = parseTime(attendanceTimeframe.end)

        const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.hour, startTime.minute)
        const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime.hour, endTime.minute)

        const warningTime = new Date(endDateTime)
        warningTime.setMinutes(endDateTime.getMinutes() - 15)

        console.log("Dashboard time check:", {
          now: now.toLocaleTimeString(),
          start: startDateTime.toLocaleTimeString(),
          end: endDateTime.toLocaleTimeString(),
          isActive: now >= startDateTime && now <= endDateTime,
          timeframe: attendanceTimeframe
        })

      setTimeState({
          isActive: now >= startDateTime && now <= endDateTime,
          isWarning: now > warningTime && now <= endDateTime,
          isExpired: now > endDateTime,
        })
      } catch (error) {
        console.error("Error parsing timeframe:", error)
        setTimeState({ isActive: false, isWarning: false, isExpired: false })
      }
    }

    checkTimeframe()
    const interval = setInterval(checkTimeframe, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [attendanceTimeframe.start, attendanceTimeframe.end])

  useEffect(() => {
    // Fetch attendance timeframe for agent
    getAgentAttendanceTimeframe().then(tf => {
      setAttendanceTimeframe({ start: tf.startTime, end: tf.endTime })
    }).catch(() => setAttendanceTimeframe({ start: "-", end: "-" }))
  }, [])

  // When attendance is marked, re-check status
  const handleMarkAttendance = async () => {
    if (!attendanceDetails.location || !attendanceDetails.sector) {
      toast({ title: "Missing Information", description: "Please provide both your work location and insurance sector.", variant: "destructive" })
      return
    }
    try {
      await markAgentAttendance({ location: attendanceDetails.location, sector: attendanceDetails.sector })
    setIsAttendanceDialogOpen(false)
      toast({ title: "Attendance Marked", description: `You have successfully marked your attendance.` })
      await refreshAttendanceStatus()
    } catch (err: any) {
      toast({ title: "Failed to mark attendance", description: err.message || "An error occurred.", variant: "destructive" })
    }
  }

  // Removed client add handler (feature deprecated)

  const getAttendanceButton = () => {
    console.log("Dashboard button state:", {
      isAttendanceMarked,
      attendanceTime,
      timeState,
      attendanceTimeframe,
      currentTime: new Date().toLocaleTimeString()
    })
    
    if (isAttendanceMarked || attendanceTime) {
      return (
        <Button size="lg" disabled className="w-full cursor-not-allowed">
          <Check className="mr-2 h-5 w-5" />
          Attendance Marked{attendanceTime ? ` at ${attendanceTime}` : ""}
        </Button>
      )
    }
    if (timeState.isExpired) {
      return (
        <Button size="lg" variant="destructive" disabled className="w-full cursor-not-allowed">
          <X className="mr-2 h-5 w-5" />
          Time Expired
        </Button>
      )
    }
    if (timeState.isActive) {
      console.log("Rendering ACTIVE attendance button")
      return (
        <Button size="lg" onClick={() => setIsAttendanceDialogOpen(true)} className={`w-full bg-primary hover:bg-primary/90`}>
          <Clock className="mr-2 h-5 w-5" />
          Mark Attendance
        </Button>
      )
    }
    console.log("Rendering DISABLED attendance button")
    return (
      <Button size="lg" disabled variant="outline" className={`w-full`}>
        <Clock className="mr-2 h-5 w-5" />
        Mark Attendance (Disabled)
      </Button>
    )
  }

  const renderAttendanceDialog = () => (
    <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Mark Your Attendance</DialogTitle>
          <DialogDescription>Please provide your work location and insurance sector for the day.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="location">Work Location</Label>
            <Input 
              id="location" 
              value={attendanceDetails.location} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAttendanceDetails({ ...attendanceDetails, location: e.target.value })} 
              placeholder="e.g., Downtown Office" 
              className="h-10 sm:h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Insurance Sector</Label>
            <Input 
              id="sector" 
              value={attendanceDetails.sector} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAttendanceDetails({ ...attendanceDetails, sector: e.target.value })} 
              placeholder="e.g., Life Insurance" 
              className="h-10 sm:h-9"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)} className="h-10 sm:h-9">Cancel</Button>
          <Button onClick={handleMarkAttendance} className="h-10 sm:h-9">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const dataToUse = dashboardData as any;

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Agent Dashboard</h1>
          <p className="text-sm opacity-90">Welcome back, {localStorage.getItem("userName") || "Agent"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-90 hidden sm:block">Attendance: {attendanceTimeframe.start} - {attendanceTimeframe.end}</span>
          {getAttendanceButton()}
        </div>
      </header>
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-50 border-b text-sm">{error}</div>
      )}
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Clients This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataToUse?.clientsThisMonth ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataToUse?.totalClients ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Performance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataToUse?.performanceRate ?? 0}%</div>
            </CardContent>
          </Card>
          <Card className="border border-primary/15">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => window.location.href = "/agent/clients"} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">My Clients</Button>
            </CardContent>
          </Card>
        </div>
        {/* Always render both views, but pass fallback data if missing */}
        {((dashboardData && (dashboardData as any).groupName) || (!dashboardData && false)) ? (
          <SalesAgentView data={dataToUse} />
        ) : (
          <IndividualAgentView data={dataToUse} />
        )}
      </div>
      {renderAttendanceDialog()}
    </div>
  );
}

// --- View Components ---

const IndividualAgentView: FC<{ data: IndividualAgentDashboardData }> = ({ data }) => {
  const { recentActivities } = data as any
  const [page, setPage] = useState<number>(1)
  const LIMIT = 5

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        
      </div>

      <Card className="border border-primary/15">
        <CardHeader>
          <CardTitle className="text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentActivities
              .slice((page - 1) * LIMIT, page * LIMIT)
              .map((activity: Activity) => (
              <li key={activity.id} className="flex items-center justify-between rounded-md border border-primary/10 p-3">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
              </li>
            ))}
            {recentActivities.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No recent activities.</p>}
          </ul>
          {recentActivities.length > LIMIT && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(recentActivities.length / LIMIT))}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="border-primary/20 text-primary hover:bg-primary/5">Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(Math.ceil(recentActivities.length / LIMIT), p + 1))} disabled={page >= Math.ceil(recentActivities.length / LIMIT)} className="border-primary/20 text-primary hover:bg-primary/5">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const SalesAgentView: FC<{ data: SalesAgentDashboardData }> = ({ data }) => {
  const { groupName, teamLeader, recentActivities } = data as any
  const [userName, setUserName] = useState("Sales Agent")
  const [page, setPage] = useState<number>(1)
  const LIMIT = 5

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
  }, [])

  return (
    <div className="space-y-6">
      <AgentProfileCard agentName={userName} agentType="Sales Agent" groupName={groupName} teamLeader={teamLeader} />
      
      <div className="grid gap-6 md:grid-cols-2">
        
      </div>

      <Card className="border border-primary/15">
        <CardHeader>
          <CardTitle className="text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentActivities
              .slice((page - 1) * LIMIT, page * LIMIT)
              .map((activity: Activity) => (
              <li key={activity.id} className="flex items-center justify-between rounded-md border border-primary/10 p-3">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
              </li>
            ))}
            {recentActivities.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No recent activities.</p>}
          </ul>
          {recentActivities.length > LIMIT && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(recentActivities.length / LIMIT))}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="border-primary/20 text-primary hover:bg-primary/5">Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(Math.ceil(recentActivities.length / LIMIT), p + 1))} disabled={page >= Math.ceil(recentActivities.length / LIMIT)} className="border-primary/20 text-primary hover:bg-primary/5">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <h1 className="text-xl font-semibold">Agent Dashboard</h1>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-64" />
          </div>
        </div>
      </main>
    </div>
  )
}
