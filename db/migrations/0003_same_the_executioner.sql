CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "verification_status" "verification_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "admin_feedback" text;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "verified_by" uuid;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;