"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreateManagerForm } from "@/components/forms/create-manager-form"
import { CreateAgentForm } from "@/components/forms/create-agent-form"
import { CreateGroupForm } from "@/components/forms/create-group-form"
import { AttendanceForm } from "@/components/forms/attendance-form"
import { ArrowLeft, Users, UserPlus, Group, Clock } from "lucide-react"
import Link from "next/link"

export default function FormsDemo() {
  const [activeTab, setActiveTab] = useState("manager")

  const handleFormSuccess = () => {
    // Handle successful form submission
    console.log("Form submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              <Badge variant="secondary">Demo Mode</Badge>
            </div>
            <h1 className="text-3xl font-bold">Forms Demo</h1>
            <p className="text-muted-foreground">Test all the forms used in the Prime Management system</p>
          </div>
        </div>

        {/* Forms Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Management Forms</CardTitle>
            <CardDescription>
              These forms are used by administrators and managers to create and manage system entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manager" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manager
                </TabsTrigger>
                <TabsTrigger value="agent" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Agent
                </TabsTrigger>
                <TabsTrigger value="group" className="flex items-center gap-2">
                  <Group className="h-4 w-4" />
                  Group
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Attendance
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="manager" className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Create Manager Form</h3>
                    <p className="text-muted-foreground">
                      Used by administrators to create new managers with full management privileges
                    </p>
                  </div>
                  <CreateManagerForm onSuccess={handleFormSuccess} />
                </TabsContent>

                <TabsContent value="agent" className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Create Agent Form</h3>
                    <p className="text-muted-foreground">
                      Used by managers to create individual agents or sales agents (with group assignment)
                    </p>
                  </div>
                  <CreateAgentForm onSuccess={handleFormSuccess} />
                </TabsContent>

                <TabsContent value="group" className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Create Group Form</h3>
                    <p className="text-muted-foreground">
                      Used by managers to create sales groups and assign agents with team leaders
                    </p>
                  </div>
                  <CreateGroupForm onSuccess={handleFormSuccess} />
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-semibold">Attendance Form</h3>
                    <p className="text-muted-foreground">
                      Used by agents to mark daily attendance with location and work details
                    </p>
                  </div>
                  <AttendanceForm onSuccess={handleFormSuccess} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Form Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Manager Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personal information</li>
                <li>• Work details & department</li>
                <li>• Security settings</li>
                <li>• Password validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Agent Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Individual vs Sales agent</li>
                <li>• Group assignment</li>
                <li>• Contact information</li>
                <li>• Work ID generation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Group Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Agent selection</li>
                <li>• Team leader assignment</li>
                <li>• Target setting</li>
                <li>• Sector & location</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Attendance Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GPS location capture</li>
                <li>• Time window validation</li>
                <li>• Work type selection</li>
                <li>• Sector tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Testing Forms:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Fill out any form to see validation</li>
                  <li>• Try submitting with missing fields</li>
                  <li>• Test password confirmation</li>
                  <li>• Use GPS location in attendance</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Form Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time validation</li>
                  <li>• Loading states</li>
                  <li>• Success notifications</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
