"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Heart,
  MessageCircle,
  Video,
  Phone,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Globe
} from "lucide-react"
import { useRouter } from "next/navigation"

type Doctor = {
  id: string
  name: string
  specialty: string
  subSpecialty?: string
  rating: number
  reviewCount: number
  yearsExperience: number
  consultationFee: number
  isAvailable: boolean
  nextAvailable: string
  languages: string[]
  bio: string
  avatar?: string
  education: string[]
  certifications: string[]
  matchReason: string
  relevanceScore: number
}

// Mock doctors with specialization matching
const mockDoctorsData: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    subSpecialty: "Heart Disease",
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 12,
    consultationFee: 75,
    isAvailable: true,
    nextAvailable: "Today 2:30 PM",
    languages: ["English", "Spanish"],
    bio: "Specialized in heart disease, chest pain, and cardiovascular conditions. Expert in preventive cardiology.",
    education: ["Harvard Medical School", "Johns Hopkins Cardiology Fellowship"],
    certifications: ["Board Certified Cardiologist", "FACC"],
    matchReason: "Specializes in chest pain and heart conditions",
    relevanceScore: 95
  },
  {
    id: "2", 
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    subSpecialty: "Headache Medicine",
    rating: 4.8,
    reviewCount: 89,
    yearsExperience: 8,
    consultationFee: 80,
    isAvailable: true,
    nextAvailable: "Tomorrow 10:00 AM",
    languages: ["English", "Mandarin"],
    bio: "Expert in treating headaches, migraines, and neurological disorders. Specializes in chronic pain management.",
    education: ["Stanford Medical School", "UCSF Neurology Residency"],
    certifications: ["Board Certified Neurologist", "Headache Medicine Certificate"],
    matchReason: "Expert in headache and neurological symptoms",
    relevanceScore: 90
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Family Medicine", 
    subSpecialty: "Primary Care",
    rating: 4.7,
    reviewCount: 203,
    yearsExperience: 15,
    consultationFee: 50,
    isAvailable: true,
    nextAvailable: "Today 4:00 PM",
    languages: ["English", "Spanish", "Portuguese"],
    bio: "Comprehensive primary care with expertise in general symptoms, fatigue, and wellness checkups.",
    education: ["UCLA Medical School", "Kaiser Family Medicine Residency"],
    certifications: ["Board Certified Family Medicine", "AAFP Member"],
    matchReason: "Treats general symptoms and overall wellness",
    relevanceScore: 85
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Internal Medicine",
    subSpecialty: "Infectious Disease",
    rating: 4.9,
    reviewCount: 156,
    yearsExperience: 10,
    consultationFee: 70,
    isAvailable: true,
    nextAvailable: "Today 6:00 PM",
    languages: ["English"],
    bio: "Specializes in fever, infections, and internal medicine. Expert in diagnosing complex symptoms.",
    education: ["Mayo Clinic Medical School", "Cleveland Clinic Fellowship"],
    certifications: ["Board Certified Internal Medicine", "Infectious Disease Specialist"],
    matchReason: "Specializes in fever and infection-related symptoms",
    relevanceScore: 88
  }
]

export default function DoctorRecommendationsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patientSymptoms, setPatientSymptoms] = useState<string[]>([])
  const [urgencyLevel, setUrgencyLevel] = useState<string>("")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, this would come from the onboarding data
    // For now, we'll use mock data based on common symptoms
    setPatientSymptoms(["Headache", "Fatigue", "Chest Pain"])
    setUrgencyLevel("medium")
    
    // Filter and sort doctors based on symptoms
    const relevantDoctors = mockDoctorsData
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 4)
    
    setDoctors(relevantDoctors)
  }, [])

  const handleBookConsultation = (doctorId: string, type: "video" | "chat" | "appointment") => {
    setSelectedDoctor(doctorId)
    // Redirect to booking page with doctor and consultation type
    router.push(`/consultation/book?doctor=${doctorId}&type=${type}`)
  }

  const handleSkipToDashboard = () => {
    router.push("/dashboard")
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">Urgent Care Needed</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medical Attention Recommended</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800">Routine Care</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Recommended Doctors for You</h1>
            <p className="text-muted-foreground mb-4">
              Based on your symptoms, we've found the best specialists to help you
            </p>
            
            {/* Patient Symptoms Summary */}
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Your Symptoms:</span>
                  {getUrgencyBadge(urgencyLevel)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="outline">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctors List */}
          <div className="space-y-6">
            {doctors.map((doctor, index) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Doctor Avatar & Basic Info */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={doctor.avatar} />
                        <AvatarFallback className="text-lg bg-blue-100">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{doctor.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Stethoscope className="h-4 w-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">{doctor.specialty}</span>
                            {doctor.subSpecialty && (
                              <span className="text-muted-foreground">• {doctor.subSpecialty}</span>
                            )}
                          </div>
                          
                          {/* Match Reason */}
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {doctor.matchReason}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {doctor.relevanceScore}% Match
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Recommendation Badge */}
                        {index === 0 && (
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            Most Recommended
                          </Badge>
                        )}
                      </div>

                      {/* Rating and Experience */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{doctor.rating}</span>
                          <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                        </div>
                        <div className="text-muted-foreground">
                          {doctor.yearsExperience} years experience
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">${doctor.consultationFee}</span>
                          <span className="text-muted-foreground text-sm">per consultation</span>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Speaks:</span>
                        <div className="flex gap-1">
                          {doctor.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-muted-foreground text-sm">{doctor.bio}</p>

                      {/* Availability and Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Available: {doctor.nextAvailable}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleBookConsultation(doctor.id, "chat")}
                          >
                            <MessageCircle className="h-4 w-4" />
                            Start Chat
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleBookConsultation(doctor.id, "video")}
                          >
                            <Video className="h-4 w-4" />
                            Video Call
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleBookConsultation(doctor.id, "appointment")}
                          >
                            <Calendar className="h-4 w-4" />
                            Book Appointment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Don't see the right specialist? You can browse all doctors or skip for now.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleSkipToDashboard}>
                Skip to Dashboard
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard/find-doctors">
                  Browse All Doctors
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 