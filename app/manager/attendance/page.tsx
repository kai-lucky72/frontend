"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getManagerAttendance, updateManagerTimeframe } from "@/lib/api"

interface AttendanceRecord {
  id: string
  agentName: string
  workId: string
  date: string
  timeIn: string
  location: string
  status: "present" | "late" | "absent"
  sector: string
}

export default function AttendancePage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isTimeframeDialogOpen, setIsTimeframeDialogOpen] = useState(false)
  const [tempTimeframe, setTempTimeframe] = useState({ startTime: "06:00", endTime: "09:00" })
  const [updatingTimeframe, setUpdatingTimeframe] = useState(false)
  const { toast } = useToast()

  // Fetch attendance for selected date
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const data = await getManagerAttendance(dateStr)
        setAttendanceData(data)
        if (data?.stats?.timeframe) {
          setTempTimeframe(data.stats.timeframe)
        }
      } catch (err) {
        setError("Failed to load attendance data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    // Prevent selecting future dates
    const now = new Date()
    if (date > now) {
      toast({
        title: "Invalid Date",
        description: "Cannot select a future date.",
        variant: "destructive",
      })
      return
    }
    setSelectedDate(date)
  }

  const handleUpdateTimeframe = async () => {
    // Validate timeframe
    if (tempTimeframe.startTime >= tempTimeframe.endTime) {
      toast({
        title: "Invalid Timeframe",
        description: "Start time must be before end time.",
        variant: "destructive",
      })
      return
    }

    setUpdatingTimeframe(true)
    try {
      await updateManagerTimeframe(tempTimeframe)
      setIsTimeframeDialogOpen(false)
      toast({
        title: "Timeframe Updated",
        description: `Attendance window updated to ${tempTimeframe.startTime} - ${tempTimeframe.endTime}`,
      })
      // Refresh attendance data to get updated timeframe
      const data = await getManagerAttendance()
      setAttendanceData(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update timeframe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingTimeframe(false)
    }
  }

  const handleTimeframeDialogOpen = (open: boolean) => {
    setIsTimeframeDialogOpen(open)
    if (open && attendanceData?.stats?.timeframe) {
      setTempTimeframe(attendanceData.stats.timeframe)
    }
  }

  const handleTimeframeChange = (field: 'startTime' | 'endTime', value: string) => {
    setTempTimeframe(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }
  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }
  if (!attendanceData) {
    return <div className="p-8">No attendance data available.</div>
  }

  const stats = attendanceData.stats || {}
  const records = attendanceData.records || []
  const attendanceRate = stats.attendanceRate || 0
  const presentCount = stats.presentCount || 0
  const lateCount = stats.lateCount || 0
  const absentCount = stats.absentCount || 0
  const attendanceTimeframe = stats.timeframe || { startTime: "06:00", endTime: "09:00" }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.workId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Attendance Tracking</h1>
          <p className="text-sm text-muted-foreground">Monitor agent attendance and punctuality</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceRate}%</div>
              <div className="text-xs text-muted-foreground">Today's overall rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-xs text-muted-foreground">On time arrivals</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
              <div className="text-xs text-muted-foreground">Late arrivals</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-xs text-muted-foreground">No attendance</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Timeframe Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance Timeframe Settings
            </CardTitle>
            <CardDescription>Configure the time window for attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Attendance Window</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {attendanceTimeframe.startTime} - {attendanceTimeframe.endTime}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Agents must mark attendance within this window</span>
                </div>
              </div>

              <Dialog open={isTimeframeDialogOpen} onOpenChange={handleTimeframeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Update Timeframe
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Update Attendance Timeframe</DialogTitle>
                    <DialogDescription>
                      Set the time window for agent attendance tracking. Agents must mark their attendance within this
                      time range.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startTime" className="text-right">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={tempTimeframe.startTime}
                        onChange={(e) => handleTimeframeChange('startTime', e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endTime" className="text-right">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={tempTimeframe.endTime}
                        onChange={(e) => handleTimeframeChange('endTime', e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1">Note:</p>
                      <p>
                        This timeframe will apply to all agents. Attendance marked outside this window will be
                        considered late or invalid.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTimeframeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleUpdateTimeframe} disabled={updatingTimeframe}>
                      {updatingTimeframe ? "Updating..." : "Update Timeframe"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select date to view attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date > new Date()}
              />
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Real-time attendance tracking for all agents</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.agentName}</div>
                          <div className="text-sm text-muted-foreground">{record.workId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.timeIn}</TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{record.sector}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "late"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
