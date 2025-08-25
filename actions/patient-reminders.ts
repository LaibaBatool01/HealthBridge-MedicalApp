"use server"

import { db, reminders, prescriptions, patients } from "@/db"
import { eq, and, desc, gte, lte } from "drizzle-orm"
import { getCurrentMedicalUser } from "./users"

export async function getPatientReminders() {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get all reminders for this patient
    const remindersList = await db
      .select({
        id: reminders.id,
        prescriptionId: reminders.prescriptionId,
        reminderType: reminders.reminderType,
        title: reminders.title,
        message: reminders.message,
        reminderTime: reminders.reminderTime,
        reminderDays: reminders.reminderDays,
        isRecurring: reminders.isRecurring,
        status: reminders.status,
        lastSentAt: reminders.lastSentAt,
        nextReminderAt: reminders.nextReminderAt,
        totalSent: reminders.totalSent,
        dosageTaken: reminders.dosageTaken,
        notes: reminders.notes,
        snoozeUntil: reminders.snoozeUntil,
        createdAt: reminders.createdAt,
        updatedAt: reminders.updatedAt,
        // Prescription info if linked
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency
      })
      .from(reminders)
      .leftJoin(prescriptions, eq(reminders.prescriptionId, prescriptions.id))
      .where(eq(reminders.patientId, patientId))
      .orderBy(desc(reminders.nextReminderAt))

    return remindersList
  } catch (error) {
    console.error("Error fetching patient reminders:", error)
    throw error
  }
}

export async function getActiveReminders() {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get active reminders
    const activeList = await db
      .select({
        id: reminders.id,
        prescriptionId: reminders.prescriptionId,
        reminderType: reminders.reminderType,
        title: reminders.title,
        message: reminders.message,
        reminderTime: reminders.reminderTime,
        reminderDays: reminders.reminderDays,
        isRecurring: reminders.isRecurring,
        status: reminders.status,
        lastSentAt: reminders.lastSentAt,
        nextReminderAt: reminders.nextReminderAt,
        totalSent: reminders.totalSent,
        dosageTaken: reminders.dosageTaken,
        notes: reminders.notes,
        snoozeUntil: reminders.snoozeUntil,
        createdAt: reminders.createdAt,
        updatedAt: reminders.updatedAt,
        // Prescription info if linked
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency
      })
      .from(reminders)
      .leftJoin(prescriptions, eq(reminders.prescriptionId, prescriptions.id))
      .where(and(
        eq(reminders.patientId, patientId),
        eq(reminders.status, 'active')
      ))
      .orderBy(reminders.nextReminderAt)

    return activeList
  } catch (error) {
    console.error("Error fetching active reminders:", error)
    throw error
  }
}

export async function getTodaysReminders() {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Get today's reminders
    const todaysList = await db
      .select({
        id: reminders.id,
        prescriptionId: reminders.prescriptionId,
        reminderType: reminders.reminderType,
        title: reminders.title,
        message: reminders.message,
        reminderTime: reminders.reminderTime,
        reminderDays: reminders.reminderDays,
        isRecurring: reminders.isRecurring,
        status: reminders.status,
        lastSentAt: reminders.lastSentAt,
        nextReminderAt: reminders.nextReminderAt,
        totalSent: reminders.totalSent,
        dosageTaken: reminders.dosageTaken,
        notes: reminders.notes,
        snoozeUntil: reminders.snoozeUntil,
        createdAt: reminders.createdAt,
        updatedAt: reminders.updatedAt,
        // Prescription info if linked
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency
      })
      .from(reminders)
      .leftJoin(prescriptions, eq(reminders.prescriptionId, prescriptions.id))
      .where(and(
        eq(reminders.patientId, patientId),
        eq(reminders.status, 'active'),
        gte(reminders.nextReminderAt, startOfDay),
        lte(reminders.nextReminderAt, endOfDay)
      ))
      .orderBy(reminders.reminderTime)

    return todaysList
  } catch (error) {
    console.error("Error fetching today's reminders:", error)
    throw error
  }
}

export async function getRemindersByType(type: 'medication' | 'appointment' | 'follow_up' | 'health_check' | 'lab_test') {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Get reminders by type
    const typeList = await db
      .select({
        id: reminders.id,
        prescriptionId: reminders.prescriptionId,
        reminderType: reminders.reminderType,
        title: reminders.title,
        message: reminders.message,
        reminderTime: reminders.reminderTime,
        reminderDays: reminders.reminderDays,
        isRecurring: reminders.isRecurring,
        status: reminders.status,
        lastSentAt: reminders.lastSentAt,
        nextReminderAt: reminders.nextReminderAt,
        totalSent: reminders.totalSent,
        dosageTaken: reminders.dosageTaken,
        notes: reminders.notes,
        snoozeUntil: reminders.snoozeUntil,
        createdAt: reminders.createdAt,
        // Prescription info if linked
        medicationName: prescriptions.medicationName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency
      })
      .from(reminders)
      .leftJoin(prescriptions, eq(reminders.prescriptionId, prescriptions.id))
      .where(and(
        eq(reminders.patientId, patientId),
        eq(reminders.reminderType, type)
      ))
      .orderBy(desc(reminders.nextReminderAt))

    return typeList
  } catch (error) {
    console.error("Error fetching reminders by type:", error)
    throw error
  }
}

export async function markReminderAsTaken(reminderId: string, taken: boolean = true, notes?: string) {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Update reminder
    await db
      .update(reminders)
      .set({
        dosageTaken: taken,
        notes: notes,
        updatedAt: new Date()
      })
      .where(and(
        eq(reminders.id, reminderId),
        eq(reminders.patientId, patientId)
      ))

    return { success: true }
  } catch (error) {
    console.error("Error marking reminder as taken:", error)
    throw error
  }
}

export async function snoozeReminder(reminderId: string, snoozeMinutes: number = 15) {
  try {
    const currentMedicalUser = await getCurrentMedicalUser()
    if (!currentMedicalUser || currentMedicalUser.userType !== 'patient') {
      throw new Error("Unauthorized - Patient access required")
    }

    // Get patient record
    const patientRecord = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, currentMedicalUser.id))
      .limit(1)

    if (patientRecord.length === 0) {
      throw new Error("Patient profile not found")
    }

    const patientId = patientRecord[0].id

    // Calculate snooze until time
    const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000)

    // Update reminder
    await db
      .update(reminders)
      .set({
        snoozeUntil: snoozeUntil,
        updatedAt: new Date()
      })
      .where(and(
        eq(reminders.id, reminderId),
        eq(reminders.patientId, patientId)
      ))

    return { success: true, snoozeUntil }
  } catch (error) {
    console.error("Error snoozing reminder:", error)
    throw error
  }
}
