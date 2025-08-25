import { NextRequest, NextResponse } from "next/server"
import { sendMessage } from "@/actions/messages"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      consultationId, 
      content, 
      messageType = 'text',
      attachmentUrl,
      attachmentName,
      replyToMessageId 
    } = body

    if (!consultationId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await sendMessage(
      consultationId,
      content,
      messageType,
      attachmentUrl,
      attachmentName,
      replyToMessageId
    )

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error sending message:", error)
    
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
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}