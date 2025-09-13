"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, Edit, Trash2, Phone, Mail, Eye, BadgeIcon as IdCard, AlertCircle, RefreshCw, Users as UsersIcon, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Agent } from "@/lib/types"
import { getAgents, updateAgent, deleteAgent, getManagerAgentClients, createTeam } from "@/lib/api"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination (client-side)
  const [page, setPage] = useState<number>(1)
  const LIMIT = 10

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [teamName, setTeamName] = useState<string>("")
  const leaderSelected = selectedAgent?.id ? String(selectedAgent.id) : ""

  const { toast } = useToast()
  const router = useRouter()

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAgents()
      setAgents(data)
    } catch (err) {
      setError("Failed to fetch agents. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const totalPages = Math.max(1, Math.ceil(agents.length / LIMIT))
  const pagedAgents = agents.slice((page - 1) * LIMIT, page * LIMIT)

  // Fix: Only update state and close dialog in handleCreateSuccess, do not call createAgent again
  // Creation disabled by backend (403). Keep edit/view/delete only.

  const handleUpdateSuccess = async (updatedAgent: Agent) => {
    setAgents((prev) => prev.map((agent) => agent.id === updatedAgent.id ? updatedAgent : agent))
      setIsEditDialogOpen(false)
      setSelectedAgent(null)
    toast({ title: "Agent Updated", description: `${updatedAgent.firstName} ${updatedAgent.lastName} has been updated.` })
  }

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return

    try {
      await deleteAgent(agentToDelete)
      setAgents((prev) => prev.filter((agent) => agent.id !== agentToDelete))
      setIsDeleteDialogOpen(false)
      setAgentToDelete(null)
      toast({ title: "Agent Deleted", description: "Agent has been removed from the system." })
    } catch (error) {
      toast({ title: "Deletion Failed", description: "Could not delete the agent. Please try again.", variant: "destructive" })
    }
  }

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsViewDialogOpen(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsEditDialogOpen(true)
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Loading Failed</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button onClick={fetchAgents} className="mt-6">Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 px-2 sm:px-4 bg-primary text-primary-foreground">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-primary-foreground/20" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">Manage Agents</h1>
          <p className="text-xs sm:text-sm opacity-90 truncate">Create, edit, and manage sales agents</p>
        </div>
        {/* Add Agent removed */}
      </header>

      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading agents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={fetchAgents} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
          <div className="rounded-md border border-primary/15">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  {/* Work ID removed */}
                  <TableHead>Type</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                      <div>
                        <div className="font-medium text-xs sm:text-sm flex items-center gap-1">
                          {agent.firstName} {agent.lastName}
                          {agent.teamLeader && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-primary/40 text-primary">
                              TL
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{agent.email}</div>
                      </div>
                    </TableCell>
                    {/* Work ID column removed */}
                    <TableCell>
                      <Badge variant={agent.type === "sales" ? "default" : "secondary"} className="text-xs capitalize">
                        {agent.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {agent.type === "sales" 
                        ? (agent.groupName || "No Group") 
                        : "None"
                      }
                      </TableCell>
                      <TableCell>
                      <Badge variant={agent.status === "active" ? "default" : "destructive"} className="text-xs">
                        {agent.status}
                      </Badge>
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent)
                            setIsViewDialogOpen(true)
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent)
                            setIsEditDialogOpen(true)
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        {agent.type === "sales" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAgent(agent)
                              setIsPromoteDialogOpen(true)
                            }}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            title="Promote to Team Leader"
                          >
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        {/* Sync removed per backend guidance (external-only mode) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            router.push(`/manager/agents/${agent.id}/clients`)
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAgentToDelete(agent.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {agents.length > LIMIT && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Create Agent removed (403 from backend). */}

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>Update agent information.</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                </div>
                <div>
                  {/* Work ID removed */}
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedAgent.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant={selectedAgent.type === "sales" ? "default" : "secondary"} className="text-xs capitalize">
                    {selectedAgent.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedAgent.status === "active" ? "default" : "destructive"} className="text-xs">
                    {selectedAgent.status}
                  </Badge>
                </div>
                {selectedAgent.type === "sales" && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Group</Label>
                      <p className="text-sm">{selectedAgent.groupName || "No Group"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Team Leader</Label>
                      <p className="text-sm">{selectedAgent.teamLeader ? "Yes" : "No"}</p>
                    </div>
                  </>
                )}
                <div>
                  
                </div>
                <div>
                  <Label className="text-sm font-medium">Attendance Rate</Label>
                  <p className="text-sm">{selectedAgent.attendanceRate}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote to Team Leader Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={(o) => { setIsPromoteDialogOpen(o); if (!o) { setTeamMembers([]); setTeamName(""); } }}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promote to Team Leader</DialogTitle>
            <DialogDescription>Select members and optionally set a team name.</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Leader</Label>
                  <p className="text-sm">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Team Name (optional)</Label>
                  <input className="border rounded h-9 px-2 w-full" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team John Doe" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Members</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agents.filter(a => String(a.id) !== leaderSelected && a.type === "sales").map(a => {
                      const id = String(a.id)
                      const active = teamMembers.includes(id)
                      return (
                        <Button key={id} type="button" variant={active ? "default" : "outline"} size="sm" onClick={() => setTeamMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}>
                          {a.firstName}
                        </Button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Pick at least one member. The leader cannot be selected as a member.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsPromoteDialogOpen(false); setTeamMembers([]); setTeamName(""); }}>Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!selectedAgent) return
                    if (teamMembers.length === 0) { toast({ title: "Members required", description: "Select at least one member.", variant: "destructive" }); return }
                    try {
                      const payload = {
                        leaderAgentId: Number.isNaN(Number(selectedAgent.id)) ? selectedAgent.id : Number(selectedAgent.id),
                        teamName: teamName || undefined,
                        memberAgentIds: teamMembers.map(m => Number.isNaN(Number(m)) ? m : Number(m)),
                      }
                      const res = await createTeam(payload as any)
                      toast({ title: "Team created", description: `${res.teamName} created.` })
                      setIsPromoteDialogOpen(false)
                      setTeamMembers([])
                      setTeamName("")
                    } catch (e: any) {
                      toast({ title: "Failed", description: e?.userFriendly || e?.message, variant: "destructive" })
                    }
                  }}
                >
                  Promote & Assign
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Agent Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>View agent information and performance.</DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                </div>
                <div>
                  {/* Work ID removed */}
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedAgent.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedAgent.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant={selectedAgent.type === "sales" ? "default" : "secondary"} className="text-xs capitalize">
                    {selectedAgent.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedAgent.status === "active" ? "default" : "destructive"} className="text-xs">
                    {selectedAgent.status}
                  </Badge>
                </div>
                {selectedAgent.type === "sales" && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Group</Label>
                      <p className="text-sm">{selectedAgent.groupName || "No Group"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Team Leader</Label>
                      <p className="text-sm">{selectedAgent.teamLeader ? "Yes" : "No"}</p>
                    </div>
                  </>
                )}
                <div>
                  
                </div>
                <div>
                  <Label className="text-sm font-medium">Attendance Rate</Label>
                  <p className="text-sm">{selectedAgent.attendanceRate}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="h-10 sm:h-9">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAgent}
              className="h-10 sm:h-9"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}
