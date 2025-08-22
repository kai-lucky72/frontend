"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Send, Bell, Users, MessageSquare, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getManagerNotifications, sendManagerNotification, getAgents } from "@/lib/api"
import type { Agent } from "@/lib/types"

interface Notification {
  id: string
  title: string
  message: string
  recipients: string[]
  sentAt: string
  priority: "low" | "normal" | "high" | "urgent"
}

export default function NotificationsPage() {
  const [agents, setAgents] = useState<Agent[]>([])

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    recipientType: "all" as "all" | "group" | "individual",
    selectedGroup: "",
    selectedAgents: [] as string[],
  })

  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [notifs, agentsList] = await Promise.all([
          getManagerNotifications(),
          getAgents(),
        ])
        setNotifications(notifs?.notifications || notifs || [])
        setAgents(Array.isArray(agentsList) ? agentsList : [])
      } catch (err) {
        setError("Failed to load notifications.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSendNotification = async () => {
    let recipient = "All Agents";
    if (newNotification.recipientType === "group") {
      recipient = newNotification.selectedGroup;
    } else if (newNotification.recipientType === "individual") {
      recipient = newNotification.selectedAgents.join(",");
    }

    // Get sender info from localStorage
    const senderRole = localStorage.getItem("userRole") || "manager";

    try {
      const response = await sendManagerNotification({
        title: newNotification.title,
        message: newNotification.message,
        recipient,
        priority: newNotification.priority,
        senderRole,
      });
      toast({
        title: "Notification Sent",
        description: `Notification sent to ${recipient}`,
      });
      setNewNotification({
        title: "",
        message: "",
        priority: "normal",
        recipientType: "all",
        selectedGroup: "",
        selectedAgents: [],
      });
      // Refresh notifications from backend
      const data = await getManagerNotifications();
      setNotifications(data?.notifications || data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.userFriendly || err?.message || "Failed to send notification.",
        variant: "destructive",
      });
    }
  };

  const handleAgentSelection = (agentId: string, checked: boolean) => {
    if (checked) {
      setNewNotification({
        ...newNotification,
        selectedAgents: [...newNotification.selectedAgents, agentId],
      })
    } else {
      setNewNotification({
        ...newNotification,
        selectedAgents: newNotification.selectedAgents.filter((id) => id !== agentId),
      })
    }
  }

  const groups = [...new Set(agents.map((agent) => agent.groupName).filter(Boolean))] as string[]

  if (loading) {
    return <div className="text-center py-8">Loading notifications...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Agent Notifications</h1>
          <p className="text-sm text-muted-foreground">Send notifications to your agents</p>
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
                <CardDescription>Send notifications to your agents</CardDescription>
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
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newNotification.priority}
                      onValueChange={(value: "low" | "normal" | "high" | "urgent") =>
                        setNewNotification({ ...newNotification, priority: value })
                      }
                    >
                      <SelectTrigger>
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

                <div className="space-y-4">
                  <Label>Recipients</Label>
                  <Select
                    value={newNotification.recipientType}
                    onValueChange={(value: "all" | "group" | "individual") =>
                      setNewNotification({ ...newNotification, recipientType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="group">Specific Group</SelectItem>
                      <SelectItem value="individual">Individual Agents</SelectItem>
                    </SelectContent>
                  </Select>

                  {newNotification.recipientType === "group" && (
                    <Select
                      value={newNotification.selectedGroup}
                      onValueChange={(value) => setNewNotification({ ...newNotification, selectedGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {newNotification.recipientType === "individual" && (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                      {agents.map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={agent.id}
                            checked={newNotification.selectedAgents.includes(agent.id)}
                            onCheckedChange={(checked) => handleAgentSelection(agent.id, checked as boolean)}
                          />
                          <Label htmlFor={agent.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between">
                              <span>{`${agent.firstName} ${agent.lastName}`}</span>
                              <span className="text-sm text-muted-foreground">{agent.groupName || "Unassigned"}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleSendNotification} className="w-full">
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
                  <MessageSquare className="h-4 w-4 text-blue-600" />
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
                  <div className="text-2xl font-bold">85%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agents.length}</div>
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
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications found. Send a new one!</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge
                              variant={
                                notification.priority === "urgent"
                                  ? "destructive"
                                  : notification.priority === "high"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>To: {Array.isArray(notification.recipients) ? notification.recipients.join(", ") : "-"}</span>
                            <span>Sent: {notification.sentAt}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-sm font-medium">
                            {/* ReadBy/TotalRecipients removed */}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {/* ReadBy/TotalRecipients removed */}
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
