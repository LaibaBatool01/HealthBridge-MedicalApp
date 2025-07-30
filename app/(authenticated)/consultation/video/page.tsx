"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff,
  Phone,
  MessageCircle,
  Settings,
  ArrowLeft,
  Circle,
  Users,
  Monitor,
  Camera
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type Doctor = {
  id: string
  name: string
  specialty: string
  isOnline: boolean
  avatar?: string
}

export default function VideoConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isConnected, setIsConnected] = useState(true)

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

    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams])

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    router.push("/dashboard?consultation=completed")
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading video consultation...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={doctor.avatar} />
                <AvatarFallback className="bg-blue-100 text-gray-900">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">{doctor.name}</h3>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  <span className="text-sm text-gray-300">
                    {doctor.specialty} • Connected
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {formatCallDuration(callDuration)}
            </Badge>
            
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
              <Circle className="h-3 w-3 fill-green-400 text-green-400 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative h-screen">
        
        {/* Doctor's Video (Main) */}
        <div className="absolute inset-0">
          <div className="h-full w-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4">
                <AvatarImage src={doctor.avatar} />
                <AvatarFallback className="bg-blue-100 text-gray-900 text-4xl">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-2">{doctor.name}</h2>
              <p className="text-blue-200">{doctor.specialty}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Video className="h-5 w-5" />
                <span>Video consultation in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient's Video (Picture-in-Picture) */}
        <div className="absolute top-20 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/30">
          <div className="h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            {isVideoOn ? (
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Your Video</p>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Camera Off</p>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="absolute bottom-24 left-6">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <Circle className={`h-3 w-3 fill-current ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-sm">
              {isConnected ? 'Stable Connection' : 'Connection Issues'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4">
          
          {/* Audio Control */}
          <Button
            variant={isAudioOn ? "secondary" : "destructive"}
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={toggleAudio}
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Video Control */}
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600"
            onClick={handleEndCall}
          >
            <Phone className="h-6 w-6 rotate-135" />
          </Button>

          {/* Chat */}
          <Button
            variant="secondary"
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={() => router.push(`/consultation/chat?doctor=${doctor.id}`)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>

          {/* Settings */}
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full border-white/30 text-white hover:bg-white/20"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Video consultation with {doctor.name} • {formatCallDuration(callDuration)}
          </p>
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 space-y-3">
        <Card className="bg-black/50 border-white/20">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Monitor className="h-6 w-6 mx-auto text-blue-400" />
              <p className="text-xs text-gray-300">Screen Share</p>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-white/20">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Users className="h-6 w-6 mx-auto text-green-400" />
              <p className="text-xs text-gray-300">Add Specialist</p>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/20">
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 