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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserPlus, MoreHorizontal, Edit, Trash2, Eye, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Manager {
  id: string
  name: string
  email: string
  workId: string
  agentsCount: number
  status: "active" | "inactive"
  createdAt: string
  lastLogin: string
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@company.com",
      workId: "MGR001",
      agentsCount: 12,
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2 hours ago",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      workId: "MGR002",
      agentsCount: 8,
      status: "active",
      createdAt: "2024-01-20",
      lastLogin: "1 day ago",
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      workId: "MGR003",
      agentsCount: 15,
      status: "inactive",
      createdAt: "2024-01-10",
      lastLogin: "1 week ago",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    workId: "",
    password: "",
  })
  const { toast } = useToast()

  const handleCreateManager = () => {
    const manager: Manager = {
      id: Date.now().toString(),
      name: newManager.name,
      email: newManager.email,
      workId: newManager.workId,
      agentsCount: 0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
    }

    setManagers([...managers, manager])
    setNewManager({ name: "", email: "", workId: "", password: "" })
    setIsCreateDialogOpen(false)

    toast({
      title: "Manager Created",
      description: `${manager.name} has been successfully created.`,
    })
  }

  const handleToggleStatus = (id: string) => {
    setManagers(
      managers.map((manager) =>
        manager.id === id ? { ...manager, status: manager.status === "active" ? "inactive" : "active" } : manager,
      ),
    )

    toast({
      title: "Status Updated",
      description: "Manager status has been updated successfully.",
    })
  }

  const handleDeleteManager = (id: string) => {
    setManagers(managers.filter((manager) => manager.id !== id))
    toast({
      title: "Manager Deleted",
      description: "Manager has been removed from the system.",
      variant: "destructive",
    })
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Manager Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage system managers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Manager</DialogTitle>
              <DialogDescription>
                Add a new manager to the system. They will be able to manage agents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  placeholder="john.smith@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workId">Work ID</Label>
                <Input
                  id="workId"
                  value={newManager.workId}
                  onChange={(e) => setNewManager({ ...newManager, workId: e.target.value })}
                  placeholder="MGR004"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newManager.password}
                  onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                  placeholder="Temporary password"
                />
              </div>
              <Button onClick={handleCreateManager} className="w-full">
                Create Manager
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
              <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.filter((m) => m.status === "active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managers.reduce((sum, m) => sum + m.agentsCount, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Agents/Manager</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {managers.length > 0
                  ? Math.round(managers.reduce((sum, m) => sum + m.agentsCount, 0) / managers.length)
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Managers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Managers</CardTitle>
            <CardDescription>Manage system managers and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Work ID</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{manager.name}</div>
                        <div className="text-sm text-muted-foreground">{manager.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{manager.workId}</Badge>
                    </TableCell>
                    <TableCell>{manager.agentsCount}</TableCell>
                    <TableCell>
                      <Badge variant={manager.status === "active" ? "default" : "secondary"}>{manager.status}</Badge>
                    </TableCell>
                    <TableCell>{manager.lastLogin}</TableCell>
                    <TableCell>{manager.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(manager.id)}>
                            <Users className="mr-2 h-4 w-4" />
                            {manager.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteManager(manager.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Manager
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
