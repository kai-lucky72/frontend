"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Users, MapPin, Crown, Search } from "lucide-react"
import { getAgents } from "@/lib/api"

interface CreateGroupFormProps {
  onSuccess?: () => void
  availableAgents?: Array<{ id: string; name: string; workId: string }>
}

export function CreateGroupForm({ onSuccess, availableAgents = [] }: CreateGroupFormProps) {
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    sector: "",
    location: "",
    teamLeader: "",
  })
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [agents, setAgents] = useState<Array<{ id: string; name: string; workId: string }>>(availableAgents)

  useEffect(() => {
    let mounted = true
    const loadAgents = async () => {
      try {
        const list = await getAgents()
        if (!mounted) return
        const formatted = (Array.isArray(list) ? list : []).map((a: any) => ({
          id: String(a.id),
          name: `${a.firstName} ${a.lastName}`,
          workId: a.workId || a.nationalId || String(a.id),
        }))
        setAgents(formatted)
      } catch (_) {
        setAgents([])
      }
    }
    if (availableAgents.length === 0) {
      loadAgents()
    }
    return () => { mounted = false }
  }, [availableAgents])

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.workId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedAgentsList = agents.filter((agent) => selectedAgents.includes(agent.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (selectedAgents.length === 0) {
      toast({
        title: "No Agents Selected",
        description: "Please select at least one agent for the group.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.teamLeader && !selectedAgents.includes(formData.teamLeader)) {
      toast({
        title: "Invalid Team Leader",
        description: "Team leader must be selected from the group members.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const teamLeaderName = agents.find((agent) => agent.id === formData.teamLeader)?.name || "None"

    toast({
      title: "Group Created Successfully",
      description: `${formData.groupName} has been created with ${selectedAgents.length} members. Team Leader: ${teamLeaderName}`,
    })

    // Reset form
    setFormData({
      groupName: "",
      description: "",
      sector: "",
      location: "",
      teamLeader: "",
    })
    setSelectedAgents([])
    setSearchTerm("")

    setIsLoading(false)
    onSuccess?.()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create New Group
        </CardTitle>
        <CardDescription>Create a new sales group and assign agents</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Information</h3>
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={formData.groupName}
                onChange={(e) => handleInputChange("groupName", e.target.value)}
                placeholder="Alpha Team"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the group's focus and objectives..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="space-y-2">
                <Label htmlFor="location">Operating Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Downtown District"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Insurance Sector</Label>
              <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="auto">Auto Insurance</SelectItem>
                  <SelectItem value="property">Property Insurance</SelectItem>
                  <SelectItem value="business">Business Insurance</SelectItem>
                  <SelectItem value="mixed">Mixed Portfolio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Agent Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Group Members</h3>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Agent List */}
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="space-y-3">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={agent.id}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <Label htmlFor={agent.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-sm text-muted-foreground">{agent.workId}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Agents Summary */}
            {selectedAgents.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Agents ({selectedAgents.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgentsList.map((agent) => (
                    <span key={agent.id} className="px-2 py-1 bg-background rounded text-xs">
                      {agent.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team Leader Selection */}
          {selectedAgents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assign Team Leader</h3>
              <div className="space-y-2">
                <Label htmlFor="teamLeader">Team Leader</Label>
                <div className="relative">
                  <Crown className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={formData.teamLeader} onValueChange={(value) => handleInputChange("teamLeader", value)}>
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Select team leader from group members" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAgentsList.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.workId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || selectedAgents.length === 0}>
            {isLoading ? "Creating Group..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
