"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createAgent, updateAgent } from "@/lib/api"
import { Agent } from "@/lib/types"

interface CreateAgentFormProps {
  agent?: Agent
  onSuccess: (agent: Agent) => void
}

export function CreateAgentForm({ agent, onSuccess }: CreateAgentFormProps) {
  const [formData, setFormData] = useState({
    firstName: agent?.firstName || "",
    lastName: agent?.lastName || "",
    email: agent?.email || "",
    phoneNumber: agent?.phoneNumber || "",
    nationalId: agent?.nationalId || "",
    workId: agent?.workId || "",
    type: agent?.type || "sales",
    group: agent?.group || "",
    status: agent?.status || "active",
    teamLeader: agent?.teamLeader || false,
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Only include password if not empty
      const agentData = {
        ...formData,
        role: "agent",
      }
      if (!agentData.password) {
        delete agentData.password;
      }

      if (agent) {
        // Update existing agent
        const updatedAgent = await updateAgent(agent.id, agentData)
        onSuccess(updatedAgent)
        toast({
          title: "Agent Updated",
          description: `${updatedAgent.firstName} ${updatedAgent.lastName} has been updated successfully.`,
        })
      } else {
        // Create new agent
        const newAgent = await createAgent(agentData)
        onSuccess(newAgent)
        toast({
          title: "Agent Created",
          description: `${newAgent.firstName} ${newAgent.lastName} has been created successfully.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
            required
            className="h-10 sm:h-9"
          />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
            required
            className="h-10 sm:h-9"
          />
        </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="john.doe@company.com"
          required
          className="h-10 sm:h-9"
        />
                </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1-555-123-4567"
            required
            className="h-10 sm:h-9"
          />
                </div>
        <div className="space-y-2">
          <Label htmlFor="nationalId">National ID *</Label>
          <Input
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            placeholder="123456789"
            required
            className="h-10 sm:h-9"
          />
            </div>
          </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workId">Work ID *</Label>
          <Input
            id="workId"
            value={formData.workId}
            onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
            placeholder="AGT001"
            required
            className="h-10 sm:h-9"
          />
              </div>
              <div className="space-y-2">
          <Label htmlFor="type">Agent Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger className="h-10 sm:h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Agent</SelectItem>
              <SelectItem value="individual">Individual Agent</SelectItem>
            </SelectContent>
          </Select>
              </div>
            </div>

      {formData.type === "sales" && (
        <div className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="group">Group Name</Label>
            <Input
              id="group"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              placeholder="Alpha Team"
              className="h-10 sm:h-9"
            />
                  </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="teamLeader"
              checked={formData.teamLeader}
              onChange={(e) => setFormData({ ...formData, teamLeader: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="teamLeader" className="text-sm font-medium">
              Team Leader
                    </Label>
                  </div>
                </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="h-10 sm:h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
                  <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        {!agent && (
          <div className="space-y-2">
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="h-10 sm:h-9"
            />
          </div>
        )}
          </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="h-10 sm:h-9 px-6">
          {isLoading ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
          </Button>
      </div>
        </form>
  )
}
