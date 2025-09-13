"use client"

// IMPORTANT: This file has been completely cleaned of all mock data and mock data toggles.
// All data is now fetched from the backend API only.
// DO NOT add any mock data, isMock state, or mock data toggles to this file.

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAgents, getManagerAgentClients, API_URL } from "@/lib/api"
import type { Agent } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

type Period = "daily" | "weekly" | "monthly" | "three_months"

function getRange(period: Period): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  switch (period) {
    case "daily":
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "weekly": {
      const day = now.getDay() // 0 Sun .. 6 Sat
      const diffToMonday = (day + 6) % 7
      start.setDate(now.getDate() - diffToMonday)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    }
    case "monthly": {
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1)
      end.setDate(0) // last day of previous month (i.e., current month)
      end.setHours(23, 59, 59, 999)
      break
    }
    case "three_months": {
      start.setMonth(start.getMonth() - 3)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    }
  }
  return { from: formatISO(start), to: formatISO(end) }
}

export default function ManagerPerformancePage() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isClientsDialogOpen, setIsClientsDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  const [period, setPeriod] = useState<Period>("weekly")
  const range = useMemo(() => getRange(period), [period])

  useEffect(() => {
    const loadAgents = async () => {
        setLoading(true)
        setError(null)
        try {
        const list = await getAgents()
        setAgents(Array.isArray(list) ? list : [])
      } catch (e: any) {
        setError("Failed to load agents.")
        } finally {
          setLoading(false)
        }
      }
    loadAgents()
  }, [])

  const fetchClientsForAgent = async (agentId: string | number) => {
    const res = await getManagerAgentClients(agentId, { from: range.from, to: range.to, page: 1, limit: 50 })
    return Array.isArray((res as any)?.items) ? (res as any).items : []
  }

  const handleDownloadClients = async (agent: Agent) => {
    try {
      const params = new URLSearchParams()
      params.set("startDate", range.from)
      params.set("endDate", range.to)
      params.set("format", "csv")
      const url = `${API_URL}/manager/agents/${agent.id}/clients/download?${params.toString()}`
      const token = localStorage.getItem("authToken")
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to download clients")
      const blob = await res.blob()
      const dispo = res.headers.get("Content-Disposition") || ""
      const match = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
      const filename = decodeURIComponent(match?.[1] || match?.[2] || `agent_${agent.id}_clients_${Date.now()}.csv`)
      const link = document.createElement("a")
      const href = URL.createObjectURL(blob)
      link.href = href
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Unable to download clients.", variant: "destructive" })
    }
  }

  const handleOpenClients = async (agent: Agent) => {
    setSelectedAgent(agent)
    setIsClientsDialogOpen(true)
    setClientsLoading(true)
    try {
      const data = await fetchClientsForAgent(agent.id)
      setClients(data)
    } catch (e: any) {
      toast({ title: "Failed to fetch clients", description: e?.userFriendly || e?.message || "Please try again.", variant: "destructive" })
    } finally {
      setClientsLoading(false)
    }
  }

  // Sync removed per backend guidance (external-only mode)

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Agent Performance</h1>
          <p className="text-sm opacity-90">Period: {period.replace("_", " ")} • {range.from} → {range.to}</p>
      </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-40 bg-primary-foreground text-primary border-primary-foreground/30">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="three_months">Three Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-center py-8">Loading...</div>}
            {error && <div className="text-center py-8 text-red-500">{error}</div>}
            {!loading && !error && (
              <div className="rounded-md border border-primary/15 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance (%)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {agents.map((a, index) => (
                      <TableRow key={`${String(a.id)}-${a.email || "noemail"}-${index}`}>
                        <TableCell>
                          <div className="font-medium">{a.firstName} {a.lastName}</div>
                          <div className="text-xs text-muted-foreground">{a.email}</div>
                        </TableCell>
                        <TableCell>{a.type === "sales" ? (a.groupName || "-") : "-"}</TableCell>
                        <TableCell>{a.status}</TableCell>
                        <TableCell>{a.attendanceRate != null ? `${a.attendanceRate}%` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenClients(a)}>Get Clients</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadClients(a)}>Download</Button>
                          </div>
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
      <Dialog open={isClientsDialogOpen} onOpenChange={setIsClientsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clients</DialogTitle>
            <DialogDescription>
              {selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName} • ${range.from} → ${range.to}` : ""}
            </DialogDescription>
          </DialogHeader>
          {clientsLoading ? (
            <div className="text-center py-6">Loading clients…</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Converted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No clients found.</TableCell>
                    </TableRow>
                  ) : (
                    clients.map((c: any, idx: number) => (
                      <TableRow key={`${String(c?.id ?? "noid")}-${String(c?.proposalNumber ?? "nopn")}-${String(c?.proposalDate ?? "nodate")}-${idx}`}>
                        <TableCell>{c.proposalNumber}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>{c.proposalDate ? new Date(c.proposalDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{c.premium}</TableCell>
                        <TableCell>{c.converted ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}