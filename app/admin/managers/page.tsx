"use client"

import { useState, useEffect } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { UserPlus, Edit, Trash2, Eye, Users, Power, PowerOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreateManagerForm } from "@/components/forms/create-manager-form"
import { Manager } from "@/lib/types"
import { getManagers, createManager, updateManager, deleteManager } from "@/lib/api"

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  const [activeDialog, setActiveDialog] = useState<"create" | "view" | "edit" | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [errorField, setErrorField] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setIsLoading(true)
        const data = await getManagers()
        setManagers(data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch managers. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchManagers()
  }, [])

  const handleFormSuccess = async (data: Partial<Manager>) => {
    try {
      setFormError(null)
      setErrorField(null)
      if (selectedManager && activeDialog === "edit") {
        const updated = await updateManager(selectedManager.id, data)
        setManagers(managers.map((m) => (m.id === updated.id ? updated : m)))
        toast({ title: "Manager updated successfully!" })
        setActiveDialog(null)
        setSelectedManager(null)
      } else {
        // Only send the six required fields for creation
        const newManagerData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          nationalId: data.nationalId || "",
          workId: data.workId || "",
        }
        try {
        const newManager = await createManager(newManagerData)
        setManagers([...managers, newManager])
        toast({ title: "Manager created successfully!" })
          setActiveDialog(null)
          setSelectedManager(null)
        } catch (err: any) {
          // Try to extract error message and error field from backend
          let errorMsg = "Failed to save manager. Please try again."
          let errorField: string | null = null
          if (err instanceof Error) {
            try {
              const errorJson = JSON.parse((err as any).message)
              if (errorJson && errorJson.message) {
                errorMsg = errorJson.message
                // Try to extract field from message
                if (errorMsg.toLowerCase().includes("email")) errorField = "email"
                else if (errorMsg.toLowerCase().includes("phone")) errorField = "phoneNumber"
                else if (errorMsg.toLowerCase().includes("workid")) errorField = "workId"
                else if (errorMsg.toLowerCase().includes("nationalid")) errorField = "nationalId"
              }
            } catch {}
            // fallback: if backend sends plain string
            if (err.message && err.message !== "API request failed") {
              errorMsg = err.message
            }
          }
          setFormError(errorMsg)
          setErrorField(errorField)
          // Do NOT show success toast or close the dialog
          return
        }
      }
    } catch (err) {
      setFormError("Failed to save manager. Please try again.")
      setErrorField(null)
    }
  }

  const handleToggleStatus = async (manager: Manager) => {
    const newStatus = manager.status === "active" ? "inactive" : "active"
    try {
      const updated = await updateManager(manager.id, { status: newStatus })
      setManagers(managers.map((m) => (m.id === updated.id ? updated : m)))
      toast({
        title: "Status Updated",
        description: "Manager status has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "An error occurred",
        description: `Failed to update status. Please try again.`, 
        variant: "destructive",
      })
    }
  }

  const handleDeleteManager = async (id: string) => {
    try {
      await deleteManager(id)
      setManagers(managers.filter((manager) => manager.id !== id))
      toast({
        title: "Manager Deleted",
        description: "Manager has been removed from the system.",
        variant: "destructive",
      })
    } catch (err) {
      toast({
        title: "An error occurred",
        description: `Failed to delete manager. Please try again.`, 
        variant: "destructive",
      })
    }
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
        <Button onClick={() => setActiveDialog("create")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Manager
        </Button>
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
              <div className="text-2xl font-bold">{managers.reduce((sum, m) => sum + (m.agentsCount || 0), 0)}</div>
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
                  ? Math.round(managers.reduce((sum, m) => sum + (m.agentsCount || 0), 0) / managers.length)
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
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading managers...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Work ID</TableHead>
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
                        <div className="font-medium">{manager.firstName}</div>
                        <div className="text-sm text-muted-foreground">{manager.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{manager.lastName}</div>
                      </TableCell>
                      <TableCell>{manager.workId}</TableCell>
                      <TableCell>
                        <Badge
                          variant={manager.status === "active" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {manager.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{manager.lastLogin}</TableCell>
                      <TableCell>{manager.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedManager(manager)
                              setActiveDialog("view")
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedManager(manager)
                              setActiveDialog("edit")
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(manager)}
                          >
                            {manager.status === "active" ? (
                              <PowerOff className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                            <span className="sr-only">Toggle Status</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteManager(manager.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Manager Dialog */}
      <Dialog
        open={activeDialog === "view"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveDialog(null)
            setSelectedManager(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manager Details</DialogTitle>
            <DialogDescription>
              Viewing details for {selectedManager?.firstName} {selectedManager?.lastName}.
            </DialogDescription>
          </DialogHeader>
          {selectedManager && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <p className="font-medium col-span-1">First Name:</p>
                <p className="col-span-2">{selectedManager.firstName}</p>

                <p className="font-medium col-span-1">Last Name:</p>
                <p className="col-span-2">{selectedManager.lastName}</p>

                <p className="font-medium col-span-1">Email:</p>
                <p className="col-span-2 truncate">{selectedManager.email}</p>

                <p className="font-medium col-span-1">Phone Number:</p>
                <p className="col-span-2">{selectedManager.phoneNumber}</p>

                <p className="font-medium col-span-1">National ID:</p>
                <p className="col-span-2">{selectedManager.nationalId}</p>

                <p className="font-medium col-span-1">Work ID:</p>
                <p className="col-span-2">{selectedManager.workId}</p>

                <div className="font-medium col-span-1">Status:</div>
                <div className="col-span-2">
                  <Badge
                    variant={selectedManager.status === "active" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {selectedManager.status}
                  </Badge>
                </div>
                <p className="font-medium col-span-1">Agents Count:</p>
                <p className="col-span-2">{selectedManager.agentsCount || 0}</p>

                <p className="font-medium col-span-1">Created At:</p>
                <p className="col-span-2">{new Date(selectedManager.createdAt).toLocaleDateString()}</p>

                <p className="font-medium col-span-1">Last Login:</p>
                <p className="col-span-2">{new Date(selectedManager.lastLogin).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Manager Dialog */}
      <Dialog
        open={activeDialog === "edit"}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveDialog(null)
            setSelectedManager(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
            <DialogDescription>
              Update the details for {selectedManager?.firstName} {selectedManager?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <CreateManagerForm onSuccess={handleFormSuccess} initialData={selectedManager} formError={formError} errorField={errorField} />
        </DialogContent>
      </Dialog>

      {/* Create Manager Dialog */}
      <Dialog
        open={activeDialog === "create"}
        onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Manager</DialogTitle>
            <DialogDescription>Enter the details for the new manager.</DialogDescription>
          </DialogHeader>
          <CreateManagerForm onSuccess={handleFormSuccess} formError={formError} errorField={errorField} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
