import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db, consultations, doctors, patients, users } from "@/db"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser()
    console.log("Clerk user authentication status:", clerkUser ? "Authenticated" : "Not authenticated")
    
    if (!clerkUser) {
      console.error("No authenticated user found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("Authenticated user ID:", clerkUser.id)

    const body = await req.json()
    const { doctorId, consultationType, symptoms, scheduledAt, duration, consultationFee } = body
    
    console.log("Consultation booking request:", { doctorId, consultationType })

    // Get current user from database
    const currentUserRecord = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (currentUserRecord.length === 0) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
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
        // Create patient profile if it doesn't exist (fallback)
        console.log("Patient profile not found, creating one...")
        const [newPatient] = await db
          .insert(patients)
          .values({
            userId: currentDbUser.id,
            country: "US" // default
          })
          .returning()
        
        patientRecord = newPatient
        console.log("Created patient profile:", patientRecord.id)
      } else {
        patientRecord = patientRecords[0]
      }
    } else {
      return NextResponse.json({ error: "Only patients can book consultations" }, { status: 403 })
    }

    // Verify doctor exists
    const doctorRecord = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1)

    if (doctorRecord.length === 0) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const doctor = doctorRecord[0]

    // Set default values
    const finalScheduledAt = scheduledAt ? new Date(scheduledAt) : new Date()
    const finalSymptoms = symptoms ? JSON.stringify(symptoms) : null
    const finalDuration = duration || "30"
    const finalConsultationFee = consultationFee || doctor.consultationFee || 75

    // Create consultation
    const [consultation] = await db
      .insert(consultations)
      .values({
        patientId: patientRecord.id,
        doctorId: doctorId,
        scheduledAt: finalScheduledAt,
        duration: finalDuration,
        consultationType: consultationType,
        status: "scheduled",
        symptoms: finalSymptoms,
        consultationFee: finalConsultationFee.toString(),
        paymentStatus: "pending",
        // Video-specific fields
        videoRoomName: `healthcare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meetingStatus: "scheduled",
        doctorJoined: false,
        patientJoined: false
      })
      .returning()

    console.log("Created consultation:", consultation.id)

    return NextResponse.json({
      success: true,
      consultation: {
        id: consultation.id,
        scheduledAt: consultation.scheduledAt,
        consultationType: consultation.consultationType,
        status: consultation.status,
        videoRoomName: consultation.videoRoomName,
        meetingStatus: consultation.meetingStatus
      }
    })

  } catch (error) {
    console.error("Error creating consultation:", error)
    return NextResponse.json(
      { error: "Failed to create consultation" },
      { status: 500 }
    )
  }
}