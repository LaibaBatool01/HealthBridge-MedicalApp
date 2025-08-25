"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, prescriptions, doctors, patients, users } from "@/db"
import { eq, and, desc, sql } from "drizzle-orm"

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

export async function getDoctorPrescriptions() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select()
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt))

    // Transform the result to match expected structure
    return result.map(row => ({
      ...row.prescriptions,
      patient: {
        ...row.patients,
        user: row.users
      }
    }))
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error)
    return []
  }
}

export async function getActiveDoctorPrescriptions() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select()
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(prescriptions.doctorId, doctorId),
        eq(prescriptions.isActive, true)
      ))
      .orderBy(desc(prescriptions.createdAt))

    return result.map(row => ({
      ...row.prescriptions,
      patient: {
        ...row.patients,
        user: row.users
      }
    }))
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
        sql`${prescriptions.createdAt} >= ${startOfMonth.toISOString()}`
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
