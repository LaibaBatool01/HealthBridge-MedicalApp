import { notFound, redirect } from "next/navigation"
import { getConsultationById } from "@/actions/consultations"
import { VideoConsultation } from "@/components/video-consultation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  User,
  Stethoscope
} from "lucide-react"

interface ConsultationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  try {
    const { id } = await params
    const consultation = await getConsultationById(id)
    
    if (!consultation) {
      notFound()
    }

    const formatDate = (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return (
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Video Consultation</h1>
          <p className="text-muted-foreground">
            {consultation.currentUser.userType === 'doctor' 
              ? `Consultation with ${consultation.patientFirstName} ${consultation.patientLastName}`
              : `Consultation with Dr. ${consultation.doctorLastName}`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <VideoConsultation
              consultationId={id}
              consultationData={{
                ...consultation,
                video_room_name: consultation.video_room_name || `healthcare-${consultation.id}`,
                scheduled_at: consultation.scheduled_at.toISOString(),
                meeting_status: consultation.meeting_status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
                doctorFirstName: consultation.doctorFirstName || undefined,
                doctorLastName: consultation.doctorLastName || undefined,
                patientFirstName: consultation.patientFirstName || undefined,
                patientLastName: consultation.patientLastName || undefined
              }}
              currentUser={{
                ...consultation.currentUser,
                userType: consultation.currentUser.userType as 'doctor' | 'patient'
              }}
            />
          </div>

          {/* Consultation Details Sidebar */}
          <div className="space-y-4">
            
            {/* Consultation Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Consultation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatDate(consultation.scheduled_at)}</p>
                    <p className="text-muted-foreground">{formatTime(consultation.scheduled_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Consultation Fee</p>
                    <p className="text-muted-foreground">${consultation.consultation_fee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={
                    consultation.status === 'completed' ? 'default' :
                    consultation.status === 'in_progress' ? 'secondary' :
                    consultation.status === 'scheduled' ? 'outline' : 'destructive'
                  }>
                    {consultation.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Dr. {consultation.doctorLastName}</span>
                  </div>
                  <Badge variant={consultation.doctor_joined ? "default" : "outline"}>
                    {consultation.doctor_joined ? "Joined" : "Not joined"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {consultation.patientFirstName} {consultation.patientLastName}
                    </span>
                  </div>
                  <Badge variant={consultation.patient_joined ? "default" : "outline"}>
                    {consultation.patient_joined ? "Joined" : "Not joined"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms (if available) */}
            {consultation.symptoms && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Reported Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {JSON.parse(consultation.symptoms).map((symptom: string, index: number) => (
                      <div key={index} className="mb-1">
                        • {symptom}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagnosis (if available) */}
            {consultation.diagnosis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{consultation.diagnosis}</p>
                </CardContent>
              </Card>
            )}

            {/* Doctor Notes (if available and user is doctor) */}
            {consultation.doctor_notes && consultation.currentUser.userType === 'doctor' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    My Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{consultation.doctor_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Meeting Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meeting Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>• Ensure you're in a quiet, private space</div>
                <div>• Test your camera and microphone beforehand</div>
                <div>• Have your medical records and medications ready</div>
                <div>• Take notes during the consultation</div>
                <div>• Ask questions if anything is unclear</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )

  } catch (error) {
    console.error("Error loading consultation:", error)
    redirect("/dashboard")
  }
}