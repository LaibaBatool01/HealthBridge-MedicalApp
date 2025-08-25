"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Users, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle, 
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  User,
  MapPin,
  Eye,
  Calendar,
  DollarSign,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { getPendingConsultations, type DoctorConsultationData } from "@/actions/doctor-consultations"

export default function PatientQueuePage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [consultations, setConsultations] = useState<DoctorConsultationData[]>([])

  useEffect(() => {
    loadQueue()
  }, [])

  const loadQueue = async () => {
    try {
      setLoading(true)
      const data = await getPendingConsultations()
      setConsultations(data)
    } catch (error) {
      console.error("Error loading patient queue:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = searchTerm === "" || 
      consultation.patient.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patient.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter
    const matchesType = typeFilter === "all" || consultation.consultationType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getConsultationTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video_call': return <Video className="h-4 w-4" />
      case 'phone_call': return <Phone className="h-4 w-4" />
      case 'chat_only': return <MessageCircle className="h-4 w-4" />
      case 'in_person': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLevel = (consultation: DoctorConsultationData) => {
    const now = new Date()
    const scheduledTime = new Date(consultation.scheduledAt)
    const timeDiff = scheduledTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    if (hoursDiff <= 1) return 'urgent'
    if (hoursDiff <= 4) return 'high'
    if (hoursDiff <= 24) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth?: Date | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Queue</h1>
          <p className="text-muted-foreground mt-2">
            Manage your pending consultations and appointments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadQueue}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
            <p className="text-xs text-muted-foreground">Pending consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {consultations.filter(c => getPriorityLevel(c) === 'urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">Next 1 hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Calls</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultations.filter(c => c.consultationType === 'video_call').length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring video setup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${consultations.reduce((sum, c) => sum + (parseFloat(c.consultationFee || '0')), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From pending consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video_call">Video Call</SelectItem>
            <SelectItem value="phone_call">Phone Call</SelectItem>
            <SelectItem value="chat_only">Chat Only</SelectItem>
            <SelectItem value="in_person">In Person</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue List */}
      {filteredConsultations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients in queue</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "No patients match your current filters."
                : "Your patient queue is empty at the moment."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConsultations
            .sort((a, b) => {
              // Sort by priority first, then by scheduled time
              const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
              const aPriority = getPriorityLevel(a)
              const bPriority = getPriorityLevel(b)
              
              if (aPriority !== bPriority) {
                return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder]
              }
              
              return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            })
            .map((consultation, index) => {
              const priority = getPriorityLevel(consultation)
              const patient = consultation.patient
              const age = calculateAge(patient.dateOfBirth)

              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-md transition-all border-l-4 ${getPriorityColor(priority)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={patient.user.profileImage || ''} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                              {getPatientInitials(patient.user.firstName, patient.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-xl">
                              {patient.user.firstName} {patient.user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">{patient.user.email}</p>
                            <div className="flex items-center gap-4 text-sm">
                              {age && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {age} years old
                                </span>
                              )}
                              {patient.gender && (
                                <span className="capitalize">{patient.gender}</span>
                              )}
                              {patient.bloodType && patient.bloodType !== 'unknown' && (
                                <span>{patient.bloodType}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(priority)} variant="outline">
                              {priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(consultation.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatTime(consultation.scheduledAt)}</span>
                          </div>
                          <Badge className={getStatusColor(consultation.status)}>
                            {consultation.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          {getConsultationTypeIcon(consultation.consultationType)}
                          <span className="capitalize font-medium">
                            {consultation.consultationType.replace('_', ' ')}
                          </span>
                          <span className="text-muted-foreground">
                            ({consultation.duration} min)
                          </span>
                        </div>
                        
                        {consultation.consultationFee && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              ${consultation.consultationFee}
                            </span>
                          </div>
                        )}
                      </div>

                      {consultation.symptoms && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-sm text-blue-900 mb-1">Reported Symptoms:</p>
                          <p className="text-sm text-blue-800">
                            {Array.isArray(consultation.symptoms) 
                              ? consultation.symptoms.join(', ') 
                              : consultation.symptoms
                            }
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {consultation.consultationType === 'video_call' && consultation.meetingLink && (
                          <Button size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Start Video Call
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/consultation/${consultation.id}`}>
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Start Consultation
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/patient-records?patient=${patient.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Records
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
        </div>
      )}
    </div>
  )
}
