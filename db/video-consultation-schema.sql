-- Add video consultation support to existing consultations table
-- Run this in your Supabase SQL editor

-- Add new columns to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS video_room_name text,
ADD COLUMN IF NOT EXISTS meeting_status text DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS meeting_started_at timestamp,
ADD COLUMN IF NOT EXISTS meeting_ended_at timestamp,
ADD COLUMN IF NOT EXISTS doctor_joined boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS patient_joined boolean DEFAULT false;

-- Add index for faster room lookups
CREATE INDEX IF NOT EXISTS idx_consultations_video_room ON consultations(video_room_name);
CREATE INDEX IF NOT EXISTS idx_consultations_meeting_status ON consultations(meeting_status);

-- Create consultation_recordings table (optional - for future use)
CREATE TABLE IF NOT EXISTS consultation_recordings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid REFERENCES consultations(id) NOT NULL,
    recording_url text,
    recording_duration integer, -- in seconds
    created_at timestamp DEFAULT now() NOT NULL
);

-- Update dummy consultation with video room names
UPDATE consultations 
SET video_room_name = 'healthcare-' || id::text || '-' || extract(epoch from scheduled_at)::text
WHERE video_room_name IS NULL;