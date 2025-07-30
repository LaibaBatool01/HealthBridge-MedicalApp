import { getCurrentMedicalUser, getUserDisplayName } from "@/actions/users"
import { getDashboardData } from "@/actions/dashboard"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { 
  Heart, 
  Calendar, 
  Pill, 
  FileText, 
  Activity, 
  Bell,
  Stethoscope,
  Search,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const clerkUser = await currentUser()
  const medicalUser = await getCurrentMedicalUser()

  if (!clerkUser || !medicalUser) {
    redirect("/login")
  }

  const dashboardData = await getDashboardData()
  const isPatient = medicalUser.userType === "patient"
  const isDoctor = medicalUser.userType === "doctor"

  return (
    <div className="space-y-6">
      {isPatient ? (
        <PatientDashboard user={medicalUser} data={dashboardData} />
      ) : (
        <DoctorDashboard user={medicalUser} data={dashboardData} />
      )}
    </div>
  )
}

function PatientDashboard({ user, data }: { user: any; data: any }) {
  const userName = getUserDisplayName(user)

  const formatAppointmentTime = (date: Date) => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your health overview and quick actions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="gap-2">
            <Link href="/dashboard/symptom-checker">
              <Search className="h-4 w-4" />
              Check Symptoms
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard/find-doctors">
              <Stethoscope className="h-4 w-4" />
              Find Doctor
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Appointment
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {data.nextAppointment ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatAppointmentTime(new Date(data.nextAppointment.scheduledAt))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dr. {data.nextAppointment.doctorFirstName} {data.nextAppointment.doctorLastName} at{' '}
                      {new Date(data.nextAppointment.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">None</div>
                    <p className="text-xs text-muted-foreground">
                      No upcoming appointments
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Prescriptions
                </CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activePrescriptionsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {data.prescriptionsDueTodayCount} due today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Health Score
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-xs text-muted-foreground">
                  Based on recent data
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest medical activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentConsultations.map((consultation: any) => (
                <div key={consultation.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">Consultation completed</p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {consultation.doctorFirstName} {consultation.doctorLastName} - {consultation.diagnosis || 'General consultation'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(consultation.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {data.recentPrescriptions.map((prescription: any) => (
                <div key={prescription.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">New prescription</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.medicationName} {prescription.dosage} - {prescription.frequency.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {data.recentConsultations.length === 0 && data.recentPrescriptions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions to manage your health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/symptom-checker">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Search className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Symptom Checker</p>
                        <p className="text-sm text-muted-foreground">Check your symptoms</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/consultations">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Start Consultation</p>
                        <p className="text-sm text-muted-foreground">Talk to a doctor</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/prescriptions">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Pill className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">View Prescriptions</p>
                        <p className="text-sm text-muted-foreground">Manage medications</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/medical-records">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Medical Records</p>
                        <p className="text-sm text-muted-foreground">View health history</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Basic Info</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medical History</span>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Contact</span>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                Complete Profile
              </Button>
            </CardContent>
          </Card>

          {/* Medication Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Today's Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentPrescriptions.slice(0, 2).map((prescription: any) => (
                <div key={prescription.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{prescription.medicationName}</p>
                    <p className="text-xs text-muted-foreground">
                      {prescription.dosage} - {prescription.frequency.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge variant={prescription.status === 'pending' ? 'secondary' : 'default'}>
                    {prescription.status === 'pending' ? 'Due' : prescription.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}

              {data.recentPrescriptions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No medication reminders
                </div>
              )}

              <Button size="sm" variant="outline" className="w-full">
                View All Reminders
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.slice(0, 3).map((appointment: any) => (
                  <div key={appointment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">
                        Dr. {appointment.doctorFirstName} {appointment.doctorLastName}
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/consultation/${appointment.id}`}>
                          Join
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {appointment.consultationType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formatAppointmentTime(new Date(appointment.scheduledAt))},{' '}
                      {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No upcoming appointments
                </div>
              )}
              
              <Button size="sm" variant="outline" className="w-full">
                Book New Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DoctorDashboard({ user, data }: { user: any; data: any }) {
  const userName = getUserDisplayName(user)
  const doctorData = user.doctorData

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning, Dr. {userName.split(' ')[userName.split(' ').length - 1]}! 👨‍⚕️
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your practice overview for today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="gap-2">
            <Link href="/dashboard/patient-queue">
              <MessageCircle className="h-4 w-4" />
              Patient Queue
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard/schedule">
              <Calendar className="h-4 w-4" />
              My Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Verification Status */}
      {!user.isVerified && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Account Under Review</h3>
                <p className="text-sm text-yellow-700">
                  Your documents are being verified. You'll be able to see patients once approved (typically 24-48 hours).
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/verification-status">
                  Check Status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Patients</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.todaysAppointmentsCount}</div>
                <p className="text-xs text-muted-foreground">
                  {data.upcomingAppointments.filter((apt: any) => apt.status === 'scheduled').length} consultations pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.upcomingAppointments.filter((apt: any) => apt.status === 'scheduled').length}
                </div>
                <p className="text-xs text-muted-foreground">Patients waiting</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPatientsCount}</div>
                <p className="text-xs text-muted-foreground">All time consultations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.rating ? parseFloat(data.rating).toFixed(1) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {data.totalRatings} reviews
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Current Patient Queue
              </CardTitle>
              <CardDescription>
                Patients waiting for consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.slice(0, 3).map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {appointment.patientFirstName?.[0]}{appointment.patientLastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {appointment.patientFirstName} {appointment.patientLastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.consultationType.replace('_', ' ')} - {' '}
                        {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">{appointment.status}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/consultation/${appointment.id}`}>
                        Join
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No patients in queue
                </div>
              )}

              <Button variant="outline" className="w-full">
                View All Patients
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/prescriptions/write">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Write Prescription</p>
                        <p className="text-sm text-muted-foreground">Create digital prescription</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/patient-records">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Patient Records</p>
                        <p className="text-sm text-muted-foreground">Access medical histories</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/schedule">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Manage Schedule</p>
                        <p className="text-sm text-muted-foreground">Set availability</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" asChild className="h-auto p-4 justify-start">
                  <Link href="/dashboard/earnings">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">View Earnings</p>
                        <p className="text-sm text-muted-foreground">Track your income</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                Practice Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification</span>
                {user.isVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Specialty</span>
                <span className="text-sm font-medium">{doctorData?.specialty || "General Practice"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Consultation Fee</span>
                <span className="text-sm font-medium">${doctorData?.consultationFee || "75"}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">09:00 - 10:00</p>
                <p className="text-xs text-muted-foreground">Follow-up: Sarah Wilson</p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">14:30 - 15:00</p>
                <p className="text-xs text-muted-foreground">New patient: Mike Johnson</p>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">16:00 - 16:30</p>
                <p className="text-xs text-muted-foreground">Consultation: Emma Davis</p>
              </div>
              
              <Button size="sm" variant="outline" className="w-full">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Consultations</span>
                <span className="text-sm font-medium">32</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Earnings</span>
                <span className="text-sm font-medium">$2,400</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Rating</span>
                <span className="text-sm font-medium">4.9/5</span>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
