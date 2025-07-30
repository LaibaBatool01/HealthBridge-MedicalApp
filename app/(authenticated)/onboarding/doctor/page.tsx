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
  Stethoscope, 
  GraduationCap, 
  Upload, 
  DollarSign,
  Clock,
  Award,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Camera,
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type OnboardingStep = "professional" | "experience" | "verification" | "rates" | "availability" | "review" | "completed"

type DoctorOnboardingData = {
  // Professional Info
  licenseNumber: string
  specialty: string
  subSpecialty: string
  yearsOfExperience: number
  
  // Education & Credentials
  medicalSchool: string
  residency: string
  fellowship: string
  boardCertifications: string[]
  
  // Bio & Languages
  professionalBio: string
  languages: string[]
  
  // Verification Documents
  medicalLicense: File | null
  degreeCertificate: File | null
  boardCertificate: File | null
  
  // Rates & Availability
  consultationFee: number
  emergencyFee: number
  followUpFee: number
  
  // Availability
  isAvailable: boolean
  availableHours: {
    monday: { start: string, end: string, available: boolean }
    tuesday: { start: string, end: string, available: boolean }
    wednesday: { start: string, end: string, available: boolean }
    thursday: { start: string, end: string, available: boolean }
    friday: { start: string, end: string, available: boolean }
    saturday: { start: string, end: string, available: boolean }
    sunday: { start: string, end: string, available: boolean }
  }
  
  // Hospital Affiliations
  hospitalAffiliations: string[]
}

const specialties = [
  "General Practice", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Neurology", "Oncology", "Pediatrics", 
  "Psychiatry", "Orthopedics", "Ophthalmology", "Gynecology",
  "Urology", "Radiology", "Emergency Medicine", "Other"
]

// Mapping from display names to database enum values
const specialtyMapping: Record<string, string> = {
  "General Practice": "general_practice",
  "Cardiology": "cardiology",
  "Dermatology": "dermatology", 
  "Endocrinology": "endocrinology",
  "Gastroenterology": "gastroenterology",
  "Neurology": "neurology",
  "Oncology": "oncology",
  "Pediatrics": "pediatrics",
  "Psychiatry": "psychiatry",
  "Orthopedics": "orthopedics",
  "Ophthalmology": "ophthalmology",
  "Gynecology": "gynecology",
  "Urology": "urology",
  "Radiology": "radiology",
  "Emergency Medicine": "emergency_medicine",
  "Other": "other"
}

const languages = [
  "English", "Spanish", "French", "German", "Arabic", "Mandarin", 
  "Hindi", "Portuguese", "Russian", "Japanese"
]

const boardCertifications = [
  "Board Certified Internal Medicine", "Board Certified Family Medicine",
  "Board Certified Cardiology", "Board Certified Neurology", 
  "Board Certified Psychiatry", "Board Certified Surgery",
  "Fellow of American College of Physicians", "Fellow of American College of Surgeons"
]

export default function DoctorOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("professional")
  const [data, setData] = useState<DoctorOnboardingData>({
    licenseNumber: "",
    specialty: "",
    subSpecialty: "",
    yearsOfExperience: 0,
    medicalSchool: "",
    residency: "",
    fellowship: "",
    boardCertifications: [],
    professionalBio: "",
    languages: ["English"],
    medicalLicense: null,
    degreeCertificate: null,
    boardCertificate: null,
    consultationFee: 75,
    emergencyFee: 150,
    followUpFee: 50,
    isAvailable: false,
    availableHours: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "13:00", available: false },
      sunday: { start: "09:00", end: "13:00", available: false }
    },
    hospitalAffiliations: []
  })

  const updateData = (field: keyof DoctorOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof DoctorOnboardingData, item: string) => {
    setData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }))
  }

  const handleNext = () => {
    const steps: OnboardingStep[] = ["professional", "experience", "verification", "rates", "availability", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: OnboardingStep[] = ["professional", "experience", "verification", "rates", "availability", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleFileUpload = (field: keyof DoctorOnboardingData, file: File) => {
    setData(prev => ({ ...prev, [field]: file }))
  }

  const handleComplete = async () => {
    try {
      // Validate required fields
      if (!data.licenseNumber || data.licenseNumber.length < 3) {
        alert("Please enter a valid medical license number")
        return
      }
      
      if (!data.specialty) {
        alert("Please select your specialty")
        return
      }
      
      if (!data.medicalSchool || data.medicalSchool.length < 5) {
        alert("Please enter a complete medical school name")
        return
      }
      
      if (!data.residency || data.residency.length < 5) {
        alert("Please enter a complete residency program name")
        return
      }
      
      if (!data.professionalBio || data.professionalBio.length < 10) {
        alert("Please provide a professional bio (at least 10 characters)")
        return
      }

      // Prepare data for submission (exclude file objects)
      const submissionData = {
        ...data,
        // Convert specialty display name to database enum value
        specialty: specialtyMapping[data.specialty] || data.specialty.toLowerCase().replace(/\s+/g, '_'),
        // Remove file objects as they can't be JSON stringified
        medicalLicense: data.medicalLicense ? data.medicalLicense.name : null,
        degreeCertificate: data.degreeCertificate ? data.degreeCertificate.name : null,
        boardCertificate: data.boardCertificate ? data.boardCertificate.name : null
      }

      console.log("Submitting doctor onboarding data:", {
        licenseNumber: submissionData.licenseNumber,
        specialty: submissionData.specialty,
        medicalSchool: submissionData.medicalSchool,
        residency: submissionData.residency
      })

      // Save doctor onboarding data
      const response = await fetch("/api/onboarding/doctor/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success("Doctor onboarding completed successfully!", {
          description: "Your documents have been submitted for verification.",
          duration: 5000
        })
        setCurrentStep("completed")
      } else {
        console.error("Failed to save doctor onboarding data:", responseData)
        toast.error("Failed to complete onboarding", {
          description: responseData.error || 'Failed to save data',
          duration: 5000
        })
      }
    } catch (error) {
      console.error("Error completing doctor onboarding:", error)
      toast.error("Network error", {
        description: "Please check your connection and try again.",
        duration: 5000
      })
    }
  }

  const getStepProgress = () => {
    const steps = ["professional", "experience", "verification", "rates", "availability", "review"]
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Doctor Verification Portal</h1>
            </div>
            <p className="text-muted-foreground">
              Complete your professional profile to start practicing on our platform
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep !== "completed" && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {["professional", "experience", "verification", "rates", "availability", "review"].indexOf(currentStep) + 1} of 6</span>
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

          {/* Professional Information Step */}
          {currentStep === "professional" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Basic professional details and specialization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="license">Medical License Number *</Label>
                  <Input
                    id="license"
                    placeholder="Enter your medical license number"
                    value={data.licenseNumber}
                    onChange={(e) => updateData("licenseNumber", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="specialty">Primary Specialty *</Label>
                    <Select value={data.specialty} onValueChange={(value) => updateData("specialty", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty} value={specialty.toLowerCase().replace(/ /g, "_")}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sub-specialty">Sub-specialty (Optional)</Label>
                    <Input
                      id="sub-specialty"
                      placeholder="e.g., Interventional Cardiology"
                      value={data.subSpecialty}
                      onChange={(e) => updateData("subSpecialty", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Years practicing medicine"
                    value={data.yearsOfExperience}
                    onChange={(e) => updateData("yearsOfExperience", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languages.map(language => (
                      <Badge
                        key={language}
                        variant={data.languages.includes(language) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem("languages", language)}
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience & Education Step */}
          {currentStep === "experience" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Education & Experience
                </CardTitle>
                <CardDescription>
                  Your educational background and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="medical-school">Medical School *</Label>
                  <Input
                    id="medical-school"
                    placeholder="University/College name and graduation year"
                    value={data.medicalSchool}
                    onChange={(e) => updateData("medicalSchool", e.target.value)}
                  />
                  {data.medicalSchool.length > 0 && data.medicalSchool.length < 5 && (
                    <p className="text-xs text-red-500 mt-1">Please enter a complete medical school name</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="residency">Residency Program *</Label>
                  <Input
                    id="residency"
                    placeholder="Residency program and institution"
                    value={data.residency}
                    onChange={(e) => updateData("residency", e.target.value)}
                  />
                  {data.residency.length > 0 && data.residency.length < 5 && (
                    <p className="text-xs text-red-500 mt-1">Please enter a complete residency program name</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fellowship">Fellowship (Optional)</Label>
                  <Input
                    id="fellowship"
                    placeholder="Fellowship program if completed"
                    value={data.fellowship}
                    onChange={(e) => updateData("fellowship", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Board Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {boardCertifications.map(cert => (
                      <Badge
                        key={cert}
                        variant={data.boardCertifications.includes(cert) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem("boardCertifications", cert)}
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Brief description of your expertise, approach to patient care, and any specializations..."
                    rows={4}
                    value={data.professionalBio}
                    onChange={(e) => updateData("professionalBio", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.professionalBio.length}/10 characters minimum
                    {data.professionalBio.length < 10 && (
                      <span className="text-red-500"> - Need {10 - data.professionalBio.length} more characters</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label htmlFor="affiliations">Hospital Affiliations (Optional)</Label>
                  <Textarea
                    id="affiliations"
                    placeholder="List hospitals or medical centers where you have privileges (one per line)"
                    rows={3}
                    value={data.hospitalAffiliations.join("\n")}
                    onChange={(e) => updateData("hospitalAffiliations", e.target.value.split("\n").filter(Boolean))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Documents Step */}
          {currentStep === "verification" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Document Verification
                </CardTitle>
                <CardDescription>
                  Upload required documents for verification (will be reviewed within 24-48 hours)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Verification Requirements</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All documents must be clear and legible</li>
                    <li>• Accepted formats: PDF, JPG, PNG (max 10MB each)</li>
                    <li>• Documents will be verified by our medical board</li>
                    <li>• You can start practicing once verified</li>
                  </ul>
                </div>

                {/* Medical License Upload */}
                <div className="space-y-2">
                  <Label>Medical License *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload your current medical license
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload("medicalLicense", e.target.files[0])}
                      className="hidden"
                      id="medical-license"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="medical-license" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    {data.medicalLicense && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {data.medicalLicense.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Degree Certificate Upload */}
                <div className="space-y-2">
                  <Label>Medical Degree Certificate *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload your medical degree certificate
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload("degreeCertificate", e.target.files[0])}
                      className="hidden"
                      id="degree-certificate"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="degree-certificate" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    {data.degreeCertificate && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {data.degreeCertificate.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Board Certificate Upload */}
                <div className="space-y-2">
                  <Label>Board Certification (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload your board certification certificate
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload("boardCertificate", e.target.files[0])}
                      className="hidden"
                      id="board-certificate"
                    />
                    <Button variant="outline" asChild>
                      <label htmlFor="board-certificate" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    {data.boardCertificate && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {data.boardCertificate.name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultation Rates Step */}
          {currentStep === "rates" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Consultation Rates
                </CardTitle>
                <CardDescription>
                  Set your consultation fees (you can adjust these later)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="standard-fee">Standard Consultation</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="standard-fee"
                        type="number"
                        min="0"
                        placeholder="75"
                        className="pl-9"
                        value={data.consultationFee}
                        onChange={(e) => updateData("consultationFee", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Regular consultation fee</p>
                  </div>

                  <div>
                    <Label htmlFor="emergency-fee">Emergency Consultation</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="emergency-fee"
                        type="number"
                        min="0"
                        placeholder="150"
                        className="pl-9"
                        value={data.emergencyFee}
                        onChange={(e) => updateData("emergencyFee", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Urgent/after-hours fee</p>
                  </div>

                  <div>
                    <Label htmlFor="followup-fee">Follow-up Consultation</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="followup-fee"
                        type="number"
                        min="0"
                        placeholder="50"
                        className="pl-9"
                        value={data.followUpFee}
                        onChange={(e) => updateData("followUpFee", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Follow-up appointment fee</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Competitive Rates</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• Platform takes 15% commission from consultations</p>
                    <p>• You'll receive payments weekly via direct deposit</p>
                    <p>• Average consultation fee in your specialty: $75-$100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability Step */}
          {currentStep === "availability" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability Schedule
                </CardTitle>
                <CardDescription>
                  Set your weekly availability (you can update this anytime)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data.availableHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-24">
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours.available}
                        onChange={(e) => updateData("availableHours", {
                          ...data.availableHours,
                          [day]: { ...hours, available: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Available</span>
                    </div>

                    {hours.available && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">From:</Label>
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) => updateData("availableHours", {
                              ...data.availableHours,
                              [day]: { ...hours, start: e.target.value }
                            })}
                            className="w-32"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm">To:</Label>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) => updateData("availableHours", {
                              ...data.availableHours,
                              [day]: { ...hours, end: e.target.value }
                            })}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Availability Notes</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Patients can book consultations during your available hours</li>
                    <li>• Emergency consultations may come outside these hours</li>
                    <li>• You can toggle availability on/off anytime from your dashboard</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Step */}
          {currentStep === "review" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review & Submit
                </CardTitle>
                <CardDescription>
                  Review your information before submitting for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Professional Summary */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Professional Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>License Number:</span>
                      <span className="font-medium">{data.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialty:</span>
                      <span className="font-medium">{data.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-medium">{data.yearsOfExperience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Languages:</span>
                      <span className="font-medium">{data.languages.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* Rates Summary */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Consultation Rates</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Standard:</span>
                      <span className="font-medium">${data.consultationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency:</span>
                      <span className="font-medium">${data.emergencyFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up:</span>
                      <span className="font-medium">${data.followUpFee}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Verification Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {data.medicalLicense ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Medical License</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.degreeCertificate ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Degree Certificate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.boardCertificate ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">Board Certificate (Optional)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Verification Process</span>
                  </div>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>• Your documents will be reviewed by our medical verification team</p>
                    <p>• Verification typically takes 24-48 hours</p>
                    <p>• You'll receive an email notification once approved</p>
                    <p>• You can update your profile and rates after approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Step */}
          {currentStep === "completed" && (
            <div className="text-center">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 pb-8">
                  <div className="mx-auto max-w-md">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                      Verification Submitted Successfully!
                    </h2>
                    <p className="text-green-700 mb-6">
                      Your professional documents have been submitted for review. Our medical verification team will review your credentials within 24-48 hours.
                    </p>
                    
                    <div className="space-y-4 text-left bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900">What happens next?</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">1</div>
                          <div>
                            <p className="font-medium">Document Review</p>
                            <p className="text-gray-600">Our team verifies your medical license and credentials</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">2</div>
                          <div>
                            <p className="font-medium">Email Notification</p>
                            <p className="text-gray-600">You'll receive confirmation once approved</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">3</div>
                          <div>
                            <p className="font-medium">Start Practicing</p>
                            <p className="text-gray-600">Access your doctor dashboard and begin consultations</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button 
                        onClick={() => router.push("/dashboard")}
                        className="w-full"
                      >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <p className="text-sm text-gray-600">
                        Note: Your profile will be activated after verification is complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== "completed" && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "professional"}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={currentStep === "review" ? handleComplete : handleNext}
              className="gap-2"
              disabled={
                (currentStep === "professional" && (!data.licenseNumber || !data.specialty || data.licenseNumber.length < 3)) ||
                (currentStep === "experience" && (!data.medicalSchool || data.medicalSchool.length < 5 || !data.residency || data.residency.length < 5 || !data.professionalBio || data.professionalBio.length < 10)) ||
                (currentStep === "verification" && (!data.medicalLicense || !data.degreeCertificate)) ||
                (currentStep === "review" && (!data.licenseNumber || data.licenseNumber.length < 3 || !data.specialty || !data.medicalSchool || data.medicalSchool.length < 5 || !data.residency || data.residency.length < 5 || !data.professionalBio || data.professionalBio.length < 10 || !data.medicalLicense || !data.degreeCertificate))
              }
            >
              {currentStep === "review" ? "Submit for Verification" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          )}
        </div>
      </div>
    </div>
  )
} 