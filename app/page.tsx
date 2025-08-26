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
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { handleError } = useLoginError()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Clear any previous errors

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
      // Handle specific error cases with clear messages
      let message = "Something went wrong. Please try again.";
      
      if (error.status === 401) {
        message = "Invalid phone number or password. Please check your credentials and try again.";
      } else if (error.status === 404) {
        message = "User not found. Please check your phone number and try again.";
      } else if (error.status === 422) {
        message = "Please provide both phone number and password.";
      } else if (error.status === 0 || error.message?.includes('Network')) {
        message = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

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

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 text-center leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}
          </form>

          
        </CardContent>
      </Card>
    </div>
  )
}
