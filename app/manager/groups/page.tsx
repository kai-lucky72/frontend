"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Plus, Users, Crown, TrendingUp, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: string
  name: string
  description: string
  members: Agent[]
  teamLeader?: Agent
  performance: number
  targetClients: number
  collectedClients: number
  createdAt: string
}

interface Agent {
  id: string
  name: string
  workId: string
  clientsCollected: number
  attendanceRate: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "Alpha Team",
      description: "High-performance sales team for downtown sector",
      members: [
        { id: "1", name: "John Doe", workId: "AGT001", clientsCollected: 45, attendanceRate: 95 },
        { id: "2", name: "Sarah Smith", workId: "AGT002", clientsCollected: 38, attendanceRate: 88 },
        { id: "3", name: "Mike Wilson", workId: "AGT003", clientsCollected: 42, attendanceRate: 92 },
      ],
      teamLeader: { id: "1", name: "John Doe", workId: "AGT001", clientsCollected: 45, attendanceRate: 95 },
      performance: 85,
      targetClients: 150,
      collectedClients: 125,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Beta Team",
      description: "Specialized team for uptown sector",
      members: [
        { id: "4", name: "Lisa Brown", workId: "AGT004", clientsCollected: 35, attendanceRate: 90 },
        { id: "5", name: "Tom Davis", workId: "AGT005", clientsCollected: 28, attendanceRate: 85 },
      ],
      teamLeader: { id: "4", name: "Lisa Brown", workId: "AGT004", clientsCollected: 35, attendanceRate: 90 },
      performance: 72,
      targetClients: 100,
      collectedClients: 63,
      createdAt: "2024-01-20",
    },
  ])

  const [availableAgents] = useState<Agent[]>([
    { id: "6", name: "Alex Johnson", workId: "AGT006", clientsCollected: 0, attendanceRate: 0 },
    { id: "7", name: "Emma Wilson", workId: "AGT007", clientsCollected: 0, attendanceRate: 0 },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    targetClients: "",
  })

  const { toast } = useToast()

  const handleCreateGroup = () => {
    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      members: [],
      performance: 0,
      targetClients: Number.parseInt(newGroup.targetClients),
      collectedClients: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setGroups([...groups, group])
    setNewGroup({ name: "", description: "", targetClients: "" })
    setIsCreateDialogOpen(false)

    toast({
      title: "Group Created",
      description: `${group.name} has been successfully created.`,
    })
  }

  const handleAssignTeamLeader = (groupId: string, agentId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          const newLeader = group.members.find((member) => member.id === agentId)
          return { ...group, teamLeader: newLeader }
        }
        return group
      }),
    )

    toast({
      title: "Team Leader Assigned",
      description: "Team leader has been successfully assigned.",
    })
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Group Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage agent groups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Create a new group for your sales agents</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Alpha Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="High-performance sales team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Clients (Monthly)</Label>
                <Input
                  id="target"
                  type="number"
                  value={newGroup.targetClients}
                  onChange={(e) => setNewGroup({ ...newGroup, targetClients: e.target.value })}
                  placeholder="100"
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.reduce((sum, group) => sum + group.members.length, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groups.length > 0
                  ? Math.round(groups.reduce((sum, group) => sum + group.performance, 0) / groups.length)
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groups.length > 0
                  ? Math.round(
                      (groups.reduce((sum, group) => sum + group.collectedClients, 0) /
                        groups.reduce((sum, group) => sum + group.targetClients, 0)) *
                        100,
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge variant="outline">{group.members.length} members</Badge>
                </div>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance</span>
                    <span className="font-medium">{group.performance}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${group.performance}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target Progress</span>
                    <span className="font-medium">
                      {group.collectedClients}/{group.targetClients}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(group.collectedClients / group.targetClients) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Team Leader */}
                {group.teamLeader ? (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm">
                      <div className="font-medium">{group.teamLeader.name}</div>
                      <div className="text-muted-foreground">Team Leader</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 border-2 border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No team leader assigned</p>
                    {group.members.length >= 2 && (
                      <Select onValueChange={(value) => handleAssignTeamLeader(group.id, value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Assign team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {group.members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.workId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Members List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Members</h4>
                  {group.members.length > 0 ? (
                    <div className="space-y-1">
                      {group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <span>{member.name}</span>
                          <Badge variant="outline">{member.workId}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No members assigned</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Add Members
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
