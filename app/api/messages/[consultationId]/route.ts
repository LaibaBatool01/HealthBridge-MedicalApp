import { NextRequest, NextResponse } from "next/server"
import { getMessagesForConsultation } from "@/actions/messages"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ consultationId: string }> }
) {
  try {
    const { consultationId } = await params

    if (!consultationId) {
      return NextResponse.json(
        { error: "Consultation ID is required" },
        { status: 400 }
      )
    }

    const messages = await getMessagesForConsultation(consultationId)

    return NextResponse.json({
      success: true,
      messages
    })

  } catch (error) {
    console.error("Error fetching messages:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("Not authenticated")) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        )
      }
      if (error.message.includes("Not authorized")) {
        return NextResponse.json(
          { error: "Not authorized" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}