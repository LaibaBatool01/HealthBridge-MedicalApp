"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MessageCircle, 
  User, 
  CalendarDays,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Eye,
  MapPin,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { getTodaysConsultations, getUpcomingConsultations, type DoctorConsultationData } from "@/actions/doctor-consultations"

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("today")
  const [loading, setLoading] = useState(true)
  const [todaysConsultations, setTodaysConsultations] = useState<DoctorConsultationData[]>([])
  const [upcomingConsultations, setUpcomingConsultations] = useState<DoctorConsultationData[]>([])

  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadScheduleData = async () => {
    try {
      setLoading(true)
      const [todaysData, upcomingData] = await Promise.all([
        getTodaysConsultations(),
        getUpcomingConsultations()
      ])
      setTodaysConsultations(todaysData)
      setUpcomingConsultations(upcomingData)
    } catch (error) {
      console.error("Error loading schedule data:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const renderConsultationCard = (consultation: DoctorConsultationData, index: number) => {
    const patient = consultation.patient

    return (
      <motion.div
        key={consultation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.user.profileImage || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getPatientInitials(patient.user.firstName, patient.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {patient.user.firstName} {patient.user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{patient.user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getConsultationTypeIcon(consultation.consultationType)}
                    <span className="text-sm capitalize">{consultation.consultationType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatTime(consultation.scheduledAt)}</span>
                </div>
                <Badge className={getStatusColor(consultation.status)}>
                  {consultation.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Duration:</p>
                <p className="text-muted-foreground">{consultation.duration} minutes</p>
              </div>
              {consultation.consultationFee && (
                <div>
                  <p className="font-medium mb-1">Fee:</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">${consultation.consultationFee}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {consultation.consultationType === 'video_call' && consultation.meetingLink && (
                <Button asChild size="sm">
                  <Link href={consultation.meetingLink} target="_blank">
                    <Video className="h-4 w-4 mr-2" />
                    Join Video Call
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
          </CardContent>
        </Card>
      </motion.div>
    )
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Manage your appointments and consultations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadScheduleData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/schedule-settings">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysConsultations.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysConsultations.filter(c => c.status === 'scheduled').length} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingConsultations.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todaysConsultations.reduce((sum, c) => sum + (parseFloat(c.consultationFee || '0')), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {todaysConsultations.length} appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today's Schedule</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Today - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </div>

          {todaysConsultations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments today</h3>
                <p className="text-muted-foreground text-center">
                  You have a free day! Enjoy your time off.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todaysConsultations.map((consultation, index) => 
                renderConsultationCard(consultation, index)
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          </div>

          {upcomingConsultations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground text-center">
                  Your schedule is clear for the next few days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingConsultations.map((consultation, index) => (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={consultation.patient.user.profileImage || ''} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getPatientInitials(consultation.patient.user.firstName, consultation.patient.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {consultation.patient.user.firstName} {consultation.patient.user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{consultation.patient.user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getConsultationTypeIcon(consultation.consultationType)}
                              <span className="text-sm capitalize">{consultation.consultationType.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/consultation/${consultation.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
