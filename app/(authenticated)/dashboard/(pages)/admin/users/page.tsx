"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Users, 
  UserCheck,
  UserX,
  MoreHorizontal,
  Filter,
  Loader2,
  AlertCircle
} from "lucide-react"
import { getAllUsers } from "@/actions/admin"

interface User {
  id: string
  clerkUserId: string
  userType: "patient" | "doctor" | "admin"
  email: string
  firstName: string
  lastName: string
  phone?: string
  profileImage?: string
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      console.error("Error loading users:", err)
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.userType === roleFilter
    
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    suspended: users.filter(u => !u.isActive).length,
    newThisMonth: users.filter(u => {
      const userDate = new Date(u.createdAt)
      const firstDayOfMonth = new Date(new Date().setDate(1))
      return userDate >= firstDayOfMonth
    }).length
  }

  const getUserTypeBadge = (userType: string) => {
    switch (userType) {
      case "patient":
        return <Badge variant="default">Patient</Badge>
      case "doctor":
        return <Badge variant="default">Doctor</Badge>
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      default:
        return <Badge variant="outline">{userType}</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended</Badge>
    }
    if (isVerified) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
    }
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Users...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Users</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadUsers}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
        <Button onClick={loadUsers}>
          <Users className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Suspended</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">New This Month</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>{filteredUsers.length} users found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} • Joined {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getUserTypeBadge(user.userType)}
                    {getStatusBadge(user.isActive, user.isVerified)}
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
