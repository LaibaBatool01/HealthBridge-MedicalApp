"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle, 
  Phone,
  Stethoscope,
  Star,
  MapPin,
  DollarSign,
  ArrowRight,
  FileText,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Search,
  Download,
  Eye
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getUnifiedConsultations, type UnifiedConsultationData } from "@/actions/unified-consultations"
import Link from "next/link"

// Use the unified consultation data type
type ConsultationData = UnifiedConsultationData

export default function ConsultationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [consultations, setConsultations] = useState<ConsultationData[]>([])
  const [upcomingConsultations, setUpcomingConsultations] = useState<ConsultationData[]>([])
  const [pastConsultations, setPastConsultations] = useState<ConsultationData[]>([])
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getUnifiedConsultations()
      
      setUserType(data.userType)
      setConsultations(data.allConsultations)
      setUpcomingConsultations(data.upcomingConsultations)
      setPastConsultations(data.pastConsultations)
    } catch (err) {
      console.error("Error loading consultations:", err)
      setError(err instanceof Error ? err.message : "Failed to load consultations")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getConsultationTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video_call': return <Video className="h-4 w-4" />
      case 'chat_only': return <MessageCircle className="h-4 w-4" />
      case 'phone_call': return <Phone className="h-4 w-4" />
      case 'in_person': return <MapPin className="h-4 w-4" />
      default: return <Video className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderConsultationCard = (consultation: ConsultationData, index: number) => (
    <motion.div
      key={consultation.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={
                  userType === 'patient' 
                    ? consultation.doctorProfileImage || ''
                    : consultation.patient?.user.profileImage || ''
                } />
                <AvatarFallback>
                  {userType === 'patient' 
                    ? `${consultation.doctorFirstName?.[0] || ''}${consultation.doctorLastName?.[0] || ''}`
                    : `${consultation.patient?.user.firstName?.[0] || ''}${consultation.patient?.user.lastName?.[0] || ''}`
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {userType === 'patient' 
                    ? `Dr. ${consultation.doctorFirstName} ${consultation.doctorLastName}`
                    : `${consultation.patient?.user.firstName} ${consultation.patient?.user.lastName}`
                  }
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {userType === 'patient' 
                    ? consultation.doctorSpecialty?.replace('_', ' ').toUpperCase()
                    : consultation.patient?.user.email
                  }
                </p>
                {userType === 'patient' && consultation.doctorRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{parseFloat(consultation.doctorRating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(consultation.status)}>
                {getStatusIcon(consultation.status)}
                <span className="ml-1">{consultation.status?.replace('_', ' ').toUpperCase()}</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(consultation.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(consultation.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                {getConsultationTypeIcon(consultation.consultationType)}
                <span>{consultation.consultationType?.replace('_', ' ').toUpperCase()}</span>
              </div>
              {consultation.consultationFee && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${consultation.consultationFee}</span>
                </div>
              )}
            </div>

            {consultation.symptoms && (
              <div>
                <p className="text-sm font-medium mb-1">Symptoms:</p>
                <p className="text-sm text-muted-foreground">
                  {consultation.symptoms || 'No symptoms recorded'}
                </p>
              </div>
            )}

            {consultation.diagnosis && (
              <div>
                <p className="text-sm font-medium mb-1">Diagnosis:</p>
                <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
              </div>
            )}

            {consultation.doctorNotes && (
              <div>
                <p className="text-sm font-medium mb-1">Doctor's Notes:</p>
                <p className="text-sm text-muted-foreground">{consultation.doctorNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {consultation.prescriptionGiven && (
                  <Badge variant="outline" className="text-green-600">
                    <FileText className="h-3 w-3 mr-1" />
                    Prescription Given
                  </Badge>
                )}
                {consultation.followUpRequired && (
                  <Badge variant="outline" className="text-blue-600">
                    <Calendar className="h-3 w-3 mr-1" />
                    Follow-up Required
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {consultation.status === 'scheduled' && consultation.consultationType === 'video_call' && (
                  <Button size="sm" asChild>
                    <Link href={`/consultation/video?id=${consultation.id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Call
                    </Link>
                  </Button>
                )}
                
                {consultation.status === 'scheduled' && consultation.consultationType === 'chat_only' && (
                  <Button size="sm" asChild>
                    <Link href={`/consultation/chat?id=${consultation.id}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat
                    </Link>
                  </Button>
                )}

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/consultation/${consultation.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Consultations...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadConsultations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {userType === 'patient' ? 'My Consultations' : 'Patient Consultations'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userType === 'patient' 
              ? 'View and manage your medical consultations'
              : 'Manage consultations with your patients'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadConsultations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/find-doctors">
              <Plus className="h-4 w-4 mr-2" />
              Book Consultation
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingConsultations.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastConsultations.length}</div>
            <p className="text-xs text-muted-foreground">Past consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Consultations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Consultations</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {/* All Consultations Tab */}
        <TabsContent value="all" className="space-y-6">
          {consultations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No consultations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your healthcare journey by booking your first consultation.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/find-doctors">
                      <Plus className="h-4 w-4 mr-2" />
                      Find a Doctor
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation, index) => 
                renderConsultationCard(consultation, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Upcoming Consultations Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingConsultations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming consultations</h3>
                  <p className="text-muted-foreground mb-4">
                    Book a consultation to get started with your healthcare.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/find-doctors">
                      <Plus className="h-4 w-4 mr-2" />
                      Book Consultation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingConsultations.map((consultation, index) => 
                renderConsultationCard(consultation, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Past Consultations Tab */}
        <TabsContent value="past" className="space-y-6">
          {pastConsultations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No past consultations</h3>
                  <p className="text-muted-foreground">
                    Your completed consultations will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastConsultations.map((consultation, index) => 
                renderConsultationCard(consultation, index)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
