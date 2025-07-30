CREATE TYPE "public"."consultation_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."consultation_type" AS ENUM('video_call', 'chat_only', 'phone_call', 'in_person');--> statement-breakpoint
CREATE TYPE "public"."specialty" AS ENUM('general_practice', 'cardiology', 'dermatology', 'endocrinology', 'gastroenterology', 'neurology', 'oncology', 'pediatrics', 'psychiatry', 'orthopedics', 'ophthalmology', 'gynecology', 'urology', 'radiology', 'emergency_medicine', 'other');--> statement-breakpoint
CREATE TYPE "public"."blood_type" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."medication_frequency" AS ENUM('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('pending', 'sent_to_pharmacy', 'ready_for_pickup', 'delivered', 'completed');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('medication', 'appointment', 'follow_up', 'health_check', 'lab_test');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('mild', 'moderate', 'severe', 'critical');--> statement-breakpoint
CREATE TYPE "public"."symptom_category" AS ENUM('respiratory', 'cardiovascular', 'gastrointestinal', 'neurological', 'musculoskeletal', 'dermatological', 'psychological', 'genitourinary', 'endocrine', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('patient', 'doctor', 'admin');--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration" text DEFAULT '30',
	"consultation_type" "consultation_type" DEFAULT 'video_call',
	"status" "consultation_status" DEFAULT 'scheduled',
	"symptoms" text,
	"diagnosis" text,
	"doctor_notes" text,
	"patient_notes" text,
	"prescription_given" boolean DEFAULT false,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"consultation_fee" numeric(10, 2),
	"payment_status" text DEFAULT 'pending',
	"meeting_link" text,
	"recording_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"license_number" text NOT NULL,
	"specialty" "specialty" NOT NULL,
	"sub_specialty" text,
	"years_of_experience" integer,
	"education" text,
	"certifications" text,
	"hospital_affiliations" text,
	"bio" text,
	"consultation_fee" numeric(10, 2),
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_ratings" integer DEFAULT 0,
	"is_available" boolean DEFAULT true,
	"available_hours" text,
	"languages" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doctors_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date_of_birth" date,
	"gender" "gender",
	"blood_type" "blood_type" DEFAULT 'unknown',
	"height" integer,
	"weight" integer,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text DEFAULT 'US',
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"emergency_contact_relation" text,
	"allergies" text,
	"medical_history" text,
	"current_medications" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"medication_name" text NOT NULL,
	"generic_name" text,
	"dosage" text NOT NULL,
	"frequency" "medication_frequency" NOT NULL,
	"custom_frequency" text,
	"duration" integer NOT NULL,
	"quantity" integer NOT NULL,
	"instructions" text,
	"side_effects" text,
	"interactions" text,
	"refills_allowed" integer DEFAULT 0,
	"status" "prescription_status" DEFAULT 'pending',
	"pharmacy_name" text,
	"pharmacy_address" text,
	"pharmacy_phone" text,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"prescription_id" uuid,
	"reminder_type" "reminder_type" NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"reminder_time" time NOT NULL,
	"reminder_days" text,
	"is_recurring" boolean DEFAULT true,
	"status" "reminder_status" DEFAULT 'active',
	"last_sent_at" timestamp,
	"next_reminder_at" timestamp,
	"total_sent" integer DEFAULT 0,
	"dosage_taken" boolean DEFAULT false,
	"notes" text,
	"snooze_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"symptom_name" text NOT NULL,
	"category" "symptom_category" NOT NULL,
	"description" text NOT NULL,
	"severity" "severity" NOT NULL,
	"duration" text,
	"frequency" text,
	"triggers" text,
	"associated_symptoms" text,
	"body_part" text,
	"onset_date" timestamp,
	"resolved_date" timestamp,
	"medication_taken" text,
	"consultation_requested" boolean DEFAULT false,
	"urgency_level" integer DEFAULT 1,
	"images" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"user_type" "user_type" NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"profile_image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;