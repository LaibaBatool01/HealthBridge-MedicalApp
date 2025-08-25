"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { 
  Users, 
  Search, 
  FileText, 
  Calendar, 
  Pill, 
  Activity, 
  Phone, 
  Mail, 
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  RefreshCw,
  Eye,
  Filter,
  Download
} from "lucide-react"
import Link from "next/link"
import { getDoctorPatients, searchDoctorPatients, getPatientDetailById, type DoctorPatientRecord } from "@/actions/doctor-patients"
import { useSearchParams, useRouter } from "next/navigation"

interface PatientDetail {
  patient: DoctorPatientRecord
  consultationHistory: any[]
  prescriptionHistory: any[]
  symptomHistory: any[]
}

export default function PatientRecordsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadPatients()
    const patientId = searchParams.get('patient')
    if (patientId) {
      setSelectedPatient(patientId)
      loadPatientDetail(patientId)
    }
  }, [searchParams])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await getDoctorPatients()
      setPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim() === "") {
      loadPatients()
      return
    }

    try {
      setLoading(true)
      const results = await searchDoctorPatients(term)
      setPatients(results)
    } catch (error) {
      console.error("Error searching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPatientDetail = async (patientId: string) => {
    try {
      setDetailLoading(true)
      const detail = await getPatientDetailById(patientId)
      setPatientDetail(detail)
    } catch (error) {
      console.error("Error loading patient detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  const selectPatient = (patientId: string) => {
    setSelectedPatient(patientId)
    loadPatientDetail(patientId)
    router.push(`/dashboard/patient-records?patient=${patientId}`)
  }

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const calculateAge = (dateOfBirth?: Date | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const parseJsonField = (field: string | null | undefined) => {
    if (!field) return []
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  if (loading && !selectedPatient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground mt-2">
            Access and manage your patients' medical records
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadPatients}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Patients ({patients.length})
              </CardTitle>
              <CardDescription>
                Patients you have consulted with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {patients.map((patient, index) => {
                  const age = calculateAge(patient.dateOfBirth)
                  const isSelected = selectedPatient === patient.id

                  return (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => selectPatient(patient.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={patient.user.profileImage || ''} />
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getPatientInitials(patient.user.firstName, patient.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {patient.user.firstName} {patient.user.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {age ? `${age} years old` : 'Age unknown'}
                                {patient.gender && ` • ${patient.gender}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {patient.consultationCount} visits
                                </Badge>
                                {patient.activeSymptoms > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {patient.activeSymptoms} active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}

                {patients.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No patients found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "No patients match your search." : "You haven't consulted with any patients yet."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          {selectedPatient && patientDetail ? (
            <PatientDetailView 
              patientDetail={patientDetail} 
              loading={detailLoading}
              calculateAge={calculateAge}
              formatDate={formatDate}
              parseJsonField={parseJsonField}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Patient</h3>
                <p className="text-muted-foreground text-center">
                  Choose a patient from the list to view their detailed medical records
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PatientDetailView({ 
  patientDetail, 
  loading, 
  calculateAge, 
  formatDate, 
  parseJsonField 
}: {
  patientDetail: PatientDetail
  loading: boolean
  calculateAge: (date?: Date | null) => number | null
  formatDate: (date: Date | string) => string
  parseJsonField: (field: string | null | undefined) => any[]
}) {
  const { patient, consultationHistory, prescriptionHistory, symptomHistory } = patientDetail
  const age = calculateAge(patient.dateOfBirth)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={patient.user.profileImage || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                {patient.user.firstName?.[0]}{patient.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {patient.user.firstName} {patient.user.lastName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="font-medium">Age</p>
                  <p className="text-muted-foreground">{age || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">Gender</p>
                  <p className="text-muted-foreground capitalize">{patient.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="font-medium">Blood Type</p>
                  <p className="text-muted-foreground">{patient.bloodType || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-medium">Total Visits</p>
                  <p className="text-muted-foreground">{patient.consultationCount}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Emergency Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{patient.user.email}</span>
            </div>
            {patient.user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.user.phone}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {patient.address}
                  {patient.city && `, ${patient.city}`}
                  {patient.state && `, ${patient.state}`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.emergencyContactName ? (
              <>
                <div>
                  <p className="font-medium">{patient.emergencyContactName}</p>
                  <p className="text-sm text-muted-foreground">{patient.emergencyContactRelation}</p>
                </div>
                {patient.emergencyContactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.emergencyContactPhone}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No emergency contact on file</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory ? (
                  <div className="space-y-2">
                    {parseJsonField(patient.medicalHistory).map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No medical history recorded</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies ? (
                  <div className="space-y-2">
                    {parseJsonField(patient.allergies).map((allergy: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{allergy}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.currentMedications ? (
                  <div className="space-y-2">
                    {parseJsonField(patient.currentMedications).map((medication: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{medication}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No current medications</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vital Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.height && (
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span>{patient.height} cm</span>
                  </div>
                )}
                {patient.weight && (
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span>{patient.weight} kg</span>
                  </div>
                )}
                {patient.height && patient.weight && (
                  <div className="flex justify-between">
                    <span>BMI:</span>
                    <span>{((patient.weight / ((patient.height / 100) ** 2))).toFixed(1)}</span>
                  </div>
                )}
                {!patient.height && !patient.weight && (
                  <p className="text-muted-foreground">No vital statistics recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>
                Previous consultations with this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultationHistory.length > 0 ? (
                <div className="space-y-4">
                  {consultationHistory.map((consultation, index) => (
                    <div key={consultation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{formatDate(consultation.scheduledAt)}</span>
                        </div>
                        <Badge variant="outline">{consultation.status}</Badge>
                      </div>
                      
                      {consultation.symptoms && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Symptoms:</p>
                          <p className="text-sm text-muted-foreground">{consultation.symptoms}</p>
                        </div>
                      )}
                      
                      {consultation.diagnosis && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Diagnosis:</p>
                          <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                        </div>
                      )}
                      
                      {consultation.doctorNotes && (
                        <div>
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-muted-foreground">{consultation.doctorNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No consultation history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescription History</CardTitle>
              <CardDescription>
                Medications prescribed to this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptionHistory.length > 0 ? (
                <div className="space-y-4">
                  {prescriptionHistory.map((prescription, index) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prescription.medicationName}</h4>
                        <Badge variant={prescription.isActive ? "default" : "outline"}>
                          {prescription.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Dosage:</p>
                          <p className="text-muted-foreground">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="font-medium">Frequency:</p>
                          <p className="text-muted-foreground">{prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="font-medium">Duration:</p>
                          <p className="text-muted-foreground">{prescription.duration} days</p>
                        </div>
                        <div>
                          <p className="font-medium">Prescribed:</p>
                          <p className="text-muted-foreground">{formatDate(prescription.createdAt)}</p>
                        </div>
                      </div>
                      
                      {prescription.instructions && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Instructions:</p>
                          <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No prescription history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle>Symptom History</CardTitle>
              <CardDescription>
                Symptoms reported by this patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {symptomHistory.length > 0 ? (
                <div className="space-y-4">
                  {symptomHistory.map((symptom, index) => (
                    <div key={symptom.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{symptom.symptomName}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {symptom.severity}
                          </Badge>
                          {!symptom.resolvedDate && (
                            <Badge variant="destructive">Active</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{symptom.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Category:</p>
                          <p className="text-muted-foreground capitalize">{symptom.category}</p>
                        </div>
                        <div>
                          <p className="font-medium">Duration:</p>
                          <p className="text-muted-foreground">{symptom.duration}</p>
                        </div>
                        <div>
                          <p className="font-medium">Onset:</p>
                          <p className="text-muted-foreground">
                            {symptom.onsetDate ? formatDate(symptom.onsetDate) : 'Unknown'}
                          </p>
                        </div>
                        {symptom.resolvedDate && (
                          <div>
                            <p className="font-medium">Resolved:</p>
                            <p className="text-muted-foreground">{formatDate(symptom.resolvedDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No symptom history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
