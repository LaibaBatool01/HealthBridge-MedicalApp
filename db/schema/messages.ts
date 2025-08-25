import { pgEnum, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core"
import { consultations } from "./consultations"
import { users } from "./users"

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "prescription",
  "system",
  "file_attachment",
  "image"
])

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered", 
  "read",
  "failed"
])

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id").references(() => consultations.id).notNull(),
  senderId: uuid("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").default("text"),
  status: messageStatusEnum("status").default("sent"),
  attachmentUrl: text("attachment_url"), // For file/image attachments
  attachmentName: text("attachment_name"),
  attachmentSize: text("attachment_size"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  replyToMessageId: uuid("reply_to_message_id").references(() => messages.id), // For reply functionality
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertMessage = typeof messages.$inferInsert
export type SelectMessage = typeof messages.$inferSelect