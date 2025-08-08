"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Users, Crown, X, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Group, Agent } from "@/lib/types"
import {
  getGroups,
  createGroup,
  deleteGroup,
  assignAgentToGroup,
  removeAgentFromGroup,
  setTeamLeader,
  getAgents,
} from "@/lib/api"

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [allAgents, setAllAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [agentsToAdd, setAgentsToAdd] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [groupsData, agentsData] = await Promise.all([getGroups(), getAgents()])
      setGroups(groupsData)
      setAllAgents(agentsData)
    } catch (err) {
      setError("Failed to load data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({ title: "Error", description: "Group name is required.", variant: "destructive" })
      return
    }
    try {
      const newGroup = await createGroup({ name: newGroupName })
      setGroups((prev) => [...prev, newGroup])
      setIsCreateDialogOpen(false)
      setNewGroupName("")
      toast({ title: "Success", description: "Group created successfully." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create group.", variant: "destructive" })
    }
  }

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return
    try {
      // Ensure id is a number
      let groupId = selectedGroup.id
      if (typeof groupId === 'string') {
        const match = groupId.match(/\d+/)
        groupId = match ? Number(match[0]) : groupId
      }
      await deleteGroup(groupId)
      setGroups((prev) => prev.filter((g) => {
        let gid = g.id
        if (typeof gid === 'string') {
          const match = gid.match(/\d+/)
          gid = match ? Number(match[0]) : gid
        }
        return gid !== groupId
      }))
      setIsDeleteConfirmationOpen(false)
      setSelectedGroup(null)
      toast({ title: "Success", description: `Group '${selectedGroup.name}' deleted.` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete group.", variant: "destructive" })
    }
  }

  const handleAssignTeamLeader = async (groupId: string | number, agentId: string | number) => {
    try {
      const updatedGroup = await setTeamLeader(groupId, agentId)
      setGroups((prev) => prev.map((g) => (g.id === groupId ? updatedGroup : g)))
      toast({ title: "Success", description: "Team leader assigned successfully." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign team leader.", variant: "destructive" })
    }
  }

  const handleRemoveMember = async (groupId: string | number, agentId: string | number) => {
    try {
      const updatedGroup = await removeAgentFromGroup(groupId, agentId)
      setGroups((prev) => prev.map((g) => (g.id === groupId ? updatedGroup : g)))
      setSelectedGroup(updatedGroup)
      toast({ title: "Success", description: "Member removed successfully." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" })
    }
  }

  const handleAddMembers = async () => {
    if (!selectedGroup || agentsToAdd.length === 0) return
    try {
      const groupId = selectedGroup.id
      const updatedGroup = await assignAgentToGroup(groupId, agentsToAdd)
      setGroups((prev) => prev.map((g) => (g.id === selectedGroup.id ? updatedGroup : g)))
      setSelectedGroup(updatedGroup)
      setIsAddMembersOpen(false)
      setAgentsToAdd([])
      if (updatedGroup.errors && updatedGroup.errors.length > 0) {
        toast({
          title: "Some agents could not be added:",
          description: updatedGroup.errors.join("\n"),
          variant: "destructive",
        })
      } else {
        toast({ title: "Success", description: "Members added successfully." })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add members.", variant: "destructive" })
    }
  }

  const openDeleteConfirmation = (group: Group) => {
    setSelectedGroup(group)
    setIsDeleteConfirmationOpen(true)
  }

  const openViewDetails = (group: Group) => {
    setSelectedGroup(group)
    setIsViewDetailsOpen(true)
  }

  const openAddMembers = (group: Group) => {
    setSelectedGroup(group)
    setAgentsToAdd([])
    setIsAddMembersOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Separator />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold mt-4">An Error Occurred</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={fetchData} className="mt-6">
          Try Again
        </Button>
      </div>
    )
  }

  // Compute all assigned agent IDs
  const allAssignedAgentIds = groups.flatMap(g => Array.isArray(g.agents) ? g.agents.map(agent => agent.id) : []);
  const unassignedSalesAgents = allAgents.filter(
    agent =>
      agent.type === "sales" &&
      !allAssignedAgentIds.includes(agent.id)
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Groups Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Enter a name to create a new agent group.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Alpha Team"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{group.name}</span>
                <Badge variant={group.teamLeader ? "default" : "outline"}>
                  {group.teamLeader ? "Leader Assigned" : "No Leader"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Team Leader</h4>
                {group.teamLeader ? (
                  <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>{
                        [group.teamLeader.firstName, group.teamLeader.lastName]
                          .filter(Boolean)
                          .map(s => s.trim())
                          .filter(Boolean)
                          .join(' ') ||
                        group.teamLeader.name ||
                        group.teamLeader.workId ||
                        group.teamLeader.email ||
                        'No Name'
                      }</span>
                    </div>
                    <Badge variant="secondary">{group.teamLeader.workId}</Badge>
                  </div>
                ) : (
                  <Select onValueChange={(agentId) => handleAssignTeamLeader(group.id, agentId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a Team Leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {group.agents.map((member, idx) => {
                        const displayName = [member.firstName, member.lastName]
                          .filter(Boolean)
                          .map(s => s.trim())
                          .filter(Boolean)
                          .join(' ');
                        return (
                          <SelectItem key={member.id || idx} value={member.id}>
                            {displayName || member.workId || member.email || 'No Name'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{group.agents.length} Members</span>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openAddMembers(group)}>
                  Add Members
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewDetails(group)}>
                  Manage Members
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => openDeleteConfirmation(group)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manage Members Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Members: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>Review and remove members from the group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {Array.isArray(selectedGroup?.agents) &&
              selectedGroup.agents.map((member, idx) => {
                const displayName =
                  member.name ||
                  [member.firstName, member.lastName]
                    .filter(Boolean)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .join(' ');
                return (
                  <div key={member.id || idx} className="flex items-center justify-between p-2 rounded-md bg-muted">
                    <span>{displayName || member.workId || member.email || 'No Name'}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveMember(selectedGroup.id, member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
            <DialogDescription>Select sales agents to add to this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {unassignedSalesAgents.map((agent, idx) => (
              <div
                key={agent.id || idx}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  agentsToAdd.includes(agent.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
                onClick={() =>
                  setAgentsToAdd((prev) =>
                    prev.includes(agent.id) ? prev.filter((id) => id !== agent.id) : [...prev, agent.id]
                  )
                }
              >
                <span>{
                  (agent.firstName || agent.lastName)
                    ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim()
                    : agent.name || agent.workId
                }</span>
                <Badge variant="outline">{agent.workId}</Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddMembersOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers}>Add Selected</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the group
              <strong> {selectedGroup?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
