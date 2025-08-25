CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'prescription', 'system', 'file_attachment', 'image');--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text',
	"status" "message_status" DEFAULT 'sent',
	"attachment_url" text,
	"attachment_name" text,
	"attachment_size" text,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"reply_to_message_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "video_room_name" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "meeting_status" text DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "meeting_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "meeting_ended_at" timestamp;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "doctor_joined" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "patient_joined" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_messages_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;