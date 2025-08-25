-- Add verification status enum
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add verification columns to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id); 