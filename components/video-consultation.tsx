"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Users,
  Clock,
  AlertCircle
} from "lucide-react"

// Extend Window type to include JitsiMeetExternalAPI
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface VideoConsultationProps {
  consultationId: string
  consultationData: {
    id: string
    video_room_name: string
    scheduled_at: string
    doctor_joined: boolean
    patient_joined: boolean
    meeting_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    doctorFirstName?: string
    doctorLastName?: string
    patientFirstName?: string
    patientLastName?: string
  }
  currentUser: {
    id: string
    userType: 'doctor' | 'patient'
    firstName: string
    lastName: string
  }
  onMeetingStatusChange?: (status: string) => void
}

export function VideoConsultation({ 
  consultationId, 
  consultationData, 
  currentUser,
  onMeetingStatusChange 
}: VideoConsultationProps) {
  const [meetingActive, setMeetingActive] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [isJitsiReady, setIsJitsiReady] = useState(false)
  const apiRef = useRef<any>(null)

  // Check if Jitsi script is loaded
  useEffect(() => {
    const checkJitsiReady = () => {
      if (typeof window !== 'undefined' && window.JitsiMeetExternalAPI) {
        setIsJitsiReady(true)
      } else {
        // Wait for script to load
        setTimeout(checkJitsiReady, 500)
      }
    }
    checkJitsiReady()
  }, [])

  const joinMeeting = async () => {
    if (!isJitsiReady) {
      alert("Video service is loading. Please try again in a moment.")
      return
    }

    setIsJoining(true)

    try {
      // Generate secure room name
      const roomName = consultationData.video_room_name || `healthcare-${consultationId}`
      
      // Configure user display name
      const displayName = currentUser.userType === 'doctor' 
        ? `Dr. ${currentUser.lastName}`
        : currentUser.firstName

      // Initialize Jitsi Meet
      apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: roomName,
        width: '100%',
        height: 500,
        parentNode: document.querySelector('#jitsi-meet-container'),
        configOverwrite: {
          startWithAudioMuted: currentUser.userType === 'patient', // Patient starts muted
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          analytics: {
            disabled: true // Disable analytics for privacy
          }
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'chat', 'hangup', 'tileview', 'settings'
          ],
          SHOW_JITSI_WATERMARK: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          SHOW_CHROME_EXTENSION_BANNER: false
        },
        userInfo: {
          displayName: displayName,
          email: `${currentUser.userType}@consultation.local` // Fake email for identification
        }
      })

      // Set up event listeners
      apiRef.current.addEventListeners({
        readyToClose: () => {
          handleMeetingEnd()
        },
        participantJoined: (participant: any) => {
          setParticipantCount(prev => prev + 1)
          console.log('Participant joined:', participant.displayName)
          
          // Update database when someone joins
          updateMeetingStatus('in_progress')
        },
        participantLeft: (participant: any) => {
          setParticipantCount(prev => Math.max(0, prev - 1))
          console.log('Participant left:', participant.displayName)
        },
        videoConferenceJoined: () => {
          setMeetingActive(true)
          setIsJoining(false)
          console.log('Successfully joined the meeting')
          
          // Update user join status in database
          updateUserJoinStatus(true)
        },
        videoConferenceLeft: () => {
          handleMeetingEnd()
        }
      })

    } catch (error) {
      console.error('Error joining meeting:', error)
      setIsJoining(false)
      alert('Failed to join the meeting. Please try again.')
    }
  }

  const updateMeetingStatus = async (status: string) => {
    try {
      const response = await fetch('/api/consultations/update-meeting-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          status,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        onMeetingStatusChange?.(status)
      }
    } catch (error) {
      console.error('Error updating meeting status:', error)
    }
  }

  const updateUserJoinStatus = async (joined: boolean) => {
    try {
      await fetch('/api/consultations/update-user-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          userType: currentUser.userType,
          joined
        })
      })
    } catch (error) {
      console.error('Error updating user join status:', error)
    }
  }

  const handleMeetingEnd = () => {
    if (apiRef.current) {
      apiRef.current.dispose()
      apiRef.current = null
    }
    setMeetingActive(false)
    setIsJoining(false)
    setParticipantCount(0)
    
    // Update database
    updateMeetingStatus('completed')
    updateUserJoinStatus(false)
  }

  const endMeeting = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup')
    }
    handleMeetingEnd()
  }

  // Format scheduled time
  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Check if meeting time is now or past
  const isMeetingTime = () => {
    const now = new Date()
    const scheduledTime = new Date(consultationData.scheduled_at)
    const diffMinutes = (now.getTime() - scheduledTime.getTime()) / (1000 * 60)
    return diffMinutes >= -15 // Allow joining 15 minutes early
  }

  if (!isJitsiReady) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p>Loading video service...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Meeting Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Consultation
              </CardTitle>
              <CardDescription>
                Scheduled for {formatScheduledTime(consultationData.scheduled_at)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={meetingActive ? "default" : "secondary"}>
                {meetingActive ? "Live" : consultationData.meeting_status}
              </Badge>
              {participantCount > 0 && (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {participantCount} participant{participantCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Container */}
      <Card>
        <CardContent className="p-0">
          {!meetingActive ? (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
              {!isMeetingTime() ? (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Meeting Not Yet Available</h3>
                  <p className="text-muted-foreground mb-4">
                    You can join the consultation 15 minutes before the scheduled time.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled: {formatScheduledTime(consultationData.scheduled_at)}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Join Consultation
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {currentUser.userType === 'doctor' 
                      ? `Meeting with ${consultationData.patientFirstName} ${consultationData.patientLastName}`
                      : `Meeting with Dr. ${consultationData.doctorLastName}`
                    }
                  </p>
                  <Button 
                    onClick={joinMeeting} 
                    disabled={isJoining}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isJoining ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Join Video Call
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Meeting Controls */}
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Consultation</span>
                </div>
                <Button 
                  onClick={endMeeting} 
                  variant="destructive" 
                  size="sm"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>

              {/* Jitsi Meet Container */}
              <div 
                id="jitsi-meet-container" 
                className="w-full min-h-[500px] bg-black rounded-lg overflow-hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Instructions */}
      {!meetingActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Video Call Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>Make sure your camera and microphone are working</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>Use a stable internet connection for best quality</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>Find a quiet, well-lit space for the consultation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Have your medical history and current medications ready</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}