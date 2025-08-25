"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video,
  Paperclip,
  ArrowLeft,
  Circle,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMessages } from "@/hooks/use-messages"
import { getConsultationById } from "@/actions/consultations"
import { getDoctorById } from "@/actions/doctors"

interface Consultation {
  id: string
  doctor_id: string
  patient_id: string
  consultation_type: string
  status: string
  scheduled_at: Date
  symptoms?: string | null
  [key: string]: any // Allow additional properties from the database
}

interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  consultationFee: number
  avatar?: string
  bio?: string
  yearsOfExperience?: number
  isAvailable: boolean
  isOnline?: boolean // Add this for the UI
}

function ChatConsultationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [newMessage, setNewMessage] = useState("")
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get consultation ID from URL params
  const consultationId = searchParams.get("id") || searchParams.get("consultationId") || ""

  // Use the real-time messages hook
  const { 
    messages, 
    loading: messagesLoading, 
    error: messagesError,
    sendMessage,
    sendingMessage 
  } = useMessages({ 
    consultationId,
    enabled: !!consultationId 
  })

  // Fetch consultation and doctor data
  useEffect(() => {
    async function fetchData() {
      if (!consultationId) {
        setError("No consultation ID provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch consultation details
        const consultationData = await getConsultationById(consultationId)
        if (!consultationData) {
          throw new Error("Consultation not found")
        }

        setConsultation(consultationData as Consultation)

        // Fetch doctor details
        const doctorData = await getDoctorById((consultationData as any).doctor_id)
        if (!doctorData) {
          throw new Error("Doctor not found")
        }

        // Add isOnline status (you can implement real logic later)
        setDoctor({
          ...doctorData,
          isOnline: true // Default to online for now
        })

      } catch (err) {
        console.error("Error fetching consultation data:", err)
        setError(err instanceof Error ? err.message : "Failed to load consultation")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [consultationId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return

    try {
      await sendMessage(newMessage.trim())
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleEndConsultation = () => {
    router.push("/dashboard?consultation=completed")
  }

  const handleSwitchToVideo = () => {
    if (consultation) {
      router.push(`/consultation/video?id=${consultation.id}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading consultation...</h2>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !consultation || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Consultation</h2>
          <p className="text-muted-foreground mb-4">{error || "Consultation or doctor not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.avatar} />
                <AvatarFallback className="bg-blue-100">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">{doctor.name}</h3>
                <div className="flex items-center gap-2">
                  <Circle className={`h-3 w-3 fill-current ${doctor.isOnline ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm text-muted-foreground">
                    {doctor.isOnline ? 'Online' : 'Offline'} • {doctor.specialty}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Circle className={`h-3 w-3 fill-current ${messagesLoading ? 'text-yellow-500' : 'text-green-500'}`} />
                {messagesLoading ? 'Connecting...' : 'Chat Active'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleSwitchToVideo}
              >
                <Video className="h-4 w-4" />
                Switch to Video
              </Button>
              <Button variant="destructive" size="sm" onClick={handleEndConsultation}>
                End Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <Card className="h-[600px] flex flex-col">
            
            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Consultation Start Notice */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                  <Stethoscope className="h-4 w-4" />
                  Consultation started with {doctor.name}
                  {consultation.symptoms && (
                    <span className="text-xs ml-2">• Symptoms: {consultation.symptoms}</span>
                  )}
                </div>
              </div>

              {/* Messages Loading */}
              {messagesLoading && messages.length === 0 && (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              )}

              {/* Messages Error */}
              {messagesError && (
                <div className="text-center py-4">
                  <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{messagesError}</p>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => {
                const isCurrentUser = message.senderType === "patient" // Assuming current user is patient
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "order-2" : "order-1"}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        isCurrentUser 
                          ? "bg-blue-600 text-white" 
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        {message.messageType === "prescription" && (
                          <div className="mt-2 p-2 bg-white/20 rounded-lg">
                            <p className="text-xs font-medium">💊 Prescription</p>
                          </div>
                        )}
                        {message.messageType === "system" && (
                          <div className="text-xs opacity-75 mt-1">
                            System message
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}>
                        <p className="text-xs text-muted-foreground">
                          {message.senderName} • {formatTime(new Date(message.createdAt))}
                        </p>
                        {message.status === "read" && isCurrentUser && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <Avatar className={`h-8 w-8 ${isCurrentUser ? "order-1 mr-2" : "order-2 ml-2"}`}>
                      <AvatarImage src={message.senderType === "doctor" ? doctor.avatar : undefined} />
                      <AvatarFallback className={isCurrentUser ? "bg-blue-100" : "bg-gray-100"}>
                        {message.senderType === "patient" ? "P" : doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )
              })}

              {/* Empty state */}
              {!messagesLoading && messages.length === 0 && !messagesError && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Start the conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Send your first message to {doctor.name} to begin the consultation.
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendingMessage}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
                {messagesError && (
                  <span className="text-red-500 ml-2">• {messagesError}</span>
                )}
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Get Prescription</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Doctor can send digital prescription
                  </p>
                  <Button variant="outline" size="sm">Request Prescription</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Video className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Switch to Video</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Continue with video call
                  </p>
                  <Button variant="outline" size="sm" onClick={handleSwitchToVideo}>Start Video Call</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Phone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Follow-up</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schedule follow-up appointment
                  </p>
                  <Button variant="outline" size="sm">Schedule Follow-up</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat consultation...</p>
        </div>
      </div>
    }>
      <ChatConsultationPageContent />
    </Suspense>
  )
} 