"use server"

import { db, consultations, doctors, patients, users } from "@/db"
import { eq, and } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"

export interface CreateConsultationData {
  doctorId: string
  consultationType: 'video_call' | 'chat_only' | 'phone_call' | 'in_person'
  symptoms?: string[]
  scheduledAt?: Date
  duration?: string
  consultationFee?: number
}

export async function createConsultation(data: CreateConsultationData) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Not authenticated")
    }

    // Get current user from database
    const currentUserRecord = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (currentUserRecord.length === 0) {
      throw new Error("User not found in database")
    }

    const currentDbUser = currentUserRecord[0]

    // Get patient record (assuming current user is a patient for consultation booking)
    let patientRecord
    if (currentDbUser.userType === 'patient') {
      const patientRecords = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, currentDbUser.id))
        .limit(1)

      if (patientRecords.length === 0) {
        throw new Error("Patient profile not found")
      }
      patientRecord = patientRecords[0]
    } else {
      throw new Error("Only patients can book consultations")
    }

    // Verify doctor exists
    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, data.doctorId))
      .limit(1)

    if (doctorRecord.length === 0) {
      throw new Error("Doctor not found")
    }

    const doctor = doctorRecord[0]

    // Set default values
    const scheduledAt = data.scheduledAt || new Date()
    const symptoms = data.symptoms ? JSON.stringify(data.symptoms) : null
    const duration = data.duration || "30"
    const consultationFee = data.consultationFee || doctor.consultationFee || 75

    // Create consultation
    const [consultation] = await db
      .insert(consultations)
      .values({
        patientId: patientRecord.id,
        doctorId: data.doctorId,
        scheduledAt,
        duration,
        consultationType: data.consultationType,
        status: "scheduled",
        symptoms,
        consultationFee: consultationFee.toString(),
        paymentStatus: "pending",
        // Video-specific fields
        videoRoomName: `healthcare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetingStatus: "scheduled",
        doctorJoined: false,
        patientJoined: false
      })
      .returning()

    console.log("Created consultation:", consultation.id)

    return {
      success: true,
      consultation: {
        id: consultation.id,
        scheduledAt: consultation.scheduledAt,
        consultationType: consultation.consultationType,
        status: consultation.status,
        videoRoomName: consultation.videoRoomName,
        meetingStatus: consultation.meetingStatus
      }
    }

  } catch (error) {
    console.error("Error creating consultation:", error)
    throw error
  }
}

export async function createInstantConsultation(doctorId: string, type: 'video_call' | 'chat_only') {
  try {
    const consultation = await createConsultation({
      doctorId,
      consultationType: type,
      scheduledAt: new Date(), // Immediate
      duration: "30"
    })

    return consultation
  } catch (error) {
    console.error("Error creating instant consultation:", error)
    throw error
  }
}