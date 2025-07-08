"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Mail, BadgeIcon as IdCard, Lock, Phone, Users, Target } from "lucide-react"

interface CreateAgentFormProps {
  onSuccess?: () => void
  availableGroups?: Array<{ id: string; name: string; sector: string }>
}

export function CreateAgentForm({ onSuccess, availableGroups = [] }: CreateAgentFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    workId: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agentType: "individual", // individual or sales
    assignedGroup: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const defaultGroups = [
    { id: "1", name: "Alpha Team", sector: "Life Insurance" },
    { id: "2", name: "Beta Team", sector: "Health Insurance" },
    { id: "3", name: "Gamma Team", sector: "Auto Insurance" },
    { id: "4", name: "Delta Team", sector: "Property Insurance" },
  ]

  const groups = availableGroups.length > 0 ? availableGroups : defaultGroups

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.agentType === "sales" && !formData.assignedGroup) {
      toast({
        title: "Group Required",
        description: "Sales agents must be assigned to a group.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const agentTypeText = formData.agentType === "sales" ? "Sales Agent" : "Individual Agent"
    const groupText =
      formData.agentType === "sales"
        ? ` and assigned to ${groups.find((g) => g.id === formData.assignedGroup)?.name}`
        : ""

    toast({
      title: "Agent Created Successfully",
      description: `${formData.firstName} ${formData.lastName} has been created as ${agentTypeText}${groupText}.`,
    })

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      workId: "",
      password: "",
      confirmPassword: "",
      phone: "",
      agentType: "individual",
      assignedGroup: "",
    })

    setIsLoading(false)
    onSuccess?.()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New Agent
        </CardTitle>
        <CardDescription>Add a new agent to the system (Individual or Sales Agent)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@company.com"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Work Information</h3>
            <div className="space-y-2">
              <Label htmlFor="workId">Work ID *</Label>
              <div className="relative">
                <IdCard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="workId"
                  value={formData.workId}
                  onChange={(e) => handleInputChange("workId", e.target.value)}
                  placeholder="AGT001"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            {/* Agent Type Selection */}
            <div className="space-y-3">
              <Label>Agent Type *</Label>
              <RadioGroup
                value={formData.agentType}
                onValueChange={(value) => handleInputChange("agentType", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="individual" id="individual" />
                  <div className="flex-1">
                    <Label htmlFor="individual" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Individual Agent</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Works independently, individual performance tracking
                      </p>
                    </Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="sales" id="sales" />
                  <div className="flex-1">
                    <Label htmlFor="sales" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Sales Agent</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Works in groups, group performance tracking</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Group Assignment for Sales Agents */}
            {formData.agentType === "sales" && (
              <div className="space-y-2">
                <Label htmlFor="assignedGroup">Assign to Group *</Label>
                <Select
                  value={formData.assignedGroup}
                  onValueChange={(value) => handleInputChange("assignedGroup", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} - {group.sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter secure password"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm password"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Agent..." : "Create Agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
