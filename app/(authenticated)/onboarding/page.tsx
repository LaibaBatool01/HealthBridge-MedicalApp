"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Heart, 
  User, 
  Calendar, 
  MapPin, 
  Phone,
  Mail,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Thermometer,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"

type OnboardingStep = "personal" | "medical" | "symptoms" | "preferences" | "complete"

type OnboardingData = {
  // Personal Info
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  
  // Medical History
  bloodType: string
  allergies: string[]
  currentMedications: string[]
  chronicConditions: string[]
  
  // Current Symptoms
  symptoms: string[]
  urgencyLevel: "low" | "medium" | "high"
  symptomsDescription: string
  
  // Preferences
  preferredLanguage: string
  consultationType: "video" | "chat" | "either"
}

const symptomOptions = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", "Dizziness",
  "Chest Pain", "Shortness of Breath", "Abdominal Pain", "Joint Pain",
  "Skin Rash", "Sore Throat", "Back Pain", "Anxiety", "Insomnia"
]

const commonAllergies = [
  "Penicillin", "Pollen", "Dust", "Pet Dander", "Nuts", "Shellfish", 
  "Latex", "Aspirin", "None"
]

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("personal")
  const [data, setData] = useState<OnboardingData>({
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: [],
    currentMedications: [],
    chronicConditions: [],
    symptoms: [],
    urgencyLevel: "low",
    symptomsDescription: "",
    preferredLanguage: "English",
    consultationType: "either"
  })

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }))
  }

  const handleNext = () => {
    const steps: OnboardingStep[] = ["personal", "medical", "symptoms", "preferences", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: OnboardingStep[] = ["personal", "medical", "symptoms", "preferences", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleComplete = async () => {
    try {
      // Save onboarding data
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        // Redirect to doctor recommendations based on symptoms
        router.push("/onboarding/doctors")
      } else {
        console.error("Failed to save onboarding data")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const getStepProgress = () => {
    const steps = ["personal", "medical", "symptoms", "preferences"]
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold">Welcome to HealthCare Plus</h1>
            </div>
            <p className="text-muted-foreground">
              Let's gather some information to provide you with personalized care
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep !== "complete" && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {["personal", "medical", "symptoms", "preferences"].indexOf(currentStep) + 1} of 4</span>
                <span>{Math.round(getStepProgress())}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Personal Information Step */}
          {currentStep === "personal" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic information for your medical profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={data.dateOfBirth}
                      onChange={(e) => updateData("dateOfBirth", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={data.gender} onValueChange={(value) => updateData("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={data.phone}
                    onChange={(e) => updateData("phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Your address"
                    value={data.address}
                    onChange={(e) => updateData("address", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="emergency-contact">Emergency Contact Name</Label>
                    <Input
                      id="emergency-contact"
                      placeholder="Contact person name"
                      value={data.emergencyContact}
                      onChange={(e) => updateData("emergencyContact", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency-phone"
                      type="tel"
                      placeholder="Contact person phone"
                      value={data.emergencyPhone}
                      onChange={(e) => updateData("emergencyPhone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical History Step */}
          {currentStep === "medical" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical History
                </CardTitle>
                <CardDescription>
                  Information about your health background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="blood-type">Blood Type</Label>
                  <Select value={data.bloodType} onValueChange={(value) => updateData("bloodType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Allergies</Label>
                  <div className="grid gap-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                      {commonAllergies.map(allergy => (
                        <Badge
                          key={allergy}
                          variant={data.allergies.includes(allergy) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleArrayItem("allergies", allergy)}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="medications">Current Medications (Optional)</Label>
                  <Textarea
                    id="medications"
                    placeholder="List any medications you're currently taking..."
                    value={data.currentMedications.join(", ")}
                    onChange={(e) => updateData("currentMedications", e.target.value.split(", ").filter(Boolean))}
                  />
                </div>

                <div>
                  <Label htmlFor="conditions">Chronic Conditions (Optional)</Label>
                  <Textarea
                    id="conditions"
                    placeholder="Any ongoing health conditions..."
                    value={data.chronicConditions.join(", ")}
                    onChange={(e) => updateData("chronicConditions", e.target.value.split(", ").filter(Boolean))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Symptoms Step */}
          {currentStep === "symptoms" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Health Concerns
                </CardTitle>
                <CardDescription>
                  Tell us about any symptoms you're experiencing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Current Symptoms</Label>
                  <div className="grid gap-2 mt-2">
                    <div className="flex flex-wrap gap-2">
                      {symptomOptions.map(symptom => (
                        <Badge
                          key={symptom}
                          variant={data.symptoms.includes(symptom) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleArrayItem("symptoms", symptom)}
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="urgency">How urgent is your concern?</Label>
                  <Select value={data.urgencyLevel} onValueChange={(value: "low" | "medium" | "high") => updateData("urgencyLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General wellness / routine check</SelectItem>
                      <SelectItem value="medium">Medium - Noticeable symptoms</SelectItem>
                      <SelectItem value="high">High - Urgent medical attention needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="symptoms-description">Describe your symptoms in detail</Label>
                  <Textarea
                    id="symptoms-description"
                    placeholder="Please describe what you're experiencing, how long it's been going on, what makes it better or worse..."
                    rows={4}
                    value={data.symptomsDescription}
                    onChange={(e) => updateData("symptomsDescription", e.target.value)}
                  />
                </div>

                {data.urgencyLevel === "high" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Urgent Care Needed</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      For urgent medical concerns, please consider visiting an emergency room or calling emergency services.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preferences Step */}
          {currentStep === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Consultation Preferences
                </CardTitle>
                <CardDescription>
                  How would you like to connect with doctors?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={data.preferredLanguage} onValueChange={(value) => updateData("preferredLanguage", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Mandarin">Mandarin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="consultation-type">Preferred Consultation Method</Label>
                  <Select value={data.consultationType} onValueChange={(value: "video" | "chat" | "either") => updateData("consultationType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consultation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="chat">Text Chat</SelectItem>
                      <SelectItem value="either">Either Video or Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• We'll show you doctors who specialize in your symptoms</li>
                    <li>• You can view their ratings, experience, and consultation fees</li>
                    <li>• Book a consultation or start chatting immediately</li>
                    <li>• Get personalized medical advice and prescriptions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          {currentStep !== "complete" && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === "personal"}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={currentStep === "preferences" ? handleComplete : handleNext}
                className="gap-2"
              >
                {currentStep === "preferences" ? "Find Doctors" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 