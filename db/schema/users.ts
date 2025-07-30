import { pgEnum, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core"

export const userTypeEnum = pgEnum("user_type", ["patient", "doctor", "admin"])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  userType: userTypeEnum("user_type").notNull(),
  email: text("email").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertUser = typeof users.$inferInsert
export type SelectUser = typeof users.$inferSelect 