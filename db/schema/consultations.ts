import { pgEnum, pgTable, text, timestamp, uuid, decimal, boolean } from "drizzle-orm/pg-core"
import { patients } from "./patients"
import { doctors } from "./doctors"

export const consultationStatusEnum = pgEnum("consultation_status", [
  "scheduled", 
  "in_progress", 
  "completed", 
  "cancelled",
  "no_show"
])

export const consultationTypeEnum = pgEnum("consultation_type", [
  "video_call",
  "chat_only", 
  "phone_call",
  "in_person"
])

export const consultations = pgTable("consultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: text("duration").default("30"), // in minutes
  consultationType: consultationTypeEnum("consultation_type").default("video_call"),
  status: consultationStatusEnum("status").default("scheduled"),
  symptoms: text("symptoms"), // JSON string of reported symptoms
  diagnosis: text("diagnosis"),
  doctorNotes: text("doctor_notes"),
  patientNotes: text("patient_notes"),
  prescriptionGiven: boolean("prescription_given").default(false),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed
  meetingLink: text("meeting_link"),
  recordingUrl: text("recording_url"),
  // Video consultation fields
  videoRoomName: text("video_room_name"),
  meetingStatus: text("meeting_status").default("scheduled"), // scheduled, in_progress, completed
  meetingStartedAt: timestamp("meeting_started_at"),
  meetingEndedAt: timestamp("meeting_ended_at"),
  doctorJoined: boolean("doctor_joined").default(false),
  patientJoined: boolean("patient_joined").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertConsultation = typeof consultations.$inferInsert
export type SelectConsultation = typeof consultations.$inferSelect 