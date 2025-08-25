import { config } from "dotenv"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Import all schemas
import { customers } from "./schema/customers"
import { users } from "./schema/users"
import { patients } from "./schema/patients"
import { doctors } from "./schema/doctors"
import { consultations } from "./schema/consultations"
import { prescriptions } from "./schema/prescriptions"
import { symptoms } from "./schema/symptoms"
import { reminders } from "./schema/reminders"
import { messages } from "./schema/messages"

config({ path: ".env.local" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

const dbSchema = {
  // tables
  customers,
  users,
  patients,
  doctors,
  consultations,
  prescriptions,
  symptoms,
  reminders,
  messages
  // relations can be added here later
}

function initializeDb(url: string) {
  const client = postgres(url, { prepare: false })
  return drizzlePostgres(client, { schema: dbSchema })
}

export const db = initializeDb(databaseUrl)

// Export schemas for use in other files
export * from "./schema/customers"
export * from "./schema/users"
export * from "./schema/patients"
export * from "./schema/doctors"
export * from "./schema/consultations"
export * from "./schema/prescriptions"
export * from "./schema/symptoms"
export * from "./schema/reminders"
export * from "./schema/messages"
