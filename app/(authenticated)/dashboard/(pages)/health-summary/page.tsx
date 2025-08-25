"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Scale, 
  Ruler,
  Calendar,
  FileText,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Stethoscope,
  Bell,
  Download,
  Share2,
  Edit,
  Plus,
  ArrowRight,
  Zap,
  Shield
} from "lucide-react"
import { useRouter } from "next/navigation"

interface VitalSigns {
  bloodPressure: string
  heartRate: number
  temperature: number
  weight: number
  height: number
  bmi: number
  lastUpdated: Date
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  status: 'active' | 'completed' | 'discontinued'
  prescribedBy: string
  instructions: string
}

interface HealthMetric {
  name: string
  value: string | number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: Date
}

interface MedicalRecord {
  id: string
  date: Date
  type: 'consultation' | 'lab_test' | 'procedure' | 'vaccination'
  title: string
  description: string
  doctor: string
  status: 'completed' | 'scheduled' | 'cancelled'
  attachments?: string[]
}

export default function HealthSummaryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  // Mock data - in real app, this would come from API
  const [vitalSigns] = useState<VitalSigns>({
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 98.6,
    weight: 70, // kg
    height: 170, // cm
    bmi: 24.2,
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  })

  const [medications] = useState<Medication[]>([
    {
      id: "1",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "active",
      prescribedBy: "Dr. Sarah Johnson",
      instructions: "Take with meals to reduce stomach upset"
    },
    {
      id: "2",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: "active",
      prescribedBy: "Dr. Michael Chen",
      instructions: "Take in the morning"
    },
    {
      id: "3",
      name: "Vitamin D3",
      dosage: "2000 IU",
      frequency: "Once daily",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: "active",
      prescribedBy: "Dr. Sarah Johnson",
      instructions: "Take with food for better absorption"
    }
  ])

  const [healthMetrics] = useState<HealthMetric[]>([
    {
      name: "Blood Sugar (Fasting)",
      value: 95,
      unit: "mg/dL",
      status: "normal",
      trend: "stable",
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Cholesterol (Total)",
      value: 180,
      unit: "mg/dL",
      status: "normal",
      trend: "down",
      lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    {
      name: "HbA1c",
      value: 6.2,
      unit: "%",
      status: "warning",
      trend: "down",
      lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      name: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      trend: "stable",
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ])

  const [medicalRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: "consultation",
      title: "Diabetes Management Follow-up",
      description: "Routine check-up for diabetes management. Blood sugar levels improved.",
      doctor: "Dr. Sarah Johnson",
      status: "completed"
    },
    {
      id: "2",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      type: "lab_test",
      title: "Comprehensive Blood Panel",
      description: "Annual blood work including cholesterol, glucose, and kidney function tests.",
      doctor: "Dr. Michael Chen",
      status: "completed"
    },
    {
      id: "3",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: "consultation",
      title: "Cardiology Consultation",
      description: "Follow-up appointment with cardiologist for blood pressure management.",
      doctor: "Dr. Lisa Wang",
      status: "scheduled"
    }
  ])

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-4 w-4" />
      case 'lab_test': return <Activity className="h-4 w-4" />
      case 'procedure': return <Zap className="h-4 w-4" />
      case 'vaccination': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Loading Health Summary...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Health Summary</h1>
          <p className="text-muted-foreground mt-2">
            Your comprehensive health overview and medical history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Health Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-xs text-muted-foreground">
                  Based on recent data
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Medications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications.filter(m => m.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently taking
                </p>
              </CardContent>
            </Card>

            {/* Last Checkup */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Checkup</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}</div>
                <p className="text-xs text-muted-foreground">
                  7 days ago
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Health Metrics</CardTitle>
              <CardDescription>Your recent health measurements and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {healthMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{metric.name}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {metric.value} {metric.unit}
                        </span>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {formatDate(metric.lastUpdated)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Activity</CardTitle>
              <CardDescription>Your latest consultations and procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalRecords.slice(0, 3).map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{record.title}</h4>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.doctor} • {formatDate(record.date)}
                      </p>
                    </div>
                    <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setActiveTab('records')}>
                  View All Records
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vital Signs Tab */}
        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Vital Signs</CardTitle>
              <CardDescription>
                Last updated: {formatDate(vitalSigns.lastUpdated)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Blood Pressure</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.bloodPressure}</div>
                  <p className="text-sm text-muted-foreground">mmHg</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.heartRate}</div>
                  <p className="text-sm text-muted-foreground">bpm</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.temperature}°F</div>
                  <p className="text-sm text-muted-foreground">Fahrenheit</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Weight</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.weight} kg</div>
                  <p className="text-sm text-muted-foreground">Kilograms</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Ruler className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Height</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.height} cm</div>
                  <p className="text-sm text-muted-foreground">Centimeters</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">BMI</span>
                  </div>
                  <div className="text-2xl font-bold">{vitalSigns.bmi}</div>
                  <p className="text-sm text-muted-foreground">Normal range: 18.5-24.9</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Current Medications</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>

          <div className="space-y-4">
            {medications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{medication.name}</h3>
                          <Badge variant={medication.status === 'active' ? 'default' : 'secondary'}>
                            {medication.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Prescribed by {medication.prescribedBy}
                        </p>
                        <p className="text-sm">{medication.instructions}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>Started: {formatDate(medication.startDate)}</span>
                          {medication.endDate && (
                            <span>Ends: {formatDate(medication.endDate)}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="space-y-4">
            {medicalRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getRecordIcon(record.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{record.title}</h3>
                            <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{record.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{record.doctor}</span>
                            <span>•</span>
                            <span>{formatDate(record.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {record.attachments && record.attachments.length > 0 && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
