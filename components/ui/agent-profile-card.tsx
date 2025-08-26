"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Users, Crown } from "lucide-react"

interface AgentProfileCardProps {
  agentName: string
  agentType: string
  groupName?: string
  teamLeader?: string
}

export const AgentProfileCard = ({ agentName, agentType, groupName, teamLeader }: AgentProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-lg">{agentName}</p>
            <p className="text-sm text-muted-foreground">{agentType}</p>
          </div>
        </div>
        {groupName && (
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <strong>Group:</strong>
            <span className="ml-2">{groupName}</span>
          </div>
        )}
        {teamLeader && (
          <div className="flex items-center text-sm">
            <Crown className="mr-2 h-4 w-4 text-muted-foreground" />
            <strong>Team Leader:</strong>
            <span className="ml-2">{teamLeader}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
