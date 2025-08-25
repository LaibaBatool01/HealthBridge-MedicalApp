"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { 
  Calendar,
  Clock,
  Settings,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Bell,
  MapPin,
  Users,
  Video,
  MessageCircle,
  Phone
} from "lucide-react"
import {
  getDoctorScheduleSettings,
  updateDoctorScheduleSettings,
  updateWorkingHours,
  updateConsultationSettings,
  updateNotificationSettings,
  getDoctorAvailabilitySummary,
  type DoctorScheduleSettings
} from "@/actions/doctor-schedule-settings"

interface WorkingHours {
  day: string
  isEnabled: boolean
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

interface ConsultationSettings {
  defaultDuration: number
  bufferTime: number
  maxBookingsPerDay: number
  allowWeekendBookings: boolean
  advanceBookingDays: number
  cancellationHours: number
  consultationTypes: {
    video: boolean
    chat: boolean
    phone: boolean
    inPerson: boolean
  }
  fees: {
    video: number
    chat: number
    phone: number
    inPerson: number
  }
}

interface NotificationSettings {
  newBooking: boolean
  appointmentReminder: boolean
  cancellation: boolean
  paymentReceived: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  reminderHours: number
}

export default function ScheduleSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("hours")
  
  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: "Monday", isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    { day: "Tuesday", isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    { day: "Wednesday", isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    { day: "Thursday", isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    { day: "Friday", isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    { day: "Saturday", isEnabled: false, startTime: "09:00", endTime: "13:00" },
    { day: "Sunday", isEnabled: false, startTime: "09:00", endTime: "13:00" }
  ])

  // Consultation settings state
  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings>({
    defaultDuration: 30,
    bufferTime: 15,
    maxBookingsPerDay: 8,
    allowWeekendBookings: false,
    advanceBookingDays: 30,
    cancellationHours: 24,
    consultationTypes: {
      video: true,
      chat: true,
      phone: true,
      inPerson: true
    },
    fees: {
      video: 100,
      chat: 85,
      phone: 90,
      inPerson: 120
    }
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newBooking: true,
    appointmentReminder: true,
    cancellation: true,
    paymentReceived: true,
    emailNotifications: true,
    smsNotifications: false,
    reminderHours: 24
  })

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: any) => {
    const updated = [...workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setWorkingHours(updated)
  }

  const handleConsultationSettingsChange = (field: keyof ConsultationSettings, value: any) => {
    setConsultationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleConsultationTypeChange = (type: keyof ConsultationSettings['consultationTypes'], enabled: boolean) => {
    setConsultationSettings(prev => ({
      ...prev,
      consultationTypes: { ...prev.consultationTypes, [type]: enabled }
    }))
  }

  const handleFeeChange = (type: keyof ConsultationSettings['fees'], amount: number) => {
    setConsultationSettings(prev => ({
      ...prev,
      fees: { ...prev.fees, [type]: amount }
    }))
  }

  const handleNotificationChange = (field: keyof NotificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your availability, consultation preferences, and notifications
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Working Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Set your working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workingHours.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="w-24">
                    <Label className="font-medium">{day.day}</Label>
                  </div>
                  
                  <Switch
                    checked={day.isEnabled}
                    onCheckedChange={(checked) => handleWorkingHoursChange(index, 'isEnabled', checked)}
                  />
                  
                  {day.isEnabled && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Start:</Label>
                        <Select
                          value={day.startTime}
                          onValueChange={(value) => handleWorkingHoursChange(index, 'startTime', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">End:</Label>
                        <Select
                          value={day.endTime}
                          onValueChange={(value) => handleWorkingHoursChange(index, 'endTime', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Break:</Label>
                        <Select
                          value={day.breakStart || "12:00"}
                          onValueChange={(value) => handleWorkingHoursChange(index, 'breakStart', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm">to</span>
                        <Select
                          value={day.breakEnd || "13:00"}
                          onValueChange={(value) => handleWorkingHoursChange(index, 'breakEnd', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultDuration">Default Consultation Duration (minutes)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={consultationSettings.defaultDuration}
                    onChange={(e) => handleConsultationSettingsChange('defaultDuration', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bufferTime">Buffer Time Between Consultations (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={consultationSettings.bufferTime}
                    onChange={(e) => handleConsultationSettingsChange('bufferTime', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxBookings">Maximum Bookings Per Day</Label>
                  <Input
                    id="maxBookings"
                    type="number"
                    value={consultationSettings.maxBookingsPerDay}
                    onChange={(e) => handleConsultationSettingsChange('maxBookingsPerDay', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="advanceBooking">Advance Booking Days</Label>
                  <Input
                    id="advanceBooking"
                    type="number"
                    value={consultationSettings.advanceBookingDays}
                    onChange={(e) => handleConsultationSettingsChange('advanceBookingDays', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cancellationHours">Cancellation Notice (hours)</Label>
                  <Input
                    id="cancellationHours"
                    type="number"
                    value={consultationSettings.cancellationHours}
                    onChange={(e) => handleConsultationSettingsChange('cancellationHours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekendBookings"
                    checked={consultationSettings.allowWeekendBookings}
                    onCheckedChange={(checked) => handleConsultationSettingsChange('allowWeekendBookings', checked)}
                  />
                  <Label htmlFor="weekendBookings">Allow Weekend Bookings</Label>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Types & Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Consultation Types & Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label className="font-medium">Video Call</Label>
                        <p className="text-sm text-muted-foreground">Face-to-face video consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={consultationSettings.fees.video}
                        onChange={(e) => handleFeeChange('video', parseFloat(e.target.value))}
                        className="w-20"
                        disabled={!consultationSettings.consultationTypes.video}
                      />
                      <Switch
                        checked={consultationSettings.consultationTypes.video}
                        onCheckedChange={(checked) => handleConsultationTypeChange('video', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <Label className="font-medium">Chat Only</Label>
                        <p className="text-sm text-muted-foreground">Text-based consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={consultationSettings.fees.chat}
                        onChange={(e) => handleFeeChange('chat', parseFloat(e.target.value))}
                        className="w-20"
                        disabled={!consultationSettings.consultationTypes.chat}
                      />
                      <Switch
                        checked={consultationSettings.consultationTypes.chat}
                        onCheckedChange={(checked) => handleConsultationTypeChange('chat', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-purple-500" />
                      <div>
                        <Label className="font-medium">Phone Call</Label>
                        <p className="text-sm text-muted-foreground">Voice-only consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={consultationSettings.fees.phone}
                        onChange={(e) => handleFeeChange('phone', parseFloat(e.target.value))}
                        className="w-20"
                        disabled={!consultationSettings.consultationTypes.phone}
                      />
                      <Switch
                        checked={consultationSettings.consultationTypes.phone}
                        onCheckedChange={(checked) => handleConsultationTypeChange('phone', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label className="font-medium">In-Person</Label>
                        <p className="text-sm text-muted-foreground">Physical clinic visit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={consultationSettings.fees.inPerson}
                        onChange={(e) => handleFeeChange('inPerson', parseFloat(e.target.value))}
                        className="w-20"
                        disabled={!consultationSettings.consultationTypes.inPerson}
                      />
                      <Switch
                        checked={consultationSettings.consultationTypes.inPerson}
                        onCheckedChange={(checked) => handleConsultationTypeChange('inPerson', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to be notified about appointments and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Notification Types</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newBooking">New Booking Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when patients book appointments</p>
                    </div>
                    <Switch
                      id="newBooking"
                      checked={notificationSettings.newBooking}
                      onCheckedChange={(checked) => handleNotificationChange('newBooking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointmentReminder">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      id="appointmentReminder"
                      checked={notificationSettings.appointmentReminder}
                      onCheckedChange={(checked) => handleNotificationChange('appointmentReminder', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cancellation">Cancellation Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when appointments are cancelled</p>
                    </div>
                    <Switch
                      id="cancellation"
                      checked={notificationSettings.cancellation}
                      onCheckedChange={(checked) => handleNotificationChange('cancellation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentReceived">Payment Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when payments are received</p>
                    </div>
                    <Switch
                      id="paymentReceived"
                      checked={notificationSettings.paymentReceived}
                      onCheckedChange={(checked) => handleNotificationChange('paymentReceived', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Delivery Methods</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reminderHours">Reminder Time (hours before appointment)</Label>
                <Input
                  id="reminderHours"
                  type="number"
                  value={notificationSettings.reminderHours}
                  onChange={(e) => handleNotificationChange('reminderHours', parseInt(e.target.value))}
                  className="mt-1 max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Overview
              </CardTitle>
              <CardDescription>
                Summary of your current availability settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Working Days</h4>
                  <div className="space-y-1">
                    {workingHours.filter(day => day.isEnabled).map(day => (
                      <div key={day.day} className="text-sm">
                        <span className="font-medium">{day.day}:</span> {day.startTime} - {day.endTime}
                        {day.breakStart && day.breakEnd && (
                          <span className="text-muted-foreground"> (Break: {day.breakStart} - {day.breakEnd})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Active Services</h4>
                  <div className="space-y-1">
                    {Object.entries(consultationSettings.consultationTypes)
                      .filter(([_, enabled]) => enabled)
                      .map(([type, _]) => (
                        <Badge key={type} variant="outline" className="mr-2">
                          {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          <span className="ml-1">${consultationSettings.fees[type as keyof ConsultationSettings['fees']]}</span>
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
