"use client"

"use client"

import { useState, useEffect } from "react"
import { useAttendance } from "@/contexts/AttendanceContext"
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Wallet,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getClients, createClient } from "@/lib/api"
import { Client } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

// Defensive: ensure all fields are always defined in initialNewClientState
const initialNewClientState = {
  fullName: "",
  nationalId: "",
  phoneNumber: "",
  email: "",
  location: "",
  dateOfBirth: "",
  insuranceType: "",
  payingAmount: 0,
  payingMethod: "cash",
  contractYears: "1", // string for input
};

export default function ClientsPage() {
  const { isAttendanceMarked } = useAttendance()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState(initialNewClientState)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const data = await getClients()
      setClients(data)
    } catch (err) {
      setError("Failed to load clients. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleAddClient = async () => {
    if (!newClient.fullName || !newClient.nationalId || !newClient.phoneNumber || !newClient.insuranceType) {
      toast({
        title: "Missing Required Fields",
        description: "Full Name, National ID, Phone Number, and Insurance Type are required.",
        variant: "destructive",
      })
      return
    }

    try {
      // Only send the fields required by the backend
      const { fullName, nationalId, phoneNumber, email, location, dateOfBirth, insuranceType, payingAmount, payingMethod, contractYears } = newClient;
      const clientToCreate = {
        fullName,
        nationalId,
        phoneNumber,
        email,
        location,
        dateOfBirth,
        insuranceType,
        payingAmount,
        payingMethod,
        contractYears: parseInt(contractYears) || 1,
      };
      const createdClient = await createClient(clientToCreate)
      fetchClients()
      setNewClient(initialNewClientState)
      setIsAddDialogOpen(false)
      toast({
        title: "Client Added Successfully",
        description: `${createdClient.fullName} has been added to your list.`,
      })
    } catch (error) {
      let errorMsg = "Something went wrong. Please try again or contact support."
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message)
          if (parsed.details && parsed.details.includes("National ID")) {
            errorMsg = "A client with this National ID already exists. Please check and try again."
          } else if (parsed.message === "Validation error" && Array.isArray(parsed.errors)) {
            errorMsg = parsed.errors.join("\n")
          } else if (parsed.message) {
            errorMsg = parsed.message
          }
        } catch {
          if (error.message.includes("National ID")) {
            errorMsg = "A client with this National ID already exists. Please check and try again."
          } else {
            errorMsg = error.message
          }
        }
      }
      toast({
        title: "Failed to Add Client",
        description: errorMsg,
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Client Management</h1>
          <p className="text-sm text-muted-foreground">Add and manage client information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <span>
            <Button disabled={!isAttendanceMarked}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            </span>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add a New Client</DialogTitle>
              <DialogDescription>
                Fill in the details below. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={newClient.fullName || ""} onChange={e => setNewClient({ ...newClient, fullName: e.target.value })} placeholder="e.g., John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input id="nationalId" value={newClient.nationalId || ""} onChange={e => setNewClient({ ...newClient, nationalId: e.target.value })} placeholder="e.g., 9988776655" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input id="phoneNumber" value={newClient.phoneNumber || ""} onChange={e => setNewClient({ ...newClient, phoneNumber: e.target.value })} placeholder="e.g., 0788520617" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={newClient.email || ""} onChange={e => setNewClient({ ...newClient, email: e.target.value })} placeholder="e.g., john@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={newClient.location || ""} onChange={e => setNewClient({ ...newClient, location: e.target.value })} placeholder="e.g., gatsata" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" value={newClient.dateOfBirth || ""} onChange={e => setNewClient({ ...newClient, dateOfBirth: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="insuranceType">Insurance Type *</Label>
                  <Input id="insuranceType" value={newClient.insuranceType || ""} onChange={e => setNewClient({ ...newClient, insuranceType: e.target.value })} placeholder="e.g., motari" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="payingAmount">Paying Amount</Label>
                  <Input id="payingAmount" type="number" value={newClient.payingAmount ?? 0} onChange={e => setNewClient({ ...newClient, payingAmount: parseFloat(e.target.value) || 0 })} placeholder="e.g., 2000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="payingMethod">Paying Method</Label>
                  <Select value={newClient.payingMethod} onValueChange={(value) => setNewClient({ ...newClient, payingMethod: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="contractYears">Contract Years</Label>
                  <Input id="contractYears" type="number" value={newClient.contractYears || ""} onChange={e => setNewClient({ ...newClient, contractYears: e.target.value })} placeholder="e.g., 5" />
                </div>
              </div>
              <Button onClick={handleAddClient} className="w-full mt-4">Add Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Clients Table */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold text-destructive">Error</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchClients} className="mt-4">Retry</Button>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>A list of all clients in your portfolio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.filter(client => client.fullName && client.nationalId && client.insuranceType).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No clients found. Click 'Add Client' to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients
                      .filter(client => client.fullName && client.nationalId && client.insuranceType)
                      .map(client => (
                        <TableRow
                          key={client.id}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedClient(client)
                            setIsDetailsDialogOpen(true)
                          }}
                        >
                          <TableCell>
                            <div className="font-medium">{client.fullName}</div>
                            <div className="text-sm text-muted-foreground">{client.phoneNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{client.insuranceType}</div>
                            <div className="text-sm text-muted-foreground">${client.payingAmount} / {client.payingMethod}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.active ? 'default' : 'secondary'}>
                              {client.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation()
                                setSelectedClient(client)
                                setIsDetailsDialogOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}


        {/* Client Details Dialog */}
        {selectedClient && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedClient.fullName}</DialogTitle>
                <DialogDescription>Detailed information for the client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center">
                  <User className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.location || 'N/A'}</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center">
                  <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Insurance Type</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.insuranceType}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-sm text-muted-foreground">${selectedClient.payingAmount}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Wallet className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Paying Method</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedClient.payingMethod}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Info className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Contract Years</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.contractYears}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Info className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedClient.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                {selectedClient.notes && (
                  <div className="flex items-start">
                    <Info className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedClient.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
