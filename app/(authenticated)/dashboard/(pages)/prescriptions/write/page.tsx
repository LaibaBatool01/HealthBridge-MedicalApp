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
  Pill, 
  User, 
  Search, 
  Plus, 
  X,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  ArrowLeft,
  Save,
  Send,
  Calculator
} from "lucide-react"
import { useRouter } from "next/navigation"

type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
  warnings?: string
}

type Patient = {
  id: string
  name: string
  age: number
  gender: string
  allergies: string[]
  currentMedications: string[]
}

// Mock patient data
const mockPatient: Patient = {
  id: "1",
  name: "John Doe",
  age: 45,
  gender: "Male",
  allergies: ["Penicillin", "Shellfish"],
  currentMedications: ["Lisinopril 10mg", "Metformin 500mg"]
}

// Common medications database
const commonMedications = [
  {
    name: "Amoxicillin",
    strengths: ["250mg", "500mg", "875mg"],
    forms: ["Capsule", "Tablet", "Suspension"],
    category: "Antibiotic"
  },
  {
    name: "Ibuprofen", 
    strengths: ["200mg", "400mg", "600mg", "800mg"],
    forms: ["Tablet", "Capsule", "Suspension"],
    category: "Pain Relief"
  },
  {
    name: "Lisinopril",
    strengths: ["2.5mg", "5mg", "10mg", "20mg"],
    forms: ["Tablet"],
    category: "Blood Pressure"
  },
  {
    name: "Metformin",
    strengths: ["500mg", "850mg", "1000mg"],
    forms: ["Tablet", "Extended Release"],
    category: "Diabetes"
  },
  {
    name: "Simvastatin",
    strengths: ["10mg", "20mg", "40mg", "80mg"],
    forms: ["Tablet"],
    category: "Cholesterol"
  }
]

const frequencies = [
  "Once daily (QD)",
  "Twice daily (BID)", 
  "Three times daily (TID)",
  "Four times daily (QID)",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (PRN)",
  "Before meals",
  "After meals",
  "At bedtime"
]

const durations = [
  "3 days",
  "5 days", 
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "30 days",
  "60 days",
  "90 days",
  "Until follow-up",
  "Ongoing"
]

export default function PrescriptionWritingPage() {
  const router = useRouter()
  const [patient] = useState<Patient>(mockPatient)
  const [medications, setMedications] = useState<Medication[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 0,
    instructions: "",
    warnings: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")

  const addMedication = () => {
    if (currentMedication.name && currentMedication.dosage && currentMedication.frequency) {
      const newMedication: Medication = {
        id: Date.now().toString(),
        name: currentMedication.name,
        dosage: currentMedication.dosage,
        frequency: currentMedication.frequency,
        duration: currentMedication.duration,
        quantity: currentMedication.quantity,
        instructions: currentMedication.instructions,
        warnings: currentMedication.warnings
      }
      
      setMedications([...medications, newMedication])
      setCurrentMedication({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: 0,
        instructions: "",
        warnings: ""
      })
    }
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id))
  }

  const filteredMedications = commonMedications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectMedication = (medication: any) => {
    setCurrentMedication({
      ...currentMedication,
      name: medication.name
    })
    setSearchTerm("")
  }

  const calculateQuantity = () => {
    // Simple calculation based on frequency and duration
    const freqMap: { [key: string]: number } = {
      "Once daily (QD)": 1,
      "Twice daily (BID)": 2,
      "Three times daily (TID)": 3,
      "Four times daily (QID)": 4
    }
    
    const durationMap: { [key: string]: number } = {
      "3 days": 3,
      "5 days": 5,
      "7 days": 7,
      "10 days": 10,
      "14 days": 14,
      "21 days": 21,
      "30 days": 30
    }
    
    const dailyDoses = freqMap[currentMedication.frequency] || 1
    const days = durationMap[currentMedication.duration] || 30
    
    return dailyDoses * days
  }

  const handleSavePrescription = async () => {
    try {
      const prescriptionData = {
        patientId: patient.id,
        diagnosis,
        medications,
        notes,
        prescribedAt: new Date()
      }
      
      // Save prescription
      const response = await fetch("/api/prescriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData)
      })
      
      if (response.ok) {
        router.push("/dashboard?prescription=created")
      }
    } catch (error) {
      console.error("Error saving prescription:", error)
    }
  }

  const handleSendPrescription = async () => {
    await handleSavePrescription()
    // Also send to patient
    router.push("/dashboard?prescription=sent")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3 mb-6">
              <Pill className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Write Prescription</h1>
                <p className="text-muted-foreground">Create digital prescription for patient</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Patient Name</p>
                      <p className="font-semibold">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age / Gender</p>
                      <p className="font-semibold">{patient.age} years / {patient.gender}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Known Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy) => (
                          <Badge key={allergy} className="bg-red-100 text-red-800">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Current Medications</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.currentMedications.map((med) => (
                          <Badge key={med} variant="outline">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis & Clinical Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="diagnosis">Primary Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      placeholder="Enter primary diagnosis or condition"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional clinical notes, instructions for patient, follow-up plans..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Medication */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Medication</CardTitle>
                  <CardDescription>
                    Search and add medications to the prescription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Medication Search */}
                  <div className="relative">
                    <Label htmlFor="med-search">Search Medication</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="med-search"
                        placeholder="Search by medication name..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    {/* Search Results */}
                    {searchTerm && filteredMedications.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        {filteredMedications.slice(0, 5).map((med) => (
                          <div
                            key={med.name}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectMedication(med)}
                          >
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-500">
                              {med.category} • {med.forms.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="med-name">Medication Name *</Label>
                      <Input
                        id="med-name"
                        placeholder="e.g., Amoxicillin"
                        value={currentMedication.name}
                        onChange={(e) => setCurrentMedication({...currentMedication, name: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dosage">Dosage & Strength *</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 500mg"
                        value={currentMedication.dosage}
                        onChange={(e) => setCurrentMedication({...currentMedication, dosage: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="frequency">Frequency *</Label>
                      <Select value={currentMedication.frequency} onValueChange={(value) => setCurrentMedication({...currentMedication, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map(freq => (
                            <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Select value={currentMedication.duration} onValueChange={(value) => setCurrentMedication({...currentMedication, duration: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map(duration => (
                            <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="flex gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          value={currentMedication.quantity || ""}
                          onChange={(e) => setCurrentMedication({...currentMedication, quantity: parseInt(e.target.value) || 0})}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMedication({...currentMedication, quantity: calculateQuantity()})}
                          className="gap-1"
                        >
                          <Calculator className="h-4 w-4" />
                          Auto
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated: {calculateQuantity()} tablets
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="instructions">Special Instructions</Label>
                      <Input
                        id="instructions"
                        placeholder="e.g., Take with food"
                        value={currentMedication.instructions}
                        onChange={(e) => setCurrentMedication({...currentMedication, instructions: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="warnings">Warnings/Side Effects (Optional)</Label>
                    <Textarea
                      id="warnings"
                      placeholder="Important warnings or common side effects to note..."
                      rows={2}
                      value={currentMedication.warnings}
                      onChange={(e) => setCurrentMedication({...currentMedication, warnings: e.target.value})}
                    />
                  </div>

                  <Button onClick={addMedication} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add to Prescription
                  </Button>
                </CardContent>
              </Card>

              {/* Current Prescription */}
              {medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Prescription</CardTitle>
                    <CardDescription>
                      Review medications before saving
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {medications.map((medication, index) => (
                      <div key={medication.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{index + 1}. {medication.name}</span>
                              <Badge variant="outline">{medication.dosage}</Badge>
                            </div>
                            
                            <div className="grid gap-2 text-sm">
                              <div className="flex gap-4">
                                <span><strong>Frequency:</strong> {medication.frequency}</span>
                                <span><strong>Duration:</strong> {medication.duration}</span>
                                <span><strong>Quantity:</strong> {medication.quantity}</span>
                              </div>
                              
                              {medication.instructions && (
                                <div><strong>Instructions:</strong> {medication.instructions}</div>
                              )}
                              
                              {medication.warnings && (
                                <div className="text-orange-600">
                                  <strong>Warnings:</strong> {medication.warnings}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedication(medication.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Prescription Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prescription Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient:</span>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medications:</span>
                      <span className="font-medium">{medications.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className="font-medium text-yellow-600">Draft</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Button 
                      onClick={handleSavePrescription}
                      variant="outline" 
                      className="w-full gap-2"
                      disabled={medications.length === 0 || !diagnosis}
                    >
                      <Save className="h-4 w-4" />
                      Save Draft
                    </Button>
                    
                    <Button 
                      onClick={handleSendPrescription}
                      className="w-full gap-2"
                      disabled={medications.length === 0 || !diagnosis}
                    >
                      <Send className="h-4 w-4" />
                      Send to Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Drug Interaction Warnings */}
              {medications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Safety Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>No drug allergies detected</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>No major drug interactions</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Review dosage for elderly patient</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>QD:</strong> Once daily</div>
                  <div><strong>BID:</strong> Twice daily</div>
                  <div><strong>TID:</strong> Three times daily</div>
                  <div><strong>QID:</strong> Four times daily</div>
                  <div><strong>PRN:</strong> As needed</div>
                  <div><strong>AC:</strong> Before meals</div>
                  <div><strong>PC:</strong> After meals</div>
                  <div><strong>HS:</strong> At bedtime</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 