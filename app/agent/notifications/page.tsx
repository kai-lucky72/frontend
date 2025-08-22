"use client"

import { useEffect, useState } from "react"
import { getAgentNotifications } from "@/lib/api"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AgentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      toast({
        title: "Marked as read",
        description: "Notification marked as read successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.userFriendly || err?.message || "Failed to mark as read.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast({
        title: "All marked as read",
        description: `${result.updated} notifications marked as read.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.userFriendly || err?.message || "Failed to mark all as read.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAgentNotifications()
        const list = data?.notifications || data || []
        const normalized = Array.isArray(list)
          ? list.map((n: any) => ({
              ...n,
              from: n?.sender?.name || n?.sender?.role || n?.from || "System",
            }))
          : []
        setNotifications(normalized)
      } catch (err) {
        setError("Failed to load notifications.")
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter(
    (notif) =>
      (notif.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notif.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((notif.sender?.name || notif.sender?.role || notif.from || "").toLowerCase().includes(searchTerm.toLowerCase()))
  )
  const formatSender = (n: any) => n?.sender?.name || n?.sender?.role || n?.from || "System"
  const unreadCount = notifications.filter((notif) => !notif.read).length
  const urgentCount = notifications.filter((notif) => notif.priority === "urgent").length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-xl font-semibold">Notifications</h1>
      </header>
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark All as Read
            </Button>
          )}
        </div>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="space-y-4">
                  {loading && <div>Loading...</div>}
                  {error && <div className="text-red-500 mb-2">{error}</div>}
                  {!loading && filteredNotifications.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No notifications found.</div>
                  )}
                  {!loading && filteredNotifications.length > 0 && (
                    filteredNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>{notification.title || "(No Title)"}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={notification.priority === "urgent" ? "destructive" : "secondary"}>{notification.priority || "normal"}</Badge>
                              {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message || "(No message)"}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>From: {formatSender(notification)}</span>
                            <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-6 text-xs"
                              >
                                Mark as Read
                              </Button>
                            )}
                            {notification.read && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="unread" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unread Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && <div>Loading...</div>}
                  {error && <div className="text-red-500 mb-2">{error}</div>}
                  {!loading && notifications.filter((notif) => !notif.read).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No unread notifications.</div>
                  )}
                  {!loading && notifications.filter((notif) => !notif.read).length > 0 && (
                    notifications.filter((notif) => !notif.read).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{notification.title || "(No Title)"}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={notification.priority === "urgent" ? "destructive" : "secondary"}>{notification.priority || "normal"}</Badge>
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message || "(No message)"}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>From: {formatSender(notification)}</span>
                            <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="urgent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && <div>Loading...</div>}
                  {error && <div className="text-red-500 mb-2">{error}</div>}
                  {!loading && notifications.filter((notif) => notif.priority === "urgent").length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No urgent notifications.</div>
                  )}
                  {!loading && notifications.filter((notif) => notif.priority === "urgent").length > 0 && (
                    notifications.filter((notif) => notif.priority === "urgent").map((notification) => (
                      <div key={notification.id} className="flex items-start gap-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950">
                        <div className="mt-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-900 dark:text-red-100">{notification.title || "(No Title)"}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Urgent</Badge>
                              {!notification.read && <div className="w-2 h-2 bg-red-600 rounded-full"></div>}
                            </div>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">{notification.message || "(No message)"}</p>
                          <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                            <span>From: {formatSender(notification)}</span>
                            <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
