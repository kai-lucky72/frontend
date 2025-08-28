"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getAgentClients } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AgentClientsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const search = useSearchParams()

  const initialFrom = search.get("from") || "auto"
  const initialTo = search.get("to") || ""
  const initialPage = parseInt(search.get("page") || "1", 10)
  const initialLimit = parseInt(search.get("limit") || "20", 10)

  const [from, setFrom] = useState<string>(initialFrom)
  const [to, setTo] = useState<string>(initialTo)
  const [page, setPage] = useState<number>(initialPage)
  const [limit, setLimit] = useState<number>(initialLimit)

  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const updateUrl = (f = from, t = to, p = page, l = limit) => {
    const params = new URLSearchParams()
    if (f) params.set("from", f)
    if (t) params.set("to", t)
    params.set("page", String(p))
    params.set("limit", String(l))
    router.replace(`/agent/clients?${params.toString()}`)
  }

  const load = async (f = from, t = to, p = page, l = limit) => {
    setIsLoading(true)
    try {
      const res = await getAgentClients({ from: f || undefined, to: t || undefined, page: p, limit: l })
      setItems(Array.isArray(res.items) ? res.items : [])
      setTotal(res.total || 0)
    } catch (e: any) {
      toast({ title: "Failed to load clients", description: e?.userFriendly || e?.message || "Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(initialFrom, initialTo, initialPage, initialLimit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyFilters = () => {
    const newPage = 1
    setPage(newPage)
    updateUrl(from, to, newPage, limit)
    load(from, to, newPage, limit)
  }

  const changePage = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages)
    setPage(target)
    updateUrl(from, to, target, limit)
    load(from, to, target, limit)
  }

  const changeLimit = (l: number) => {
    const newLimit = l
    setLimit(newLimit)
    const newPage = 1
    setPage(newPage)
    updateUrl(from, to, newPage, newLimit)
    load(from, to, newPage, newLimit)
  }

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams()
      if (from && from !== "auto") params.set("startDate", from)
      if (to) params.set("endDate", to)
      params.set("format", "csv")
      const url = `http://localhost:5238/api/agent/clients/download?${params.toString()}`
      const token = localStorage.getItem("authToken")
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to download clients")
      const blob = await res.blob()
      const dispo = res.headers.get("Content-Disposition") || ""
      const match = dispo.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
      const filename = decodeURIComponent(match?.[1] || match?.[2] || `clients_${Date.now()}.csv`)
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

  const rowKey = (c: any, index: number) => {
    const id = c?.id ?? "noid"
    const pn = c?.proposalNumber ?? "nopn"
    const date = c?.proposalDate ?? "nodate"
    return `${String(id)}-${String(pn)}-${String(date)}-${index}`
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">My Clients</h1>
          <p className="text-sm opacity-90">Manage and view your client data</p>
        </div>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>From</Label>
              <Input placeholder="auto or yyyy-mm-dd" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input placeholder="yyyy-mm-dd" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div>
              <Label>Limit</Label>
              <select className="h-10 border rounded px-2" value={limit} onChange={(e) => changeLimit(parseInt(e.target.value, 10))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
                         <div className="md:col-span-2 flex items-end gap-2">
               <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90">Apply</Button>
               <Button variant="outline" onClick={() => { setFrom("auto"); setTo(""); setPage(1); updateUrl("auto", "", 1, limit); load("auto", "", 1, limit); }} className="border-primary/20 text-primary hover:bg-primary/5">This Month</Button>
               <Button variant="outline" onClick={() => { setFrom(""); setTo(""); setPage(1); updateUrl("", "", 1, limit); load("", "", 1, limit); }} className="border-primary/20 text-primary hover:bg-primary/5">All</Button>
               <Button variant="outline" onClick={handleDownload} className="border-primary/20 text-primary hover:bg-primary/5">Download</Button>
             </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No clients found.</div>
            ) : (
              <div className="rounded-md border border-primary/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary font-medium">Proposal No</TableHead>
                      <TableHead className="text-primary font-medium">Customer</TableHead>
                      <TableHead className="text-primary font-medium">Date</TableHead>
                      <TableHead className="text-primary font-medium">Premium</TableHead>
                      <TableHead className="text-primary font-medium">Converted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((c, index) => (
                      <TableRow key={rowKey(c, index)}>
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => changePage(page - 1)} disabled={page <= 1} className="border-primary/20 text-primary hover:bg-primary/5">Prev</Button>
                <Button variant="outline" onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="border-primary/20 text-primary hover:bg-primary/5">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
