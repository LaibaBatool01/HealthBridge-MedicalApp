import { pgEnum, pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core"
import { patients } from "./patients"

export const severityEnum = pgEnum("severity", ["mild", "moderate", "severe", "critical"])

export const symptomCategoryEnum = pgEnum("symptom_category", [
  "respiratory",
  "cardiovascular", 
  "gastrointestinal",
  "neurological",
  "musculoskeletal",
  "dermatological",
  "psychological",
  "genitourinary",
  "endocrine",
  "other"
])

export const symptoms = pgTable("symptoms", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  symptomName: text("symptom_name").notNull(),
  category: symptomCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  severity: severityEnum("severity").notNull(),
  duration: text("duration"), // e.g., "2 days", "1 week"
  frequency: text("frequency"), // e.g., "constant", "intermittent"
  triggers: text("triggers"), // what makes it worse/better
  associatedSymptoms: text("associated_symptoms"), // JSON array of related symptoms
  bodyPart: text("body_part"), // affected body part/area
  onsetDate: timestamp("onset_date"),
  resolvedDate: timestamp("resolved_date"),
  medicationTaken: text("medication_taken"), // any self-medication
  consultationRequested: boolean("consultation_requested").default(false),
  urgencyLevel: integer("urgency_level").default(1), // 1-5 scale
  images: text("images"), // JSON array of image URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertSymptom = typeof symptoms.$inferInsert
export type SelectSymptom = typeof symptoms.$inferSelect 