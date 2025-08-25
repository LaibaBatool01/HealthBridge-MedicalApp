"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Building2,
  DollarSign,
  Star,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react"
import { getDoctorVerificationDetails, verifyDoctor } from "@/actions/doctors"
import { getCurrentAdminUser } from "@/actions/admin"
import { useRouter, useParams } from "next/navigation"

interface DoctorDetails {
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
    phone?: string
    profileImage?: string
    createdAt: Date
  }
  verifier?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function AdminDoctorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.id as string

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [doctorData, currentAdmin] = await Promise.all([
          getDoctorVerificationDetails(doctorId),
          getCurrentAdminUser()
        ])
        
        setDoctor(doctorData)
        setAdminUser(currentAdmin)
        setFeedback(doctorData.adminFeedback || "")
      } catch (error) {
        console.error("Error loading doctor details:", error)
        router.push("/dashboard/admin")
      } finally {
        setLoading(false)
      }
    }

    if (doctorId) {
      loadData()
    }
  }, [doctorId, router])

  const handleVerification = async (status: "approved" | "rejected") => {
    if (!doctor || !adminUser) return

    try {
      setSubmitting(true)
      await verifyDoctor(doctor.id, adminUser.id, status, feedback.trim() || undefined)
      
      // Refresh data
      const updatedDoctor = await getDoctorVerificationDetails(doctorId)
      setDoctor(updatedDoctor)
      
      // Show success message and redirect
      setTimeout(() => {
        router.push("/dashboard/admin")
      }, 2000)
    } catch (error) {
      console.error("Error verifying doctor:", error)
      alert("Failed to verify doctor. Please try again.")
    } finally {
      setSubmitting(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
      case "approved":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Approved</Badge>
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const parseJsonField = (field: string | undefined | null) => {
    if (!field || field === 'null' || field === 'undefined') return []
    try {
      const parsed = JSON.parse(field)
      // Ensure we always return an array
      if (Array.isArray(parsed)) {
        return parsed
      } else if (parsed && typeof parsed === 'object') {
        // Convert object to array of key-value pairs
        return Object.entries(parsed).map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }))
      } else if (parsed) {
        return [parsed]
      } else {
        return []
      }
    } catch {
      // Return as array if not valid JSON
      return [field]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Doctor Details...</h2>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
          <Button onClick={() => router.push("/dashboard/admin")}>Back to Admin Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Doctor Verification</h1>
          <p className="text-muted-foreground">Review and verify doctor application</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.user.profileImage} />
                    <AvatarFallback className="text-lg">
                      {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      Dr. {doctor.user.firstName} {doctor.user.lastName}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {doctor.specialty.replace("_", " ").toUpperCase()}
                      {doctor.subSpecialty && ` • ${doctor.subSpecialty}`}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(doctor.verificationStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.user.email}</span>
                </div>
                {doctor.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied: {formatDate(doctor.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>License: {doctor.licenseNumber}</span>
                </div>
                {doctor.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{doctor.yearsOfExperience} years experience</span>
                  </div>
                )}
                {doctor.consultationFee && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${doctor.consultationFee} consultation fee</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          {doctor.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {doctor.education && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(parseJsonField(doctor.education) || []).map((edu: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      {edu.degree && <p className="font-medium">{edu.degree}</p>}
                      {edu.institution && <p className="text-sm text-muted-foreground">{edu.institution}</p>}
                      {edu.year && <p className="text-sm text-muted-foreground">{edu.year}</p>}
                      {edu.key && edu.value && (
                        <p className="text-sm text-muted-foreground">{edu.key}: {edu.value}</p>
                      )}
                      {typeof edu === 'string' && <p className="font-medium">{edu}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {doctor.certifications && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(parseJsonField(doctor.certifications) || []).map((cert: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      {cert.name && <p className="font-medium">{cert.name}</p>}
                      {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                      {cert.year && <p className="text-sm text-muted-foreground">{cert.year}</p>}
                      {cert.key && cert.value && (
                        <p className="text-sm text-muted-foreground">{cert.key}: {cert.value}</p>
                      )}
                      {typeof cert === 'string' && <p className="font-medium">{cert}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hospital Affiliations */}
          {doctor.hospitalAffiliations && (
            <Card>
              <CardHeader>
                <CardTitle>Hospital Affiliations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(parseJsonField(doctor.hospitalAffiliations) || []).map((hospital: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {hospital.name && <span>{hospital.name}</span>}
                      {hospital.position && <span className="text-sm text-muted-foreground">• {hospital.position}</span>}
                      {hospital.key && hospital.value && (
                        <span className="text-sm text-muted-foreground">{hospital.key}: {hospital.value}</span>
                      )}
                      {typeof hospital === 'string' && <span>{hospital}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {getStatusBadge(doctor.verificationStatus)}
              </div>
              
              {doctor.verifiedAt && (
                <div className="text-sm text-muted-foreground text-center">
                  <p>Verified on {formatDate(doctor.verifiedAt)}</p>
                  {doctor.verifier && (
                    <p>by {doctor.verifier.firstName} {doctor.verifier.lastName}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Feedback</CardTitle>
              <CardDescription>
                Provide feedback for the doctor (especially important for rejections)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback Message</Label>
                <Textarea
                  id="feedback"
                  placeholder="Enter your feedback here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  disabled={submitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {doctor.verificationStatus === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleVerification("approved")}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Doctor
                </Button>
                <Button
                  onClick={() => handleVerification("rejected")}
                  disabled={submitting}
                  variant="destructive"
                  className="w-full"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Previous Feedback */}
          {doctor.adminFeedback && doctor.verificationStatus !== "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{doctor.adminFeedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 