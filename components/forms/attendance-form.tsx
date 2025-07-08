"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Clock, AlertTriangle, CheckCircle, Briefcase, Target } from "lucide-react"

interface AttendanceFormProps {
  onSuccess?: () => void
}

export function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const [formData, setFormData] = useState({
    workType: "",
    sector: "",
    location: "",
    notes: "",
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isWithinTimeWindow = () => {
    const hour = currentTime.getHours()
    return hour >= 6 && hour <= 9
  }

  const getTimeStatus = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return { status: "early", message: "Too early to mark attendance" }
    if (hour <= 9) return { status: "ontime", message: "On time" }
    return { status: "late", message: "Late attendance" }
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setFormData((prev) => ({
          ...prev,
          location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        }))
        setIsGettingLocation(false)
        toast({
          title: "Location Captured",
          description: "GPS location has been successfully captured.",
        })
      },
      (error) => {
        setLocationError("Unable to retrieve your location")
        setIsGettingLocation(false)
        toast({
          title: "Location Error",
          description: "Could not get your current location. Please enter manually.",
          variant: "destructive",
        })
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!formData.workType) {
      toast({
        title: "Work Type Required",
        description: "Please select your work type for today.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.sector) {
      toast({
        title: "Sector Required",
        description: "Please select your insurance sector.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.location) {
      toast({
        title: "Location Required",
        description: "Please provide your current location.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const timeStatus = getTimeStatus()
    const statusMessage =
      timeStatus.status === "late"
        ? "Attendance marked as late. Please contact your manager if needed."
        : "Attendance marked successfully!"

    toast({
      title: "Attendance Recorded",
      description: statusMessage,
      variant: timeStatus.status === "late" ? "destructive" : "default",
    })

    // Reset form
    setFormData({
      workType: "",
      sector: "",
      location: "",
      notes: "",
    })
    setGpsLocation(null)

    setIsLoading(false)
    onSuccess?.()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const timeStatus = getTimeStatus()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Mark Attendance
        </CardTitle>
        <CardDescription>Record your daily attendance and work details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Status */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Current Time</h3>
              <Badge
                variant={
                  timeStatus.status === "ontime"
                    ? "default"
                    : timeStatus.status === "late"
                      ? "destructive"
                      : "secondary"
                }
              >
                {timeStatus.status === "ontime" && <CheckCircle className="h-3 w-3 mr-1" />}
                {timeStatus.status === "late" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {timeStatus.status === "early" && <Clock className="h-3 w-3 mr-1" />}
                {timeStatus.message}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-muted-foreground">Attendance window: 6:00 AM - 9:00 AM</p>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Work Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={formData.workType} onValueChange={(value) => handleInputChange("workType", value)}>
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field">Field Work</SelectItem>
                      <SelectItem value="office">Office Work</SelectItem>
                      <SelectItem value="remote">Remote Work</SelectItem>
                      <SelectItem value="client-visit">Client Visit</SelectItem>
                      <SelectItem value="training">Training/Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Insurance Sector *</Label>
                <div className="relative">
                  <Target className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="life">Life Insurance</SelectItem>
                      <SelectItem value="health">Health Insurance</SelectItem>
                      <SelectItem value="auto">Auto Insurance</SelectItem>
                      <SelectItem value="property">Property Insurance</SelectItem>
                      <SelectItem value="business">Business Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>
            <div className="space-y-2">
              <Label htmlFor="location">Current Location *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter location or use GPS"
                    className="pl-8"
                    required
                  />
                </div>
                <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={isGettingLocation}>
                  {isGettingLocation ? "Getting..." : "Use GPS"}
                </Button>
              </div>
              {locationError && <p className="text-sm text-red-600">{locationError}</p>}
              {gpsLocation && (
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                  <CheckCircle className="inline h-4 w-4 mr-1 text-green-600" />
                  GPS location captured successfully
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes about your work today..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !isWithinTimeWindow()}>
            {isLoading ? "Recording Attendance..." : "Mark Attendance"}
          </Button>

          {!isWithinTimeWindow() && (
            <p className="text-sm text-center text-muted-foreground">
              {timeStatus.status === "early"
                ? "Attendance can only be marked between 6:00 AM - 9:00 AM"
                : "Late attendance requires manager approval"}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
