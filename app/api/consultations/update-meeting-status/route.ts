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

    const { consultationId, status, timestamp } = await req.json()

    if (!consultationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update consultation meeting status
    const updateData: any = {
      meetingStatus: status
    }

    // Add timestamps based on status
    if (status === 'in_progress') {
      updateData.meetingStartedAt = new Date(timestamp)
    } else if (status === 'completed') {
      updateData.meetingEndedAt = new Date(timestamp)
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
    console.error("Error updating meeting status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}