"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Users, Shield, UserCheck } from "lucide-react"
import { getUsers } from "@/lib/api"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await getUsers()
        setUsers(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch users')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      (user.firstName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  )

  const managers = users.filter((user) => user.role === "manager")
  const agents = users.filter((user) => user.role === "agent")
  const activeUsers = users.filter((user) => user.status === "active")

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">All Users</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">View and manage all system users</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Managers</CardTitle>
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{managers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Agents</CardTitle>
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{agents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{activeUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>Search and filter all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-10 sm:h-9"
                />
              </div>
              <Tabs value={selectedRole} onValueChange={setSelectedRole}>
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
                  <TabsTrigger value="manager" className="flex-1 sm:flex-none">Managers</TabsTrigger>
                  <TabsTrigger value="agent" className="flex-1 sm:flex-none">Agents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="text-center p-8">Loading users...</div>
            ) : error ? (
              <div className="text-center text-red-500 p-8">{error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Work ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Group/Agents</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{user.workId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "manager" ? "default" : "secondary"} className="text-xs">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"} className="text-xs">{user.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {user.role === "manager"
                            ? `${user.details?.agentsCount ?? 0} agents`
                            : user.details?.group || "Individual"}
                        </TableCell>
                        <TableCell className="text-xs">{user.lastLogin}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
