-- Create consultation between laiba_temp (patient) and chatgpt user (doctor)
-- Run this in your Supabase SQL Editor

-- First, let's check if the users exist and get their info
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.user_type,
    CASE 
        WHEN u.user_type = 'patient' THEN p.id
        WHEN u.user_type = 'doctor' THEN d.id
        ELSE NULL
    END as profile_id
FROM users u
LEFT JOIN patients p ON u.id = p.user_id
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.email IN ('laibatemp@gmail.com', 'chatgptrwp@gmail.com')
ORDER BY u.user_type DESC; -- doctors first, then patients

-- Create the consultation (modify the IDs based on the query above)
-- You'll need to replace 'PATIENT_ID_HERE' and 'DOCTOR_ID_HERE' with actual IDs from the query above

WITH patient_info AS (
    SELECT p.id as patient_id
    FROM users u
    JOIN patients p ON u.id = p.user_id
    WHERE u.email = 'laibatemp@gmail.com'
    LIMIT 1
),
doctor_info AS (
    SELECT d.id as doctor_id
    FROM users u
    JOIN doctors d ON u.id = d.user_id
    WHERE u.email = 'chatgptrwp@gmail.com'
    LIMIT 1
)
INSERT INTO consultations (
    id,
    patient_id,
    doctor_id,
    scheduled_at,
    duration,
    consultation_type,
    status,
    symptoms,
    consultation_fee,
    payment_status,
    video_room_name,
    meeting_status
)
SELECT 
    'consultation-laiba-chatgpt-' || extract(epoch from now())::text,
    patient_info.patient_id,
    doctor_info.doctor_id,
    NOW() + INTERVAL '1 hour', -- Schedule for 1 hour from now
    '30', -- 30 minutes
    'chat_only', -- Chat consultation for testing
    'scheduled',
    '["General consultation", "Health check"]',
    85.00, -- Consultation fee
    'pending',
    'room-laiba-chatgpt-' || extract(epoch from now())::text,
    'scheduled'
FROM patient_info, doctor_info;

-- Verify the consultation was created
SELECT 
    c.id,
    c.scheduled_at,
    c.consultation_type,
    c.status,
    c.video_room_name,
    pu.first_name || ' ' || pu.last_name as patient_name,
    pu.email as patient_email,
    du.first_name || ' ' || du.last_name as doctor_name,
    du.email as doctor_email
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN users pu ON p.user_id = pu.id
JOIN doctors d ON c.doctor_id = d.id
JOIN users du ON d.user_id = du.id
WHERE pu.email = 'laibatemp@gmail.com' 
  AND du.email = 'chatgptrwp@gmail.com'
ORDER BY c.created_at DESC
LIMIT 1;
