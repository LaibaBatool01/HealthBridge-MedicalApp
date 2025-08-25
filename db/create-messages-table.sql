-- Create messages table for chat consultations
-- Run this in your Supabase SQL editor

-- Create message type enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM('text', 'prescription', 'system', 'file_attachment', 'image');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create message status enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM('sent', 'delivered', 'read', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create messages table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid REFERENCES consultations(id) NOT NULL,
    sender_id uuid REFERENCES users(id) NOT NULL,
    content text NOT NULL,
    message_type message_type DEFAULT 'text',
    status message_status DEFAULT 'sent',
    attachment_url text,
    attachment_name text,
    attachment_size text,
    is_edited boolean DEFAULT false,
    edited_at timestamp,
    reply_to_message_id uuid REFERENCES messages(id),
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_consultation_id ON messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
-- Users can only see messages from consultations they're part of
CREATE POLICY "Users can view messages from their consultations" ON messages
    FOR SELECT USING (
        consultation_id IN (
            SELECT c.id FROM consultations c
            LEFT JOIN patients p ON c.patient_id = p.id
            LEFT JOIN doctors d ON c.doctor_id = d.id
            LEFT JOIN users u ON (p.user_id = u.id OR d.user_id = u.id)
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Users can insert messages only in their consultations
CREATE POLICY "Users can send messages in their consultations" ON messages
    FOR INSERT WITH CHECK (
        consultation_id IN (
            SELECT c.id FROM consultations c
            LEFT JOIN patients p ON c.patient_id = p.id
            LEFT JOIN doctors d ON c.doctor_id = d.id
            LEFT JOIN users u ON (p.user_id = u.id OR d.user_id = u.id)
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
        )
        AND sender_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Users can update only their own messages
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (
        sender_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Enable real-time subscriptions for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;