import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db, consultations } from "@/db"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { consultationId, userType, joined } = await req.json()

    if (!consultationId || !userType || typeof joined !== 'boolean') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate userType
    if (!['doctor', 'patient'].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Update the appropriate join status field
    const updateData: any = {}
    if (userType === 'doctor') {
      updateData.doctorJoined = joined
    } else {
      updateData.patientJoined = joined
    }

    const result = await db
      .update(consultations)
      .set(updateData)
      .where(eq(consultations.id, consultationId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      consultation: result[0] 
    })

  } catch (error) {
    console.error("Error updating user join status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}