-- ==============================================================================
-- Doctor Appointment Booker - Comprehensive Demonstration Seed Data
-- Creates Hospitals, Verified Doctors, Slots, Patient Medical History, and Records
-- ==============================================================================

-- 1. Insert Hospitals
INSERT INTO public.hospitals (id, name, address, city, contact_number, departments, image_url)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'Apollo Health City', 'Road No 72, Jubilee Hills', 'Hyderabad', '+91 40 2360 7777', ARRAY['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'], 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80'),
    ('11111111-1111-1111-1111-111111111102', 'Fortis Memorial Research Institute', 'Sector 44, Opposite City Centre', 'Gurugram', '+91 124 4962200', ARRAY['Oncology', 'Cardiology', 'Dermatology', 'Gastroenterology'], 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80'),
    ('11111111-1111-1111-1111-111111111103', 'Manipal Hospital Whitefield', 'Survey No. 10P & 12P, Ramagondanahalli', 'Bengaluru', '+91 80 2502 4444', ARRAY['Pediatrics', 'Orthopedics', 'ENT', 'Pulmonology'], 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80'),
    ('11111111-1111-1111-1111-111111111104', 'Max Super Speciality Hospital', '1, 2, Press Enclave Road, Saket', 'New Delhi', '+91 11 2651 5050', ARRAY['General Medicine', 'Neurology', 'Dermatology', 'Endocrinology'], 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Mock Users / Profiles (UUIDs match standard demo accounts)
-- Admin
INSERT INTO public.profiles (id, full_name, email, phone, role, avatar_url)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Dr. Sarah Jenkins (Hospital Admin)', 'admin@healthcare.org', '+91 98765 43210', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'),
    -- Doctors
    ('d0000000-0000-0000-0000-000000000001', 'Dr. Priya Sharma', 'dr.priya@apollo.org', '+91 98480 12345', 'doctor', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'),
    ('d0000000-0000-0000-0000-000000000002', 'Dr. Rajesh Nair', 'dr.rajesh@fortis.org', '+91 98480 23456', 'doctor', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'),
    ('d0000000-0000-0000-0000-000000000003', 'Dr. Ananya Sen', 'dr.ananya@manipal.org', '+91 98480 34567', 'doctor', 'https://images.unsplash.com/photo-1594824813589-9828a2c26219?w=400&auto=format&fit=crop&q=80'),
    ('d0000000-0000-0000-0000-000000000004', 'Dr. Vikram Malhotra', 'dr.vikram@maxhealth.org', '+91 98480 45678', 'doctor', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'),
    ('d0000000-0000-0000-0000-000000000005', 'Dr. Kavita Reddy (Pending)', 'dr.kavita@apollo.org', '+91 98480 56789', 'doctor', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&auto=format&fit=crop&q=80'),
    -- Patient
    ('c0000000-0000-0000-0000-000000000001', 'Rahul Verma', 'rahul.verma@example.com', '+91 91234 56789', 'patient', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 3. Doctor Details
INSERT INTO public.doctors (id, user_id, hospital_id, specialization, qualifications, experience_years, consultation_fee, biography, license_number, verification_status, profile_image)
VALUES
    (
        'dddddddd-1111-1111-1111-111111111101',
        'd0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111101',
        'Cardiology',
        'MBBS, MD (Medicine), DM (Cardiology), FACC',
        14,
        850.00,
        'Senior Interventional Cardiologist specializing in preventive cardiology, coronary artery disease management, and arrhythmia treatment.',
        'MCI-HYD-2010-8472',
        'verified',
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
    ),
    (
        'dddddddd-1111-1111-1111-111111111102',
        'd0000000-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111102',
        'Neurology',
        'MBBS, MD, DM (Neurology), FAAN',
        16,
        1000.00,
        'Consultant Neurologist focusing on stroke prevention, chronic migraine management, neurodegenerative disorders, and epilepsy.',
        'DMC-DEL-2008-5931',
        'verified',
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
    ),
    (
        'dddddddd-1111-1111-1111-111111111103',
        'd0000000-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111103',
        'Pediatrics',
        'MBBS, DCH, DNB (Pediatrics)',
        9,
        600.00,
        'Dedicated pediatrician caring for neonates and young children with special expertise in developmental milestones, vaccinations, and pediatric asthma.',
        'KMC-BLR-2015-1294',
        'verified',
        'https://images.unsplash.com/photo-1594824813589-9828a2c26219?w=400&auto=format&fit=crop&q=80'
    ),
    (
        'dddddddd-1111-1111-1111-111111111104',
        'd0000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111104',
        'Dermatology',
        'MBBS, MD (Dermatology, Venereology & Leprosy)',
        11,
        750.00,
        'Specialist dermatologist experienced in clinical dermatology, psoriasis, eczema management, and advanced aesthetic laser procedures.',
        'DMC-DEL-2013-3382',
        'verified',
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'
    ),
    (
        'dddddddd-1111-1111-1111-111111111105',
        'd0000000-0000-0000-0000-000000000005',
        '11111111-1111-1111-1111-111111111101',
        'Orthopedics',
        'MBBS, MS (Orthopedics), Fellowship in Joint Replacement',
        7,
        800.00,
        'Orthopedic surgeon specializing in sports trauma, arthroscopy, and minimally invasive knee and hip joint replacements.',
        'MCI-HYD-2018-7719',
        'pending',
        'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&auto=format&fit=crop&q=80'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Patient Health Profile
INSERT INTO public.patient_medical_profiles (id, patient_id, date_of_birth, blood_group, height, weight, emergency_contact_name, emergency_contact_phone, general_notes)
VALUES (
    'pppppppp-1111-1111-1111-111111111101',
    'c0000000-0000-0000-0000-000000000001',
    '1992-06-15',
    'B+',
    178.0,
    74.5,
    'Sunita Verma (Spouse)',
    '+91 91234 98765',
    'Non-smoker, mild seasonal allergic rhinitis, regular brisk walker.'
)
ON CONFLICT (patient_id) DO NOTHING;

-- 5. Medical Conditions
INSERT INTO public.medical_conditions (id, patient_id, condition_name, description, diagnosed_date, status, source_type, verification_status)
VALUES
    ('cccccccc-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000001', 'Essential Hypertension', 'Stage 1 hypertension managed with lifestyle and Telmisartan.', '2023-03-10', 'managed', 'clinician_documented', 'verified_by_doctor'),
    ('cccccccc-1111-1111-1111-111111111102', 'c0000000-0000-0000-0000-000000000001', 'Allergic Rhinitis', 'Seasonal nasal congestion triggered during pollen months.', '2021-08-14', 'active', 'patient_reported', 'unverified')
ON CONFLICT (id) DO NOTHING;

-- 6. Patient Allergies
INSERT INTO public.patient_allergies (id, patient_id, allergen, allergy_type, reaction, severity, source_type, notes)
VALUES
    ('aaaaaaaa-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000001', 'Penicillin', 'medicine', 'Hives, facial erythema, dyspnea', 'severe', 'clinician_documented', 'Observed in 2019 during dental extraction course.'),
    ('aaaaaaaa-1111-1111-1111-111111111102', 'c0000000-0000-0000-0000-000000000001', 'Peanuts', 'food', 'Mild oral tingling and lip swelling', 'mild', 'patient_reported', 'Avoids raw peanuts and peanut oil.')
ON CONFLICT (id) DO NOTHING;

-- 7. Patient Medications
INSERT INTO public.patient_medications (id, patient_id, medicine_name, dosage, frequency, start_date, end_date, status, source_type, prescribed_by, notes)
VALUES
    ('mmmmmmmm-1111-1111-1111-111111111101', 'c0000000-0000-0000-0000-000000000001', 'Telmisartan', '40 mg', 'Once daily (morning)', '2023-03-15', NULL, 'active', 'clinician_documented', 'Dr. Priya Sharma', 'Take with or without food.'),
    ('mmmmmmmm-1111-1111-1111-111111111102', 'c0000000-0000-0000-0000-000000000001', 'Cetirizine', '10 mg', 'As needed during allergy flare-ups', '2021-08-20', NULL, 'active', 'patient_reported', 'Self / OTC', 'Bedtime dose.')
ON CONFLICT (id) DO NOTHING;

-- 8. Sample Medical Records
INSERT INTO public.medical_records (id, patient_id, title, category, record_date, uploaded_at, file_path, file_type, file_size, hospital_name, notes)
VALUES
    (
        'rrrrrrrr-1111-1111-1111-111111111101',
        'c0000000-0000-0000-0000-000000000001',
        'Complete Blood Count & Lipid Profile',
        'lab_reports',
        '2024-08-15',
        now() - INTERVAL '60 days',
        'records/cbc_lipid_panel_2024.pdf',
        'application/pdf',
        425000,
        'Apollo Diagnostics',
        'Lipid levels within target range. Total Cholesterol 185 mg/dL, HDL 48 mg/dL.'
    ),
    (
        'rrrrrrrr-1111-1111-1111-111111111102',
        'c0000000-0000-0000-0000-000000000001',
        'Resting 12-Lead Electrocardiogram (ECG)',
        'diagnostic_reports',
        '2024-03-12',
        now() - INTERVAL '180 days',
        'records/ecg_normal_sinus_2024.pdf',
        'application/pdf',
        612000,
        'Apollo Health City',
        'Normal sinus rhythm, HR 72 bpm, no ST-T abnormalities.'
    ),
    (
        'rrrrrrrr-1111-1111-1111-111111111103',
        'c0000000-0000-0000-0000-000000000001',
        'Chest X-Ray PA View',
        'xrays_scans',
        '2023-11-20',
        now() - INTERVAL '300 days',
        'records/chest_xray_pa.png',
        'image/png',
        1420000,
        'Max Healthcare Radiodiagnostics',
        'Clear lung fields, normal cardiothoracic ratio, intact bony cage.'
    )
ON CONFLICT (id) DO NOTHING;
