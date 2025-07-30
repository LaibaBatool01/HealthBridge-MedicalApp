import { db, prescriptions, users, patients } from "@/db"
import { eq } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const prescriptionData = await req.json()

    // Get the doctor user from our database
    const [doctor] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1)

    if (!doctor || doctor.userType !== "doctor") {
      return NextResponse.json({ error: "Doctor user not found" }, { status: 404 })
    }

    // For now, we'll save each medication as a separate prescription record
    // In a real system, you might have a prescriptions table with a medications array
    const savedPrescriptions = []

    for (const medication of prescriptionData.medications) {
      // Convert frequency to enum value
      const frequencyMap: { [key: string]: string } = {
        "Once daily (QD)": "once_daily",
        "Twice daily (BID)": "twice_daily", 
        "Three times daily (TID)": "three_times_daily",
        "Four times daily (QID)": "four_times_daily",
        "As needed (PRN)": "as_needed"
      }
      
      // Convert duration string to days
      const durationMap: { [key: string]: number } = {
        "3 days": 3,
        "5 days": 5,
        "7 days": 7,
        "10 days": 10,
        "14 days": 14,
        "21 days": 21,
        "30 days": 30,
        "60 days": 60,
        "90 days": 90
      }

      const [prescription] = await db
        .insert(prescriptions)
        .values({
          patientId: prescriptionData.patientId, // This should be a UUID from patients table
          doctorId: doctor.id,
          consultationId: null, // Could link to consultation if available
          medicationName: medication.name,
          dosage: medication.dosage,
          frequency: (frequencyMap[medication.frequency] || "custom") as any,
          customFrequency: frequencyMap[medication.frequency] ? null : medication.frequency,
          duration: durationMap[medication.duration] || 30,
          quantity: medication.quantity || 30,
          instructions: medication.instructions || null,
          sideEffects: medication.warnings || null,
          status: "pending",
          startDate: new Date(),
          isActive: true
        })
        .returning()

      savedPrescriptions.push(prescription)
    }

    console.log("Prescription created by doctor:", doctor.id)
    console.log("For patient:", prescriptionData.patientId)
    console.log("Medications:", prescriptionData.medications.length)
    console.log("Diagnosis:", prescriptionData.diagnosis)

    return NextResponse.json({ 
      success: true, 
      message: "Prescription created successfully",
      prescriptionCount: savedPrescriptions.length
    })

  } catch (error) {
    console.error("Error creating prescription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 