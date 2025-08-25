"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Star,
  Stethoscope,
  DollarSign,
  AlertCircle
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type BookingStep = "doctor-selection" | "details" | "scheduling" | "payment" | "confirmation"

type ConsultationType = "chat" | "video" | "appointment"

type Doctor = {
  id: string
  name: string
  specialty: string
  rating: number
  consultationFee: number
  avatar?: string
  bio?: string
  yearsOfExperience?: number
  isAvailable: boolean
}

// Available time slots (mock data)
const availableSlots = [
  { date: "2025-01-28", times: ["09:00", "10:30", "14:00", "15:30", "16:00"] },
  { date: "2025-01-29", times: ["09:30", "11:00", "13:00", "14:30", "17:00"] },
  { date: "2025-01-30", times: ["10:00", "11:30", "15:00", "16:30"] }
]

function ConsultationBookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState<BookingStep>("doctor-selection" as BookingStep)
  const [consultationType, setConsultationType] = useState<ConsultationType>("chat")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    symptoms: "",
    urgency: "medium",
    notes: "",
    selectedDate: "",
    selectedTime: "",
    paymentMethod: "card"
  })

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const { getAvailableDoctors, getDoctorById } = await import("@/actions/doctors")
        
        // Get doctor ID and consultation type from URL params
        const doctorId = searchParams.get("doctor")
        const type = searchParams.get("type") as ConsultationType
        
        if (type) {
          setConsultationType(type)
        }

        if (doctorId) {
          // If doctor ID is provided, fetch that specific doctor and skip to details
          const doctor = await getDoctorById(doctorId)
          if (doctor) {
            setSelectedDoctor(doctor)
            setCurrentStep("details")
          } else {
            // Doctor not found, load all doctors for selection
            const doctors = await getAvailableDoctors()
            setAvailableDoctors(doctors)
            setCurrentStep("doctor-selection")
          }
        } else {
          // No doctor provided, load all doctors for selection
          const doctors = await getAvailableDoctors()
          setAvailableDoctors(doctors)
          setCurrentStep("doctor-selection")
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        setAvailableDoctors([])
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchDoctors()
  }, [searchParams])

  const handleNext = () => {
    const steps: BookingStep[] = ["doctor-selection", "details", "scheduling", "payment", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentStep === "doctor-selection") {
      router.back()
      return
    }
    
    const steps: BookingStep[] = ["doctor-selection", "details", "scheduling", "payment", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setCurrentStep("details")
  }

  const handleBooking = async () => {
    if (isBooking) return // Prevent double-clicks
    
    setIsBooking(true)
    try {
      if (!selectedDoctor) {
        throw new Error("No doctor selected")
      }

      // Create consultation record for chat/video
      if (consultationType === "chat" || consultationType === "video") {
        const response = await fetch('/api/consultations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            doctorId: selectedDoctor.id,
            consultationType: consultationType === "video" ? "video_call" : "chat_only",
            symptoms: bookingData.symptoms ? [bookingData.symptoms] : undefined,
            scheduledAt: new Date().toISOString(),
            duration: "30"
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Redirect to the consultation with the proper ID
          if (consultationType === "chat") {
            router.push(`/consultation/chat?id=${result.consultation.id}`)
          } else if (consultationType === "video") {
            router.push(`/consultation/video?id=${result.consultation.id}`)
          }
        } else {
          throw new Error(result.error || "Failed to create consultation")
        }
      } else {
        // For appointments, just show confirmation and redirect to dashboard
        setCurrentStep("confirmation")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
      
      // Show more specific error messages
      const errorMessage = error instanceof Error ? error.message : "Failed to book consultation"
      
      if (errorMessage.includes("Not authenticated")) {
        alert("Please log in to book a consultation.")
        window.location.href = "/login"
      } else if (errorMessage.includes("Patient profile not found")) {
        alert("Please complete your patient profile first.")
        window.location.href = "/onboarding"
      } else {
        alert(`Booking failed: ${errorMessage}. Please try again.`)
      }
    } finally {
      setIsBooking(false)
    }
  }

  const getConsultationTypeInfo = () => {
    switch (consultationType) {
      case "chat":
        return {
          icon: MessageCircle,
          title: "Start Chat Consultation",
          description: "Begin chatting with the doctor immediately",
          duration: "Available now",
          immediate: true
        }
      case "video":
        return {
          icon: Video,
          title: "Start Video Consultation",
          description: "Begin video call with the doctor immediately",
          duration: "Available now",
          immediate: true
        }
      case "appointment":
        return {
          icon: Calendar,
          title: "Book Appointment",
          description: "Schedule a future consultation",
          duration: "30 minutes",
          immediate: false
        }
      default:
        return {
          icon: MessageCircle,
          title: "Consultation",
          description: "",
          duration: "",
          immediate: false
        }
    }
  }

  const consultationInfo = getConsultationTypeInfo()
  const ConsultationIcon = consultationInfo.icon

  // Loading state
  if (loadingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-600">Finding available doctors...</p>
        </div>
      </div>
    )
  }

  if (currentStep === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                Consultation Booked Successfully!
              </h1>
              <p className="text-muted-foreground">
                Your consultation with {selectedDoctor?.name} has been confirmed.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Doctor:</span>
                    <span className="font-medium">{selectedDoctor?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{consultationType}</span>
                  </div>
                  {consultationType === "appointment" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{bookingData.selectedDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{bookingData.selectedTime}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span>Fee:</span>
                    <span className="font-bold text-green-600">${selectedDoctor?.consultationFee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                {consultationType === "appointment" 
                  ? "You'll receive a reminder before your appointment. Check your dashboard for updates."
                  : "You can start your consultation anytime. Check your dashboard to manage consultations."
                }
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
                {consultationType !== "appointment" && selectedDoctor && (
                  <Button onClick={() => router.push(`/consultation/${consultationType}?doctor=${selectedDoctor.id}`)}>
                    Start Consultation Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Doctor selection step
  if (currentStep === "doctor-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              <div className="text-center">
                <Stethoscope className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Choose Your Doctor</h1>
                <p className="text-muted-foreground">Select a doctor for your {consultationType} consultation</p>
              </div>
            </div>

            {/* Consultation Type Selector */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Consultation Type</CardTitle>
                <CardDescription>Select how you'd like to consult</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      consultationType === "chat" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setConsultationType("chat")}
                  >
                    <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold">Chat Consultation</h3>
                    <p className="text-sm text-muted-foreground">Text-based consultation</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      consultationType === "video" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setConsultationType("video")}
                  >
                    <Video className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold">Video Call</h3>
                    <p className="text-sm text-muted-foreground">Face-to-face consultation</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      consultationType === "appointment" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setConsultationType("appointment")}
                  >
                    <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold">Appointment</h3>
                    <p className="text-sm text-muted-foreground">Schedule for later</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Doctors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDoctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No doctors available</h3>
                  <p className="text-muted-foreground mb-4">
                    No doctors are currently available for consultation.
                  </p>
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                availableDoctors.map((doctor) => (
                  <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <Avatar className="h-20 w-20 mx-auto mb-3">
                          <AvatarImage src={doctor.avatar} />
                          <AvatarFallback className="text-lg">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold">{doctor.name}</h3>
                        <p className="text-muted-foreground">{doctor.specialty}</p>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{doctor.rating.toFixed(1)}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.yearsOfExperience}+ years exp.
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ${doctor.consultationFee}
                          </span>
                          <Badge variant="secondary">Available</Badge>
                        </div>
                      </div>
                      
                      {doctor.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {doctor.bio}
                        </p>
                      )}
                      
                      <Button 
                        onClick={() => handleDoctorSelect(doctor)}
                        className="w-full"
                      >
                        Select Doctor
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safety check - if no doctor selected and not on doctor selection step, redirect
  if (!selectedDoctor && (currentStep as string) !== "doctor-selection") {
    setCurrentStep("doctor-selection" as BookingStep)
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="text-center">
              <ConsultationIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">{consultationInfo.title}</h1>
              <p className="text-muted-foreground">{consultationInfo.description}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Doctor Info */}
              {selectedDoctor && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedDoctor.avatar} />
                        <AvatarFallback className="text-lg">
                          {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
                        <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedDoctor.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${selectedDoctor.consultationFee}</div>
                        <div className="text-sm text-muted-foreground">consultation fee</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Consultation Details */}
              {currentStep === "details" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Details</CardTitle>
                    <CardDescription>
                      Tell the doctor about your symptoms and concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="symptoms">Current Symptoms</Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Describe your symptoms in detail..."
                        value={bookingData.symptoms}
                        onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select value={bookingData.urgency} onValueChange={(value) => setBookingData({...bookingData, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Routine consultation</SelectItem>
                          <SelectItem value="medium">Medium - Need medical advice</SelectItem>
                          <SelectItem value="high">High - Urgent concern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information for the doctor..."
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        rows={3}
                      />
                    </div>

                    {consultationInfo.immediate && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">Ready to Start</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          You can begin your consultation immediately after booking.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Scheduling (for appointments only) */}
              {currentStep === "scheduling" && consultationType === "appointment" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Date & Time</CardTitle>
                    <CardDescription>
                      Choose your preferred appointment slot
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {availableSlots.map((day) => (
                      <div key={day.date}>
                        <h4 className="font-semibold mb-3">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {day.times.map((time) => (
                            <Button
                              key={time}
                              variant={bookingData.selectedDate === day.date && bookingData.selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBookingData({
                                ...bookingData, 
                                selectedDate: day.date, 
                                selectedTime: time
                              })}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Payment */}
              {currentStep === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                      Secure payment for your consultation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold">Payment Summary</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Consultation Fee:</span>
                          <span>${selectedDoctor?.consultationFee || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span>$5</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1 mt-2">
                          <span>Total:</span>
                          <span>${(selectedDoctor?.consultationFee || 0) + 5}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input 
                          id="card-number" 
                          placeholder="1234 5678 9012 3456"
                          className="font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Secure Payment</span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Consultation Type:</span>
                      <span className="font-medium capitalize">{consultationType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{consultationInfo.duration}</span>
                    </div>
                    {bookingData.selectedDate && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Date:</span>
                          <span className="font-medium">
                            {new Date(bookingData.selectedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time:</span>
                          <span className="font-medium">{bookingData.selectedTime}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {selectedDoctor && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total Fee:</span>
                        <span>${selectedDoctor.consultationFee}</span>
                      </div>
                    </div>
                  )}

                  {(currentStep as string) !== "doctor-selection" && selectedDoctor && (
                    <Button 
                      className="w-full"
                      onClick={currentStep === "payment" ? handleBooking : handleNext}
                      disabled={
                        isBooking ||
                        (currentStep === "details" && !bookingData.symptoms) ||
                        (currentStep === "scheduling" && consultationType === "appointment" && (!bookingData.selectedDate || !bookingData.selectedTime))
                      }
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : currentStep === "payment" 
                        ? `Pay $${selectedDoctor.consultationFee + 5} & Book`
                        : consultationInfo.immediate && currentStep === "details"
                        ? `Book & Start ${consultationType === "chat" ? "Chat" : "Video Call"}`
                        : "Continue"
                      }
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsultationBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation booking...</p>
        </div>
      </div>
    }>
      <ConsultationBookingPageContent />
    </Suspense>
  )
} 