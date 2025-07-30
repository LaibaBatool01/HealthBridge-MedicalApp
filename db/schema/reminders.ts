import { pgEnum, pgTable, text, timestamp, uuid, boolean, time, integer } from "drizzle-orm/pg-core"
import { prescriptions } from "./prescriptions"
import { patients } from "./patients"

export const reminderTypeEnum = pgEnum("reminder_type", [
  "medication",
  "appointment", 
  "follow_up",
  "health_check",
  "lab_test"
])

export const reminderStatusEnum = pgEnum("reminder_status", [
  "active",
  "paused",
  "completed",
  "cancelled"
])

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id),
  reminderType: reminderTypeEnum("reminder_type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  reminderTime: time("reminder_time").notNull(), // time of day for reminder
  reminderDays: text("reminder_days"), // JSON array of days ["monday", "tuesday", etc]
  isRecurring: boolean("is_recurring").default(true),
  status: reminderStatusEnum("status").default("active"),
  lastSentAt: timestamp("last_sent_at"),
  nextReminderAt: timestamp("next_reminder_at"),
  totalSent: integer("total_sent").default(0),
  dosageTaken: boolean("dosage_taken").default(false),
  notes: text("notes"),
  snoozeUntil: timestamp("snooze_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertReminder = typeof reminders.$inferInsert
export type SelectReminder = typeof reminders.$inferSelect 