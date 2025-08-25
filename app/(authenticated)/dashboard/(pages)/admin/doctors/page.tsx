"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { getAllDoctorsForAdmin } from "@/actions/admin"
import Link from "next/link"

interface Doctor {
  id: string
  verificationStatus: string
  specialty: string
  licenseNumber: string
  yearsOfExperience: number | null
  consultationFee: string | null
  rating: string | null
  totalRatings: number | null
  isAvailable: boolean
  createdAt: Date
  verifiedAt: Date | null
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage: string | null
  } | null
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      const doctorsData = await getAllDoctorsForAdmin()
      setDoctors(doctorsData as Doctor[])
      setFilteredDoctors(doctorsData as Doctor[])
    } catch (err) {
      console.error("Error loading doctors:", err)
      setError(err instanceof Error ? err.message : "Failed to load doctors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    let filtered = doctors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(doctor => doctor.verificationStatus === statusFilter)
    }

    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />
      case "rejected": return <XCircle className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Doctors...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Doctors</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDoctors}>Try Again</Button>
        </div>
      </div>
    )
  }

  const stats = {
    total: doctors.length,
    approved: doctors.filter(d => d.verificationStatus === "approved").length,
    pending: doctors.filter(d => d.verificationStatus === "pending").length,
    rejected: doctors.filter(d => d.verificationStatus === "rejected").length
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Doctor Management</h1>
          <p className="text-muted-foreground">Manage and review doctor registrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDoctors}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Doctors</CardTitle>
          <CardDescription>
            {filteredDoctors.length} of {doctors.length} doctors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDoctors.length > 0 ? (
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.user?.profileImage || undefined} />
                      <AvatarFallback>
                        {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">
                        {doctor.user?.firstName} {doctor.user?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.user?.email} • {doctor.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          License: {doctor.licenseNumber}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {doctor.yearsOfExperience || 0} years exp.
                        </span>
                        {doctor.rating && parseFloat(doctor.rating) > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{parseFloat(doctor.rating).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({doctor.totalRatings || 0})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${doctor.consultationFee || "0"}</p>
                      <p className="text-sm text-muted-foreground">consultation fee</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doctor.verificationStatus)}
                      <Badge className={getStatusColor(doctor.verificationStatus)}>
                        {doctor.verificationStatus}
                      </Badge>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/doctor/${doctor.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {doctors.length === 0 ? "No doctors found" : "No doctors match your filters"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
