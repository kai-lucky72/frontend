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
import { Users, Clock, Calendar, Check, X, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add initial state for new client (from clients/page.tsx)
const initialNewClientState = {
  name: "",
  contact: "",
  address: "",
  policy: "",
  amount: 0,
  payingMethod: "cash",
  notes: "",
}

// --- Main Component ---
export default function AgentDashboard() {
  const [dashboardData, setDashboardData] = useState<IndividualAgentDashboardData | SalesAgentDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const { isAttendanceMarked, attendanceTime, refreshAttendanceStatus } = useAttendance()
  const { toast } = useToast()

  useEffect(() => {
    if (!isMock) {
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
    }
  }, [isMock])

  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState({ location: "", sector: "" })
  const [attendanceTimeframe, setAttendanceTimeframe] = useState<{ start: string; end: string }>({ start: "-", end: "-" })
  // Use the fetched attendanceTimeframe for all logic
  const [timeState, setTimeState] = useState({ isActive: false, isWarning: false, isExpired: false })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState(initialNewClientState)

  useEffect(() => {
    const checkTimeframe = () => {
      const now = new Date()
      const [startHour, startMinute] = attendanceTimeframe.start.split(":").map(Number)
      const [endHour, endMinute] = attendanceTimeframe.end.split(":").map(Number)

      const startTime = new Date(now)
      startTime.setHours(startHour, startMinute, 0, 0)

      const endTime = new Date(now)
      endTime.setHours(endHour, endMinute, 0, 0)

      const warningTime = new Date(endTime)
      warningTime.setMinutes(endTime.getMinutes() - 15)

      setTimeState({
        isActive: now >= startTime && now <= endTime,
        isWarning: now > warningTime && now <= endTime,
        isExpired: now > endTime,
      })
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

  // Add Client handler (from clients/page.tsx)
  const handleAddClient = async () => {
    if (!newClient.name || !newClient.contact || !newClient.policy) {
      toast({
        title: "Missing Required Fields",
        description: "Full Name, Contact, and Policy are required.",
        variant: "destructive",
      })
      return
    }
    try {
      // Use createClient from lib/api
      const clientToCreate = { ...newClient, status: "pending" }
      await import("@/lib/api").then(({ createClient }) => createClient(clientToCreate))
      setNewClient(initialNewClientState)
      setIsAddDialogOpen(false)
      toast({
        title: "Client Added Successfully",
        description: `${newClient.name} has been added to your list.`,
      })
    } catch (error) {
      toast({
        title: "Failed to Add Client",
        description: "An error occurred while adding the client. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAttendanceButton = () => {
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
    return (
      <Button size="lg" onClick={() => setIsAttendanceDialogOpen(true)} className={`w-full bg-red-600 hover:bg-red-700`} disabled={!timeState.isActive}>
        <Clock className="mr-2 h-5 w-5" />
        Mark Attendance
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

  // Mock data for both agent types
  const mockIndividualData: IndividualAgentDashboardData = {
    agentType: "individual",
    attendanceMarked: false,
    clientsThisMonth: 5,
    totalClients: 20,
    recentActivities: [
      { id: "1", description: "Collected 2 clients", timestamp: "2024-07-10 09:00" },
      { id: "2", description: "Marked attendance", timestamp: "2024-07-10 08:30" },
    ],
  };
  const mockSalesData: SalesAgentDashboardData = {
    agentType: "sales",
    attendanceMarked: true,
    clientsThisMonth: 10,
    totalClients: 50,
    groupName: "PrimeoSummit",
    teamLeader: "lucky kail",
    recentActivities: [
      { id: "1", description: "Collected 5 clients", timestamp: "2024-07-10 09:00" },
      { id: "2", description: "Group meeting", timestamp: "2024-07-09 15:00" },
    ],
  };
  const dataToUse = dashboardData;

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const handleAddMockData = () => {
    // Use the correct mock data based on agent type
    const agentType = dashboardData?.agentType || "individual";
    setDashboardData(agentType === "sales" ? mockSalesData : mockIndividualData)
    setIsMock(true)
    setError(null)
    setIsLoading(false)
  }
  const handleRemoveMockData = () => {
    setIsMock(false)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4 md:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg sm:text-xl font-semibold truncate">Agent Dashboard</h1>
        <div className="ml-auto flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-4">
          <span className="text-xs text-muted-foreground md:mr-2 hidden sm:block">Attendance Window: {attendanceTimeframe.start} - {attendanceTimeframe.end}</span>
          {getAttendanceButton()}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button size="sm" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3" variant="default" disabled={!(isAttendanceMarked || attendanceTime)}>
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add Client</span>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {!(isAttendanceMarked || attendanceTime)
                  ? "You must mark your attendance before adding clients."
                  : "Add a new client to your list."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add a New Client</DialogTitle>
                <DialogDescription>Fill in the details below. Required fields are marked with an asterisk (*).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="e.g., John Doe" className="h-10 sm:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact (Phone or Email) *</Label>
                    <Input id="contact" value={newClient.contact} onChange={e => setNewClient({ ...newClient, contact: e.target.value })} placeholder="e.g., +1-555-1234" className="h-10 sm:h-9" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })} placeholder="e.g., 123 Main St, Anytown, USA" className="h-10 sm:h-9" />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="policy">Policy / Insurance Type *</Label>
                    <Input id="policy" value={newClient.policy} onChange={e => setNewClient({ ...newClient, policy: e.target.value })} placeholder="e.g., Health Insurance" className="h-10 sm:h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" type="number" value={newClient.amount} onChange={e => setNewClient({ ...newClient, amount: parseFloat(e.target.value) || 0 })} placeholder="e.g., 250" className="h-10 sm:h-9" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="payingMethod">Paying Method</Label>
                    <select id="payingMethod" value={newClient.payingMethod} onChange={e => setNewClient({ ...newClient, payingMethod: e.target.value })} className="w-full border rounded px-3 py-2 h-10 sm:h-9 text-sm">
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={newClient.notes} onChange={e => setNewClient({ ...newClient, notes: e.target.value })} placeholder="Any additional information..." className="min-h-[80px]" />
                  </div>
                </div>
                <Button onClick={handleAddClient} className="w-full mt-4 h-10 sm:h-9" disabled={!(isAttendanceMarked || attendanceTime)}>Add Client</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
          {isMock ? (
            <Button variant="destructive" size="sm" onClick={handleRemoveMockData}>
              Remove Mock Data
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleAddMockData}>
              Add Mock Data
            </Button>
          )}
        </div>
      </header>
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-50 border-b text-sm">{error}</div>
      )}
      <main className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Always render both views, but pass fallback data if missing */}
        {((dashboardData && dashboardData.groupName) || (!dashboardData && false)) ? (
          <SalesAgentView data={dataToUse} />
        ) : (
          <IndividualAgentView data={dataToUse} />
        )}
      </main>
      {renderAttendanceDialog()}
    </div>
  );
}

// --- View Components ---

const IndividualAgentView: FC<{ data: IndividualAgentDashboardData }> = ({ data }) => {
  const { clientsThisMonth, totalClients, recentActivities } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentActivities.map((activity: Activity) => (
              <li key={activity.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
              </li>
            ))}
            {recentActivities.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No recent activities.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

const SalesAgentView: FC<{ data: SalesAgentDashboardData }> = ({ data }) => {
  const { groupName, teamLeader, clientsThisMonth, totalClients, recentActivities } = data
  const [userName, setUserName] = useState("Sales Agent")

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) setUserName(name)
  }, [])

  return (
    <div className="space-y-6">
      <AgentProfileCard agentName={userName} agentType="Sales Agent" groupName={groupName} teamLeader={teamLeader} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recentActivities.map((activity: Activity) => (
              <li key={activity.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
              </li>
            ))}
            {recentActivities.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No recent activities.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
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
