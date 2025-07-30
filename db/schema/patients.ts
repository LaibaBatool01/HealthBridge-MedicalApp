import { pgEnum, pgTable, text, timestamp, uuid, date, integer } from "drizzle-orm/pg-core"
import { users } from "./users"

export const genderEnum = pgEnum("gender", ["male", "female", "other", "prefer_not_to_say"])
export const bloodTypeEnum = pgEnum("blood_type", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"])

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  bloodType: bloodTypeEnum("blood_type").default("unknown"),
  height: integer("height"), // in cm
  weight: integer("weight"), // in kg
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country").default("US"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  allergies: text("allergies"), // JSON string of allergies
  medicalHistory: text("medical_history"), // JSON string of medical history
  currentMedications: text("current_medications"), // JSON string of current medications
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertPatient = typeof patients.$inferInsert
export type SelectPatient = typeof patients.$inferSelect 