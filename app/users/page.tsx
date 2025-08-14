"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Shield, ShieldCheck, ShieldX, Edit, Trash2, UserPlus, Users, UserCheck, UserX } from "lucide-react"
import { User, UserRole } from "@/lib/models"
import { UserInvitationDialog } from "@/components/user-invitation-dialog"
import { toast } from "sonner"

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  roleDistribution: Array<{ _id: string; count: number }>
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<string>("")

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      })
      
      if (searchTerm) params.append("search", searchTerm)
      if (roleFilter !== "all") params.append("role", roleFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      
      const data = await response.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/users/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleRoleChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: 'active' | 'inactive' | 'all') => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditingRole(user.role)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole })
      })

      if (!response.ok) throw new Error("Failed to update user role")

      toast.success("User role updated successfully")
      setIsEditDialogOpen(false)
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.error("Failed to update user role")
      console.error("Error updating user:", error)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error("API Error:", response.status, errorData)
        throw new Error(errorData.error || `Failed to deactivate user (${response.status})`)
      }

      toast.success("User deactivated successfully")
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.error("Failed to deactivate user")
      console.error("Error deactivating user:", error)
    }
  }

  const handleReactivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error("API Error:", response.status, errorData)
        throw new Error(errorData.error || `Failed to reactivate user (${response.status})`)
      }

      toast.success("User reactivated successfully")
      fetchUsers()
      fetchStats()
    } catch (error) {
      toast.error("Failed to reactivate user")
      console.error("Error reactivating user:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.RECRUITER: return <ShieldCheck className="h-4 w-4" />
      case UserRole.HIRING_MANAGER: return <Shield className="h-4 w-4" />
      case UserRole.INTERVIEWER: return <UserCheck className="h-4 w-4" />
      case UserRole.VIEWER: return <UserX className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.RECRUITER: return "bg-purple-100 text-purple-800"
      case UserRole.HIRING_MANAGER: return "bg-blue-100 text-blue-800"
      case UserRole.INTERVIEWER: return "bg-green-100 text-green-800"
      case UserRole.VIEWER: return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isUserActive = (user: User) => !user.deactivatedAt

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <UserInvitationDialog onInviteSent={() => {
          fetchUsers()
          fetchStats()
        }} />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recruiters</CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.roleDistribution.find(r => r._id === UserRole.RECRUITER)?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={UserRole.RECRUITER}>Recruiter</SelectItem>
                <SelectItem value={UserRole.HIRING_MANAGER}>Hiring Manager</SelectItem>
                <SelectItem value={UserRole.INTERVIEWER}>Interviewer</SelectItem>
                <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUserActive(user) ? "default" : "secondary"}>
                          {isUserActive(user) ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isUserActive(user) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateUser(user._id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivateUser(user._id!)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {users.length} users
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={editingRole} onValueChange={setEditingRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.RECRUITER}>Recruiter</SelectItem>
                  <SelectItem value={UserRole.HIRING_MANAGER}>Hiring Manager</SelectItem>
                  <SelectItem value={UserRole.INTERVIEWER}>Interviewer</SelectItem>
                  <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUserRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
