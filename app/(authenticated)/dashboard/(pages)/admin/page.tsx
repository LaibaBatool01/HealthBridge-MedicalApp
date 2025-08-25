"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react"
import { getPendingDoctors, getAllDoctorsForAdmin } from "@/actions/doctors"
import { checkAdminAccess } from "@/actions/admin"
import { useRouter } from "next/navigation"

// Helper functions
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>
    case "approved":
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Approved</Badge>
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

interface DoctorWithUser {
  id: string
  licenseNumber: string
  specialty: string
  subSpecialty?: string
  yearsOfExperience?: number
  education?: string
  certifications?: string
  hospitalAffiliations?: string
  bio?: string
  consultationFee?: string
  verificationStatus: "pending" | "approved" | "rejected"
  adminFeedback?: string
  verifiedAt?: Date
  createdAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    profileImage?: string
    createdAt: Date
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingDoctors, setPendingDoctors] = useState<DoctorWithUser[]>([])
  const [allDoctors, setAllDoctors] = useState<DoctorWithUser[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    async function initializeAdmin() {
      try {
        // Check admin access
        const adminAccess = await checkAdminAccess()
        if (!adminAccess) {
          router.push("/dashboard")
          return
        }
        setIsAdmin(true)

        // Load data
        await loadData()
      } catch (error) {
        console.error("Error initializing admin:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    initializeAdmin()
  }, [router])

  const loadData = async () => {
    try {
      const [pending, all] = await Promise.all([
        getPendingDoctors(),
        getAllDoctorsForAdmin()
      ])
      setPendingDoctors(pending)
      setAllDoctors(all)
    } catch (error) {
      console.error("Error loading admin data:", error)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Admin Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const approvedDoctors = allDoctors.filter(d => d.verificationStatus === "approved")
  const rejectedDoctors = allDoctors.filter(d => d.verificationStatus === "rejected")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage doctor verifications and platform oversight</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDoctors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedDoctors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedDoctors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{allDoctors.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Doctors ({allDoctors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <DoctorsList doctors={pendingDoctors} showActions={true} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <DoctorsList doctors={approvedDoctors} showActions={false} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <DoctorsList doctors={rejectedDoctors} showActions={true} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <DoctorsList doctors={allDoctors} showActions={true} onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface DoctorsListProps {
  doctors: DoctorWithUser[]
  showActions: boolean
  onRefresh: () => void
}

function DoctorsList({ doctors, showActions, onRefresh }: DoctorsListProps) {
  const router = useRouter()

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No doctors found</h3>
            <p className="text-sm text-muted-foreground">
              No doctors match the current filter criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {doctors.map((doctor) => (
        <Card key={doctor.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.user.profileImage} />
                  <AvatarFallback>
                    {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </h3>
                    {getStatusBadge(doctor.verificationStatus)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {doctor.specialty.replace("_", " ").toUpperCase()}
                    {doctor.subSpecialty && ` • ${doctor.subSpecialty}`}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">License:</span> {doctor.licenseNumber}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {doctor.yearsOfExperience || "N/A"} years
                    </div>
                    <div>
                      <span className="font-medium">Fee:</span> ${doctor.consultationFee || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span> {formatDate(doctor.createdAt)}
                    </div>
                  </div>

                  {doctor.adminFeedback && (
                    <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Admin Feedback:</span> {doctor.adminFeedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/admin/doctor/${doctor.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 