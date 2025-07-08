"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserPlus, MoreHorizontal, Edit, Trash2, Users, Crown, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Agent {
  id: string
  name: string
  email: string
  workId: string
  type: "sales" | "individual"
  group?: string
  isTeamLeader: boolean
  status: "active" | "inactive"
  clientsCollected: number
  attendanceRate: number
  createdAt: string
}

interface Group {
  id: string
  name: string
  memberCount: number
  teamLeader?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@company.com",
      workId: "AGT001",
      type: "sales",
      group: "Alpha Team",
      isTeamLeader: true,
      status: "active",
      clientsCollected: 45,
      attendanceRate: 95,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah.smith@company.com",
      workId: "AGT002",
      type: "sales",
      group: "Alpha Team",
      isTeamLeader: false,
      status: "active",
      clientsCollected: 38,
      attendanceRate: 88,
      createdAt: "2024-01-16",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      workId: "AGT003",
      type: "individual",
      isTeamLeader: false,
      status: "active",
      clientsCollected: 52,
      attendanceRate: 92,
      createdAt: "2024-01-17",
    },
  ])

  const [groups, setGroups] = useState<Group[]>([
    { id: "1", name: "Alpha Team", memberCount: 2, teamLeader: "John Doe" },
    { id: "2", name: "Beta Team", memberCount: 0 },
    { id: "3", name: "Gamma Team", memberCount: 0 },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    workId: "",
    phone: "",
    type: "sales" as "sales" | "individual",
    group: "",
  })

  const { toast } = useToast()

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAgent.name || !newAgent.email || !newAgent.workId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (newAgent.type === "sales" && !newAgent.group) {
      toast({
        title: "Group Required",
        description: "Sales agents must be assigned to a group.",
        variant: "destructive",
      })
      return
    }

    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      email: newAgent.email,
      workId: newAgent.workId,
      type: newAgent.type,
      group: newAgent.type === "sales" ? newAgent.group : undefined,
      isTeamLeader: false,
      status: "active",
      clientsCollected: 0,
      attendanceRate: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setAgents([...agents, agent])
    setNewAgent({ name: "", email: "", workId: "", phone: "", type: "sales", group: "" })
    setIsCreateDialogOpen(false)

    toast({
      title: "Agent Created",
      description: `${agent.name} has been successfully created.`,
    })
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setNewAgent({
      name: agent.name,
      email: agent.email,
      workId: agent.workId,
      phone: "",
      type: agent.type,
      group: agent.group || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAgent = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingAgent) return

    const updatedAgents = agents.map((agent) =>
      agent.id === editingAgent.id
        ? {
            ...agent,
            name: newAgent.name,
            email: newAgent.email,
            workId: newAgent.workId,
            type: newAgent.type,
            group: newAgent.type === "sales" ? newAgent.group : undefined,
          }
        : agent,
    )

    setAgents(updatedAgents)
    setIsEditDialogOpen(false)
    setEditingAgent(null)
    setNewAgent({ name: "", email: "", workId: "", phone: "", type: "sales", group: "" })

    toast({
      title: "Agent Updated",
      description: `${newAgent.name} has been successfully updated.`,
    })
  }

  const handleDeleteAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId)
    setAgents(agents.filter((a) => a.id !== agentId))

    toast({
      title: "Agent Deleted",
      description: `${agent?.name} has been removed from the system.`,
    })
  }

  const handleToggleTeamLeader = (agentId: string, groupName: string) => {
    setAgents(
      agents.map((agent) => {
        if (agent.group === groupName) {
          return { ...agent, isTeamLeader: agent.id === agentId }
        }
        return agent
      }),
    )

    toast({
      title: "Team Leader Updated",
      description: "Team leader has been assigned successfully.",
    })
  }

  const handleToggleStatus = (agentId: string) => {
    const updatedAgents = agents.map((agent) =>
      agent.id === agentId
        ? { ...agent, status: agent.status === "active" ? "inactive" : ("active" as "active" | "inactive") }
        : agent,
    )
    setAgents(updatedAgents)

    const agent = agents.find((a) => a.id === agentId)
    toast({
      title: "Status Updated",
      description: `${agent?.name} is now ${agent?.status === "active" ? "inactive" : "active"}.`,
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Agent Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage your agents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>Add a new agent to your team</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="john.doe@company.com"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workId">Work ID *</Label>
                <Input
                  id="workId"
                  value={newAgent.workId}
                  onChange={(e) => setNewAgent({ ...newAgent, workId: e.target.value })}
                  placeholder="AGT004"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Agent Type *</Label>
                <Select
                  value={newAgent.type}
                  onValueChange={(value: "sales" | "individual") =>
                    setNewAgent({ ...newAgent, type: value, group: value === "individual" ? "" : newAgent.group })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Agent (Group)</SelectItem>
                    <SelectItem value="individual">Individual Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newAgent.type === "sales" && (
                <div className="space-y-2">
                  <Label htmlFor="group">Group *</Label>
                  <Select value={newAgent.group} onValueChange={(value) => setNewAgent({ ...newAgent, group: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Agent
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Agents</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter((a) => a.type === "sales").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Individual Agents</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter((a) => a.type === "individual").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Leaders</CardTitle>
              <Crown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter((a) => a.isTeamLeader).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Agents</CardTitle>
            <CardDescription>Manage your agents and assign team leaders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead className="hidden sm:table-cell">Work ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Group</TableHead>
                    <TableHead className="hidden lg:table-cell">Clients</TableHead>
                    <TableHead className="hidden lg:table-cell">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{agent.name}</div>
                            <div className="text-sm text-muted-foreground truncate sm:hidden">{agent.workId}</div>
                            <div className="text-sm text-muted-foreground truncate">{agent.email}</div>
                          </div>
                          {agent.isTeamLeader && <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{agent.workId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.type === "sales" ? "default" : "secondary"}>{agent.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{agent.group || "Individual"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{agent.clientsCollected}</TableCell>
                      <TableCell className="hidden lg:table-cell">{agent.attendanceRate}%</TableCell>
                      <TableCell>
                        <Badge variant={agent.status === "active" ? "default" : "destructive"}>{agent.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Agent
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(agent.id)}>
                              <Users className="mr-2 h-4 w-4" />
                              {agent.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            {agent.type === "sales" && agent.group && (
                              <DropdownMenuItem onClick={() => handleToggleTeamLeader(agent.id, agent.group!)}>
                                <Crown className="mr-2 h-4 w-4" />
                                {agent.isTeamLeader ? "Remove Team Leader" : "Make Team Leader"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAgent(agent.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Agent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>Update agent information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-workId">Work ID *</Label>
              <Input
                id="edit-workId"
                value={newAgent.workId}
                onChange={(e) => setNewAgent({ ...newAgent, workId: e.target.value })}
                placeholder="AGT004"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Agent Type *</Label>
              <Select
                value={newAgent.type}
                onValueChange={(value: "sales" | "individual") =>
                  setNewAgent({ ...newAgent, type: value, group: value === "individual" ? "" : newAgent.group })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Agent (Group)</SelectItem>
                  <SelectItem value="individual">Individual Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newAgent.type === "sales" && (
              <div className="space-y-2">
                <Label htmlFor="edit-group">Group *</Label>
                <Select value={newAgent.group} onValueChange={(value) => setNewAgent({ ...newAgent, group: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Update Agent
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
