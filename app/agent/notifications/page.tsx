"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, Search, CheckCircle, Clock, AlertTriangle, Info, Trash2 } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "urgent"
  from: string
  timestamp: string
  read: boolean
  priority: "low" | "normal" | "high" | "urgent"
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Weekly Target Update",
      message: "Your weekly target has been updated to 40 clients. Please check your dashboard for details.",
      type: "info",
      from: "Manager",
      timestamp: "2024-01-15 10:30",
      read: false,
      priority: "normal",
    },
    {
      id: "2",
      title: "Team Meeting Tomorrow",
      message: "Mandatory team meeting at 9 AM in the conference room. Please bring your weekly reports.",
      type: "urgent",
      from: "Manager",
      timestamp: "2024-01-14 16:45",
      read: false,
      priority: "urgent",
    },
    {
      id: "3",
      title: "Attendance Reminder",
      message: "Please remember to mark your attendance between 6:00 AM - 9:00 AM daily.",
      type: "warning",
      from: "System",
      timestamp: "2024-01-14 08:00",
      read: true,
      priority: "normal",
    },
    {
      id: "4",
      title: "Performance Achievement",
      message: "Congratulations! You've exceeded your monthly target by 15%. Keep up the excellent work!",
      type: "success",
      from: "System",
      timestamp: "2024-01-13 14:20",
      read: true,
      priority: "low",
    },
    {
      id: "5",
      title: "New Policy Update",
      message: "Please review the updated company policies in the employee handbook section.",
      type: "info",
      from: "Admin",
      timestamp: "2024-01-12 11:15",
      read: false,
      priority: "normal",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(
    (notif) =>
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.from.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const unreadCount = notifications.filter((notif) => !notif.read).length
  const urgentCount = notifications.filter((notif) => notif.priority === "urgent" && !notif.read).length

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getNotificationVariant = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "secondary"
      case "warning":
        return "destructive"
      case "success":
        return "default"
      case "urgent":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated with important messages and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
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
                <CardDescription>View all your notifications and messages</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg ${
                        !notification.read ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" : ""
                      }`}
                    >
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getNotificationVariant(notification.type)}>{notification.type}</Badge>
                            {notification.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                            {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>From: {notification.from}</span>
                          <span>{notification.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unread Notifications</CardTitle>
                <CardDescription>Notifications that require your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((notif) => !notif.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      >
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getNotificationVariant(notification.type)}>{notification.type}</Badge>
                              {notification.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>From: {notification.from}</span>
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urgent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Notifications</CardTitle>
                <CardDescription>High priority notifications requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((notif) => notif.priority === "urgent")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950"
                      >
                        <div className="mt-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-900 dark:text-red-100">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Urgent</Badge>
                              {!notification.read && <div className="w-2 h-2 bg-red-600 rounded-full"></div>}
                            </div>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300">{notification.message}</p>
                          <div className="flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                            <span>From: {notification.from}</span>
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
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
