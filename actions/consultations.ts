"use server"

import { db, consultations, users, patients, doctors } from "@/db"
import { eq, and, desc, gte, lte } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"
import { getCurrentMedicalUser } from "./users"

export async function getConsultationById(consultationId: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Not authenticated")
    }

    // Get consultation with doctor and patient info
    const result = await db
      .select({
        // Consultation data
        id: consultations.id,
        scheduledAt: consultations.scheduledAt,
        status: consultations.status,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        consultationFee: consultations.consultationFee,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        meetingStartedAt: consultations.meetingStartedAt,
        meetingEndedAt: consultations.meetingEndedAt,
        doctorJoined: consultations.doctorJoined,
        patientJoined: consultations.patientJoined,
        
        // Doctor info
        doctorUserId: doctors.userId,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        
        // Patient info (we'll get this in a separate query due to join complexity)
        patientId: consultations.patientId,
        doctorId: consultations.doctorId
      })
      .from(consultations)
      .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(consultations.id, consultationId))
      .limit(1)

    if (result.length === 0) {
      throw new Error("Consultation not found")
    }

    const consultation = result[0]

    // Get patient info separately
    const patientInfo = await db
      .select({
        patientUserId: patients.userId,
        patientFirstName: users.firstName,
        patientLastName: users.lastName
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, consultation.patientId))
      .limit(1)

    const patient = patientInfo[0]

    // Verify user has access to this consultation
    const currentUserFromDb = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (currentUserFromDb.length === 0) {
      throw new Error("User not found")
    }

    const currentDbUser = currentUserFromDb[0]
    
    // Check if user is authorized to access this consultation
    const isAuthorized = 
      (currentDbUser.userType === 'doctor' && consultation.doctorUserId === currentDbUser.id) ||
      (currentDbUser.userType === 'patient' && patient?.patientUserId === currentDbUser.id)

    if (!isAuthorized) {
      throw new Error("Not authorized to access this consultation")
    }

    // Return consultation data with all needed info
    return {
      id: consultation.id,
      doctor_id: consultation.doctorId,
      patient_id: consultation.patientId,
      consultation_type: 'chat_only', // We can get this from the actual consultation data later
      scheduled_at: consultation.scheduledAt,
      status: consultation.status,
      symptoms: consultation.symptoms,
      diagnosis: consultation.diagnosis,
      doctor_notes: consultation.doctorNotes,
      consultation_fee: consultation.consultationFee,
      video_room_name: consultation.videoRoomName,
      meeting_status: consultation.meetingStatus || 'scheduled',
      meeting_started_at: consultation.meetingStartedAt,
      meeting_ended_at: consultation.meetingEndedAt,
      doctor_joined: consultation.doctorJoined || false,
      patient_joined: consultation.patientJoined || false,
      doctorFirstName: consultation.doctorFirstName,
      doctorLastName: consultation.doctorLastName,
      patientFirstName: patient?.patientFirstName,
      patientLastName: patient?.patientLastName,
      currentUser: {
        id: currentDbUser.id,
        userType: currentDbUser.userType as 'doctor' | 'patient',
        firstName: currentDbUser.firstName,
        lastName: currentDbUser.lastName
      }
    }

  } catch (error) {
    console.error("Error fetching consultation:", error)
    throw error
  }
}

export async function generateVideoRoomName(consultationId: string) {
  try {
    const timestamp = Date.now()
    const roomName = `healthcare-${consultationId}-${timestamp}`
    
    // Update consultation with room name
    await db
      .update(consultations)
      .set({ videoRoomName: roomName })
      .where(eq(consultations.id, consultationId))

    return roomName
  } catch (error) {
    console.error("Error generating video room name:", error)
    throw error
  }
}

// Patient-specific consultation functions
export async function getPatientConsultations() {
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

    // Get all consultations for this patient with doctor info
    const consultationsList = await db
      .select({
        id: consultations.id,
        scheduledAt: consultations.scheduledAt,
        status: consultations.status,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        consultationFee: consultations.consultationFee,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        createdAt: consultations.createdAt,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty,
        doctorRating: doctors.rating,
        doctorProfileImage: users.profileImage
      })
      .from(consultations)
      .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.scheduledAt))

    return consultationsList
  } catch (error) {
    console.error("Error fetching patient consultations:", error)
    throw error
  }
}

export async function getUpcomingConsultations() {
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

    // Get upcoming consultations
    const upcomingList = await db
      .select({
        id: consultations.id,
        scheduledAt: consultations.scheduledAt,
        status: consultations.status,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        consultationFee: consultations.consultationFee,
        videoRoomName: consultations.videoRoomName,
        meetingStatus: consultations.meetingStatus,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty,
        doctorRating: doctors.rating,
        doctorProfileImage: users.profileImage
      })
      .from(consultations)
      .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(consultations.patientId, patientId),
        gte(consultations.scheduledAt, new Date())
      ))
      .orderBy(consultations.scheduledAt)

    return upcomingList
  } catch (error) {
    console.error("Error fetching upcoming consultations:", error)
    throw error
  }
}

export async function getPastConsultations() {
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

    // Get past consultations
    const pastList = await db
      .select({
        id: consultations.id,
        scheduledAt: consultations.scheduledAt,
        status: consultations.status,
        consultationType: consultations.consultationType,
        symptoms: consultations.symptoms,
        diagnosis: consultations.diagnosis,
        doctorNotes: consultations.doctorNotes,
        consultationFee: consultations.consultationFee,
        prescriptionGiven: consultations.prescriptionGiven,
        followUpRequired: consultations.followUpRequired,
        followUpDate: consultations.followUpDate,
        // Doctor info
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        doctorSpecialty: doctors.specialty,
        doctorRating: doctors.rating,
        doctorProfileImage: users.profileImage
      })
      .from(consultations)
      .leftJoin(doctors, eq(consultations.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(and(
        eq(consultations.patientId, patientId),
        lte(consultations.scheduledAt, new Date()),
        eq(consultations.status, 'completed')
      ))
      .orderBy(desc(consultations.scheduledAt))

    return pastList
  } catch (error) {
    console.error("Error fetching past consultations:", error)
    throw error
  }
}