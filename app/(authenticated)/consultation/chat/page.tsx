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
  CheckCircle
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type Message = {
  id: string
  sender: "patient" | "doctor"
  message: string
  timestamp: Date
  type: "text" | "prescription" | "system"
}

type Doctor = {
  id: string
  name: string
  specialty: string
  isOnline: boolean
  avatar?: string
}

// Mock messages for demo
const mockMessages: Message[] = [
  {
    id: "1",
    sender: "doctor",
    message: "Hello! I'm Dr. Johnson. I see you've reported chest pain and fatigue. Can you tell me more about when these symptoms started?",
    timestamp: new Date(Date.now() - 300000),
    type: "text"
  },
  {
    id: "2",
    sender: "patient", 
    message: "Hi Doctor. The chest pain started about 3 days ago, and I've been feeling very tired for the past week.",
    timestamp: new Date(Date.now() - 240000),
    type: "text"
  },
  {
    id: "3",
    sender: "doctor",
    message: "I understand. On a scale of 1-10, how would you rate the chest pain? And does it worsen with physical activity?",
    timestamp: new Date(Date.now() - 180000),
    type: "text"
  },
  {
    id: "4",
    sender: "patient",
    message: "I'd say it's about a 6/10, and yes, it gets worse when I walk up stairs or exercise.",
    timestamp: new Date(Date.now() - 120000),
    type: "text"
  }
]

function ChatConsultationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [consultationStarted, setConsultationStarted] = useState(true)

  useEffect(() => {
    const doctorId = searchParams.get("doctor")
    
    // Mock doctor data
    setDoctor({
      id: doctorId || "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      isOnline: true,
      avatar: undefined
    })
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "patient",
      message: newMessage,
      timestamp: new Date(),
      type: "text"
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate doctor response after a delay
    setTimeout(() => {
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "doctor",
        message: getAutomaticResponse(newMessage),
        timestamp: new Date(),
        type: "text"
      }
      setMessages(prev => [...prev, doctorResponse])
    }, 2000)
  }

  const getAutomaticResponse = (patientMessage: string) => {
    const lowerMessage = patientMessage.toLowerCase()
    
    if (lowerMessage.includes("pain") || lowerMessage.includes("hurt")) {
      return "I understand you're experiencing pain. Can you describe the exact location and what type of pain it is - sharp, dull, aching, or burning?"
    }
    
    if (lowerMessage.includes("tired") || lowerMessage.includes("fatigue")) {
      return "Fatigue can have many causes. Have you noticed any other symptoms like shortness of breath, dizziness, or changes in your appetite?"
    }
    
    if (lowerMessage.includes("thank") || lowerMessage.includes("appreciate")) {
      return "You're welcome! Based on our conversation, I'm going to prescribe some tests and medication. Is there anything else you'd like to discuss?"
    }
    
    return "Thank you for that information. Let me review your symptoms. Based on what you've told me, I recommend we run some tests to get a clearer picture."
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

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading consultation...</h2>
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
                <Clock className="h-3 w-3" />
                Chat Active
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
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
                </div>
              </div>

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "patient" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.sender === "patient" ? "order-2" : "order-1"}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === "patient" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${
                      message.sender === "patient" ? "text-right" : "text-left"
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  <Avatar className={`h-8 w-8 ${message.sender === "patient" ? "order-1 mr-2" : "order-2 ml-2"}`}>
                    <AvatarImage src={message.sender === "doctor" ? doctor.avatar : undefined} />
                    <AvatarFallback className={message.sender === "patient" ? "bg-blue-100" : "bg-gray-100"}>
                      {message.sender === "patient" ? "P" : doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
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
                  <Button variant="outline" size="sm">Start Video Call</Button>
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