"use client"

import { useState, useEffect } from "react"
import { useAttendance } from "@/contexts/AttendanceContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock, CheckCircle, CalendarIcon, Shield } from "lucide-react"
import { getAgentAttendanceTimeframe, getAgentAttendanceStatus, markAgentAttendance } from "@/lib/api"

// --- Interfaces and Data ---
interface AttendanceRecord {
  id: string
  date: string
  time: string
  location: string
  sector: string
  status: "present" | "absent"
}

const initialRecords: AttendanceRecord[] = []

// --- Main Component ---
export default function AttendancePage() {
  const { isAttendanceMarked, attendanceTime, refreshAttendanceStatus } = useAttendance()
  const { toast } = useToast()

  // --- State Management ---
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any>({ attendanceRate: 0, presentCount: 0, lateCount: 0, absentCount: 0 })
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [attendanceDetails, setAttendanceDetails] = useState({ location: "", sector: "" })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [timeframe, setTimeframe] = useState({ start: "-", end: "-" })
  const [timeState, setTimeState] = useState({ isActive: false, isWarning: false, isExpired: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState<number>(1)
  const HISTORY_LIMIT = 3

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch attendance status for today
        const status = await getAgentAttendanceStatus()
        if (status.hasMarkedToday) {
          // markGlobalAttendance() // This line was removed as per the new_code, as the backend now provides this.
        }
        // Fetch attendance history
        const token = localStorage.getItem('authToken')
        const res = await fetch('http://localhost:5238/api/agent/attendance/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch attendance history')
        const data = await res.json()
        setAttendanceRecords(data.records || [])
        setAttendanceStats({
          attendanceRate: data.attendanceRate || 0,
          presentCount: data.presentCount || 0,
          lateCount: data.lateCount || 0,
          absentCount: data.absentCount || 0
        })
        // Fetch timeframe from backend
        let tf
        try {
          tf = await getAgentAttendanceTimeframe()
          console.log("Fetched timeframe from API:", tf)
        } catch (error) {
          console.error("Error fetching timeframe:", error)
          // Set a default timeframe for testing (5:00 AM to 5:00 PM)
          tf = { startTime: "5:00 AM", endTime: "5:00 PM" }
          console.log("Using default timeframe:", tf)
        }
        
        // Convert 12-hour format to 24-hour format
        const convertTo24Hour = (timeStr: string) => {
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
            
            return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          }
          return timeStr // Return as-is if not 12-hour format
        }
        
        const newTimeframe = { 
          start: convertTo24Hour(tf.startTime), 
          end: convertTo24Hour(tf.endTime) 
        }
        console.log("Converted timeframe (24-hour):", newTimeframe)
        setTimeframe(newTimeframe)
        
        // Force a re-render by updating timeState immediately
        const now = new Date()
        
        // Parse time function for 24-hour format
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(":")
          const hour = parseInt(parts[0], 10)
          const minute = parseInt(parts[1], 10)
          return { hour, minute }
        }
        
        const startTime = parseTime(newTimeframe.start)
        const endTime = parseTime(newTimeframe.end)
        
        const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.hour, startTime.minute)
        const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime.hour, endTime.minute)
        
        console.log("Forced time check:", {
          now: now.toLocaleTimeString(),
          start: startDateTime.toLocaleTimeString(),
          end: endDateTime.toLocaleTimeString(),
          isActive: now >= startDateTime && now <= endDateTime
        })
        
        if (now >= startDateTime && now <= endDateTime) {
          console.log("Setting timeState to ACTIVE")
          setTimeState({ isActive: true, isWarning: false, isExpired: false })
        } else {
          console.log("Setting timeState to INACTIVE")
          setTimeState({ isActive: false, isWarning: false, isExpired: now > endDateTime })
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance history')
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  useEffect(() => {
    // Only run periodic checks if timeframe is loaded
    if (timeframe.start === "-" || timeframe.end === "-") {
      return
    }

          const checkTimeframe = () => {
        const now = new Date()
        
        const parseTime = (timeStr: string) => {
          // Now expecting 24-hour format like "05:00" or "17:00"
          const parts = timeStr.split(":")
          const hour = parseInt(parts[0], 10)
          const minute = parseInt(parts[1], 10)
          return { hour, minute }
        }

      try {
        const startTime = parseTime(timeframe.start)
        const endTime = parseTime(timeframe.end)

        const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.hour, startTime.minute)
        const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime.hour, endTime.minute)

        const totalDuration = endDateTime.getTime() - startDateTime.getTime()
        const warningTime = startDateTime.getTime() + totalDuration * 0.75

        console.log("Periodic time check:", {
          now: now.toLocaleTimeString(),
          start: startDateTime.toLocaleTimeString(),
          end: endDateTime.toLocaleTimeString(),
          isActive: now >= startDateTime && now <= endDateTime
        })

        if (now >= startDateTime && now <= endDateTime) {
          setTimeState({ isActive: true, isWarning: now.getTime() >= warningTime, isExpired: false })
        } else {
          setTimeState({ isActive: false, isWarning: false, isExpired: now > endDateTime })
        }
      } catch (error) {
        console.error("Error parsing timeframe:", error)
        setTimeState({ isActive: false, isWarning: false, isExpired: false })
      }
    }

    checkTimeframe()
    const interval = setInterval(checkTimeframe, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [timeframe])

  // --- Handlers ---
  const handleMarkAttendance = async () => {
    if (!attendanceDetails.location || !attendanceDetails.sector) {
      toast({ title: "Missing Information", description: "Please provide both location and sector.", variant: "destructive" })
      return
    }
    try {
      await markAgentAttendance({ location: attendanceDetails.location, sector: attendanceDetails.sector })
    setIsAttendanceDialogOpen(false)
      toast({ title: "Attendance Marked!", description: `Checked in successfully.`, className: "bg-green-100 dark:bg-green-900" })
      await refreshAttendanceStatus()
    } catch (err: any) {
      toast({ title: "Failed to mark attendance", description: err.message || "An error occurred.", variant: "destructive" })
    }
  }

  // --- Render Logic ---
  const getAttendanceButton = () => {
    console.log("Button state:", {
      isAttendanceMarked,
      attendanceTime,
      timeState,
      timeframe,
      currentTime: new Date().toLocaleTimeString(),
      isActive: timeState.isActive
    })
    if (isAttendanceMarked || attendanceTime) {
      return (
        <div className="flex items-center justify-center rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
            <p className="font-medium text-green-800 dark:text-green-200">
                Attendance marked for today{attendanceTime ? ` at ${attendanceTime}` : ""}
            </p>
        </div>
      )
    }
    if (timeState.isExpired) return <div className="text-center text-muted-foreground p-4">Attendance window for today has closed.</div>
    if (timeState.isActive) {
      console.log("Rendering ACTIVE button")
      return (
        <Button 
          size="lg" 
          className={`w-full bg-red-600 hover:bg-red-700`}
          onClick={() => setIsAttendanceDialogOpen(true)}
        >
          <Clock className="mr-2 h-5 w-5" />
          Mark Today's Attendance
        </Button>
      )
    }
    console.log("Rendering DISABLED button - timeState.isActive is false")
    return (
        <Button variant="outline" size="lg" className="w-full" disabled>
            Attendance opens at {timeframe.start}
        </Button>
    )
  }

  const attendanceRate = Math.round(
    (attendanceRecords.filter((r) => r.status === "present").length / attendanceRecords.length) * 100
  ) || 0

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Attendance Management</h1>
          <p className="text-sm opacity-90">Mark your daily attendance and track your record</p>
        </div>
        <span className="text-xs opacity-90 ml-auto">Attendance Window: {timeframe.start} - {timeframe.end}</span>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <Card className="border border-primary/15">
                <CardHeader>
                    <CardTitle className="text-primary">Daily Check-in</CardTitle>
                    <CardDescription>Timeframe to mark attendance: {timeframe.start} - {timeframe.end}</CardDescription>
                </CardHeader>
                <CardContent>
                    {getAttendanceButton()}
                </CardContent>
            </Card>
             <DialogContent>
                <DialogHeader>
                <DialogTitle>Mark Daily Attendance</DialogTitle>
                <DialogDescription>Provide your work details for today.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="location"><MapPin className="mr-2 h-4 w-4 inline-block" />Work Location</Label>
                    <Input id="location" placeholder="e.g., Downtown, Central Plaza" value={attendanceDetails.location} onChange={(e) => setAttendanceDetails({ ...attendanceDetails, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sector"><Shield className="mr-2 h-4 w-4 inline-block" />Insurance Sector</Label>
                    <Input id="sector" placeholder="e.g., Health, Auto, Life" value={attendanceDetails.sector} onChange={(e) => setAttendanceDetails({ ...attendanceDetails, sector: e.target.value })}/>
                </div>
                </div>
                <DialogFooter>
                <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleMarkAttendance}>Submit Attendance</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Attendance Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Attendance Rate</span><span className="font-medium">{attendanceRate}%</span></div>
                    <div className="w-full bg-secondary rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${attendanceRate}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center"><div className="text-2xl font-bold text-primary">{attendanceRecords.filter((r) => r.status === "present").length}</div><div className="text-xs text-muted-foreground">Present</div></div>
                    <div className="text-center"><div className="text-2xl font-bold text-red-600">{attendanceRecords.filter((r) => r.status === "absent").length}</div><div className="text-xs text-muted-foreground">Absent</div></div>
                </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border border-primary/15">
            <CardHeader>
              <CardTitle className="text-primary">Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border border-primary/10" />
            </CardContent>
          </Card>
        </div>

        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Recent Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceRecords
                .slice((historyPage - 1) * HISTORY_LIMIT, historyPage * HISTORY_LIMIT)
                .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border border-primary/10 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium"><CalendarIcon className="h-4 w-4 text-primary" />{record.date} <span className="text-sm text-muted-foreground font-normal">at {record.time}</span></div>
                    <div className="flex items-center gap-4 pl-6 text-sm text-muted-foreground"><div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{record.location}</div><span>{record.sector}</span></div>
                  </div>
                  <Badge variant={record.status === "present" ? "default" : "secondary"} className={record.status === "present" ? "bg-primary text-primary-foreground" : ""}>{record.status}</Badge>
                </div>
              ))}
            </div>
            {/* Pagination controls for history */}
            {attendanceRecords.length > HISTORY_LIMIT && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {historyPage} of {Math.max(1, Math.ceil(attendanceRecords.length / HISTORY_LIMIT))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage <= 1}
                    className="border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHistoryPage((p) => Math.min(Math.max(1, Math.ceil(attendanceRecords.length / HISTORY_LIMIT)), p + 1))}
                    disabled={historyPage >= Math.ceil(attendanceRecords.length / HISTORY_LIMIT)}
                    className="border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
