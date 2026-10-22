-- ==============================================================================
-- Doctor Appointment Booker - Comprehensive Production Database Schema
-- Includes All 17 Tables, Constraints, Indexes, RLS Policies, & Atomic Procedures
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- Table 1: profiles
-- Associated with authenticated auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')) DEFAULT 'patient',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 2: hospitals
-- Healthcare facilities and medical centers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    departments TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 3: doctors
-- Doctor professional profiles linked to user profiles and hospitals
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    specialization TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (consultation_fee >= 0),
    biography TEXT,
    license_number TEXT NOT NULL UNIQUE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')) DEFAULT 'pending',
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 4: doctor_verifications
-- Verification audit log and credentials verification decisions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'rejected', 'suspended')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_reason TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 5: availability_slots
-- Calendar time slots provided by doctors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'blocked', 'cancelled')) DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, start_time)
);

-- ==============================================================================
-- Table 6: appointments
-- Consultations booked between patients and doctors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.availability_slots(id) ON DELETE RESTRICT,
    reason_for_visit TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'reschedule_requested', 'completed', 'no_show')) DEFAULT 'pending',
    cancellation_reason TEXT,
    rejection_reason TEXT,
    reschedule_reason TEXT,
    preferred_reschedule_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_appointment_slot UNIQUE (slot_id)
);

-- ==============================================================================
-- Table 7: medical_records
-- Secure medical documents uploaded by patients
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'lab_reports', 
        'prescriptions', 
        'xrays_scans', 
        'discharge_summaries', 
        'surgery_reports', 
        'vaccination_records', 
        'diagnostic_reports', 
        'other'
    )),
    record_date DATE NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'image/jpeg', 'image/jpg', 'image/png')),
    file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 15728640), -- Max 15MB
    hospital_name TEXT,
    notes TEXT
);

-- ==============================================================================
-- Table 8: patient_medical_profiles
-- Baseline longitudinal health metrics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patient_medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    height NUMERIC(5,2) CHECK (height > 0 AND height < 300), -- cm
    weight NUMERIC(5,2) CHECK (weight > 0 AND weight < 500), -- kg
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    general_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 9: medical_conditions
-- Patient diagnosed and patient-reported chronic and acute conditions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    description TEXT,
    diagnosed_date DATE,
    status TEXT NOT NULL CHECK (status IN ('active', 'managed', 'resolved', 'in_remission')) DEFAULT 'active',
    source_type TEXT NOT NULL CHECK (source_type IN ('patient_reported', 'clinician_documented')) DEFAULT 'patient_reported',
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('unverified', 'verified_by_doctor')) DEFAULT 'unverified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 10: patient_allergies
-- Life-critical and documented allergies
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    allergen TEXT NOT NULL,
    allergy_type TEXT NOT NULL CHECK (allergy_type IN ('medicine', 'food', 'environmental', 'other')) DEFAULT 'medicine',
    reaction TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')) DEFAULT 'moderate',
    source_type TEXT NOT NULL CHECK (source_type IN ('patient_reported', 'clinician_documented')) DEFAULT 'patient_reported',
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 11: patient_medications
-- Active and historical medications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL CHECK (status IN ('active', 'discontinued', 'completed', 'paused')) DEFAULT 'active',
    source_type TEXT NOT NULL CHECK (source_type IN ('patient_reported', 'clinician_documented')) DEFAULT 'patient_reported',
    prescribed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 12: medical_history_events
-- Chronological event timeline
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_history_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'appointment', 
        'consultation_summary', 
        'recorded_diagnosis', 
        'medication_change', 
        'surgery_hospitalization', 
        'laboratory_result', 
        'uploaded_report', 
        'medical_event'
    )),
    event_date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 13: medical_record_shares
-- Granular document sharing consent with revocation tracking
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_record_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_record_share UNIQUE (record_id, appointment_id)
);

-- ==============================================================================
-- Table 14: medical_history_consents
-- Section-level health background consent with doctors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medical_history_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    shared_sections TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'conditions', 'allergies', 'medications', 'consultations'}
    consented_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_history_consent UNIQUE (appointment_id)
);

-- ==============================================================================
-- Table 15: consultation_notes
-- Signed clinical notes recorded by treating doctors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE UNIQUE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    observations TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    prescription_details TEXT,
    follow_up_recommendations TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 16: notifications
-- Notification center for all users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 17: audit_logs
-- Immutable tamper-evident audit logs for sensitive operations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Indexes for Performance & Queries
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_user ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON public.doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_verification ON public.doctors(verification_status);

CREATE INDEX IF NOT EXISTS idx_slots_doctor_time ON public.availability_slots(doctor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_slots_status ON public.availability_slots(status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_patient ON public.medical_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_patient ON public.patient_allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON public.patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_events_patient ON public.medical_history_events(patient_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_record_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES
CREATE POLICY "Public profiles can be read by authenticated users"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update only their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- HOSPITALS
CREATE POLICY "Hospitals viewable by everyone"
ON public.hospitals FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage hospitals"
ON public.hospitals FOR ALL TO authenticated
USING (public.current_user_role() = 'admin');

-- DOCTORS
CREATE POLICY "Doctor profiles viewable by all authenticated and anon"
ON public.doctors FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Doctors can update their own profile"
ON public.doctors FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage doctor records"
ON public.doctors FOR ALL TO authenticated
USING (public.current_user_role() = 'admin');

-- DOCTOR VERIFICATIONS
CREATE POLICY "Admins and specific doctor can view verification logs"
ON public.doctor_verifications FOR SELECT TO authenticated
USING (
    public.current_user_role() = 'admin' OR 
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can insert doctor verification"
ON public.doctor_verifications FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() = 'admin');

-- AVAILABILITY SLOTS
CREATE POLICY "Availability slots viewable by all"
ON public.availability_slots FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY "Doctors can manage their own availability slots"
ON public.availability_slots FOR ALL TO authenticated
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- APPOINTMENTS
CREATE POLICY "Patients view their own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    public.current_user_role() = 'admin'
);

CREATE POLICY "Patients can insert appointments for themselves"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients and assigned doctors can update appointment"
ON public.appointments FOR UPDATE TO authenticated
USING (
    patient_id = auth.uid() OR 
    doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()) OR
    public.current_user_role() = 'admin'
);

-- MEDICAL RECORDS
CREATE POLICY "Patients manage their own medical records"
ON public.medical_records FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view shared medical records with active consent"
ON public.medical_records FOR SELECT TO authenticated
USING (
    id IN (
        SELECT record_id FROM public.medical_record_shares mrs
        JOIN public.doctors d ON d.id = mrs.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mrs.revoked_at IS NULL
    )
);

-- PATIENT MEDICAL PROFILES
CREATE POLICY "Patients manage their health profile"
ON public.patient_medical_profiles FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view health profile with consent"
ON public.patient_medical_profiles FOR SELECT TO authenticated
USING (
    patient_id IN (
        SELECT patient_id FROM public.medical_history_consents mhc
        JOIN public.doctors d ON d.id = mhc.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mhc.revoked_at IS NULL
    )
);

-- MEDICAL CONDITIONS
CREATE POLICY "Patients view and manage their medical conditions"
ON public.medical_conditions FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view conditions with active consent"
ON public.medical_conditions FOR SELECT TO authenticated
USING (
    patient_id IN (
        SELECT patient_id FROM public.medical_history_consents mhc
        JOIN public.doctors d ON d.id = mhc.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mhc.revoked_at IS NULL
          AND 'conditions' = ANY(mhc.shared_sections)
    )
);

-- PATIENT ALLERGIES
CREATE POLICY "Patients view and manage allergies"
ON public.patient_allergies FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view allergies with active consent"
ON public.patient_allergies FOR SELECT TO authenticated
USING (
    patient_id IN (
        SELECT patient_id FROM public.medical_history_consents mhc
        JOIN public.doctors d ON d.id = mhc.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mhc.revoked_at IS NULL
          AND 'allergies' = ANY(mhc.shared_sections)
    )
);

-- PATIENT MEDICATIONS
CREATE POLICY "Patients view and manage medications"
ON public.patient_medications FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view medications with active consent"
ON public.patient_medications FOR SELECT TO authenticated
USING (
    patient_id IN (
        SELECT patient_id FROM public.medical_history_consents mhc
        JOIN public.doctors d ON d.id = mhc.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mhc.revoked_at IS NULL
          AND 'medications' = ANY(mhc.shared_sections)
    )
);

-- MEDICAL HISTORY EVENTS
CREATE POLICY "Patients view their history events"
ON public.medical_history_events FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view history events with active consent"
ON public.medical_history_events FOR SELECT TO authenticated
USING (
    patient_id IN (
        SELECT patient_id FROM public.medical_history_consents mhc
        JOIN public.doctors d ON d.id = mhc.doctor_id
        WHERE d.user_id = auth.uid() 
          AND mhc.revoked_at IS NULL
    )
);

-- MEDICAL RECORD SHARES
CREATE POLICY "Patients manage record shares"
ON public.medical_record_shares FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view their received shares"
ON public.medical_record_shares FOR SELECT TO authenticated
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- MEDICAL HISTORY CONSENTS
CREATE POLICY "Patients manage history consents"
ON public.medical_history_consents FOR ALL TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view their granted consents"
ON public.medical_history_consents FOR SELECT TO authenticated
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- CONSULTATION NOTES
CREATE POLICY "Patient can read consultation note for their appointment"
ON public.consultation_notes FOR SELECT TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Assigned doctor can read and write consultation note"
ON public.consultation_notes FOR ALL TO authenticated
USING (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()))
WITH CHECK (doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "Users can only read and update their own notifications"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.current_user_role() = 'admin');

CREATE POLICY "System and users can append audit logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- ==============================================================================
-- Atomic Stored Procedure: book_appointment_atomic
-- Guarantees double-booking prevention under concurrent requests
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
    p_patient_id UUID,
    p_doctor_id UUID,
    p_slot_id UUID,
    p_reason TEXT,
    p_shared_record_ids UUID[] DEFAULT '{}',
    p_shared_sections TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_slot RECORD;
    v_appointment_id UUID;
    v_rec_id UUID;
BEGIN
    -- 1. Lock slot row for update (prevents race conditions)
    SELECT * INTO v_slot
    FROM public.availability_slots
    WHERE id = p_slot_id AND doctor_id = p_doctor_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment slot does not exist.';
    END IF;

    IF v_slot.status != 'available' THEN
        RAISE EXCEPTION 'This appointment slot is no longer available. Please select another time.';
    END IF;

    -- 2. Mark slot as booked
    UPDATE public.availability_slots
    SET status = 'booked'
    WHERE id = p_slot_id;

    -- 3. Insert appointment record
    INSERT INTO public.appointments (
        patient_id,
        doctor_id,
        slot_id,
        reason_for_visit,
        status
    ) VALUES (
        p_patient_id,
        p_doctor_id,
        p_slot_id,
        p_reason,
        'pending'
    )
    RETURNING id INTO v_appointment_id;

    -- 4. Record shared medical records consent
    IF array_length(p_shared_record_ids, 1) > 0 THEN
        FOREACH v_rec_id IN ARRAY p_shared_record_ids LOOP
            INSERT INTO public.medical_record_shares (
                record_id,
                patient_id,
                doctor_id,
                appointment_id,
                consented_at
            ) VALUES (
                v_rec_id,
                p_patient_id,
                p_doctor_id,
                v_appointment_id,
                now()
            );
        END LOOP;
    END IF;

    -- 5. Record medical history consent
    IF array_length(p_shared_sections, 1) > 0 THEN
        INSERT INTO public.medical_history_consents (
            patient_id,
            doctor_id,
            appointment_id,
            shared_sections,
            consented_at
        ) VALUES (
            p_patient_id,
            p_doctor_id,
            v_appointment_id,
            p_shared_sections,
            now()
        );
    END IF;

    -- 6. Insert notification for doctor
    INSERT INTO public.notifications (
        user_id,
        appointment_id,
        title,
        message,
        notification_type
    )
    SELECT 
        d.user_id,
        v_appointment_id,
        'New Appointment Request',
        'You have a new appointment booking request awaiting your review.',
        'appointment_request'
    FROM public.doctors d
    WHERE d.id = p_doctor_id;

    -- 7. Insert audit log
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        p_patient_id,
        'BOOK_APPOINTMENT',
        'appointments',
        v_appointment_id::text,
        jsonb_build_object(
            'slot_id', p_slot_id,
            'doctor_id', p_doctor_id,
            'shared_records_count', coalesce(array_length(p_shared_record_ids, 1), 0),
            'shared_sections', p_shared_sections
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_appointment_id,
        'status', 'pending'
    );
END;
$$;
