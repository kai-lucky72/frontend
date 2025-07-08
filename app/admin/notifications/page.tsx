"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Send, Bell, Users, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  recipient: string
  status: "sent" | "pending" | "failed"
  sentAt: string
  readBy: number
  totalRecipients: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday 2 AM - 4 AM",
      recipient: "All Users",
      status: "sent",
      sentAt: "2024-01-15 10:30",
      readBy: 45,
      totalRecipients: 50,
    },
    {
      id: "2",
      title: "New Policy Update",
      message: "Please review the updated company policies",
      recipient: "All Managers",
      status: "sent",
      sentAt: "2024-01-14 14:20",
      readBy: 8,
      totalRecipients: 12,
    },
  ])

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    recipient: "",
    priority: "normal",
  })

  const { toast } = useToast()

  const handleSendNotification = () => {
    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      recipient: newNotification.recipient,
      status: "sent",
      sentAt: new Date().toLocaleString(),
      readBy: 0,
      totalRecipients:
        newNotification.recipient === "All Users" ? 50 : newNotification.recipient === "All Managers" ? 12 : 38,
    }

    setNotifications([notification, ...notifications])
    setNewNotification({ title: "", message: "", recipient: "", priority: "normal" })

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${notification.recipient}`,
    })
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Send and manage system notifications</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="send" className="space-y-6">
          <TabsList>
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">Notification History</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send New Notification</CardTitle>
                <CardDescription>Send notifications to users across the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      placeholder="Enter notification title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipients</Label>
                    <Select
                      value={newNotification.recipient}
                      onValueChange={(value) => setNewNotification({ ...newNotification, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Users">All Users</SelectItem>
                        <SelectItem value="All Managers">All Managers</SelectItem>
                        <SelectItem value="All Agents">All Agents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter your notification message..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newNotification.priority}
                    onValueChange={(value) => setNewNotification({ ...newNotification, priority: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendNotification} className="w-full md:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">50</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>View all sent notifications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>To: {notification.recipient}</span>
                          <span>Sent: {notification.sentAt}</span>
                          <span>
                            Read: {notification.readBy}/{notification.totalRecipients}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={notification.status === "sent" ? "default" : "secondary"}>
                          {notification.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((notification.readBy / notification.totalRecipients) * 100)}% read
                        </div>
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
