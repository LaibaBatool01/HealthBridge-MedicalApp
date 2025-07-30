-- Medical Platform Database Setup (Safe version)
-- This script handles existing types and tables gracefully

-- Create user types enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create gender enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE gender AS ENUM('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create blood_type enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE blood_type AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create specialty enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE specialty AS ENUM(
        'general_practice', 'cardiology', 'dermatology', 'endocrinology',
        'gastroenterology', 'neurology', 'oncology', 'pediatrics',
        'psychiatry', 'orthopedics', 'ophthalmology', 'gynecology',
        'urology', 'radiology', 'emergency_medicine', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create consultation enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_type AS ENUM('video_call', 'chat_only', 'phone_call', 'in_person');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create prescription enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE prescription_status AS ENUM('pending', 'sent_to_pharmacy', 'ready_for_pickup', 'delivered', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE medication_frequency AS ENUM('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create symptom enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE severity AS ENUM('mild', 'moderate', 'severe', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE symptom_category AS ENUM(
        'respiratory', 'cardiovascular', 'gastrointestinal', 'neurological',
        'musculoskeletal', 'dermatological', 'psychological', 'genitourinary',
        'endocrine', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create reminder enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM('medication', 'appointment', 'follow_up', 'health_check', 'lab_test');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status AS ENUM('active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id text UNIQUE NOT NULL,
    user_type user_type NOT NULL,
    email text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    profile_image text,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create patients table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) NOT NULL,
    date_of_birth date,
    gender gender,
    blood_type blood_type DEFAULT 'unknown',
    height integer, -- in cm
    weight integer, -- in kg
    address text,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'US',
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relation text,
    allergies text, -- JSON string
    medical_history text, -- JSON string
    current_medications text, -- JSON string
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create doctors table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) NOT NULL,
    license_number text UNIQUE NOT NULL,
    specialty specialty NOT NULL,
    sub_specialty text,
    years_of_experience integer,
    education text, -- JSON string
    certifications text, -- JSON string
    hospital_affiliations text, -- JSON string
    bio text,
    consultation_fee numeric(10, 2),
    rating numeric(3, 2) DEFAULT 0.00,
    total_ratings integer DEFAULT 0,
    is_available boolean DEFAULT true,
    available_hours text, -- JSON string
    languages text, -- JSON string
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create consultations table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS consultations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) NOT NULL,
    doctor_id uuid REFERENCES doctors(id) NOT NULL,
    scheduled_at timestamp NOT NULL,
    duration text DEFAULT '30', -- in minutes
    consultation_type consultation_type DEFAULT 'video_call',
    status consultation_status DEFAULT 'scheduled',
    symptoms text, -- JSON string
    diagnosis text,
    doctor_notes text,
    patient_notes text,
    prescription_given boolean DEFAULT false,
    follow_up_required boolean DEFAULT false,
    follow_up_date timestamp,
    consultation_fee numeric(10, 2),
    payment_status text DEFAULT 'pending',
    meeting_link text,
    recording_url text,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create prescriptions table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS prescriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id uuid REFERENCES consultations(id),
    patient_id uuid REFERENCES patients(id) NOT NULL,
    doctor_id uuid REFERENCES doctors(id) NOT NULL,
    medication_name text NOT NULL,
    generic_name text,
    dosage text NOT NULL,
    frequency medication_frequency NOT NULL,
    custom_frequency text,
    duration integer NOT NULL, -- in days
    quantity integer NOT NULL,
    instructions text,
    side_effects text,
    interactions text,
    refills_allowed integer DEFAULT 0,
    status prescription_status DEFAULT 'pending',
    pharmacy_name text,
    pharmacy_address text,
    pharmacy_phone text,
    start_date timestamp DEFAULT now(),
    end_date timestamp,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create symptoms table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS symptoms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) NOT NULL,
    symptom_name text NOT NULL,
    category symptom_category NOT NULL,
    description text NOT NULL,
    severity severity NOT NULL,
    duration text, -- e.g., "2 days", "1 week"
    frequency text, -- e.g., "constant", "intermittent"
    triggers text,
    associated_symptoms text, -- JSON array
    body_part text,
    onset_date timestamp,
    resolved_date timestamp,
    medication_taken text,
    consultation_requested boolean DEFAULT false,
    urgency_level integer DEFAULT 1, -- 1-5 scale
    images text, -- JSON array of URLs
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create reminders table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) NOT NULL,
    prescription_id uuid REFERENCES prescriptions(id),
    reminder_type reminder_type NOT NULL,
    title text NOT NULL,
    message text,
    reminder_time time NOT NULL,
    reminder_days text, -- JSON array
    is_recurring boolean DEFAULT true,
    status reminder_status DEFAULT 'active',
    last_sent_at timestamp,
    next_reminder_at timestamp,
    total_sent integer DEFAULT 0,
    dosage_taken boolean DEFAULT false,
    notes text,
    snooze_until timestamp,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL
);

-- Create indexes (only if they don't exist)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
    CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_symptoms_patient_id ON symptoms(patient_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_patient_id ON reminders(patient_id);
END $$; 