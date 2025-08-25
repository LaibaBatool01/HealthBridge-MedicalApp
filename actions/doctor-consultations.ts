"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db, consultations, doctors, patients, users } from "@/db"
import { eq, and, desc, gte, lte, sql } from "drizzle-orm"

export interface DoctorConsultationData {
  id: string
  patientId: string
  scheduledAt: Date
  duration: string
  consultationType: string
  status: string
  symptoms?: string | null
  diagnosis?: string | null
  doctorNotes?: string | null
  patientNotes?: string | null
  prescriptionGiven: boolean
  followUpRequired: boolean
  followUpDate?: Date | null
  consultationFee?: string | null
  paymentStatus?: string | null
  meetingLink?: string | null
  videoRoomName?: string | null
  meetingStatus?: string | null
  doctorJoined: boolean
  patientJoined: boolean
  createdAt: Date
  updatedAt: Date
  patient: {
    id: string
    userId: string
    dateOfBirth?: Date | null
    gender?: string | null
    bloodType?: string | null
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

export async function getDoctorConsultations(): Promise<DoctorConsultationData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        patientId: consultations.patientId,
        scheduledAt: consultations.scheduledAt,
        duration: consultations.duration,
        consultationType: consultations.consultationType,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        patientNotes: consultations.patientNotes,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        consultationFee: consultations.consultationFee,
        paymentStatus: consultations.paymentStatus,
        meetingLink: consultations.meetingLink,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        doctorJoined: consultations.doctorJoined,
        patientJoined: consultations.patientJoined,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt,
        // Patient info
        patientId: patients.id,
        patientUserId: patients.userId,
        patientDateOfBirth: patients.dateOfBirth,
        patientGender: patients.gender,
        patientBloodType: patients.bloodType,
        // User info
        patientUserEmail: users.email,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientPhone: users.phone,
        patientProfileImage: users.profileImage
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(consultations.scheduledAt))

    // Map flattened results back to nested structure
    return result.map(item => ({
      id: item.id,
      patientId: item.patientId,
      scheduledAt: item.scheduledAt,
      duration: item.duration,
      consultationType: item.consultationType,
      status: item.status,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      doctorNotes: item.doctorNotes,
      patientNotes: item.patientNotes,
      prescriptionGiven: item.prescriptionGiven,
      followUpRequired: item.followUpRequired,
      followUpDate: item.followUpDate,
      consultationFee: item.consultationFee,
      paymentStatus: item.paymentStatus,
      meetingLink: item.meetingLink,
      videoRoomName: item.videoRoomName,
      meetingStatus: item.meetingStatus,
      doctorJoined: item.doctorJoined,
      patientJoined: item.patientJoined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: {
        id: item.patientId,
        userId: item.patientUserId,
        dateOfBirth: item.patientDateOfBirth,
        gender: item.patientGender,
        bloodType: item.patientBloodType,
        user: {
          id: item.patientUserId,
          email: item.patientUserEmail,
          firstName: item.patientFirstName,
          lastName: item.patientLastName,
          phone: item.patientPhone,
          profileImage: item.patientProfileImage
        }
      }
    })) as DoctorConsultationData[]
  } catch (error) {
    console.error("Error fetching doctor consultations:", error)
    return []
  }
}

export async function getTodaysConsultations(): Promise<DoctorConsultationData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const result = await db
      .select({
        id: consultations.id,
        patientId: consultations.patientId,
        scheduledAt: consultations.scheduledAt,
        duration: consultations.duration,
        consultationType: consultations.consultationType,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        patientNotes: consultations.patientNotes,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        consultationFee: consultations.consultationFee,
        paymentStatus: consultations.paymentStatus,
        meetingLink: consultations.meetingLink,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        doctorJoined: consultations.doctorJoined,
        patientJoined: consultations.patientJoined,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt,
        // Patient info
        patientId: patients.id,
        patientUserId: patients.userId,
        patientDateOfBirth: patients.dateOfBirth,
        patientGender: patients.gender,
        patientBloodType: patients.bloodType,
        // User info
        patientUserEmail: users.email,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientPhone: users.phone,
        patientProfileImage: users.profileImage
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        gte(consultations.scheduledAt, startOfDay),
        lte(consultations.scheduledAt, endOfDay)
      ))
      .orderBy(consultations.scheduledAt)

    // Map flattened results back to nested structure
    return result.map(item => ({
      id: item.id,
      patientId: item.patientId,
      scheduledAt: item.scheduledAt,
      duration: item.duration,
      consultationType: item.consultationType,
      status: item.status,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      doctorNotes: item.doctorNotes,
      patientNotes: item.patientNotes,
      prescriptionGiven: item.prescriptionGiven,
      followUpRequired: item.followUpRequired,
      followUpDate: item.followUpDate,
      consultationFee: item.consultationFee,
      paymentStatus: item.paymentStatus,
      meetingLink: item.meetingLink,
      videoRoomName: item.videoRoomName,
      meetingStatus: item.meetingStatus,
      doctorJoined: item.doctorJoined,
      patientJoined: item.patientJoined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: {
        id: item.patientId,
        userId: item.patientUserId,
        dateOfBirth: item.patientDateOfBirth,
        gender: item.patientGender,
        bloodType: item.patientBloodType,
        user: {
          id: item.patientUserId,
          email: item.patientUserEmail,
          firstName: item.patientFirstName,
          lastName: item.patientLastName,
          phone: item.patientPhone,
          profileImage: item.patientProfileImage
        }
      }
    })) as DoctorConsultationData[]
  } catch (error) {
    console.error("Error fetching today's consultations:", error)
    return []
  }
}

export async function getUpcomingConsultations(): Promise<DoctorConsultationData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const now = new Date()

    const result = await db
      .select({
        id: consultations.id,
        patientId: consultations.patientId,
        scheduledAt: consultations.scheduledAt,
        duration: consultations.duration,
        consultationType: consultations.consultationType,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        patientNotes: consultations.patientNotes,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        consultationFee: consultations.consultationFee,
        paymentStatus: consultations.paymentStatus,
        meetingLink: consultations.meetingLink,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        doctorJoined: consultations.doctorJoined,
        patientJoined: consultations.patientJoined,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt,
        // Patient info
        patientId: patients.id,
        patientUserId: patients.userId,
        patientDateOfBirth: patients.dateOfBirth,
        patientGender: patients.gender,
        patientBloodType: patients.bloodType,
        // User info
        patientUserEmail: users.email,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientPhone: users.phone,
        patientProfileImage: users.profileImage
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        gte(consultations.scheduledAt, now),
        eq(consultations.status, 'scheduled')
      ))
      .orderBy(consultations.scheduledAt)
      .limit(10)

    // Map flattened results back to nested structure
    return result.map(item => ({
      id: item.id,
      patientId: item.patientId,
      scheduledAt: item.scheduledAt,
      duration: item.duration,
      consultationType: item.consultationType,
      status: item.status,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      doctorNotes: item.doctorNotes,
      patientNotes: item.patientNotes,
      prescriptionGiven: item.prescriptionGiven,
      followUpRequired: item.followUpRequired,
      followUpDate: item.followUpDate,
      consultationFee: item.consultationFee,
      paymentStatus: item.paymentStatus,
      meetingLink: item.meetingLink,
      videoRoomName: item.videoRoomName,
      meetingStatus: item.meetingStatus,
      doctorJoined: item.doctorJoined,
      patientJoined: item.patientJoined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: {
        id: item.patientId,
        userId: item.patientUserId,
        dateOfBirth: item.patientDateOfBirth,
        gender: item.patientGender,
        bloodType: item.patientBloodType,
        user: {
          id: item.patientUserId,
          email: item.patientUserEmail,
          firstName: item.patientFirstName,
          lastName: item.patientLastName,
          phone: item.patientPhone,
          profileImage: item.patientProfileImage
        }
      }
    })) as DoctorConsultationData[]
  } catch (error) {
    console.error("Error fetching upcoming consultations:", error)
    return []
  }
}

export async function getPendingConsultations(): Promise<DoctorConsultationData[]> {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return []

    const result = await db
      .select({
        id: consultations.id,
        patientId: consultations.patientId,
        scheduledAt: consultations.scheduledAt,
        duration: consultations.duration,
        consultationType: consultations.consultationType,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        patientNotes: consultations.patientNotes,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        consultationFee: consultations.consultationFee,
        paymentStatus: consultations.paymentStatus,
        meetingLink: consultations.meetingLink,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        doctorJoined: consultations.doctorJoined,
        patientJoined: consultations.patientJoined,
        createdAt: consultations.createdAt,
        updatedAt: consultations.updatedAt,
        // Patient info
        patientId: patients.id,
        patientUserId: patients.userId,
        patientDateOfBirth: patients.dateOfBirth,
        patientGender: patients.gender,
        patientBloodType: patients.bloodType,
        // User info
        patientUserEmail: users.email,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
        patientPhone: users.phone,
        patientProfileImage: users.profileImage
      })
      .from(consultations)
      .innerJoin(patients, eq(consultations.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'scheduled')
      ))
      .orderBy(consultations.scheduledAt)

    // Map flattened results back to nested structure
    return result.map(item => ({
      id: item.id,
      patientId: item.patientId,
      scheduledAt: item.scheduledAt,
      duration: item.duration,
      consultationType: item.consultationType,
      status: item.status,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      doctorNotes: item.doctorNotes,
      patientNotes: item.patientNotes,
      prescriptionGiven: item.prescriptionGiven,
      followUpRequired: item.followUpRequired,
      followUpDate: item.followUpDate,
      consultationFee: item.consultationFee,
      paymentStatus: item.paymentStatus,
      meetingLink: item.meetingLink,
      videoRoomName: item.videoRoomName,
      meetingStatus: item.meetingStatus,
      doctorJoined: item.doctorJoined,
      patientJoined: item.patientJoined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: {
        id: item.patientId,
        userId: item.patientUserId,
        dateOfBirth: item.patientDateOfBirth,
        gender: item.patientGender,
        bloodType: item.patientBloodType,
        user: {
          id: item.patientUserId,
          email: item.patientUserEmail,
          firstName: item.patientFirstName,
          lastName: item.patientLastName,
          phone: item.patientPhone,
          profileImage: item.patientProfileImage
        }
      }
    })) as DoctorConsultationData[]
  } catch (error) {
    console.error("Error fetching pending consultations:", error)
    return []
  }
}

export async function getDoctorEarningsData() {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) return null

    // Get total earnings
    const totalEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${consultations.consultationFee} AS DECIMAL)), 0)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.paymentStatus, 'completed')
      ))

    // Get this month's earnings
    const thisMonth = new Date()
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const endOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0)

    const monthlyEarningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${consultations.consultationFee} AS DECIMAL)), 0)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.paymentStatus, 'completed'),
        gte(consultations.scheduledAt, startOfMonth),
        lte(consultations.scheduledAt, endOfMonth)
      ))

    // Get consultation count
    const consultationCountResult = await db
      .select({
        total: sql<number>`COUNT(*)`
      })
      .from(consultations)
      .where(and(
        eq(consultations.doctorId, doctorId),
        eq(consultations.status, 'completed')
      ))

    return {
      totalEarnings: totalEarningsResult[0]?.total || 0,
      monthlyEarnings: monthlyEarningsResult[0]?.total || 0,
      consultationCount: consultationCountResult[0]?.total || 0
    }
  } catch (error) {
    console.error("Error fetching doctor earnings data:", error)
    return null
  }
}

export async function updateConsultationNotes(consultationId: string, notes: string) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(consultations)
      .set({
        doctorNotes: notes,
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

export async function updateConsultationDiagnosis(consultationId: string, diagnosis: string) {
  try {
    const doctorId = await getCurrentDoctorId()
    if (!doctorId) throw new Error("Unauthorized")

    await db
      .update(consultations)
      .set({
        diagnosis: diagnosis,
        updatedAt: new Date()
      })
      .where(and(
        eq(consultations.id, consultationId),
        eq(consultations.doctorId, doctorId)
      ))

    return { success: true }
  } catch (error) {
    console.error("Error updating consultation diagnosis:", error)
    throw error
  }
}
