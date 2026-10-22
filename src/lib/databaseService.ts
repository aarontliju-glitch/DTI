import { 
  Profile, 
  Hospital, 
  Doctor, 
  AvailabilitySlot, 
  Appointment, 
  MedicalRecord, 
  PatientMedicalProfile, 
  MedicalCondition, 
  PatientAllergy, 
  PatientMedication, 
  MedicalHistoryEvent, 
  MedicalRecordShare, 
  MedicalHistoryConsent, 
  ConsultationNote, 
  NotificationItem, 
  AuditLog,
  AppointmentStatus,
  DoctorVerificationStatus
} from '../types/database';

import {
  INITIAL_HOSPITALS,
  INITIAL_PROFILES,
  INITIAL_DOCTORS,
  INITIAL_SLOTS,
  INITIAL_PATIENT_MEDICAL_PROFILE,
  INITIAL_CONDITIONS,
  INITIAL_ALLERGIES,
  INITIAL_MEDICATIONS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATION_NOTES,
  INITIAL_RECORD_SHARES,
  INITIAL_HISTORY_CONSENTS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './mockData';

import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_PREFIX = 'doctor_booker_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage quota or error', e);
  }
}

// In-Memory & LocalStorage Engine
class DatabaseEngine {
  private hospitals: Hospital[] = getStored('hospitals', INITIAL_HOSPITALS);
  private profiles: Profile[] = getStored('profiles', INITIAL_PROFILES);
  private doctors: Doctor[] = getStored('doctors', INITIAL_DOCTORS);
  private slots: AvailabilitySlot[] = getStored('slots', INITIAL_SLOTS);
  private appointments: Appointment[] = getStored('appointments', INITIAL_APPOINTMENTS);
  private patientProfiles: Record<string, PatientMedicalProfile> = getStored('patient_profiles', {
    'c0000000-0000-0000-0000-000000000001': INITIAL_PATIENT_MEDICAL_PROFILE
  });
  private conditions: MedicalCondition[] = getStored('conditions', INITIAL_CONDITIONS);
  private allergies: PatientAllergy[] = getStored('allergies', INITIAL_ALLERGIES);
  private medications: PatientMedication[] = getStored('medications', INITIAL_MEDICATIONS);
  private medicalRecords: MedicalRecord[] = getStored('records', INITIAL_MEDICAL_RECORDS);
  private recordShares: MedicalRecordShare[] = getStored('record_shares', INITIAL_RECORD_SHARES);
  private historyConsents: MedicalHistoryConsent[] = getStored('history_consents', INITIAL_HISTORY_CONSENTS);
  private consultationNotes: ConsultationNote[] = getStored('consultation_notes', INITIAL_CONSULTATION_NOTES);
  private timelineEvents: MedicalHistoryEvent[] = getStored('timeline', INITIAL_TIMELINE_EVENTS);
  private notifications: NotificationItem[] = getStored('notifications', INITIAL_NOTIFICATIONS);
  private auditLogs: AuditLog[] = getStored('audit_logs', INITIAL_AUDIT_LOGS);

  private save(key: string, data: any) {
    setStored(key, data);
  }

  // --- PROFILES & AUTH ---
  public getProfiles(): Profile[] {
    return this.profiles;
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  public createProfile(profile: Profile): Profile {
    this.profiles.push(profile);
    this.save('profiles', this.profiles);
    return profile;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.profiles[idx] = { ...this.profiles[idx], ...updates, updated_at: new Date().toISOString() };
    this.save('profiles', this.profiles);
    return this.profiles[idx];
  }

  // --- HOSPITALS ---
  public getHospitals(): Hospital[] {
    return this.hospitals;
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.hospitals.find(h => h.id === id);
  }

  public createHospital(data: Omit<Hospital, 'id' | 'created_at'>): Hospital {
    const newHospital: Hospital = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.hospitals.push(newHospital);
    this.save('hospitals', this.hospitals);
    return newHospital;
  }

  public updateHospital(id: string, data: Partial<Hospital>): Hospital | null {
    const idx = this.hospitals.findIndex(h => h.id === id);
    if (idx === -1) return null;
    this.hospitals[idx] = { ...this.hospitals[idx], ...data };
    this.save('hospitals', this.hospitals);
    return this.hospitals[idx];
  }

  // --- DOCTORS ---
  public getDoctors(): Doctor[] {
    return this.doctors.map(d => ({
      ...d,
      profile: this.getProfileById(d.user_id),
      hospital: d.hospital_id ? this.getHospitalById(d.hospital_id) : undefined,
    }));
  }

  public getDoctorById(id: string): Doctor | undefined {
    const d = this.doctors.find(item => item.id === id || item.user_id === id);
    if (!d) return undefined;
    return {
      ...d,
      profile: this.getProfileById(d.user_id),
      hospital: d.hospital_id ? this.getHospitalById(d.hospital_id) : undefined,
    };
  }

  public searchDoctors(params: {
    query?: string;
    specialization?: string;
    hospitalId?: string;
    city?: string;
    maxFee?: number;
    verifiedOnly?: boolean;
    availableDate?: string;
  }): Doctor[] {
    let result = this.getDoctors();

    if (params.verifiedOnly) {
      result = result.filter(d => d.verification_status === 'verified');
    }

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(d => 
        (d.profile?.full_name?.toLowerCase().includes(q)) ||
        d.specialization.toLowerCase().includes(q) ||
        (d.hospital?.name?.toLowerCase().includes(q)) ||
        (d.hospital?.city?.toLowerCase().includes(q))
      );
    }

    if (params.specialization && params.specialization !== 'all') {
      result = result.filter(d => d.specialization.toLowerCase() === params.specialization?.toLowerCase());
    }

    if (params.hospitalId && params.hospitalId !== 'all') {
      result = result.filter(d => d.hospital_id === params.hospitalId);
    }

    if (params.city && params.city !== 'all') {
      result = result.filter(d => d.hospital?.city?.toLowerCase() === params.city?.toLowerCase());
    }

    if (params.maxFee) {
      result = result.filter(d => d.consultation_fee <= params.maxFee!);
    }

    return result;
  }

  public updateDoctorProfile(id: string, updates: Partial<Doctor>): Doctor | null {
    const idx = this.doctors.findIndex(d => d.id === id || d.user_id === id);
    if (idx === -1) return null;
    this.doctors[idx] = { ...this.doctors[idx], ...updates, updated_at: new Date().toISOString() };
    this.save('doctors', this.doctors);
    return this.getDoctorById(this.doctors[idx].id) || null;
  }

  // --- AVAILABILITY SLOTS ---
  public getDoctorSlots(doctorId: string): AvailabilitySlot[] {
    return this.slots
      .filter(s => s.doctor_id === doctorId)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  public addDoctorSlots(doctorId: string, newSlots: { start_time: string; end_time: string }[]): AvailabilitySlot[] {
    const created: AvailabilitySlot[] = [];
    for (const item of newSlots) {
      // Check collision
      const exists = this.slots.some(s => s.doctor_id === doctorId && s.start_time === item.start_time);
      if (!exists) {
        const slot: AvailabilitySlot = {
          id: crypto.randomUUID(),
          doctor_id: doctorId,
          start_time: item.start_time,
          end_time: item.end_time,
          status: 'available',
          created_at: new Date().toISOString(),
        };
        this.slots.push(slot);
        created.push(slot);
      }
    }
    this.save('slots', this.slots);
    return created;
  }

  public deleteSlot(slotId: string): boolean {
    const idx = this.slots.findIndex(s => s.id === slotId);
    if (idx === -1) return false;
    // Don't delete if booked
    if (this.slots[idx].status === 'booked') {
      throw new Error('Cannot delete a slot with an active appointment.');
    }
    this.slots.splice(idx, 1);
    this.save('slots', this.slots);
    return true;
  }

  // --- APPOINTMENTS & ATOMIC BOOKING ---
  public bookAppointmentAtomic(params: {
    patient_id: string;
    doctor_id: string;
    slot_id: string;
    reason_for_visit: string;
    shared_record_ids?: string[];
    shared_sections?: string[];
  }): { success: boolean; appointment: Appointment } {
    // 1. Transactional Slot Check
    const slotIdx = this.slots.findIndex(s => s.id === params.slot_id && s.doctor_id === params.doctor_id);
    if (slotIdx === -1) {
      throw new Error('Selected appointment slot was not found.');
    }
    const slot = this.slots[slotIdx];
    if (slot.status !== 'available') {
      throw new Error('This appointment slot is no longer available. Please choose another time.');
    }

    // 2. Mark slot booked atomically
    this.slots[slotIdx] = { ...slot, status: 'booked' };
    this.save('slots', this.slots);

    // 3. Create Appointment
    const appointmentId = crypto.randomUUID();
    const newAppointment: Appointment = {
      id: appointmentId,
      patient_id: params.patient_id,
      doctor_id: params.doctor_id,
      slot_id: params.slot_id,
      reason_for_visit: params.reason_for_visit,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.appointments.unshift(newAppointment);
    this.save('appointments', this.appointments);

    // 4. Record Shared Medical Records Consent
    if (params.shared_record_ids && params.shared_record_ids.length > 0) {
      for (const recId of params.shared_record_ids) {
        this.recordShares.push({
          id: crypto.randomUUID(),
          record_id: recId,
          patient_id: params.patient_id,
          doctor_id: params.doctor_id,
          appointment_id: appointmentId,
          consented_at: new Date().toISOString(),
        });
      }
      this.save('record_shares', this.recordShares);
    }

    // 5. Record Health History Consent
    if (params.shared_sections && params.shared_sections.length > 0) {
      this.historyConsents.push({
        id: crypto.randomUUID(),
        patient_id: params.patient_id,
        doctor_id: params.doctor_id,
        appointment_id: appointmentId,
        shared_sections: params.shared_sections,
        consented_at: new Date().toISOString(),
      });
      this.save('history_consents', this.historyConsents);
    }

    // 6. Notify Doctor
    const doctor = this.getDoctorById(params.doctor_id);
    const patient = this.getProfileById(params.patient_id);
    if (doctor?.user_id) {
      this.addNotification({
        user_id: doctor.user_id,
        appointment_id: appointmentId,
        title: 'New Appointment Request',
        message: `${patient?.full_name || 'A patient'} has requested an appointment for "${params.reason_for_visit}".`,
        notification_type: 'appointment_request',
      });
    }

    // 7. Add Timeline Event for Patient
    this.addTimelineEvent({
      patient_id: params.patient_id,
      event_type: 'appointment',
      event_date: slot.start_time,
      description: `Appointment booked with ${doctor?.profile?.full_name || 'Doctor'} (${doctor?.specialization}).`,
      source_type: 'appointment',
      source_id: appointmentId,
      metadata: {
        doctor_name: doctor?.profile?.full_name,
        specialization: doctor?.specialization,
        hospital: doctor?.hospital?.name,
      },
    });

    // 8. Audit Log
    this.addAuditLog({
      actor_id: params.patient_id,
      action: 'BOOK_APPOINTMENT',
      entity_type: 'appointments',
      entity_id: appointmentId,
      details: {
        slot_id: params.slot_id,
        doctor_id: params.doctor_id,
        shared_records_count: params.shared_record_ids?.length || 0,
        shared_sections: params.shared_sections,
      },
    });

    return {
      success: true,
      appointment: this.enrichAppointment(newAppointment),
    };
  }

  public getAppointments(filters?: {
    patient_id?: string;
    doctor_id?: string;
    status?: AppointmentStatus;
  }): Appointment[] {
    let list = this.appointments;

    if (filters?.patient_id) {
      list = list.filter(a => a.patient_id === filters.patient_id);
    }

    if (filters?.doctor_id) {
      list = list.filter(a => a.doctor_id === filters.doctor_id);
    }

    if (filters?.status) {
      list = list.filter(a => a.status === filters.status);
    }

    return list.map(a => this.enrichAppointment(a));
  }

  public getAppointmentById(id: string): Appointment | undefined {
    const apt = this.appointments.find(a => a.id === id);
    return apt ? this.enrichAppointment(apt) : undefined;
  }

  private enrichAppointment(a: Appointment): Appointment {
    const slot = this.slots.find(s => s.id === a.slot_id);
    const doctor = this.getDoctorById(a.doctor_id);
    const patient = this.getProfileById(a.patient_id);
    const consultation_note = this.consultationNotes.find(c => c.appointment_id === a.id);

    return {
      ...a,
      slot,
      doctor,
      patient,
      consultation_note,
    };
  }

  public updateAppointmentStatus(
    id: string, 
    status: AppointmentStatus, 
    actorId: string, 
    options?: {
      cancellation_reason?: string;
      rejection_reason?: string;
      reschedule_reason?: string;
      preferred_reschedule_time?: string;
    }
  ): Appointment {
    const idx = this.appointments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found.');

    const current = this.appointments[idx];
    const prevStatus = current.status;

    // Free up slot if cancelled or rejected
    if (status === 'cancelled' || status === 'rejected') {
      const slotIdx = this.slots.findIndex(s => s.id === current.slot_id);
      if (slotIdx !== -1) {
        this.slots[slotIdx].status = 'available';
        this.save('slots', this.slots);
      }
    }

    const updated: Appointment = {
      ...current,
      status,
      cancellation_reason: options?.cancellation_reason || current.cancellation_reason,
      rejection_reason: options?.rejection_reason || current.rejection_reason,
      reschedule_reason: options?.reschedule_reason || current.reschedule_reason,
      preferred_reschedule_time: options?.preferred_reschedule_time || current.preferred_reschedule_time,
      updated_at: new Date().toISOString(),
    };

    this.appointments[idx] = updated;
    this.save('appointments', this.appointments);

    // Notify respective counterpart
    const doctor = this.getDoctorById(updated.doctor_id);
    const isActorDoctor = doctor?.user_id === actorId;

    if (isActorDoctor) {
      // Notify patient
      this.addNotification({
        user_id: updated.patient_id,
        appointment_id: updated.id,
        title: `Appointment ${status === 'confirmed' ? 'Confirmed' : status === 'rejected' ? 'Declined' : status.replace('_', ' ').toUpperCase()}`,
        message: status === 'confirmed' 
          ? `Dr. ${doctor?.profile?.full_name} has confirmed your appointment.` 
          : status === 'rejected' 
            ? `Dr. ${doctor?.profile?.full_name} could not confirm: ${options?.rejection_reason || 'Doctor unavailable.'}`
            : `Your appointment status was updated to ${status}.`,
        notification_type: `appointment_${status}`,
      });
    } else {
      // Notify doctor
      if (doctor?.user_id) {
        this.addNotification({
          user_id: doctor.user_id,
          appointment_id: updated.id,
          title: `Appointment ${status === 'cancelled' ? 'Cancelled by Patient' : 'Updated'}`,
          message: status === 'cancelled'
            ? `Patient cancelled appointment. Reason: ${options?.cancellation_reason || 'Not specified'}.`
            : `Appointment updated to ${status}.`,
          notification_type: `appointment_${status}`,
        });
      }
    }

    // Add Audit Log
    this.addAuditLog({
      actor_id: actorId,
      action: `UPDATE_APPOINTMENT_STATUS_${status.toUpperCase()}`,
      entity_type: 'appointments',
      entity_id: id,
      details: { prev_status: prevStatus, new_status: status, ...options },
    });

    return this.enrichAppointment(updated);
  }

  // --- MEDICAL RECORDS ---
  public getPatientRecords(patientId: string): MedicalRecord[] {
    return this.medicalRecords.filter(r => r.patient_id === patientId);
  }

  public getDoctorAuthorizedRecords(appointmentId: string, doctorId: string): MedicalRecord[] {
    // Find active non-revoked shares
    const activeShares = this.recordShares.filter(
      s => s.appointment_id === appointmentId && s.doctor_id === doctorId && !s.revoked_at
    );
    const sharedRecordIds = new Set(activeShares.map(s => s.record_id));
    return this.medicalRecords.filter(r => sharedRecordIds.has(r.id));
  }

  public uploadMedicalRecord(record: Omit<MedicalRecord, 'id' | 'uploaded_at'>): MedicalRecord {
    // Enforce file size limit 15MB
    if (record.file_size > 15 * 1024 * 1024) {
      throw new Error('File exceeds maximum allowable size of 15 MB.');
    }
    const newRecord: MedicalRecord = {
      ...record,
      id: crypto.randomUUID(),
      uploaded_at: new Date().toISOString(),
    };
    this.medicalRecords.unshift(newRecord);
    this.save('records', this.medicalRecords);

    // Timeline event
    this.addTimelineEvent({
      patient_id: record.patient_id,
      event_type: 'uploaded_report',
      event_date: record.record_date,
      description: `Uploaded record: "${record.title}" (${record.category.replace('_', ' ')}).`,
      source_type: 'patient',
      source_id: newRecord.id,
      metadata: { category: record.category, hospital: record.hospital_name },
    });

    // Audit log
    this.addAuditLog({
      actor_id: record.patient_id,
      action: 'UPLOAD_MEDICAL_RECORD',
      entity_type: 'medical_records',
      entity_id: newRecord.id,
      details: { title: record.title, category: record.category, file_size: record.file_size },
    });

    return newRecord;
  }

  public deleteMedicalRecord(recordId: string, patientId: string): boolean {
    const idx = this.medicalRecords.findIndex(r => r.id === recordId && r.patient_id === patientId);
    if (idx === -1) return false;

    this.medicalRecords.splice(idx, 1);
    this.save('records', this.medicalRecords);

    // Remove any associated active shares
    this.recordShares = this.recordShares.filter(s => s.record_id !== recordId);
    this.save('record_shares', this.recordShares);

    this.addAuditLog({
      actor_id: patientId,
      action: 'DELETE_MEDICAL_RECORD',
      entity_type: 'medical_records',
      entity_id: recordId,
    });

    return true;
  }

  public updateMedicalRecord(recordId: string, patientId: string, updates: Partial<MedicalRecord>): MedicalRecord | null {
    const idx = this.medicalRecords.findIndex(r => r.id === recordId && r.patient_id === patientId);
    if (idx === -1) return null;
    this.medicalRecords[idx] = { ...this.medicalRecords[idx], ...updates };
    this.save('records', this.medicalRecords);
    return this.medicalRecords[idx];
  }

  // --- CONSENT & SHARING MANAGEMENT ---
  public getConsentsForAppointment(appointmentId: string): {
    shares: MedicalRecordShare[];
    historyConsent?: MedicalHistoryConsent;
  } {
    const shares = this.recordShares.filter(s => s.appointment_id === appointmentId);
    const historyConsent = this.historyConsents.find(h => h.appointment_id === appointmentId);
    return { shares, historyConsent };
  }

  public revokeRecordShare(shareId: string, patientId: string): boolean {
    const share = this.recordShares.find(s => s.id === shareId && s.patient_id === patientId);
    if (!share) return false;
    share.revoked_at = new Date().toISOString();
    this.save('record_shares', this.recordShares);

    this.addAuditLog({
      actor_id: patientId,
      action: 'REVOKE_RECORD_SHARE',
      entity_type: 'medical_record_shares',
      entity_id: shareId,
      details: { record_id: share.record_id, doctor_id: share.doctor_id },
    });
    return true;
  }

  public revokeHistoryConsent(consentId: string, patientId: string): boolean {
    const consent = this.historyConsents.find(c => c.id === consentId && c.patient_id === patientId);
    if (!consent) return false;
    consent.revoked_at = new Date().toISOString();
    this.save('history_consents', this.historyConsents);

    this.addAuditLog({
      actor_id: patientId,
      action: 'REVOKE_HISTORY_CONSENT',
      entity_type: 'medical_history_consents',
      entity_id: consentId,
      details: { doctor_id: consent.doctor_id },
    });
    return true;
  }

  // --- STRUCTURED PATIENT MEDICAL HISTORY ---
  public getPatientMedicalProfile(patientId: string): PatientMedicalProfile | null {
    return this.patientProfiles[patientId] || null;
  }

  public updatePatientMedicalProfile(patientId: string, profile: Partial<PatientMedicalProfile>): PatientMedicalProfile {
    const existing = this.patientProfiles[patientId] || {
      id: crypto.randomUUID(),
      patient_id: patientId,
      updated_at: new Date().toISOString(),
    };

    const updated: PatientMedicalProfile = {
      ...existing,
      ...profile,
      updated_at: new Date().toISOString(),
    };

    this.patientProfiles[patientId] = updated;
    this.save('patient_profiles', this.patientProfiles);

    this.addAuditLog({
      actor_id: patientId,
      action: 'UPDATE_HEALTH_PROFILE',
      entity_type: 'patient_medical_profiles',
      entity_id: updated.id,
    });

    return updated;
  }

  // Conditions
  public getConditions(patientId: string): MedicalCondition[] {
    return this.conditions.filter(c => c.patient_id === patientId);
  }

  public addCondition(condition: Omit<MedicalCondition, 'id' | 'created_at' | 'updated_at'>): MedicalCondition {
    const newCondition: MedicalCondition = {
      ...condition,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.conditions.push(newCondition);
    this.save('conditions', this.conditions);

    this.addTimelineEvent({
      patient_id: condition.patient_id,
      event_type: 'recorded_diagnosis',
      event_date: condition.diagnosed_date || new Date().toISOString(),
      description: `Condition added: "${condition.condition_name}" (${condition.source_type.replace('_', ' ')}).`,
      source_type: condition.source_type,
      source_id: newCondition.id,
    });

    this.addAuditLog({
      actor_id: condition.recorded_by || condition.patient_id,
      action: 'ADD_MEDICAL_CONDITION',
      entity_type: 'medical_conditions',
      entity_id: newCondition.id,
      details: { condition_name: condition.condition_name, source_type: condition.source_type },
    });

    return newCondition;
  }

  public updateCondition(id: string, updates: Partial<MedicalCondition>, actorId: string): MedicalCondition | null {
    const idx = this.conditions.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.conditions[idx] = { ...this.conditions[idx], ...updates, updated_at: new Date().toISOString() };
    this.save('conditions', this.conditions);

    this.addAuditLog({
      actor_id: actorId,
      action: 'UPDATE_MEDICAL_CONDITION',
      entity_type: 'medical_conditions',
      entity_id: id,
      details: updates,
    });

    return this.conditions[idx];
  }

  public deleteCondition(id: string, patientId: string): boolean {
    const idx = this.conditions.findIndex(c => c.id === id && c.patient_id === patientId);
    if (idx === -1) return false;
    this.conditions.splice(idx, 1);
    this.save('conditions', this.conditions);
    return true;
  }

  // Allergies
  public getAllergies(patientId: string): PatientAllergy[] {
    return this.allergies.filter(a => a.patient_id === patientId);
  }

  public addAllergy(allergy: Omit<PatientAllergy, 'id' | 'created_at' | 'updated_at'>): PatientAllergy {
    const newAllergy: PatientAllergy = {
      ...allergy,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.allergies.push(newAllergy);
    this.save('allergies', this.allergies);

    this.addAuditLog({
      actor_id: allergy.recorded_by || allergy.patient_id,
      action: 'ADD_ALLERGY',
      entity_type: 'patient_allergies',
      entity_id: newAllergy.id,
      details: { allergen: allergy.allergen, severity: allergy.severity },
    });

    return newAllergy;
  }

  public deleteAllergy(id: string, patientId: string): boolean {
    const idx = this.allergies.findIndex(a => a.id === id && a.patient_id === patientId);
    if (idx === -1) return false;
    this.allergies.splice(idx, 1);
    this.save('allergies', this.allergies);
    return true;
  }

  // Medications
  public getMedications(patientId: string): PatientMedication[] {
    return this.medications.filter(m => m.patient_id === patientId);
  }

  public addMedication(med: Omit<PatientMedication, 'id' | 'created_at'>): PatientMedication {
    const newMed: PatientMedication = {
      ...med,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.medications.push(newMed);
    this.save('medications', this.medications);

    this.addTimelineEvent({
      patient_id: med.patient_id,
      event_type: 'medication_change',
      event_date: med.start_date,
      description: `Medication started: "${med.medicine_name}" (${med.dosage}, ${med.frequency}).`,
      source_type: med.source_type,
      source_id: newMed.id,
    });

    this.addAuditLog({
      actor_id: med.patient_id,
      action: 'ADD_MEDICATION',
      entity_type: 'patient_medications',
      entity_id: newMed.id,
      details: { medicine_name: med.medicine_name, dosage: med.dosage },
    });

    return newMed;
  }

  public deleteMedication(id: string, patientId: string): boolean {
    const idx = this.medications.findIndex(m => m.id === id && m.patient_id === patientId);
    if (idx === -1) return false;
    this.medications.splice(idx, 1);
    this.save('medications', this.medications);
    return true;
  }

  // Timeline Events
  public getTimelineEvents(patientId: string): MedicalHistoryEvent[] {
    return this.timelineEvents
      .filter(t => t.patient_id === patientId)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }

  public addTimelineEvent(event: Omit<MedicalHistoryEvent, 'id' | 'created_at'>): MedicalHistoryEvent {
    const newEvent: MedicalHistoryEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.timelineEvents.unshift(newEvent);
    this.save('timeline', this.timelineEvents);
    return newEvent;
  }

  // --- CONSULTATION NOTES ---
  public getConsultationNote(appointmentId: string): ConsultationNote | undefined {
    return this.consultationNotes.find(c => c.appointment_id === appointmentId);
  }

  public saveConsultationNote(data: Omit<ConsultationNote, 'id' | 'created_at' | 'updated_at'>): ConsultationNote {
    const existingIdx = this.consultationNotes.findIndex(c => c.appointment_id === data.appointment_id);
    let result: ConsultationNote;

    if (existingIdx !== -1) {
      this.consultationNotes[existingIdx] = {
        ...this.consultationNotes[existingIdx],
        ...data,
        updated_at: new Date().toISOString(),
      };
      result = this.consultationNotes[existingIdx];
    } else {
      result = {
        ...data,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.consultationNotes.push(result);
    }
    this.save('consultation_notes', this.consultationNotes);

    // Auto mark appointment as completed
    const aptIdx = this.appointments.findIndex(a => a.id === data.appointment_id);
    if (aptIdx !== -1) {
      this.appointments[aptIdx].status = 'completed';
      this.appointments[aptIdx].updated_at = new Date().toISOString();
      this.save('appointments', this.appointments);
    }

    // Auto-record in patient timeline
    const doctor = this.getDoctorById(data.doctor_id);
    this.addTimelineEvent({
      patient_id: data.patient_id,
      event_type: 'consultation_summary',
      event_date: new Date().toISOString(),
      description: `Clinical consultation summary documented by ${doctor?.profile?.full_name}: Diagnosis "${data.diagnosis}".`,
      source_type: 'doctor',
      source_id: result.id,
      metadata: {
        diagnosis: data.diagnosis,
        treatment_plan: data.treatment_plan,
        prescription: data.prescription_details,
      },
    });

    // Notify patient
    this.addNotification({
      user_id: data.patient_id,
      appointment_id: data.appointment_id,
      title: 'Consultation Note Added',
      message: `${doctor?.profile?.full_name} has recorded your clinical notes and prescriptions.`,
      notification_type: 'consultation_completed',
    });

    // Audit log
    this.addAuditLog({
      actor_id: doctor?.user_id || data.doctor_id,
      action: 'SAVE_CLINICAL_NOTE',
      entity_type: 'consultation_notes',
      entity_id: result.id,
      details: { appointment_id: data.appointment_id, diagnosis: data.diagnosis },
    });

    return result;
  }

  // --- DOCTOR VERIFICATION & ADMIN ---
  public verifyDoctor(doctorId: string, adminId: string, status: 'verified' | 'rejected' | 'suspended', reason?: string): Doctor {
    const docIdx = this.doctors.findIndex(d => d.id === doctorId);
    if (docIdx === -1) throw new Error('Doctor not found');

    this.doctors[docIdx].verification_status = status;
    this.doctors[docIdx].updated_at = new Date().toISOString();
    this.save('doctors', this.doctors);

    const doc = this.doctors[docIdx];

    // Notify doctor
    if (doc.user_id) {
      this.addNotification({
        user_id: doc.user_id,
        title: `Doctor Verification: ${status.toUpperCase()}`,
        message: status === 'verified'
          ? 'Congratulations! Your medical credentials have been verified by hospital administration. You can now receive patient bookings.'
          : `Your verification status was changed to ${status}. Reason: ${reason || 'Administrative review'}.`,
        notification_type: 'verification_update',
      });
    }

    // Audit log
    this.addAuditLog({
      actor_id: adminId,
      action: `VERIFY_DOCTOR_${status.toUpperCase()}`,
      entity_type: 'doctors',
      entity_id: doctorId,
      details: { reason, status },
    });

    return this.getDoctorById(doctorId)!;
  }

  // --- NOTIFICATIONS ---
  public getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: crypto.randomUUID(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    this.save('notifications', this.notifications);
    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.is_read = true;
      this.save('notifications', this.notifications);
    }
  }

  public markAllNotificationsRead(userId: string): void {
    this.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.save('notifications', this.notifications);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs
      .map(log => ({
        ...log,
        actor_profile: log.actor_id ? this.getProfileById(log.actor_id) : undefined,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.save('audit_logs', this.auditLogs);
  }

  // --- METRICS & REPORTING ---
  public getAdminStats() {
    const totalPatients = this.profiles.filter(p => p.role === 'patient').length;
    const totalDoctors = this.doctors.length;
    const verifiedDoctors = this.doctors.filter(d => d.verification_status === 'verified').length;
    const pendingVerifications = this.doctors.filter(d => d.verification_status === 'pending').length;
    const totalAppointments = this.appointments.length;
    const upcomingAppointments = this.appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
    const cancelledCount = this.appointments.filter(a => a.status === 'cancelled').length;
    const completedCount = this.appointments.filter(a => a.status === 'completed').length;
    const cancellationRate = totalAppointments > 0 ? Math.round((cancelledCount / totalAppointments) * 100) : 0;
    const completionRate = totalAppointments > 0 ? Math.round((completedCount / totalAppointments) * 100) : 0;

    // Dept stats
    const deptCount: Record<string, number> = {};
    for (const apt of this.appointments) {
      const doc = this.doctors.find(d => d.id === apt.doctor_id);
      if (doc) {
        deptCount[doc.specialization] = (deptCount[doc.specialization] || 0) + 1;
      }
    }

    return {
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      pendingVerifications,
      totalAppointments,
      upcomingAppointments,
      cancelledCount,
      completedCount,
      cancellationRate,
      completionRate,
      deptCount,
      hospitalsCount: this.hospitals.length,
    };
  }

  public getDoctorStats(doctorId: string) {
    const doctorAppointments = this.appointments.filter(a => a.doctor_id === doctorId);
    const todayStr = new Date().toISOString().slice(0, 10);

    const todayCount = doctorAppointments.filter(a => {
      const slot = this.slots.find(s => s.id === a.slot_id);
      return slot && slot.start_time.startsWith(todayStr);
    }).length;

    const pendingCount = doctorAppointments.filter(a => a.status === 'pending').length;
    const confirmedCount = doctorAppointments.filter(a => a.status === 'confirmed').length;
    const completedCount = doctorAppointments.filter(a => a.status === 'completed').length;
    const cancelledCount = doctorAppointments.filter(a => a.status === 'cancelled').length;

    return {
      total: doctorAppointments.length,
      todayCount,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      cancellationRate: doctorAppointments.length > 0 ? Math.round((cancelledCount / doctorAppointments.length) * 100) : 0,
    };
  }
}

// Global Singleton
export const db = new DatabaseEngine();
