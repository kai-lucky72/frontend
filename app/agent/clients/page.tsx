"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { syncAgentClients, getAgentClients } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AgentClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [from, setFrom] = useState<string>("auto")
  const [to, setTo] = useState<string>("")

  const load = async () => {
    setIsLoading(true)
    try {
      const data = await getAgentClients({ from: from || undefined, to: to || undefined })
      setClients(Array.isArray(data) ? data : [])
    } catch (e: any) {
      toast({ title: "Failed to load clients", description: e?.userFriendly || e?.message || "Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSync = async () => {
    try {
      await syncAgentClients()
      toast({ title: "Sync started", description: "Clients synchronization triggered." })
      load()
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.userFriendly || e?.message || "Please try again.", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">My Clients</h1>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>From</Label>
              <Input placeholder="auto or yyyy-mm-dd" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input placeholder="yyyy-mm-dd" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button onClick={load}>Apply</Button>
              <Button variant="outline" onClick={() => { setFrom("auto"); setTo(""); }}>This Month</Button>
              <Button variant="outline" onClick={() => { setFrom(""); setTo(""); }}>All</Button>
              <Button onClick={handleSync}>Sync Clients</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No clients found.</div>
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
                    {clients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.proposalNumber}</TableCell>
                        <TableCell>{c.customerName}</TableCell>
                        <TableCell>{c.proposalDate ? new Date(c.proposalDate).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{c.premium}</TableCell>
                        <TableCell>{c.converted ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
