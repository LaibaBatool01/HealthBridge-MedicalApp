import { Suspense } from "react"
import { getConsultationById } from "@/actions/consultations"
import { VideoConsultation } from "@/components/video-consultation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video } from "lucide-react"
import Link from "next/link"

interface VideoConsultationPageProps {
  searchParams: Promise<{ 
    id?: string 
    consultationId?: string
  }>
}

async function VideoConsultationPageContent({ searchParams }: VideoConsultationPageProps) {
  // Get consultation ID from search params
  const params = await searchParams
  const consultationId = params.id || params.consultationId
  
  if (!consultationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Video className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold">No Consultation Found</h2>
          <p className="text-gray-600">Please provide a valid consultation ID.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  try {
    // Fetch consultation data
    const consultation = await getConsultationById(consultationId)

    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Video Consultation</h1>
              <p className="text-muted-foreground">
                {consultation.currentUser.userType === 'doctor' 
                  ? `Meeting with ${consultation.patientFirstName} ${consultation.patientLastName}`
                  : `Meeting with Dr. ${consultation.doctorLastName}`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <VideoConsultation
              consultationId={consultationId}
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
            <div className="bg-card text-card-foreground rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Consultation Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Scheduled:</span>
                  <p className="font-medium">
                    {new Date(consultation.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{consultation.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Meeting Status:</span>
                  <p className="font-medium capitalize">{consultation.meeting_status}</p>
                </div>
                {consultation.consultation_fee && (
                  <div>
                    <span className="text-muted-foreground">Fee:</span>
                    <p className="font-medium">${consultation.consultation_fee}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptoms */}
            {consultation.symptoms && (
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Reported Symptoms</h3>
                <div className="text-sm">
                  {JSON.parse(consultation.symptoms).map((symptom: string, index: number) => (
                    <div key={index} className="mb-2 p-2 bg-muted rounded">
                      {symptom}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Notes */}
            {consultation.doctor_notes && (
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Doctor's Notes</h3>
                <p className="text-sm text-muted-foreground">
                  {consultation.doctor_notes}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {consultation.diagnosis && (
              <div className="bg-card text-card-foreground rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  {consultation.diagnosis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading consultation:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Video className="h-16 w-16 mx-auto text-red-400" />
          <h2 className="text-2xl font-bold">Consultation Not Found</h2>
          <p className="text-gray-600">
            The consultation you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }
}

export default function VideoConsultationPage({ searchParams }: VideoConsultationPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video consultation...</p>
        </div>
      </div>
    }>
      <VideoConsultationPageContent searchParams={searchParams} />
    </Suspense>
  )
} 