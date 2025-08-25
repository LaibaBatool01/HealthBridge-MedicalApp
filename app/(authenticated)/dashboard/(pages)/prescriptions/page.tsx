"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Pill, 
  Clock, 
  Calendar, 
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Loader2,
  Stethoscope,
  Package,
  Truck,
  ShoppingCart,
  Filter,
  Search
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getDoctorPrescriptions, getActiveDoctorPrescriptions, getDoctorPrescriptionStats } from "@/actions/doctor-prescriptions-simple"
import Link from "next/link"

// Define the prescription data type
interface PrescriptionData {
  id: string
  medicationName: string
  genericName?: string | null
  dosage: string
  frequency: string
  customFrequency?: string | null
  duration: number
  quantity: number
  instructions?: string | null
  sideEffects?: string | null
  interactions?: string | null
  refillsAllowed?: number | null
  status: string
  pharmacyName?: string | null
  pharmacyAddress?: string | null
  pharmacyPhone?: string | null
  startDate?: Date | null
  endDate?: Date | null
  isActive?: boolean | null
  createdAt: Date
  updatedAt: Date
  patient: {
    id: string
    userId: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone?: string | null
      profileImage?: string | null
    }
  }
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([])
  const [activePrescriptions, setActivePrescriptions] = useState<PrescriptionData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [allData, statsData] = await Promise.all([
        getDoctorPrescriptions(),
        getDoctorPrescriptionStats()
      ])
      
      setPrescriptions(allData as any || [])
      setActivePrescriptions((allData as any)?.filter((p: any) => p.isActive) || [])
      setStats(statsData)
    } catch (err) {
      console.error("Error loading prescriptions:", err)
      setError(err instanceof Error ? err.message : "Failed to load prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent_to_pharmacy': return 'bg-blue-100 text-blue-800'
      case 'ready_for_pickup': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'sent_to_pharmacy': return <Truck className="h-4 w-4" />
      case 'ready_for_pickup': return <Package className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getFrequencyLabel = (frequency: string, customFrequency?: string) => {
    if (frequency === 'custom' && customFrequency) {
      return customFrequency
    }
    
    switch (frequency) {
      case 'once_daily': return 'Once daily'
      case 'twice_daily': return 'Twice daily'
      case 'three_times_daily': return 'Three times daily'
      case 'four_times_daily': return 'Four times daily'
      case 'as_needed': return 'As needed'
      case 'weekly': return 'Weekly'
      default: return frequency.replace('_', ' ').toUpperCase()
    }
  }

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not specified'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (endDate: Date | string) => {
    if (!endDate) return null
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const renderPrescriptionCard = (prescription: PrescriptionData, index: number) => {
    const daysRemaining = prescription.endDate ? getDaysRemaining(prescription.endDate) : null
    const patientName = `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`

    return (
      <motion.div
        key={prescription.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{prescription.medicationName}</h3>
                  {prescription.genericName && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Generic: {prescription.genericName}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{prescription.dosage}</span>
                    <span>•</span>
                    <span>{getFrequencyLabel(prescription.frequency, prescription.customFrequency || undefined)}</span>
                    <span>•</span>
                    <span>{prescription.duration} days</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(prescription.status)}>
                  {getStatusIcon(prescription.status)}
                  <span className="ml-1">{prescription.status?.replace('_', ' ').toUpperCase()}</span>
                </Badge>
                {prescription.isActive && (
                  <Badge variant="outline" className="text-green-600">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Patient:</p>
                  <p className="text-muted-foreground">{patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {prescription.patient.user.email}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Quantity:</p>
                  <p className="text-muted-foreground">{prescription.quantity} units</p>
                  {prescription.refillsAllowed !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {prescription.refillsAllowed} refills allowed
                    </p>
                  )}
                </div>
              </div>

              {prescription.instructions && (
                <div>
                  <p className="text-sm font-medium mb-1">Instructions:</p>
                  <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                </div>
              )}

              {prescription.sideEffects && (
                <div>
                  <p className="text-sm font-medium mb-1">Side Effects:</p>
                  <p className="text-sm text-muted-foreground">{prescription.sideEffects}</p>
                </div>
              )}

              {prescription.interactions && (
                <div>
                  <p className="text-sm font-medium mb-1">Drug Interactions:</p>
                  <p className="text-sm text-muted-foreground">{prescription.interactions}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Start Date:</p>
                                      <p className="text-muted-foreground">{prescription.startDate ? formatDate(prescription.startDate) : 'Not set'}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">End Date:</p>
                  <p className="text-muted-foreground">{prescription.endDate ? formatDate(prescription.endDate) : 'Not set'}</p>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <p className="text-xs text-blue-600">
                      {daysRemaining} days remaining
                    </p>
                  )}
                  {daysRemaining !== null && daysRemaining <= 0 && (
                    <p className="text-xs text-red-600">
                      Expired
                    </p>
                  )}
                </div>
              </div>

              {prescription.pharmacyName && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Pharmacy Information:</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{prescription.pharmacyName}</span>
                    </div>
                    {prescription.pharmacyAddress && (
                      <p className="ml-6">{prescription.pharmacyAddress}</p>
                    )}
                    {prescription.pharmacyPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{prescription.pharmacyPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                  Prescribed on {formatDate(prescription.createdAt)}
                </p>

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
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Prescriptions...</h2>
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
          <Button onClick={loadPrescriptions}>
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
          <h1 className="text-3xl font-bold">Prescriptions Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage prescriptions you've written for your patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPrescriptions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/prescriptions/write">
              <Plus className="h-4 w-4 mr-2" />
              Write Prescription
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || activePrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Active prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending || prescriptions.filter(p => p.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting pharmacy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.thisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">Prescribed this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>
          <TabsTrigger value="active">Active Medications</TabsTrigger>
        </TabsList>

        {/* All Prescriptions Tab */}
        <TabsContent value="all" className="space-y-6">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No prescriptions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your prescriptions from consultations will appear here.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/find-doctors">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Book Consultation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription, index) => 
                renderPrescriptionCard(prescription, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Active Medications Tab */}
        <TabsContent value="active" className="space-y-6">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active medications</h3>
                  <p className="text-muted-foreground">
                    Your active prescriptions will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePrescriptions.map((prescription, index) => 
                renderPrescriptionCard(prescription, index)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
