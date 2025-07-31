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

type BookingStep = "details" | "scheduling" | "payment" | "confirmation"

type ConsultationType = "chat" | "video" | "appointment"

type Doctor = {
  id: string
  name: string
  specialty: string
  rating: number
  consultationFee: number
  avatar?: string
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
  
  const [currentStep, setCurrentStep] = useState<BookingStep>("details")
  const [consultationType, setConsultationType] = useState<ConsultationType>("chat")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingData, setBookingData] = useState({
    symptoms: "",
    urgency: "medium",
    notes: "",
    selectedDate: "",
    selectedTime: "",
    paymentMethod: "card"
  })

  useEffect(() => {
    // Get doctor ID and consultation type from URL params
    const doctorId = searchParams.get("doctor")
    const type = searchParams.get("type") as ConsultationType
    
    if (type) {
      setConsultationType(type)
    }

    // Mock doctor data (in real app, fetch from API)
    if (doctorId) {
      setSelectedDoctor({
        id: doctorId,
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        rating: 4.9,
        consultationFee: 75,
        avatar: undefined
      })
    }
  }, [searchParams])

  const handleNext = () => {
    const steps: BookingStep[] = ["details", "scheduling", "payment", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentStep === "details") {
      router.back()
      return
    }
    
    const steps: BookingStep[] = ["details", "scheduling", "payment", "confirmation"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleBooking = async () => {
    try {
      // Start consultation immediately for chat/video
      if (consultationType === "chat") {
        router.push(`/consultation/chat?doctor=${selectedDoctor?.id}`)
      } else if (consultationType === "video") {
        router.push(`/consultation/video?doctor=${selectedDoctor?.id}`)
      } else {
        // For appointments, just show confirmation and redirect to dashboard
        setCurrentStep("confirmation")
      }
    } catch (error) {
      console.error("Error booking consultation:", error)
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

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Doctor not found</h2>
          <Button onClick={() => router.push("/dashboard/find-doctors")}>
            Find Doctors
          </Button>
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
                Your consultation with {selectedDoctor.name} has been confirmed.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Doctor:</span>
                    <span className="font-medium">{selectedDoctor.name}</span>
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
                    <span className="font-bold text-green-600">${selectedDoctor.consultationFee}</span>
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
                {consultationType !== "appointment" && (
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
                          <span>${selectedDoctor.consultationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span>$5</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1 mt-2">
                          <span>Total:</span>
                          <span>${selectedDoctor.consultationFee + 5}</span>
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
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total Fee:</span>
                      <span>${selectedDoctor.consultationFee}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={currentStep === "payment" ? handleBooking : handleNext}
                    disabled={
                      (currentStep === "details" && !bookingData.symptoms) ||
                      (currentStep === "scheduling" && consultationType === "appointment" && (!bookingData.selectedDate || !bookingData.selectedTime))
                    }
                  >
                    {currentStep === "payment" 
                      ? `Pay $${selectedDoctor.consultationFee + 5} & Book`
                      : consultationInfo.immediate && currentStep === "details"
                      ? `Book & Start ${consultationType === "chat" ? "Chat" : "Video Call"}`
                      : "Continue"
                    }
                  </Button>
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