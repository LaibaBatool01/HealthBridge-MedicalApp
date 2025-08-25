"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, consultations, doctors, patients, users } from "@/db"
import { eq, and, desc, sql } from "drizzle-orm"

export interface ConsultationNoteData {
  id: string
  consultationId: string
  patientName: string
  patientEmail: string
  patientProfileImage?: string | null
  consultationDate: Date
  consultationType: string
  symptoms: string[]
  diagnosis?: string | null
  notes?: string | null
  prescriptionGiven: boolean
  followUpRequired: boolean
  followUpDate?: Date | null
  status: string
  createdAt: Date
  updatedAt: Date
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

export async function getDoctorConsultationNotes(): Promise<ConsultationNoteData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        consultationId: consultations.id,
        patientName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        patientProfileImage: users.profileImage,
        consultationDate: consultations.scheduledAt,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        notes: consultations.doctorNotes,
        prescriptionGiven: sql<boolean>`CASE WHEN EXISTS(
          SELECT 1 FROM prescriptions p WHERE p.consultation_id = ${consultations.id}
        ) THEN true ELSE false END`,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        status: consultations.status,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(consultations.scheduledAt))

    return result.map(item => ({
      ...item,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : 
                item.symptoms ? JSON.parse(item.symptoms as string) : [],
      prescriptionGiven: Boolean(item.prescriptionGiven)
    })) as ConsultationNoteData[]
  } catch (error) {
    console.error("Error fetching doctor consultation notes:", error)
    return []
  }
}

export async function getRecentConsultationNotes(days: number = 7): Promise<ConsultationNoteData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await db
      .select({
        id: consultations.id,
        consultationId: consultations.id,
        patientName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        patientProfileImage: users.profileImage,
        consultationDate: consultations.scheduledAt,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        notes: consultations.doctorNotes,
        prescriptionGiven: sql<boolean>`CASE WHEN EXISTS(
          SELECT 1 FROM prescriptions p WHERE p.consultation_id = ${consultations.id}
        ) THEN true ELSE false END`,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        status: consultations.status,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        sql`${consultations.scheduledAt} >= ${cutoffDate.toISOString()}`
      ))
      .orderBy(desc(consultations.scheduledAt))

    return result.map(item => ({
      ...item,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : 
                item.symptoms ? JSON.parse(item.symptoms as string) : [],
      prescriptionGiven: Boolean(item.prescriptionGiven)
    })) as ConsultationNoteData[]
  } catch (error) {
    console.error("Error fetching recent consultation notes:", error)
    return []
  }
}

export async function getConsultationNotesWithFollowUp(): Promise<ConsultationNoteData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        consultationId: consultations.id,
        patientName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        patientProfileImage: users.profileImage,
        consultationDate: consultations.scheduledAt,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        notes: consultations.doctorNotes,
        prescriptionGiven: sql<boolean>`CASE WHEN EXISTS(
          SELECT 1 FROM prescriptions p WHERE p.consultation_id = ${consultations.id}
        ) THEN true ELSE false END`,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        status: consultations.status,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.followUpRequired, true)
      ))
      .orderBy(desc(consultations.scheduledAt))

    return result.map(item => ({
      ...item,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : 
                item.symptoms ? JSON.parse(item.symptoms as string) : [],
      prescriptionGiven: Boolean(item.prescriptionGiven)
    })) as ConsultationNoteData[]
  } catch (error) {
    console.error("Error fetching consultation notes with follow-up:", error)
    return []
  }
}

export async function getConsultationNotesWithPrescriptions(): Promise<ConsultationNoteData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        consultationId: consultations.id,
        patientName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        patientProfileImage: users.profileImage,
        consultationDate: consultations.scheduledAt,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        notes: consultations.doctorNotes,
        prescriptionGiven: sql<boolean>`true`,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        status: consultations.status,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        sql`EXISTS(SELECT 1 FROM prescriptions p WHERE p.consultation_id = ${consultations.id})`
      ))
      .orderBy(desc(consultations.scheduledAt))

    return result.map(item => ({
      ...item,
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : 
                item.symptoms ? JSON.parse(item.symptoms as string) : [],
      prescriptionGiven: true
    })) as ConsultationNoteData[]
  } catch (error) {
    console.error("Error fetching consultation notes with prescriptions:", error)
    return []
  }
}

export async function updateConsultationNotes(consultationId: string, notes: string, diagnosis?: string): Promise<{ success: boolean }> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(consultations)
      .set({
        doctorNotes: notes,
        diagnosis: diagnosis || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(consultations.id, consultationId),
        eq(consultations.doctorId, doctorId)
      ))

    return { success: true }
  } catch (error) {
    console.error("Error updating consultation notes:", error)
    throw error
  }
}

export async function getConsultationNotesStats() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    // Get total notes count
    const totalResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(eq(consultations.doctorId, doctorId))

    // Get recent notes count (last 7 days)
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 7)

    const recentResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        sql`${consultations.scheduledAt} >= ${recentDate.toISOString()}`
      ))

    // Get follow-up required count
    const followUpResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.followUpRequired, true)
      ))

    // Get prescriptions count
    const prescriptionsResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${consultations.id})`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        sql`EXISTS(SELECT 1 FROM prescriptions p WHERE p.consultation_id = ${consultations.id})`
      ))

    return {
      total: totalResult[0]?.count || 0,
      recent: recentResult[0]?.count || 0,
      followUp: followUpResult[0]?.count || 0,
      prescriptions: prescriptionsResult[0]?.count || 0
    }
  } catch (error) {
    console.error("Error fetching consultation notes stats:", error)
    return null
  }
}
