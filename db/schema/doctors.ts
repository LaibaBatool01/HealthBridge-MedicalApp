import { pgEnum, pgTable, text, timestamp, uuid, integer, boolean, decimal } from "drizzle-orm/pg-core"
import { users } from "./users"

export const specialtyEnum = pgEnum("specialty", [
  "general_practice", 
  "cardiology", 
  "dermatology", 
  "endocrinology",
  "gastroenterology",
  "neurology",
  "oncology",
  "pediatrics",
  "psychiatry",
  "orthopedics",
  "ophthalmology",
  "gynecology",
  "urology",
  "radiology",
  "emergency_medicine",
  "other"
])

export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  licenseNumber: text("license_number").unique().notNull(),
  specialty: specialtyEnum("specialty").notNull(),
  subSpecialty: text("sub_specialty"),
  yearsOfExperience: integer("years_of_experience"),
  education: text("education"), // JSON string of education details
  certifications: text("certifications"), // JSON string of certifications
  hospitalAffiliations: text("hospital_affiliations"), // JSON string
  bio: text("bio"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: integer("total_ratings").default(0),
  isAvailable: boolean("is_available").default(true),
  availableHours: text("available_hours"), // JSON string of availability schedule
  languages: text("languages"), // JSON string of languages spoken
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertDoctor = typeof doctors.$inferInsert
export type SelectDoctor = typeof doctors.$inferSelect 