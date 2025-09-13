"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createTeam, getAgents, listTeams, deleteTeam, updateTeamMembers, changeTeamLeader } from "@/lib/api"
import type { Agent } from "@/lib/types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export default function TeamsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [teams, setTeams] = useState<Array<{ id: string | number; name: string; leader?: any; members?: any[] }>>([])
  const [loadingTeams, setLoadingTeams] = useState(true)

  const [leaderId, setLeaderId] = useState<string>("")
  const [teamName, setTeamName] = useState<string>("")
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  
  // Edit team states
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<any>(null)
  const [isChangeLeaderDialogOpen, setIsChangeLeaderDialogOpen] = useState(false)
  const [newLeaderId, setNewLeaderId] = useState<string>("")
  
  // Member management states
  const [agentsToAdd, setAgentsToAdd] = useState<string[]>([])
  const [agentsToRemove, setAgentsToRemove] = useState<string[]>([])
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false)
  const [isRemoveMembersDialogOpen, setIsRemoveMembersDialogOpen] = useState(false)
  const [updatingMembers, setUpdatingMembers] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingAgents(true)
        const a = await getAgents()
        setAgents(Array.isArray(a) ? a : [])
      } catch (e: any) {
        toast({ title: "Failed to load agents", description: e?.userFriendly || e?.message })
      } finally {
        setLoadingAgents(false)
      }
    }
    const loadTeams = async () => {
      try {
        setLoadingTeams(true)
        const t = await listTeams()
        setTeams(Array.isArray(t) ? t : [])
      } catch (e: any) {
        // silent
      } finally {
        setLoadingTeams(false)
      }
    }
    load()
    loadTeams()
  }, [])

  const selectableAgents = useMemo(() => agents.filter(a => a && a.id != null), [agents])

  const toggleMember = (id: string) => {
    setMemberIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDeleteTeam = async (team: any) => {
    setTeamToDelete(team)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return
    try {
      await deleteTeam(teamToDelete.id)
      toast({ title: "Team deleted", description: `${teamToDelete.name} has been deleted.` })
      // Refresh teams list
      const t = await listTeams()
      setTeams(Array.isArray(t) ? t : [])
      setIsDeleteDialogOpen(false)
      setTeamToDelete(null)
    } catch (e: any) {
      toast({ title: "Failed to delete team", description: e?.userFriendly || e?.message, variant: "destructive" })
    }
  }

  const handleEditTeam = (team: any) => {
    setEditingTeam(team)
    setIsEditDialogOpen(true)
  }

  const handleChangeLeader = (team: any) => {
    setEditingTeam(team)
    setNewLeaderId("")
    setIsChangeLeaderDialogOpen(true)
  }

  const confirmChangeLeader = async () => {
    if (!editingTeam || !newLeaderId) return
    try {
      await changeTeamLeader(editingTeam.id, newLeaderId)
      toast({ title: "Leader changed", description: "Team leader has been updated." })
      // Refresh teams list
      const t = await listTeams()
      setTeams(Array.isArray(t) ? t : [])
      setIsChangeLeaderDialogOpen(false)
      setEditingTeam(null)
      setNewLeaderId("")
    } catch (e: any) {
      toast({ title: "Failed to change leader", description: e?.userFriendly || e?.message, variant: "destructive" })
    }
  }

  const handleAddMembers = (team: any) => {
    setEditingTeam(team)
    setAgentsToAdd([])
    setIsAddMembersDialogOpen(true)
  }

  const handleRemoveMembers = (team: any) => {
    setEditingTeam(team)
    setAgentsToRemove([])
    setIsRemoveMembersDialogOpen(true)
  }

  const confirmAddMembers = async () => {
    if (!editingTeam || agentsToAdd.length === 0) return
    setUpdatingMembers(true)
    try {
      const result = await updateTeamMembers(editingTeam.id, agentsToAdd, [])
      toast({ 
        title: "Members added", 
        description: `${result.addedCount} members added successfully.${result.skippedCount > 0 ? ` ${result.skippedCount} agents were already in teams.` : ''}` 
      })
      // Refresh teams list
      const t = await listTeams()
      setTeams(Array.isArray(t) ? t : [])
      setIsAddMembersDialogOpen(false)
      setEditingTeam(null)
      setAgentsToAdd([])
    } catch (e: any) {
      toast({ title: "Failed to add members", description: e?.userFriendly || e?.message, variant: "destructive" })
    } finally {
      setUpdatingMembers(false)
    }
  }

  const confirmRemoveMembers = async () => {
    if (!editingTeam || agentsToRemove.length === 0) return
    setUpdatingMembers(true)
    try {
      const result = await updateTeamMembers(editingTeam.id, [], agentsToRemove)
      toast({ 
        title: "Members removed", 
        description: `${result.removedCount} members removed successfully.` 
      })
      // Refresh teams list
      const t = await listTeams()
      setTeams(Array.isArray(t) ? t : [])
      setIsRemoveMembersDialogOpen(false)
      setEditingTeam(null)
      setAgentsToRemove([])
    } catch (e: any) {
      toast({ title: "Failed to remove members", description: e?.userFriendly || e?.message, variant: "destructive" })
    } finally {
      setUpdatingMembers(false)
    }
  }

  const toggleAgentToAdd = (agentId: string) => {
    setAgentsToAdd(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const toggleAgentToRemove = (agentId: string) => {
    setAgentsToRemove(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const submit = async () => {
    if (!leaderId) {
      toast({ title: "Leader required", description: "Please pick a team leader.", variant: "destructive" })
      return
    }
    if (memberIds.length === 0) {
      toast({ title: "Members required", description: "Select at least one member.", variant: "destructive" })
      return
    }
    try {
      setCreating(true)
      const payload = {
        leaderAgentId: Number.isNaN(Number(leaderId)) ? leaderId : Number(leaderId),
        teamName: teamName || undefined,
        memberAgentIds: memberIds.map(m => Number.isNaN(Number(m)) ? m : Number(m)),
      }
      const res = await createTeam(payload as any)
      toast({ title: "Team created", description: `${res.teamName} (ID ${res.groupId})` })
      // refresh team list
      const t = await listTeams()
      setTeams(Array.isArray(t) ? t : [])
      // reset form
      setLeaderId("")
      setTeamName("")
      setMemberIds([])
    } catch (e: any) {
      toast({ title: "Failed to create team", description: e?.userFriendly || e?.message, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Teams</h1>
          <p className="text-sm opacity-90">Create and manage agent teams</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Create Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Team Leader</Label>
                <Select value={leaderId} onValueChange={setLeaderId}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={loadingAgents ? "Loading..." : "Select leader"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableAgents.map(a => (
                      <SelectItem key={String(a.id)} value={String(a.id)}>{a.firstName} {a.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Team Name (optional)</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team John Doe" />
              </div>
              <div>
                <Label>Members</Label>
                <div className="h-10 flex items-center gap-2 overflow-x-auto">
                  {selectableAgents.slice(0, 20).map(a => {
                    const id = String(a.id)
                    const active = memberIds.includes(id)
                    return (
                      <Button key={id} type="button" variant={active ? "default" : "outline"} className="px-3 py-2" onClick={() => toggleMember(id)}>
                        {a.firstName}
                      </Button>
                    )
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Tip: Click to toggle. This quick picker shows up to 20; refine in future.</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={submit} disabled={creating}>{creating ? "Creating..." : "Create Team"}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/15">
          <CardHeader>
            <CardTitle className="text-primary">Existing Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTeams ? (
              <div className="py-8 text-center">Loading...</div>
            ) : teams.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No teams created yet.</div>
            ) : (
              <div className="rounded-md border border-primary/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary font-medium">ID</TableHead>
                      <TableHead className="text-primary font-medium">Name</TableHead>
                      <TableHead className="text-primary font-medium">Leader</TableHead>
                      <TableHead className="text-primary font-medium">Members</TableHead>
                      <TableHead className="text-primary font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map(t => (
                      <TableRow key={String(t.id)}>
                        <TableCell>{t.id}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.leader ? `${t.leader.firstName} ${t.leader.lastName}` : "N/A"}</TableCell>
                        <TableCell>{t.members ? t.members.length : 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => handleAddMembers(t)}>
                              Add Members
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveMembers(t)}>
                              Remove Members
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleChangeLeader(t)}>
                              Change Leader
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTeam(t)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{teamToDelete?.name}"? This action cannot be undone. 
              All team members will return to individual status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Leader Dialog */}
      <Dialog open={isChangeLeaderDialogOpen} onOpenChange={setIsChangeLeaderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Leader</DialogTitle>
            <DialogDescription>
              Select a new leader for "{editingTeam?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Team Leader</Label>
              <Select value={newLeaderId} onValueChange={setNewLeaderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new leader" />
                </SelectTrigger>
                <SelectContent>
                  {selectableAgents.map(agent => (
                    <SelectItem key={String(agent.id)} value={String(agent.id)}>
                      {agent.firstName} {agent.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeLeaderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChangeLeader} disabled={!newLeaderId}>
              Change Leader
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Members</DialogTitle>
            <DialogDescription>
              Select agents to add to "{editingTeam?.name}". Agents already in other teams cannot be added.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {selectableAgents
                  .filter(agent => !editingTeam?.members?.some((m: any) => m.id === agent.id))
                  .map(agent => (
                  <div key={agent.id} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={`add-${agent.id}`}
                      checked={agentsToAdd.includes(String(agent.id))}
                      onChange={() => toggleAgentToAdd(String(agent.id))}
                      className="rounded"
                    />
                    <label htmlFor={`add-${agent.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{agent.firstName} {agent.lastName}</div>
                      <div className="text-sm text-muted-foreground">{agent.email}</div>
                    </label>
                  </div>
                ))}
              </div>
              {selectableAgents.filter(agent => !editingTeam?.members?.some((m: any) => m.id === agent.id)).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No available agents to add.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMembersDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAddMembers} 
              disabled={agentsToAdd.length === 0 || updatingMembers}
            >
              {updatingMembers ? "Adding..." : `Add ${agentsToAdd.length} Members`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Members Dialog */}
      <Dialog open={isRemoveMembersDialogOpen} onOpenChange={setIsRemoveMembersDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Remove Team Members</DialogTitle>
            <DialogDescription>
              Select members to remove from "{editingTeam?.name}". The team leader cannot be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {editingTeam?.members
                  ?.filter((member: any) => !member.isLeader)
                  .map((member: any, index: number) => (
                  <div key={member.id || index} className="flex items-center space-x-2 p-2 border rounded">
                    <input
                      type="checkbox"
                      id={`remove-${member.id}`}
                      checked={agentsToRemove.includes(String(member.id))}
                      onChange={() => toggleAgentToRemove(String(member.id))}
                      className="rounded"
                    />
                    <label htmlFor={`remove-${member.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </label>
                  </div>
                ))}
              </div>
              {editingTeam?.members?.filter((m: any) => !m.isLeader).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No members can be removed (only leader remains).
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveMembersDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemoveMembers} 
              disabled={agentsToRemove.length === 0 || updatingMembers}
            >
              {updatingMembers ? "Removing..." : `Remove ${agentsToRemove.length} Members`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


