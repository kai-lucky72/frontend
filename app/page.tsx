"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Mail, User, BadgeIcon as IdCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [workId, setWorkId] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication with just email and work ID
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store user data in localStorage
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userRole", role)
    localStorage.setItem("workId", workId)

    // For agents, determine if they are individual or sales agent based on email
    if (role === "agent") {
      const agentType = email.includes("sales") || email.includes("team") ? "sales" : "individual"
      const groupName = agentType === "sales" ? getGroupName(email) : ""

      localStorage.setItem("agentType", agentType)
      if (groupName) {
        localStorage.setItem("groupName", groupName)
      }
    }

    toast({
      title: "Login Successful",
      description: `Welcome back! Redirecting to your ${role} dashboard.`,
    })

    // Redirect based on role
    router.push(`/${role}`)
    setIsLoading(false)
  }

  const getGroupName = (email: string) => {
    // Simulate group assignment based on email
    if (email.includes("alpha") || email.includes("team1")) return "Alpha Team"
    if (email.includes("beta") || email.includes("team2")) return "Beta Team"
    if (email.includes("gamma") || email.includes("team3")) return "Gamma Team"
    return "Alpha Team" // Default
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Prime Management</CardTitle>
          <CardDescription className="text-sm">Sign in with your Work ID and Email</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workId" className="text-sm font-medium">
                Work ID
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="workId"
                  type="text"
                  placeholder="EMP001"
                  value={workId}
                  onChange={(e) => setWorkId(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="pl-10 h-12 text-base">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading || !email || !workId || !role}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Admin:</strong> admin@company.com | ADM001
              </p>
              <p>
                <strong>Manager:</strong> manager@company.com | MGR001
              </p>
              <p>
                <strong>Individual Agent:</strong> agent@company.com | AGT001
              </p>
              <p>
                <strong>Sales Agent:</strong> sales@company.com | AGT002
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
