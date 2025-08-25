"use server"

import { db, messages, consultations, users, patients, doctors } from "@/db"
import { eq, and, desc } from "drizzle-orm"
import { currentUser } from "@clerk/nextjs/server"

export interface MessageData {
  id: string
  consultationId: string
  senderId: string
  senderName: string
  senderType: 'patient' | 'doctor'
  content: string
  messageType: 'text' | 'prescription' | 'system' | 'file_attachment' | 'image'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  attachmentUrl?: string
  attachmentName?: string
  isEdited: boolean
  editedAt?: Date
  replyToMessageId?: string
  createdAt: Date
  updatedAt: Date
}

export async function getMessagesForConsultation(consultationId: string): Promise<MessageData[]> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Not authenticated")
    }

    // Verify user has access to this consultation
    const hasAccess = await verifyConsultationAccess(consultationId, clerkUser.id)
    if (!hasAccess) {
      throw new Error("Not authorized to access this consultation")
    }

    // Get messages with sender information
    const result = await db
      .select({
        id: messages.id,
        consultationId: messages.consultationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        status: messages.status,
        attachmentUrl: messages.attachmentUrl,
        attachmentName: messages.attachmentName,
        isEdited: messages.isEdited,
        editedAt: messages.editedAt,
        replyToMessageId: messages.replyToMessageId,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderUserType: users.userType
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.consultationId, consultationId))
      .orderBy(messages.createdAt)

    return result.map(msg => ({
      id: msg.id,
      consultationId: msg.consultationId,
      senderId: msg.senderId,
      senderName: `${msg.senderFirstName} ${msg.senderLastName}`,
      senderType: msg.senderUserType as 'patient' | 'doctor',
      content: msg.content,
      messageType: msg.messageType as 'text' | 'prescription' | 'system' | 'file_attachment' | 'image',
      status: msg.status as 'sent' | 'delivered' | 'read' | 'failed',
      attachmentUrl: msg.attachmentUrl || undefined,
      attachmentName: msg.attachmentName || undefined,
      isEdited: msg.isEdited || false,
      editedAt: msg.editedAt || undefined,
      replyToMessageId: msg.replyToMessageId || undefined,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }))

  } catch (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
}

export async function sendMessage(
  consultationId: string,
  content: string,
  messageType: 'text' | 'prescription' | 'system' = 'text',
  attachmentUrl?: string,
  attachmentName?: string,
  replyToMessageId?: string
) {
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

    // Verify user has access to this consultation
    const hasAccess = await verifyConsultationAccess(consultationId, clerkUser.id)
    if (!hasAccess) {
      throw new Error("Not authorized to send messages in this consultation")
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        consultationId,
        senderId: currentDbUser.id,
        content,
        messageType,
        status: 'sent',
        attachmentUrl,
        attachmentName,
        replyToMessageId
      })
      .returning()

    return {
      success: true,
      message: {
        id: newMessage.id,
        consultationId: newMessage.consultationId,
        senderId: newMessage.senderId,
        senderName: `${currentDbUser.firstName} ${currentDbUser.lastName}`,
        senderType: currentDbUser.userType as 'patient' | 'doctor',
        content: newMessage.content,
        messageType: newMessage.messageType as 'text' | 'prescription' | 'system',
        status: newMessage.status as 'sent',
        attachmentUrl: newMessage.attachmentUrl || undefined,
        attachmentName: newMessage.attachmentName || undefined,
        isEdited: newMessage.isEdited || false,
        replyToMessageId: newMessage.replyToMessageId || undefined,
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt
      }
    }

  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Not authenticated")
    }

    await db
      .update(messages)
      .set({ 
        status: 'read',
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId))

    return { success: true }

  } catch (error) {
    console.error("Error marking message as read:", error)
    throw error
  }
}

async function verifyConsultationAccess(consultationId: string, clerkUserId: string): Promise<boolean> {
  try {
    const consultation = await db
      .select({
        id: consultations.id,
        patientId: consultations.patientId,
        doctorId: consultations.doctorId
      })
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1)

    if (consultation.length === 0) {
      return false
    }

    const consultationData = consultation[0]

    // Check if user is the patient or doctor in this consultation
    const userAccess = await db
      .select({
        userId: users.id,
        userType: users.userType
      })
      .from(users)
      .leftJoin(patients, eq(users.id, patients.userId))
      .leftJoin(doctors, eq(users.id, doctors.userId))
      .where(
        and(
          eq(users.clerkUserId, clerkUserId),
          // User is either the patient or doctor in this consultation
          // This is a simplified check - in a real app you'd want more robust checking
          eq(users.id, users.id) // Placeholder - will be replaced with proper logic
        )
      )
      .limit(1)

    // More specific check: get user and verify they're part of this consultation
    const currentUserRecord = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1)

    if (currentUserRecord.length === 0) {
      return false
    }

    const user = currentUserRecord[0]

    if (user.userType === 'patient') {
      // Check if user is the patient in this consultation
      const patientRecord = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, user.id))
        .limit(1)

      return patientRecord.length > 0 && patientRecord[0].id === consultationData.patientId
    } else if (user.userType === 'doctor') {
      // Check if user is the doctor in this consultation
      const doctorRecord = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, user.id))
        .limit(1)

      return doctorRecord.length > 0 && doctorRecord[0].id === consultationData.doctorId
    }

    return false

  } catch (error) {
    console.error("Error verifying consultation access:", error)
    return false
  }
}