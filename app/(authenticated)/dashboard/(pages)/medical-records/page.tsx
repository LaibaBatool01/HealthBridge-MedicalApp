"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  FileText, 
  Calendar, 
  Stethoscope,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  Loader2,
  User,
  Clock,
  Heart,
  Brain,
  Thermometer,
  Zap,
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  getPatientMedicalRecords, 
  getMedicalRecordsByType, 
  getRecentMedicalActivity,
  type MedicalRecord 
} from "@/actions/patient-medical-records"

export default function MedicalRecordsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")

  useEffect(() => {
    loadMedicalRecords()
  }, [])

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const records = await getPatientMedicalRecords()
      setMedicalRecords(records)
    } catch (err) {
      console.error("Error loading medical records:", err)
      setError(err instanceof Error ? err.message : "Failed to load medical records")
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'consultation': return 'bg-blue-100 text-blue-800'
      case 'symptom': return 'bg-red-100 text-red-800'
      case 'prescription': return 'bg-green-100 text-green-800'
      case 'lab_test': return 'bg-purple-100 text-purple-800'
      case 'procedure': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'consultation': return <Stethoscope className="h-5 w-5 text-blue-600" />
      case 'symptom': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'prescription': return <Pill className="h-5 w-5 text-green-600" />
      case 'lab_test': return <Activity className="h-5 w-5 text-purple-600" />
      case 'procedure': return <Zap className="h-5 w-5 text-orange-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.doctor && record.doctor.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = !selectedType || record.type === selectedType
    
    return matchesSearch && matchesType
  })

  const recordsByType = {
    consultation: filteredRecords.filter(r => r.type === 'consultation'),
    symptom: filteredRecords.filter(r => r.type === 'symptom'),
    prescription: filteredRecords.filter(r => r.type === 'prescription'),
    lab_test: filteredRecords.filter(r => r.type === 'lab_test'),
    procedure: filteredRecords.filter(r => r.type === 'procedure')
  }

  const renderRecordCard = (record: MedicalRecord, index: number) => (
    <motion.div
      key={record.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getTypeIcon(record.type).props.className.includes('blue') ? 'bg-blue-100' : 
                getTypeIcon(record.type).props.className.includes('red') ? 'bg-red-100' :
                getTypeIcon(record.type).props.className.includes('green') ? 'bg-green-100' :
                getTypeIcon(record.type).props.className.includes('purple') ? 'bg-purple-100' :
                getTypeIcon(record.type).props.className.includes('orange') ? 'bg-orange-100' : 'bg-gray-100'}`}>
                {getTypeIcon(record.type)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{record.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(record.date)}</span>
                  </div>
                  {record.doctor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{record.doctor}</span>
                    </div>
                  )}
                  {record.doctorSpecialty && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {record.doctorSpecialty}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(record.type)}>
                {record.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(record.status)}>
                {getStatusIcon(record.status)}
                <span className="ml-1">{record.status?.toUpperCase()}</span>
              </Badge>
            </div>
          </div>

          {/* Type-specific additional information */}
          {record.type === 'consultation' && record.data && (
            <div className="space-y-2 mb-4">
              {record.data.symptoms && (
                <div>
                  <p className="text-sm font-medium">Symptoms:</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof record.data.symptoms === 'string' 
                      ? record.data.symptoms 
                      : JSON.stringify(record.data.symptoms)
                    }
                  </p>
                </div>
              )}
              {record.data.diagnosis && (
                <div>
                  <p className="text-sm font-medium">Diagnosis:</p>
                  <p className="text-sm text-muted-foreground">{record.data.diagnosis}</p>
                </div>
              )}
              {record.data.doctorNotes && (
                <div>
                  <p className="text-sm font-medium">Doctor's Notes:</p>
                  <p className="text-sm text-muted-foreground">{record.data.doctorNotes}</p>
                </div>
              )}
            </div>
          )}

          {record.type === 'symptom' && record.data && (
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {record.data.severity && (
                  <div>
                    <p className="font-medium">Severity:</p>
                    <p className="text-muted-foreground capitalize">{record.data.severity}</p>
                  </div>
                )}
                {record.data.duration && (
                  <div>
                    <p className="font-medium">Duration:</p>
                    <p className="text-muted-foreground">{record.data.duration}</p>
                  </div>
                )}
                {record.data.frequency && (
                  <div>
                    <p className="font-medium">Frequency:</p>
                    <p className="text-muted-foreground">{record.data.frequency}</p>
                  </div>
                )}
                {record.data.bodyPart && (
                  <div>
                    <p className="font-medium">Body Part:</p>
                    <p className="text-muted-foreground">{record.data.bodyPart}</p>
                  </div>
                )}
              </div>
              {record.data.triggers && (
                <div>
                  <p className="text-sm font-medium">Triggers:</p>
                  <p className="text-sm text-muted-foreground">{record.data.triggers}</p>
                </div>
              )}
            </div>
          )}

          {record.type === 'prescription' && record.data && (
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {record.data.dosage && (
                  <div>
                    <p className="font-medium">Dosage:</p>
                    <p className="text-muted-foreground">{record.data.dosage}</p>
                  </div>
                )}
                {record.data.frequency && (
                  <div>
                    <p className="font-medium">Frequency:</p>
                    <p className="text-muted-foreground">{record.data.frequency.replace('_', ' ')}</p>
                  </div>
                )}
                {record.data.duration && (
                  <div>
                    <p className="font-medium">Duration:</p>
                    <p className="text-muted-foreground">{record.data.duration} days</p>
                  </div>
                )}
                {record.data.quantity && (
                  <div>
                    <p className="font-medium">Quantity:</p>
                    <p className="text-muted-foreground">{record.data.quantity} units</p>
                  </div>
                )}
              </div>
              {record.data.instructions && (
                <div>
                  <p className="text-sm font-medium">Instructions:</p>
                  <p className="text-sm text-muted-foreground">{record.data.instructions}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {record.attachments && record.attachments.length > 0 && (
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {record.attachments.length} file(s)
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Medical Records...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadMedicalRecords}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground mt-2">
            View your complete medical history and health records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMedicalRecords} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalRecords.length}</div>
            <p className="text-xs text-muted-foreground">All records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsByType.consultation.length}</div>
            <p className="text-xs text-muted-foreground">Doctor visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsByType.prescription.length}</div>
            <p className="text-xs text-muted-foreground">Medications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Symptoms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsByType.symptom.length}</div>
            <p className="text-xs text-muted-foreground">Reported symptoms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordsByType.lab_test.length}</div>
            <p className="text-xs text-muted-foreground">Tests & Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Types</option>
                <option value="consultation">Consultations</option>
                <option value="prescription">Prescriptions</option>
                <option value="symptom">Symptoms</option>
                <option value="lab_test">Lab Tests</option>
                <option value="procedure">Procedures</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
        </TabsList>

        {/* All Records Tab */}
        <TabsContent value="all" className="space-y-6">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery || selectedType ? 'No matching records found' : 'No medical records yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedType 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Your medical history will appear here as you use our platform.'
                    }
                  </p>
                  {!searchQuery && !selectedType && (
                    <Button onClick={() => router.push('/dashboard/find-doctors')}>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Book First Consultation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record, index) => 
                renderRecordCard(record, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          {recordsByType.consultation.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No consultations yet</h3>
                  <p className="text-muted-foreground">
                    Your consultation history will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recordsByType.consultation.map((record, index) => 
                renderRecordCard(record, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-6">
          {recordsByType.prescription.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No prescriptions yet</h3>
                  <p className="text-muted-foreground">
                    Your prescription history will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recordsByType.prescription.map((record, index) => 
                renderRecordCard(record, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Symptoms Tab */}
        <TabsContent value="symptoms" className="space-y-6">
          {recordsByType.symptom.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No symptoms recorded</h3>
                  <p className="text-muted-foreground">
                    Your symptom history will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recordsByType.symptom.map((record, index) => 
                renderRecordCard(record, index)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
