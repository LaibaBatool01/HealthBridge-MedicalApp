import { pgEnum, pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core"
import { consultations } from "./consultations"
import { patients } from "./patients"
import { doctors } from "./doctors"

export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "pending",
  "sent_to_pharmacy", 
  "ready_for_pickup",
  "delivered",
  "completed"
])

export const medicationFrequencyEnum = pgEnum("medication_frequency", [
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "four_times_daily",
  "as_needed",
  "weekly",
  "custom"
])

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id").references(() => consultations.id),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  medicationName: text("medication_name").notNull(),
  genericName: text("generic_name"),
  dosage: text("dosage").notNull(), // e.g., "10mg", "2 tablets"
  frequency: medicationFrequencyEnum("frequency").notNull(),
  customFrequency: text("custom_frequency"), // for custom frequency
  duration: integer("duration").notNull(), // in days
  quantity: integer("quantity").notNull(), // total quantity prescribed
  instructions: text("instructions"), // special instructions
  sideEffects: text("side_effects"), // potential side effects
  interactions: text("interactions"), // drug interactions to watch for
  refillsAllowed: integer("refills_allowed").default(0),
  status: prescriptionStatusEnum("status").default("pending"),
  pharmacyName: text("pharmacy_name"),
  pharmacyAddress: text("pharmacy_address"),
  pharmacyPhone: text("pharmacy_phone"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertPrescription = typeof prescriptions.$inferInsert
export type SelectPrescription = typeof prescriptions.$inferSelect 