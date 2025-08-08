"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Download, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { getLogs } from "@/lib/api"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  category: "auth" | "system" | "user" | "security"
  message: string
  user?: string
  ip?: string
  details?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<any>({ errorCount: 0, warningCount: 0, infoCount: 0, successCount: 0 })
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getLogs({
          level: levelFilter,
          category: categoryFilter,
          search: searchTerm,
          page: pagination.page,
          limit: pagination.limit,
        })
        setLogs(data.logs || [])
        setStats(data.stats || { errorCount: 0, warningCount: 0, infoCount: 0, successCount: 0 })
        setPagination(data.pagination || { page: 1, limit: 10, total: 0 })
      } catch (err: any) {
        setError(err.message || 'Failed to fetch logs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, levelFilter, categoryFilter, pagination.page, pagination.limit])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter

    return matchesSearch && matchesLevel && matchesCategory
  })

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getLevelVariant = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "secondary"
      case "warning":
        return "destructive"
      case "error":
        return "destructive"
      case "success":
        return "default"
      default:
        return "secondary"
    }
  }

  const errorCount = stats.errorCount
  const warningCount = stats.warningCount
  const infoCount = stats.infoCount
  const successCount = stats.successCount

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">System Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor system activities and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
              <div className="text-xs text-muted-foreground">Last 24 hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-muted-foreground">Requires attention</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
              <div className="text-xs text-muted-foreground">Monitor closely</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-muted-foreground">Operations completed</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Activity Logs</CardTitle>
                <CardDescription>Real-time system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading logs...
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-red-600">
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No logs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLevelIcon(log.level)}
                              <Badge variant={getLevelVariant(log.level)}>{log.level}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.category}</Badge>
                          </TableCell>
                          <TableCell>{log.message}</TableCell>
                          <TableCell>{log.user || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.details || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>System errors requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading error logs...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : logs
                    .filter((log) => log.level === "error")
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950"
                      >
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-red-900 dark:text-red-100">{log.message}</h4>
                            <span className="text-sm text-red-700 dark:text-red-300">{log.timestamp}</span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">{log.details}</p>
                          {log.user && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              User: {log.user} | IP: {log.ip}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Logs</CardTitle>
                <CardDescription>Security-related events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading security logs...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : logs
                    .filter((log) => log.category === "security")
                    .map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{log.message}</h4>
                            <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                          {log.user && (
                            <p className="text-xs text-muted-foreground">
                              User: {log.user} | IP: {log.ip}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Logs</CardTitle>
                <CardDescription>User login and authentication events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading authentication logs...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : logs
                    .filter((log) => log.category === "auth")
                    .map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{log.message}</h4>
                            <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                          {log.user && (
                            <p className="text-xs text-muted-foreground">
                              User: {log.user} | IP: {log.ip}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
