"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Bell, 
  Clock, 
  Calendar, 
  Pill,
  Stethoscope,
  Activity,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Timer,
  Check,
  X,
  Loader2,
  Pause,
  Play,
  Edit,
  Trash2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  getPatientReminders, 
  getActiveReminders, 
  getTodaysReminders, 
  getRemindersByType,
  markReminderAsTaken,
  snoozeReminder
} from "@/actions/patient-reminders"

interface ReminderData {
  id: string
  prescriptionId?: string | null
  reminderType: string
  title: string
  message?: string | null
  reminderTime: string
  reminderDays?: string | null
  isRecurring: boolean | null
  status: string | null
  lastSentAt?: Date | null
  nextReminderAt?: Date | null
  totalSent: number | null
  dosageTaken: boolean | null
  notes?: string | null
  snoozeUntil?: Date | null
  createdAt: Date
  updatedAt?: Date
  // Prescription info if linked
  medicationName?: string | null
  dosage?: string | null
  frequency?: string | null
}

export default function RemindersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<ReminderData[]>([])
  const [activeReminders, setActiveReminders] = useState<ReminderData[]>([])
  const [todaysReminders, setTodaysReminders] = useState<ReminderData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processingReminder, setProcessingReminder] = useState<string | null>(null)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [allData, activeData, todayData] = await Promise.all([
        getPatientReminders(),
        getActiveReminders(),
        getTodaysReminders()
      ])
      
      setReminders(allData)
      setActiveReminders(activeData)
      setTodaysReminders(todayData)
    } catch (err) {
      console.error("Error loading reminders:", err)
      setError(err instanceof Error ? err.message : "Failed to load reminders")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsTaken = async (reminderId: string, taken: boolean = true) => {
    try {
      setProcessingReminder(reminderId)
      await markReminderAsTaken(reminderId, taken)
      await loadReminders() // Refresh data
    } catch (err) {
      console.error("Error marking reminder:", err)
    } finally {
      setProcessingReminder(null)
    }
  }

  const handleSnoozeReminder = async (reminderId: string, minutes: number = 15) => {
    try {
      setProcessingReminder(reminderId)
      await snoozeReminder(reminderId, minutes)
      await loadReminders() // Refresh data
    } catch (err) {
      console.error("Error snoozing reminder:", err)
    } finally {
      setProcessingReminder(null)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getReminderTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'medication': return <Pill className="h-5 w-5 text-blue-600" />
      case 'appointment': return <Calendar className="h-5 w-5 text-green-600" />
      case 'follow_up': return <Stethoscope className="h-5 w-5 text-purple-600" />
      case 'health_check': return <Activity className="h-5 w-5 text-red-600" />
      case 'lab_test': return <FileText className="h-5 w-5 text-orange-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getReminderTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'medication': return 'bg-blue-100'
      case 'appointment': return 'bg-green-100'
      case 'follow_up': return 'bg-purple-100'
      case 'health_check': return 'bg-red-100'
      case 'lab_test': return 'bg-orange-100'
      default: return 'bg-gray-100'
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not set'
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const minute = parseInt(minutes)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not set'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (date: Date | string) => {
    if (!date) return 'Not set'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseReminderDays = (daysString?: string | null) => {
    if (!daysString) return []
    try {
      return JSON.parse(daysString)
    } catch {
      return []
    }
  }

  const isReminderSnoozed = (reminder: ReminderData) => {
    if (!reminder.snoozeUntil) return false
    return new Date(reminder.snoozeUntil) > new Date()
  }

  const renderReminderCard = (reminder: ReminderData, index: number) => {
    const reminderDays = parseReminderDays(reminder.reminderDays)
    const isSnoozed = isReminderSnoozed(reminder)
    const isProcessing = processingReminder === reminder.id

    return (
      <motion.div
        key={reminder.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Card className={`hover:shadow-md transition-shadow ${isSnoozed ? 'border-yellow-200 bg-yellow-50' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getReminderTypeColor(reminder.reminderType)}`}>
                  {getReminderTypeIcon(reminder.reminderType)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{reminder.title}</h3>
                  {reminder.message && (
                    <p className="text-sm text-muted-foreground mb-2">{reminder.message}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(reminder.reminderTime)}</span>
                    </div>
                    {reminder.isRecurring && reminderDays.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{reminderDays.join(', ')}</span>
                      </div>
                    )}
                    {reminder.nextReminderAt && (
                      <div className="flex items-center gap-1">
                        <Bell className="h-4 w-4" />
                        <span>Next: {formatDateTime(reminder.nextReminderAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(reminder.status)}>
                  {getStatusIcon(reminder.status)}
                  <span className="ml-1">{reminder.status?.toUpperCase() || 'UNKNOWN'}</span>
                </Badge>
                {isSnoozed && (
                  <Badge variant="outline" className="text-yellow-600">
                    Snoozed
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {reminder.medicationName && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Medication:</p>
                  <p className="text-sm text-blue-800">
                    {reminder.medicationName}
                    {reminder.dosage && ` - ${reminder.dosage}`}
                    {reminder.frequency && ` (${reminder.frequency.replace('_', ' ')})`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Type:</p>
                  <p className="text-muted-foreground capitalize">
                    {reminder.reminderType.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Frequency:</p>
                  <p className="text-muted-foreground">
                    {reminder.isRecurring === true ? 'Recurring' : 'One-time'}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Total Sent:</p>
                  <p className="text-muted-foreground">{reminder.totalSent || 0} notifications</p>
                </div>

                {reminder.lastSentAt && (
                  <div>
                    <p className="font-medium mb-1">Last Sent:</p>
                    <p className="text-muted-foreground">{formatDateTime(reminder.lastSentAt)}</p>
                  </div>
                )}
              </div>

              {reminder.dosageTaken === true && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Marked as taken</span>
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-green-700 mt-1">{reminder.notes}</p>
                  )}
                </div>
              )}

              {isSnoozed && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Snoozed until {formatDateTime(reminder.snoozeUntil!)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                  Created on {formatDate(reminder.createdAt)}
                </p>

                <div className="flex gap-2">
                  {reminder.reminderType === 'medication' && reminder.status === 'active' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAsTaken(reminder.id, !reminder.dosageTaken)}
                        disabled={isProcessing}
                        variant={reminder.dosageTaken === true ? "outline" : "default"}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : reminder.dosageTaken === true ? (
                          <X className="h-4 w-4 mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {reminder.dosageTaken === true ? 'Mark as Not Taken' : 'Mark as Taken'}
                      </Button>
                      
                      {!isSnoozed && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSnoozeReminder(reminder.id, 15)}
                          disabled={isProcessing}
                        >
                          <Timer className="h-4 w-4 mr-2" />
                          Snooze 15m
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
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
          <h2 className="text-2xl font-bold mb-4">Loading Reminders...</h2>
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
          <Button onClick={loadReminders}>
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
          <h1 className="text-3xl font-bold">My Reminders</h1>
          <p className="text-muted-foreground mt-2">
            Manage your medication and health reminders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadReminders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reminders</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-xs text-muted-foreground">All reminders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReminders.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Reminders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysReminders.length}</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medication Reminders</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminders.filter(r => r.reminderType === 'medication').length}
              </div>
            <p className="text-xs text-muted-foreground">Medication alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Reminders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        {/* All Reminders Tab */}
        <TabsContent value="all" className="space-y-6">
          {reminders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reminders yet</h3>
                <p className="text-muted-foreground mb-4">
                    Set up reminders for medications, appointments, and health checks.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reminder
                </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder, index) => 
                renderReminderCard(reminder, index)
                            )}
                          </div>
          )}
        </TabsContent>

        {/* Active Reminders Tab */}
        <TabsContent value="active" className="space-y-6">
          {activeReminders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active reminders</h3>
                <p className="text-muted-foreground">
                    Your active reminders will appear here.
                </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeReminders.map((reminder, index) => 
                renderReminderCard(reminder, index)
              )}
            </div>
          )}
        </TabsContent>

        {/* Today's Reminders Tab */}
        <TabsContent value="today" className="space-y-6">
          {todaysReminders.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reminders for today</h3>
                  <p className="text-muted-foreground">
                    You're all caught up for today!
                  </p>
                    </div>
                  </CardContent>
                </Card>
          ) : (
            <div className="space-y-4">
              {todaysReminders.map((reminder, index) => 
                renderReminderCard(reminder, index)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
