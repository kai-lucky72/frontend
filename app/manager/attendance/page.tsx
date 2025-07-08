"use client"

import { useState } from "react"
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
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      agentName: "John Doe",
      workId: "AGT001",
      date: "2024-01-15",
      timeIn: "08:30",
      location: "Downtown Office",
      status: "present",
      sector: "Life Insurance",
    },
    {
      id: "2",
      agentName: "Sarah Smith",
      workId: "AGT002",
      date: "2024-01-15",
      timeIn: "09:15",
      location: "Uptown Office",
      status: "late",
      sector: "Health Insurance",
    },
    {
      id: "3",
      agentName: "Mike Johnson",
      workId: "AGT003",
      date: "2024-01-15",
      timeIn: "08:15",
      location: "Midtown Office",
      status: "present",
      sector: "Auto Insurance",
    },
    {
      id: "4",
      agentName: "Lisa Brown",
      workId: "AGT004",
      date: "2024-01-15",
      timeIn: "-",
      location: "-",
      status: "absent",
      sector: "Property Insurance",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [attendanceTimeframe, setAttendanceTimeframe] = useState({
    startTime: "06:00",
    endTime: "09:00",
  })
  const [isTimeframeDialogOpen, setIsTimeframeDialogOpen] = useState(false)
  const [tempTimeframe, setTempTimeframe] = useState(attendanceTimeframe)
  const { toast } = useToast()

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.workId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length
  const lateCount = attendanceRecords.filter((r) => r.status === "late").length
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length
  const attendanceRate = Math.round(((presentCount + lateCount) / attendanceRecords.length) * 100)

  const handleUpdateTimeframe = () => {
    setAttendanceTimeframe(tempTimeframe)
    setIsTimeframeDialogOpen(false)
    toast({
      title: "Timeframe Updated",
      description: `Attendance window updated to ${tempTimeframe.startTime} - ${tempTimeframe.endTime}`,
    })
  }

  const handleTimeframeDialogOpen = (open: boolean) => {
    setIsTimeframeDialogOpen(open)
    if (open) {
      setTempTimeframe(attendanceTimeframe)
    }
  }

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
                        onChange={(e) => setTempTimeframe((prev) => ({ ...prev, startTime: e.target.value }))}
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
                        onChange={(e) => setTempTimeframe((prev) => ({ ...prev, endTime: e.target.value }))}
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
                    <Button type="button" onClick={handleUpdateTimeframe}>
                      Update Timeframe
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
                onSelect={setSelectedDate}
                className="rounded-md border"
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

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Summary</CardTitle>
            <CardDescription>Attendance patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monday</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tuesday</span>
                  <span className="font-medium">88%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Wednesday</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
