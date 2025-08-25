"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  Mail,
  Calendar,
  User,
  Stethoscope,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getDoctorVerificationStatus, type DoctorVerificationStatus } from "@/actions/doctor-verification"

export default function VerificationStatusPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<DoctorVerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVerificationStatus = async () => {
    try {
      setError(null)
      
      const data = await getDoctorVerificationStatus()
      if (!data) {
        setError("Doctor profile not found. Please complete your onboarding first.")
        return
      }
      
      setDoctor(data)
    } catch (err) {
      console.error("Error loading verification status:", err)
      setError("Failed to load verification status")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await loadVerificationStatus()
      setLoading(false)
    }
    
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadVerificationStatus()
    setRefreshing(false)
  }

  const getStatusIcon = () => {
    if (!doctor) return null
    
    switch (doctor.verificationStatus) {
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-600" />
      case "approved":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "rejected":
        return <XCircle className="h-8 w-8 text-red-600" />
      default:
        return <Clock className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    if (!doctor) return "gray"
    
    switch (doctor.verificationStatus) {
      case "pending":
        return "yellow"
      case "approved":
        return "green"
      case "rejected":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusMessage = () => {
    if (!doctor) return ""
    
    switch (doctor.verificationStatus) {
      case "pending":
        return "Your application is under review by our medical verification team."
      case "approved":
        return "Congratulations! Your medical credentials have been verified. You can now start accepting consultations."
      case "rejected":
        return "Your application requires additional information or documentation."
      default:
        return "Status unknown"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Verification Status...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            {error.includes("onboarding") && (
              <Button variant="outline" onClick={() => router.push("/onboarding/doctor")}>
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Application Found</h2>
          <p className="text-muted-foreground mb-4">You haven't submitted a doctor verification application yet.</p>
          <Button onClick={() => router.push("/onboarding/doctor")}>
            Start Application
          </Button>
        </div>
      </div>
    )
  }

  const statusColor = getStatusColor()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Verification Status</h1>
          <p className="text-muted-foreground">Track your doctor verification application</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status Overview */}
        <Card className={`border-${statusColor}-200 bg-${statusColor}-50`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.user.profileImage || ''} />
                <AvatarFallback className="text-lg">
                  {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  Dr. {doctor.user.firstName} {doctor.user.lastName}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {doctor.specialty.replace("_", " ").toUpperCase()}
                  {doctor.subSpecialty && ` • ${doctor.subSpecialty}`}
                </p>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-semibold text-lg capitalize">
                    {doctor.verificationStatus}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg" style={{
                backgroundColor: statusColor === "yellow" ? "#fef3c7" : statusColor === "green" ? "#d1fae5" : "#fee2e2",
                borderColor: statusColor === "yellow" ? "#f59e0b" : statusColor === "green" ? "#10b981" : "#ef4444"
              }}>
                <p className="font-medium mb-2" style={{
                  color: statusColor === "yellow" ? "#92400e" : statusColor === "green" ? "#065f46" : "#991b1b"
                }}>
                  {getStatusMessage()}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Application Submitted:</span>
                  <span className="font-medium">{formatDate(doctor.createdAt)}</span>
                </div>
                
                {doctor.verifiedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Verification Date:</span>
                    <span className="font-medium">{formatDate(doctor.verifiedAt)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span>License Number:</span>
                  <span className="font-medium">{doctor.licenseNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact & Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.user.email}</span>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Stay Updated:</strong> We'll send email notifications to your registered address about any status changes.
                  </p>
                </div>

                {doctor.verificationStatus === "pending" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Typical Review Time:</strong> 24-48 hours for document verification.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Feedback */}
        {doctor.adminFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Admin Feedback
              </CardTitle>
              <CardDescription>
                Important information from our verification team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Verification Team Message:
                </p>
                <p className="text-sm text-yellow-700">
                  {doctor.adminFeedback}
                </p>
                {doctor.verifier && (
                  <p className="text-xs text-yellow-600 mt-2">
                    - {doctor.verifier.firstName} {doctor.verifier.lastName}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {doctor.verificationStatus === "pending" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your application is being reviewed. Here's what you can expect:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-sm">Document Verification</p>
                      <p className="text-xs text-muted-foreground">Our team is verifying your medical credentials</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-sm">Email Notification</p>
                      <p className="text-xs text-muted-foreground">You'll receive an update via email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs mt-0.5">3</div>
                    <div>
                      <p className="font-medium text-sm">Start Practicing</p>
                      <p className="text-xs text-muted-foreground">Begin accepting consultations after approval</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {doctor.verificationStatus === "approved" && (
              <div className="space-y-4">
                <p className="text-sm text-green-700 font-medium">
                  🎉 You're all set! Your verification is complete.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/dashboard")}>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Go to Practice Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/account")}>
                    Update Profile
                  </Button>
                </div>
              </div>
            )}

            {doctor.verificationStatus === "rejected" && (
              <div className="space-y-4">
                <p className="text-sm text-red-700 font-medium">
                  Your application needs attention. Please review the admin feedback above and resubmit if necessary.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/onboarding/doctor")}>
                    Update Application
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard/support")}>
                    Contact Support
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 