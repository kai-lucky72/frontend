"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, CheckCircle, AlertCircle, CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  id: string
  date: string
  time: string
  location: string
  sector: string
  status: "present" | "late" | "absent"
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      date: "2024-01-15",
      time: "08:30",
      location: "Downtown Office",
      sector: "Life Insurance",
      status: "present",
    },
    {
      id: "2",
      date: "2024-01-14",
      time: "09:15",
      location: "Downtown Office",
      sector: "Health Insurance",
      status: "late",
    },
    {
      id: "3",
      date: "2024-01-13",
      time: "08:15",
      location: "Downtown Office",
      sector: "Auto Insurance",
      status: "present",
    },
  ])

  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [currentLocation, setCurrentLocation] = useState("")
  const [selectedSector, setSelectedSector] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const { toast } = useToast()

  const handleMarkAttendance = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)

    if (!currentLocation || !selectedSector) {
      toast({
        title: "Missing Information",
        description: "Please provide your location and sector.",
        variant: "destructive",
      })
      return
    }

    const newAttendance: AttendanceRecord = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: currentTime,
      location: currentLocation,
      sector: selectedSector,
      status: currentTime > "09:00" ? "late" : "present",
    }

    setAttendanceRecords([newAttendance, ...attendanceRecords])
    setTodayAttendance(newAttendance)
    setCurrentLocation("")
    setSelectedSector("")

    toast({
      title: "Attendance Marked",
      description: `Attendance marked successfully at ${currentTime}`,
    })
  }

  const getLocationFromGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
          toast({
            title: "Location Retrieved",
            description: "GPS location has been captured.",
          })
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to retrieve GPS location.",
            variant: "destructive",
          })
        },
      )
    }
  }

  const attendanceRate = Math.round(
    (attendanceRecords.filter((r) => r.status === "present").length / attendanceRecords.length) * 100,
  )

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Attendance Management</h1>
          <p className="text-sm text-muted-foreground">Mark your daily attendance and track your record</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Mark your attendance for today (Timeframe: 6:00 AM - 9:00 AM)</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAttendance ? (
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Attendance Marked</h3>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Marked at {todayAttendance.time} - {todayAttendance.location} - {todayAttendance.sector}
                  </p>
                </div>
                <Badge variant={todayAttendance.status === "present" ? "default" : "destructive"}>
                  {todayAttendance.status}
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg mb-4">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">Attendance Required</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-200">
                      Please mark your attendance to access other features
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Current Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={currentLocation}
                        onChange={(e) => setCurrentLocation(e.target.value)}
                        placeholder="Enter your location"
                      />
                      <Button variant="outline" onClick={getLocationFromGPS}>
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Insurance Sector</Label>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                        <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                        <SelectItem value="Auto Insurance">Auto Insurance</SelectItem>
                        <SelectItem value="Property Insurance">Property Insurance</SelectItem>
                        <SelectItem value="Business Insurance">Business Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleMarkAttendance} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Attendance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>Your attendance performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance Rate</span>
                  <span className="font-medium">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${attendanceRate}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceRecords.filter((r) => r.status === "present").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {attendanceRecords.filter((r) => r.status === "late").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceRecords.filter((r) => r.status === "absent").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>View your attendance history</CardDescription>
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
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance History</CardTitle>
            <CardDescription>Your attendance records for the past days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{record.date}</span>
                      <span className="text-sm text-muted-foreground">at {record.time}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.location}
                      </div>
                      <span>{record.sector}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      record.status === "present" ? "default" : record.status === "late" ? "destructive" : "secondary"
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
