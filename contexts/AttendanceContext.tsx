"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAgentAttendanceStatus } from "@/lib/api"

export const AttendanceContext = createContext<{
  isAttendanceMarked: boolean
  attendanceTime: string | null
  markAttendance: () => void
  refreshAttendanceStatus: () => Promise<void>
}>(
  {
    isAttendanceMarked: false,
    attendanceTime: null,
    markAttendance: () => {},
    refreshAttendanceStatus: async () => {},
  }
)

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false)
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null)

  const markAttendance = () => {
    setIsAttendanceMarked(true)
    setAttendanceTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  }

  const refreshAttendanceStatus = async () => {
    try {
      const status = await getAgentAttendanceStatus()
      setIsAttendanceMarked(status.hasMarkedToday)
      setAttendanceTime(status.time || null)
    } catch {
      setIsAttendanceMarked(false)
      setAttendanceTime(null)
    }
  }

  useEffect(() => {
    refreshAttendanceStatus()
  }, [])

  return (
    <AttendanceContext.Provider value={{ isAttendanceMarked, attendanceTime, markAttendance, refreshAttendanceStatus }}>
      {children}
    </AttendanceContext.Provider>
  )
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
