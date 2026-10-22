// Types matching the 17 database tables and application domain

export type UserRole = 'patient' | 'doctor' | 'admin';

export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'cancelled';

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'reschedule_requested'
  | 'completed'
  | 'no_show';

export type RecordCategory = 
  | 'lab_reports'
  | 'prescriptions'
  | 'xrays_scans'
  | 'discharge_summaries'
  | 'surgery_reports'
  | 'vaccination_records'
  | 'diagnostic_reports'
  | 'other';

export type ConditionStatus = 'active' | 'managed' | 'resolved' | 'in_remission';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type AllergyType = 'medicine' | 'food' | 'environmental' | 'other';
export type MedicationStatus = 'active' | 'discontinued' | 'completed' | 'paused';
export type SourceType = 'patient_reported' | 'clinician_documented';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_number: string;
  departments: string[];
  image_url?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  hospital_id?: string;
  specialization: string;
  qualifications: string;
  experience_years: number;
  consultation_fee: number;
  biography?: string;
  license_number: string;
  verification_status: DoctorVerificationStatus;
  profile_image?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  profile?: Profile;
  hospital?: Hospital;
}

export interface DoctorVerification {
  id: string;
  doctor_id: string;
  verification_status: 'verified' | 'rejected' | 'suspended';
  reviewed_by?: string;
  review_reason?: string;
  reviewed_at: string;
  created_at: string;
  reviewer_profile?: Profile;
}

export interface AvailabilitySlot {
  id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  reason_for_visit: string;
  status: AppointmentStatus;
  cancellation_reason?: string;
  rejection_reason?: string;
  reschedule_reason?: string;
  preferred_reschedule_time?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  patient?: Profile;
  doctor?: Doctor;
  slot?: AvailabilitySlot;
  consultation_note?: ConsultationNote;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  title: string;
  category: RecordCategory;
  record_date: string;
  uploaded_at: string;
  file_path: string;
  file_type: string;
  file_size: number;
  hospital_name?: string;
  notes?: string;
  data_url?: string; // base64 preview for mock/local mode
  is_shared?: boolean;
}

export interface PatientMedicalProfile {
  id: string;
  patient_id: string;
  date_of_birth?: string;
  blood_group?: string;
  height?: number; // cm
  weight?: number; // kg
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  general_notes?: string;
  updated_at: string;
}

export interface MedicalCondition {
  id: string;
  patient_id: string;
  condition_name: string;
  description?: string;
  diagnosed_date?: string;
  status: ConditionStatus;
  source_type: SourceType;
  recorded_by?: string;
  verification_status: 'unverified' | 'verified_by_doctor';
  created_at: string;
  updated_at: string;
}

export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  allergy_type: AllergyType;
  reaction: string;
  severity: AllergySeverity;
  source_type: SourceType;
  recorded_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientMedication {
  id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  status: MedicationStatus;
  source_type: SourceType;
  prescribed_by?: string;
  notes?: string;
  created_at: string;
}

export interface MedicalHistoryEvent {
  id: string;
  patient_id: string;
  event_type: 
    | 'appointment' 
    | 'consultation_summary' 
    | 'recorded_diagnosis' 
    | 'medication_change' 
    | 'surgery_hospitalization' 
    | 'laboratory_result' 
    | 'uploaded_report' 
    | 'medical_event';
  event_date: string;
  description: string;
  source_type: string;
  source_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MedicalRecordShare {
  id: string;
  record_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  consented_at: string;
  revoked_at?: string;
  record?: MedicalRecord;
}

export interface MedicalHistoryConsent {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  shared_sections: string[]; // ['conditions', 'allergies', 'medications', 'consultations']
  consented_at: string;
  revoked_at?: string;
}

export interface ConsultationNote {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  treatment_plan: string;
  prescription_details?: string;
  follow_up_recommendations?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  appointment_id?: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
  actor_profile?: Profile;
}
