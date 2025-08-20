"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Building2, Mail, User, BadgeIcon as IdCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { login } from "@/lib/api"

import { useLoginError } from "@/hooks/use-api-error"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { handleError } = useLoginError()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the backend-driven login function (phone + password only)
      const { user, token } = await login(phone, password);

      // Clear previous session data and store new data from backend response
      const fullName = user.name || "";
      localStorage.clear();
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);
      // workId removed

      // The backend determines agentType and groupName
      if (user.agentType) {
        localStorage.setItem("agentType", user.agentType);
      }
      if (user.groupName) {
        localStorage.setItem("groupName", user.groupName);
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${fullName}! Redirecting...`,
      });

      // Redirect based on the role provided by the backend
      router.push(`/${user.role}`);

    } catch (error: any) {
      handleError(error, "Login");
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-xl sm:text-2xl font-bold">Prime Agent Management</CardTitle>
          <CardDescription className="text-sm">Sign in with your Phone and Password</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading || !phone || !password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>
  )
}
