"use client"

import type React from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserAssignment {
  id: string
  userName: string
  email: string
  role: string
  department: string
  assignedAt: string
  status: boolean
}

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AssignUserPage() {
  const t = useTranslations("nav")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Cookie yoxla
    if (typeof document !== "undefined") {
      const isLoggedIn = document.cookie.split(';').some(cookie => cookie.trim().startsWith('logged_in=true'));
      if (!isLoggedIn) {
        router.replace("/login")
      }
    }
  }, [router])

  const [assignments, setAssignments] = useState<UserAssignment[]>([
    {
      id: "1",
      userName: "John Doe",
      email: "john@example.com",
      role: "Editor",
      department: "Content",
      assignedAt: "2024-01-15",
      status: true,
    },
    {
      id: "2",
      userName: "Jane Smith",
      email: "jane@example.com",
      role: "Moderator",
      department: "Community",
      assignedAt: "2024-01-14",
      status: true,
    },
  ])

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    role: "",
    department: "",
  })

  const columns = [
    { key: "userName", label: "User Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "department", label: "Department", sortable: true },
    { key: "assignedAt", label: "Assigned Date", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAssignment: UserAssignment = {
      id: Date.now().toString(),
      ...formData,
      assignedAt: new Date().toISOString().split("T")[0],
      status: true,
    }
    setAssignments([...assignments, newAssignment])
    setFormData({ userName: "", email: "", role: "", department: "" })
    toast({
      title: "User assigned",
      description: "User role has been assigned successfully.",
    })
  }

  const handleEdit = (assignment: UserAssignment) => {
    // Handle edit logic
    console.log("Edit assignment:", assignment)
  }

  const handleDelete = (assignment: UserAssignment) => {
    setAssignments(assignments.filter((a) => a.id !== assignment.id))
    toast({
      title: "Assignment removed",
      description: `${assignment.userName}'s assignment has been removed.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("assignUser")}</h1>
        <p className="text-muted-foreground">Assign roles and permissions to users in your organization.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Assign New Role</CardTitle>
            <CardDescription>Add a new user assignment with specific role and department.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
              <CardDescription>Manage existing user role assignments and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={assignments} onEdit={handleEdit} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
