"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, prescriptions, doctors, patients, users } from "@/db"
import { eq, and, desc, sql } from "drizzle-orm"
import type { SelectPrescription } from "@/db"

export interface DoctorPrescriptionData {
  id: string
  consultationId?: string | null
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
  isActive: boolean | null
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

export async function getDoctorPrescriptions(): Promise<DoctorPrescriptionData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: prescriptions.id,
        consultationId: prescriptions.consultationId,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        patient: {
          id: patients.id,
          userId: patients.userId,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            profileImage: users.profileImage
          }
        }
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt))

    return result as DoctorPrescriptionData[]
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error)
    return []
  }
}

export async function getDoctorPrescriptionsByStatus(status: string): Promise<DoctorPrescriptionData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: prescriptions.id,
        consultationId: prescriptions.consultationId,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        patient: {
          id: patients.id,
          userId: patients.userId,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            profileImage: users.profileImage
          }
        }
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.status, status)
      ))
      .orderBy(desc(prescriptions.createdAt))

    return result as DoctorPrescriptionData[]
  } catch (error) {
    console.error("Error fetching doctor prescriptions by status:", error)
    return []
  }
}

export async function getActiveDoctorPrescriptions(): Promise<DoctorPrescriptionData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: prescriptions.id,
        consultationId: prescriptions.consultationId,
        medicationName: prescriptions.medicationName,
        genericName: prescriptions.genericName,
        dosage: prescriptions.dosage,
        frequency: prescriptions.frequency,
        customFrequency: prescriptions.customFrequency,
        duration: prescriptions.duration,
        quantity: prescriptions.quantity,
        instructions: prescriptions.instructions,
        sideEffects: prescriptions.sideEffects,
        interactions: prescriptions.interactions,
        refillsAllowed: prescriptions.refillsAllowed,
        status: prescriptions.status,
        pharmacyName: prescriptions.pharmacyName,
        pharmacyAddress: prescriptions.pharmacyAddress,
        pharmacyPhone: prescriptions.pharmacyPhone,
        startDate: prescriptions.startDate,
        endDate: prescriptions.endDate,
        isActive: prescriptions.isActive,
        createdAt: prescriptions.createdAt,
        updatedAt: prescriptions.updatedAt,
        patient: {
          id: patients.id,
          userId: patients.userId,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            profileImage: users.profileImage
          }
        }
      })
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.isActive, true)
      ))
      .orderBy(desc(prescriptions.createdAt))

    return result as DoctorPrescriptionData[]
  } catch (error) {
    console.error("Error fetching active doctor prescriptions:", error)
    return []
  }
}

export async function getDoctorPrescriptionStats() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    // Get total prescriptions count
    const totalResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))

    // Get active prescriptions count
    const activeResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(prescriptions)
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.isActive, true)
      ))

    // Get pending prescriptions count
    const pendingResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(prescriptions)
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.status, 'pending')
      ))

    // Get this month's prescriptions count
    const thisMonth = new Date()
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    
    const monthlyResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(prescriptions)
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        sql`${prescriptions.createdAt} >= ${startOfMonth}`
      ))

    return {
      total: totalResult[0]?.count || 0,
      active: activeResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      thisMonth: monthlyResult[0]?.count || 0
    }
  } catch (error) {
    console.error("Error fetching doctor prescription stats:", error)
    return null
  }
}

export async function createPrescription(prescriptionData: {
  patientId: string
  consultationId?: string
  medicationName: string
  genericName?: string
  dosage: string
  frequency: string
  customFrequency?: string
  duration: number
  quantity: number
  instructions?: string
  sideEffects?: string
  interactions?: string
  refillsAllowed?: number
  pharmacyName?: string
  pharmacyAddress?: string
  pharmacyPhone?: string
}) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    const newPrescription = await db
      .insert(prescriptions)
      .values({
        ...prescriptionData,
        doctorId,
        status: 'pending',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + prescriptionData.duration * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    return { success: true, prescription: newPrescription[0] }
  } catch (error) {
    console.error("Error creating prescription:", error)
    throw error
  }
}

export async function updatePrescriptionStatus(prescriptionId: string, status: string) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(prescriptions)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(and(
        eq(prescriptions.id, prescriptionId),
        eq(prescriptions.doctorId, doctorId)
      ))

    return { success: true }
  } catch (error) {
    console.error("Error updating prescription status:", error)
    throw error
  }
}
