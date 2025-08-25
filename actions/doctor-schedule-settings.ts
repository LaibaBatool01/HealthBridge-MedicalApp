"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, doctors, users } from "@/db"
import { eq, and } from "drizzle-orm"

export interface DoctorScheduleSettings {
  id: string
  workingHours: {
    monday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    tuesday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    wednesday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    thursday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    friday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    saturday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
    sunday: { isEnabled: boolean; startTime: string; endTime: string; breakStart?: string; breakEnd?: string }
  }
  consultationSettings: {
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
  notificationSettings: {
    newBooking: boolean
    appointmentReminder: boolean
    cancellation: boolean
    paymentReceived: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    reminderHours: number
  }
}

async function getCurrentDoctorId(): Promise<string | null> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const userRecord = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (!userRecord[0]) return null

    const doctorRecord = await db
      .select({ id: doctors.id })
      .from(doctors)
      .where(eq(doctors.userId, userRecord[0].id))
      .limit(1)

    return doctorRecord[0]?.id || null
  } catch (error) {
    console.error("Error getting current doctor ID:", error)
    return null
  }
}

export async function getDoctorScheduleSettings(): Promise<DoctorScheduleSettings | null> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    const [doctorData] = await db
      .select({
        id: doctors.id,
        workingHours: doctors.workingHours,
        consultationDuration: doctors.consultationDuration,
        bufferTime: doctors.bufferTime,
        maxBookingsPerDay: doctors.maxBookingsPerDay,
        allowWeekendBookings: doctors.allowWeekendBookings,
        advanceBookingDays: doctors.advanceBookingDays,
        cancellationHours: doctors.cancellationHours,
        consultationTypes: doctors.consultationTypes,
        consultationFees: doctors.consultationFees,
        notificationSettings: doctors.notificationSettings
      })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1)

    if (!doctorData) return null

    // Parse JSON fields or provide defaults
    const workingHours = doctorData.workingHours ? 
      (typeof doctorData.workingHours === 'string' ? JSON.parse(doctorData.workingHours) : doctorData.workingHours) :
      {
        monday: { isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        tuesday: { isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        wednesday: { isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        thursday: { isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        friday: { isEnabled: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        saturday: { isEnabled: false, startTime: "09:00", endTime: "13:00" },
        sunday: { isEnabled: false, startTime: "09:00", endTime: "13:00" }
      }

    const consultationTypes = doctorData.consultationTypes ?
      (typeof doctorData.consultationTypes === 'string' ? JSON.parse(doctorData.consultationTypes) : doctorData.consultationTypes) :
      { video: true, chat: true, phone: true, inPerson: true }

    const consultationFees = doctorData.consultationFees ?
      (typeof doctorData.consultationFees === 'string' ? JSON.parse(doctorData.consultationFees) : doctorData.consultationFees) :
      { video: 100, chat: 85, phone: 90, inPerson: 120 }

    const notificationSettings = doctorData.notificationSettings ?
      (typeof doctorData.notificationSettings === 'string' ? JSON.parse(doctorData.notificationSettings) : doctorData.notificationSettings) :
      {
        newBooking: true,
        appointmentReminder: true,
        cancellation: true,
        paymentReceived: true,
        emailNotifications: true,
        smsNotifications: false,
        reminderHours: 24
      }

    return {
      id: doctorData.id,
      workingHours,
      consultationSettings: {
        defaultDuration: doctorData.consultationDuration || 30,
        bufferTime: doctorData.bufferTime || 15,
        maxBookingsPerDay: doctorData.maxBookingsPerDay || 8,
        allowWeekendBookings: doctorData.allowWeekendBookings || false,
        advanceBookingDays: doctorData.advanceBookingDays || 30,
        cancellationHours: doctorData.cancellationHours || 24,
        consultationTypes,
        fees: consultationFees
      },
      notificationSettings
    }
  } catch (error) {
    console.error("Error fetching doctor schedule settings:", error)
    return null
  }
}

export async function updateDoctorScheduleSettings(settings: Partial<DoctorScheduleSettings>): Promise<{ success: boolean }> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    const updateData: any = {
      updatedAt: new Date()
    }

    if (settings.workingHours) {
      updateData.workingHours = JSON.stringify(settings.workingHours)
    }

    if (settings.consultationSettings) {
      const cs = settings.consultationSettings
      if (cs.defaultDuration) updateData.consultationDuration = cs.defaultDuration
      if (cs.bufferTime) updateData.bufferTime = cs.bufferTime
      if (cs.maxBookingsPerDay) updateData.maxBookingsPerDay = cs.maxBookingsPerDay
      if (cs.allowWeekendBookings !== undefined) updateData.allowWeekendBookings = cs.allowWeekendBookings
      if (cs.advanceBookingDays) updateData.advanceBookingDays = cs.advanceBookingDays
      if (cs.cancellationHours) updateData.cancellationHours = cs.cancellationHours
      if (cs.consultationTypes) updateData.consultationTypes = JSON.stringify(cs.consultationTypes)
      if (cs.fees) updateData.consultationFees = JSON.stringify(cs.fees)
    }

    if (settings.notificationSettings) {
      updateData.notificationSettings = JSON.stringify(settings.notificationSettings)
    }

    await db
      .update(doctors)
      .set(updateData)
      .where(eq(doctors.id, doctorId))

    return { success: true }
  } catch (error) {
    console.error("Error updating doctor schedule settings:", error)
    throw error
  }
}

export async function updateWorkingHours(workingHours: DoctorScheduleSettings['workingHours']): Promise<{ success: boolean }> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(doctors)
      .set({
        workingHours: JSON.stringify(workingHours),
        updatedAt: new Date()
      })
      .where(eq(doctors.id, doctorId))

    return { success: true }
  } catch (error) {
    console.error("Error updating working hours:", error)
    throw error
  }
}

export async function updateConsultationSettings(consultationSettings: DoctorScheduleSettings['consultationSettings']): Promise<{ success: boolean }> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(doctors)
      .set({
        consultationDuration: consultationSettings.defaultDuration,
        bufferTime: consultationSettings.bufferTime,
        maxBookingsPerDay: consultationSettings.maxBookingsPerDay,
        allowWeekendBookings: consultationSettings.allowWeekendBookings,
        advanceBookingDays: consultationSettings.advanceBookingDays,
        cancellationHours: consultationSettings.cancellationHours,
        consultationTypes: JSON.stringify(consultationSettings.consultationTypes),
        consultationFees: JSON.stringify(consultationSettings.fees),
        updatedAt: new Date()
      })
      .where(eq(doctors.id, doctorId))

    return { success: true }
  } catch (error) {
    console.error("Error updating consultation settings:", error)
    throw error
  }
}

export async function updateNotificationSettings(notificationSettings: DoctorScheduleSettings['notificationSettings']): Promise<{ success: boolean }> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(doctors)
      .set({
        notificationSettings: JSON.stringify(notificationSettings),
        updatedAt: new Date()
      })
      .where(eq(doctors.id, doctorId))

    return { success: true }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    throw error
  }
}

export async function getDoctorAvailabilitySummary() {
  try {
    const settings = await getDoctorScheduleSettings()
    if (!settings) return null

    const workingDays = Object.entries(settings.workingHours)
      .filter(([_, hours]) => hours.isEnabled)
      .map(([day, hours]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        startTime: hours.startTime,
        endTime: hours.endTime,
        breakStart: hours.breakStart,
        breakEnd: hours.breakEnd
      }))

    const activeServices = Object.entries(settings.consultationSettings.consultationTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        fee: settings.consultationSettings.fees[type as keyof typeof settings.consultationSettings.fees]
      }))

    return {
      workingDays,
      activeServices,
      maxBookingsPerDay: settings.consultationSettings.maxBookingsPerDay,
      defaultDuration: settings.consultationSettings.defaultDuration,
      advanceBookingDays: settings.consultationSettings.advanceBookingDays,
      allowWeekendBookings: settings.consultationSettings.allowWeekendBookings
    }
  } catch (error) {
    console.error("Error fetching doctor availability summary:", error)
    return null
  }
}
