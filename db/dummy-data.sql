-- Realistic Medical Platform Demo Data
-- Run this after the main schema setup

-- Insert realistic users
INSERT INTO users (id, clerk_user_id, user_type, email, first_name, last_name, phone, is_active, is_verified) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'clerk_patient_1', 'patient', 'emily.rodriguez@gmail.com', 'Emily', 'Rodriguez', '+1-555-0123', true, true),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'clerk_doctor_1', 'doctor', 'dr.patel@medicenter.org', 'Raj', 'Patel', '+1-555-0124', true, true),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'clerk_doctor_2', 'doctor', 'dr.chen@cardiohealth.com', 'Lisa', 'Chen', '+1-555-0125', true, true),
('d4e5f6a7-b8c9-0123-defa-456789012345', 'clerk_patient_2', 'patient', 'james.thompson@outlook.com', 'James', 'Thompson', '+1-555-0126', true, true),
('e5f6a7b8-c9d0-1234-efab-567890123456', 'clerk_doctor_3', 'doctor', 'dr.williams@familycare.net', 'Amanda', 'Williams', '+1-555-0127', true, true);

-- Insert realistic patients with varied medical profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_type, height, weight, allergies, medical_history, current_medications) VALUES
('f1a2b3c4-d5e6-a789-0abc-def123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1988-09-22', 'female', 'A+', 165, 62, '["Latex", "Ibuprofen", "Tree nuts"]', '["Migraine headaches", "Seasonal allergies", "Previous ankle fracture (2019)"]', '["Sumatriptan 50mg as needed", "Loratadine 10mg daily"]'),
('f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'd4e5f6a7-b8c9-0123-defa-456789012345', '1975-03-14', 'male', 'O-', 180, 85, '["Sulfa drugs", "Bee stings"]', '["Hypertension", "High cholesterol", "Type 2 diabetes", "Sleep apnea"]', '["Metformin 500mg twice daily", "Atorvastatin 20mg nightly", "Lisinopril 10mg daily", "CPAP therapy"]');

-- Insert realistic doctors with detailed specializations
INSERT INTO doctors (id, user_id, license_number, specialty, years_of_experience, bio, consultation_fee, rating, total_ratings, is_available) VALUES
('a1a2b3c4-d5e6-a789-0abc-def123456789', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'MD-CA-087432', 'general_practice', 18, 'Board-certified family medicine physician with extensive experience in preventive care, chronic disease management, and patient education. Fluent in English, Hindi, and Spanish.', 85.00, 4.7, 203, true),
('a2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'MD-NY-129876', 'cardiology', 14, 'Interventional cardiologist specializing in heart disease prevention, cardiac catheterization, and stent placement. Published researcher in cardiac rehabilitation and women''s heart health.', 150.00, 4.9, 156, true),
('a3c4d5e6-a7b8-9012-3cde-a345678901bc', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'MD-TX-054321', 'general_practice', 22, 'Senior family physician with special interest in pediatric care, women''s health, and geriatric medicine. Former chief of staff at Regional Medical Center.', 90.00, 4.8, 289, true);

-- Insert realistic consultations with varied scenarios
INSERT INTO consultations (id, patient_id, doctor_id, scheduled_at, status, symptoms, diagnosis, doctor_notes, consultation_fee) VALUES
('c1a2b3c4-d5e6-a789-0abc-def123456789', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'a1a2b3c4-d5e6-a789-0abc-def123456789', NOW() + INTERVAL '1 day 10 hours', 'scheduled', '["Severe headache", "Nausea", "Light sensitivity"]', '', '', 85.00),
('c2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'a2b3c4d5-e6a7-8901-2bcd-ef234567890a', NOW() - INTERVAL '3 hours', 'completed', '["Chest tightness", "Shortness of breath during exercise"]', 'Stable angina - recommend stress test', 'Patient reports improved symptoms with nitroglycerin. Scheduled for cardiac stress test next week. Continue current medications.', 150.00),
('c3c4d5e6-a7b8-9012-3cde-a345678901bc', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'a3c4d5e6-a7b8-9012-3cde-a345678901bc', NOW() + INTERVAL '3 days 14 hours', 'scheduled', '["Annual physical", "Routine checkup"]', '', '', 90.00),
('c4d5e6a7-b8c9-0123-4def-56789012345c', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'a1a2b3c4-d5e6-a789-0abc-def123456789', NOW() - INTERVAL '1 week', 'completed', '["Fatigue", "Frequent urination", "Increased thirst"]', 'Diabetes management - HbA1c elevated', 'A1C at 8.2%. Adjusting Metformin dosage and adding lifestyle counseling referral. Follow-up in 3 months.', 85.00);

-- Insert realistic prescriptions with common medications
INSERT INTO prescriptions (id, patient_id, doctor_id, consultation_id, medication_name, dosage, frequency, duration, quantity, instructions, status, start_date) VALUES
('aa1a2b3c-d5e6-a789-0abc-def123456789', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'a1a2b3c4-d5e6-a789-0abc-def123456789', 'c4d5e6a7-b8c9-0123-4def-56789012345c', 'Sumatriptan', '50mg', 'as_needed', 30, 9, 'Take at first sign of migraine. Maximum 2 tablets per 24 hours. May cause drowsiness.', 'sent_to_pharmacy', NOW() - INTERVAL '2 days'),
('ab2b3c4d-e6a7-8901-2bcd-ef234567890a', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'a2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'c2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'Nitroglycerin', '0.4mg', 'as_needed', 60, 25, 'Place under tongue at onset of chest pain. May repeat every 5 minutes up to 3 doses. Seek emergency care if pain persists.', 'ready_for_pickup', NOW() - INTERVAL '1 day'),
('ac3c4d5e-a7b8-9012-3cde-a345678901bc', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'a1a2b3c4-d5e6-a789-0abc-def123456789', NULL, 'Metformin XR', '1000mg', 'twice_daily', 90, 180, 'Take with meals to reduce stomach upset. Monitor blood sugar levels regularly. Report any unusual muscle pain.', 'pending', NOW()),
('ad4d5e6a-b8c9-0123-4def-56789012345c', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'a3c4d5e6-a7b8-9012-3cde-a345678901bc', NULL, 'Vitamin D3', '2000 IU', 'once_daily', 90, 90, 'Take with food for better absorption. Helps maintain bone health and immune function.', 'completed', NOW() - INTERVAL '10 days');

-- Insert realistic symptoms with detailed descriptions
INSERT INTO symptoms (id, patient_id, symptom_name, category, description, severity, duration, onset_date) VALUES
('ba1a2b3c-d5e6-a789-0abc-def123456789', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'Migraine headache', 'neurological', 'Throbbing pain on right side of head, worsens with bright lights and loud sounds', 'severe', '2 days intermittent', NOW() - INTERVAL '2 days'),
('bb2b3c4d-e6a7-8901-2bcd-ef234567890a', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'Chest tightness', 'cardiovascular', 'Pressure sensation in center of chest, occurs during physical activity like climbing stairs', 'moderate', '1 week', NOW() - INTERVAL '1 week'),
('bc3c4d5e-a7b8-9012-3cde-a345678901bc', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'Seasonal allergies', 'respiratory', 'Runny nose, watery eyes, sneezing fits especially in the morning', 'mild', '3 weeks', NOW() - INTERVAL '3 weeks'),
('bd4d5e6a-b8c9-0123-4def-56789012345c', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'Morning fatigue', 'other', 'Feeling extremely tired despite 7-8 hours of sleep, difficulty concentrating at work', 'moderate', '2 months', NOW() - INTERVAL '2 months');

-- Insert realistic medication reminders
INSERT INTO reminders (id, patient_id, prescription_id, reminder_type, title, message, reminder_time, reminder_days, status) VALUES
('ca1a2b3c-d5e6-a789-0abc-def123456789', 'f1a2b3c4-d5e6-a789-0abc-def123456789', 'ad4d5e6a-b8c9-0123-4def-56789012345c', 'medication', 'Morning Vitamin D', 'Take your Vitamin D3 2000 IU with breakfast', '08:30:00', '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 'active'),
('cb2b3c4d-e6a7-8901-2bcd-ef234567890a', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'ac3c4d5e-a7b8-9012-3cde-a345678901bc', 'medication', 'Metformin - Morning Dose', 'Take Metformin XR 1000mg with breakfast to manage blood sugar', '08:00:00', '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 'active'),
('cc3c4d5e-a7b8-9012-3cde-a345678901bc', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', 'ac3c4d5e-a7b8-9012-3cde-a345678901bc', 'medication', 'Metformin - Evening Dose', 'Take Metformin XR 1000mg with dinner', '19:00:00', '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 'active'),
('cd4d5e6a-b8c9-0123-4def-56789012345c', 'f1a2b3c4-d5e6-a789-0abc-def123456789', NULL, 'appointment', 'Dr. Patel Appointment', 'Migraine follow-up appointment with Dr. Patel tomorrow at 10:00 AM', '09:00:00', '[]', 'active'),
('ce5e6a7b-c9d0-1234-5efa-6789012345de', 'f2b3c4d5-e6a7-8901-2bcd-ef234567890a', NULL, 'health_check', 'Blood Sugar Check', 'Time for your daily blood glucose monitoring', '07:00:00', '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', 'active');