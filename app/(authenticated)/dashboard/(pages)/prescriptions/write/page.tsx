"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { 
  Pill, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Trash2,
  Save,
  Send,
  Search,
  FileText,
  Stethoscope,
  Info,
  Shield,
  Zap
} from "lucide-react"
import { getCurrentUserAction } from "@/actions/get-current-user"

interface Medication {
  id: string
  name: string
  genericName?: string
  dosage: string
  frequency: string
  duration: number
  quantity: number
  instructions: string
  sideEffects?: string
  interactions?: string
  refillsAllowed: number
}

interface Patient {
  id: string
  name: string
  email: string
  dateOfBirth: string
  allergies: string[]
  currentMedications: string[]
}

const medicationFrequency = [
  { value: 'once_daily', label: 'Once Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: 'Three Times Daily' },
  { value: 'four_times_daily', label: 'Four Times Daily' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' }
]

const commonMedications = [
  { name: 'Amoxicillin', genericName: 'Amoxicillin', dosage: '500mg', frequency: 'three_times_daily', duration: 7 },
  { name: 'Ibuprofen', genericName: 'Ibuprofen', dosage: '400mg', frequency: 'as_needed', duration: 5 },
  { name: 'Omeprazole', genericName: 'Omeprazole', dosage: '20mg', frequency: 'once_daily', duration: 30 },
  { name: 'Metformin', genericName: 'Metformin', dosage: '500mg', frequency: 'twice_daily', duration: 90 },
  { name: 'Lisinopril', genericName: 'Lisinopril', dosage: '10mg', frequency: 'once_daily', duration: 30 },
  { name: 'Atorvastatin', genericName: 'Atorvastatin', dosage: '20mg', frequency: 'once_daily', duration: 30 },
  { name: 'Albuterol', genericName: 'Albuterol', dosage: '90mcg', frequency: 'as_needed', duration: 30 },
  { name: 'Sumatriptan', genericName: 'Sumatriptan', dosage: '50mg', frequency: 'as_needed', duration: 9 }
]

const pharmacies = [
  { name: 'CVS Pharmacy', address: '123 Main St, City, State 12345', phone: '(555) 123-4567' },
  { name: 'Walgreens', address: '456 Oak Ave, City, State 12345', phone: '(555) 234-5678' },
  { name: 'Rite Aid', address: '789 Pine Rd, City, State 12345', phone: '(555) 345-6789' },
  { name: 'Walmart Pharmacy', address: '321 Elm St, City, State 12345', phone: '(555) 456-7890' }
]

export default function PrescriptionsWritePage() {
  const [user, setUser] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: '',
    genericName: '',
    dosage: '',
    frequency: 'once_daily',
    duration: 30,
    quantity: 30,
    instructions: '',
    sideEffects: '',
    interactions: '',
    refillsAllowed: 0
  })
  const [selectedPharmacy, setSelectedPharmacy] = useState('')
  const [consultationNotes, setConsultationNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const result = await getCurrentUserAction()
      if (result.success) {
        setUser(result.user)
      } else {
        console.error('Error loading user:', result.error)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  // Mock patient data - in real app, this would come from database
  const mockPatient: Patient = {
    id: 'patient-1',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@gmail.com',
    dateOfBirth: '1988-09-22',
    allergies: ['Latex', 'Ibuprofen', 'Tree nuts'],
    currentMedications: ['Sumatriptan 50mg as needed', 'Loratadine 10mg daily']
  }

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMedication.name,
      genericName: newMedication.genericName || undefined,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      duration: newMedication.duration,
      quantity: newMedication.quantity,
      instructions: newMedication.instructions,
      sideEffects: newMedication.sideEffects || undefined,
      interactions: newMedication.interactions || undefined,
      refillsAllowed: newMedication.refillsAllowed
    }

    setMedications([...medications, medication])
    setNewMedication({
      name: '',
      genericName: '',
      dosage: '',
      frequency: 'once_daily',
      duration: 30,
      quantity: 30,
      instructions: '',
      sideEffects: '',
      interactions: '',
      refillsAllowed: 0
    })
    setShowAddMedication(false)
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  const quickAddMedication = (med: typeof commonMedications[0]) => {
    const medication: Medication = {
      id: Date.now().toString(),
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      quantity: med.duration,
      instructions: `Take ${med.dosage} ${medicationFrequency.find(f => f.value === med.frequency)?.label.toLowerCase()}`,
      refillsAllowed: 0
    }

    setMedications([...medications, medication])
  }

  const getFrequencyLabel = (frequency: string) => {
    return medicationFrequency.find(f => f.value === frequency)?.label || frequency
  }

  const calculateEndDate = (duration: number) => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + duration)
    return endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const savePrescription = () => {
    // In real app, this would save to database
    console.log('Saving prescription:', {
      patient: selectedPatient,
      medications,
      pharmacy: selectedPharmacy,
      consultationNotes,
      diagnosis
    })
  }

  const sendToPharmacy = () => {
    // In real app, this would send prescription to pharmacy
    console.log('Sending to pharmacy:', selectedPharmacy)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is a doctor
  if (user.userType !== 'doctor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Only doctors can access the prescription writing interface.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Write Prescription</h1>
        <p className="text-muted-foreground">
          Create and manage prescriptions for your patients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input value={mockPatient.name} readOnly />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input value={mockPatient.dateOfBirth} readOnly />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={mockPatient.email} readOnly />
                </div>
                <div>
                  <Label>Allergies</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mockPatient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Diagnosis & Consultation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div>
                <Label htmlFor="notes">Consultation Notes</Label>
                <Textarea
                  id="notes"
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Enter consultation notes..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medications
                </CardTitle>
                <Button onClick={() => setShowAddMedication(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Quick Add Common Medications */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Quick Add Common Medications</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {commonMedications.map((med, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => quickAddMedication(med)}
                      className="text-xs"
                    >
                      {med.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Add Medication Form */}
              {showAddMedication && (
                <Card className="mb-4 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Medication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medName">Medication Name</Label>
                        <Input
                          id="medName"
                          value={newMedication.name}
                          onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                          placeholder="e.g., Amoxicillin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="genericName">Generic Name (Optional)</Label>
                        <Input
                          id="genericName"
                          value={newMedication.genericName}
                          onChange={(e) => setNewMedication({ ...newMedication, genericName: e.target.value })}
                          placeholder="e.g., Amoxicillin"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {medicationFrequency.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newMedication.duration}
                          onChange={(e) => setNewMedication({ ...newMedication, duration: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={newMedication.instructions}
                        onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                        placeholder="e.g., Take with food, avoid alcohol..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addMedication} disabled={!newMedication.name || !newMedication.dosage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medications List */}
              <div className="space-y-4">
                {medications.map((medication) => (
                  <Card key={medication.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{medication.name}</h4>
                            {medication.genericName && (
                              <Badge variant="outline" className="text-xs">
                                {medication.genericName}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                            <span><strong>Dosage:</strong> {medication.dosage}</span>
                            <span><strong>Frequency:</strong> {getFrequencyLabel(medication.frequency)}</span>
                            <span><strong>Duration:</strong> {medication.duration} days</span>
                            <span><strong>Quantity:</strong> {medication.quantity}</span>
                          </div>
                          {medication.instructions && (
                            <p className="text-sm mb-2"><strong>Instructions:</strong> {medication.instructions}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>End Date: {calculateEndDate(medication.duration)}</span>
                            {medication.refillsAllowed > 0 && (
                              <span>• Refills: {medication.refillsAllowed}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pharmacy Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Pharmacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pharmacy" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((pharmacy) => (
                    <SelectItem key={pharmacy.name} value={pharmacy.name}>
                      <div>
                        <div className="font-medium">{pharmacy.name}</div>
                        <div className="text-xs text-muted-foreground">{pharmacy.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPatient.currentMedications.map((med, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    {med}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={savePrescription} className="w-full" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={sendToPharmacy} className="w-full" disabled={medications.length === 0 || !selectedPharmacy}>
                <Send className="h-4 w-4 mr-2" />
                Send to Pharmacy
              </Button>
            </CardContent>
          </Card>

          {/* Prescription Summary */}
          {medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prescription Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Medications:</span>
                    <span className="font-medium">{medications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span className="font-medium">
                      {Math.max(...medications.map(m => m.duration))} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pharmacy:</span>
                    <span className="font-medium">{selectedPharmacy || 'Not selected'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 