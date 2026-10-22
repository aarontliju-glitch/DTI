// Automated Verification Suite for Doctor Appointment Booker
// Tests atomic slot locking, role-based authorization, consent sharing, and revocation

import assert from 'assert';

console.log('🧪 Starting Security & Workflow Automated Test Suite...\n');

// Mock localStorage for Node environment test run
const memoryStore: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, val: string) => { memoryStore[key] = val; },
  removeItem: (key: string) => { delete memoryStore[key]; }
};

// Import database engine and seed data
const { db } = await import('../src/lib/databaseService.ts');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASSED: ${name}`);
    testsPassed++;
  } catch (err: any) {
    console.error(`  ❌ FAILED: ${name}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

// TEST 1: Doctor search and filter
runTest('Doctors search returns verified specialists', () => {
  const doctors = db.searchDoctors({ specialization: 'Cardiology', verifiedOnly: true });
  assert.ok(doctors.length > 0, 'Should find at least 1 verified cardiologist');
  assert.strictEqual(doctors[0].specialization, 'Cardiology');
  assert.strictEqual(doctors[0].verification_status, 'verified');
});

// TEST 2: Availability slot retrieval
runTest('Doctor availability slots retrieved correctly', () => {
  const doctorId = 'dddddddd-1111-1111-1111-111111111101';
  const slots = db.getDoctorSlots(doctorId);
  assert.ok(slots.length > 0, 'Should retrieve calendar slots');
  assert.strictEqual(slots[0].doctor_id, doctorId);
});

// TEST 3: Atomic appointment booking
let bookedSlotId = '';
let newAppointmentId = '';
runTest('Patient books an available appointment slot atomically', () => {
  const doctorId = 'dddddddd-1111-1111-1111-111111111101';
  const availableSlots = db.getDoctorSlots(doctorId).filter(s => s.status === 'available');
  assert.ok(availableSlots.length > 0, 'Should have an available slot to book');
  
  bookedSlotId = availableSlots[0].id;
  const result = db.bookAppointmentAtomic({
    patient_id: 'c0000000-0000-0000-0000-000000000001',
    doctor_id: doctorId,
    slot_id: bookedSlotId,
    reason_for_visit: 'Chest discomfort on exertion and routine BP evaluation',
    shared_record_ids: ['rrrrrrrr-1111-1111-1111-111111111101'],
    shared_sections: ['conditions', 'allergies', 'medications'],
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.appointment.id, 'Should generate an appointment ID');
  newAppointmentId = result.appointment.id;

  // Slot must now be marked as booked!
  const updatedSlot = db.getDoctorSlots(doctorId).find(s => s.id === bookedSlotId);
  assert.strictEqual(updatedSlot?.status, 'booked', 'Slot status must transition to booked');
});

// TEST 4: Race condition / Double-booking prevention
runTest('Double booking is strictly prevented on the same slot', () => {
  const doctorId = 'dddddddd-1111-1111-1111-111111111101';
  let errorThrown = false;
  try {
    db.bookAppointmentAtomic({
      patient_id: 'c0000000-0000-0000-0000-000000000002',
      doctor_id: doctorId,
      slot_id: bookedSlotId, // Already booked in previous test!
      reason_for_visit: 'Concurrent booking attempt by another patient',
    });
  } catch (err: any) {
    errorThrown = true;
    assert.match(err.message, /no longer available/i);
  }
  assert.strictEqual(errorThrown, true, 'Backend must reject booking an already reserved slot');
});

// TEST 5: Doctor views authorized patient data under consent
runTest('Doctor can inspect only consented medical records', () => {
  const doctorId = 'dddddddd-1111-1111-1111-111111111101';
  const authorizedRecords = db.getDoctorAuthorizedRecords(newAppointmentId, doctorId);
  assert.strictEqual(authorizedRecords.length, 1, 'Doctor should see exactly 1 shared document');
  assert.strictEqual(authorizedRecords[0].id, 'rrrrrrrr-1111-1111-1111-111111111101');
});

// TEST 6: Consent revocation blocks future access
runTest('Patient can revoke document consent and immediately block access', () => {
  const patientId = 'c0000000-0000-0000-0000-000000000001';
  const doctorId = 'dddddddd-1111-1111-1111-111111111101';
  const consentInfo = db.getConsentsForAppointment(newAppointmentId);
  assert.ok(consentInfo.shares.length > 0, 'Should have active share');

  const shareId = consentInfo.shares[0].id;
  const revoked = db.revokeRecordShare(shareId, patientId);
  assert.strictEqual(revoked, true, 'Share revocation should succeed');

  // Verify doctor can NO LONGER see the record
  const afterRevokeRecords = db.getDoctorAuthorizedRecords(newAppointmentId, doctorId);
  assert.strictEqual(afterRevokeRecords.length, 0, 'Revoked record must be immediately hidden from doctor');
});

// TEST 7: Doctor accepts appointment
runTest('Doctor accepts pending appointment', () => {
  const doctorUserId = 'd0000000-0000-0000-0000-000000000001';
  const updated = db.updateAppointmentStatus(newAppointmentId, 'confirmed', doctorUserId);
  assert.strictEqual(updated.status, 'confirmed');
});

// TEST 8: Doctor writes signed clinical notes
runTest('Doctor documents clinical consultation notes and prescription', () => {
  const note = db.saveConsultationNote({
    appointment_id: newAppointmentId,
    patient_id: 'c0000000-0000-0000-0000-000000000001',
    doctor_id: 'dddddddd-1111-1111-1111-111111111101',
    symptoms: 'Patient reports morning dizziness with BP 142/90.',
    observations: 'Sitting BP 136/86 mmHg. S1S2 normal, no murmurs.',
    diagnosis: 'Stage 1 Essential Hypertension with good medication tolerance.',
    treatment_plan: 'Continue low sodium diet. 30 mins aerobic walking.',
    prescription_details: 'Tab Telmisartan 40mg once daily x 90 days.',
    follow_up_recommendations: 'Follow up in 6 months with home BP diary.',
    follow_up_date: '2025-07-20',
  });

  assert.ok(note.id, 'Should create signed consultation note');
  assert.strictEqual(note.diagnosis, 'Stage 1 Essential Hypertension with good medication tolerance.');

  // Appointment must automatically transition to completed
  const apt = db.getAppointmentById(newAppointmentId);
  assert.strictEqual(apt?.status, 'completed', 'Appointment must be marked completed upon note submission');
});

// TEST 9: Admin verifies pending doctor
runTest('Hospital administrator verifies pending doctor credentials', () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const pendingDocId = 'dddddddd-1111-1111-1111-111111111105'; // Dr. Kavita Reddy (Orthopedics)

  const docBefore = db.getDoctorById(pendingDocId);
  assert.strictEqual(docBefore?.verification_status, 'pending');

  const verifiedDoc = db.verifyDoctor(pendingDocId, adminId, 'verified');
  assert.strictEqual(verifiedDoc.verification_status, 'verified', 'Doctor must now have verified status');
});

// TEST 10: Patient cancellation frees slot
runTest('Patient cancellation frees slot for other patients', () => {
  const patientId = 'c0000000-0000-0000-0000-000000000001';
  const doctorId = 'dddddddd-1111-1111-1111-111111111102';
  const slots = db.getDoctorSlots(doctorId).filter(s => s.status === 'available');
  assert.ok(slots.length > 0);

  const slotId = slots[0].id;
  const booking = db.bookAppointmentAtomic({
    patient_id: patientId,
    doctor_id: doctorId,
    slot_id: slotId,
    reason_for_visit: 'Migraine consultation',
  });

  // Verify slot is booked
  let slot = db.getDoctorSlots(doctorId).find(s => s.id === slotId);
  assert.strictEqual(slot?.status, 'booked');

  // Cancel appointment
  db.updateAppointmentStatus(booking.appointment.id, 'cancelled', patientId, {
    cancellation_reason: 'Resolved symptoms with hydration and rest',
  });

  // Slot should be restored to available
  slot = db.getDoctorSlots(doctorId).find(s => s.id === slotId);
  assert.strictEqual(slot?.status, 'available', 'Cancelled appointment slot must be released back to available');
});

console.log(`\n========================================`);
console.log(`Results: ${testsPassed} Passed, ${testsFailed} Failed.`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All 10 security, authorization, and clinical tests PASSED flawlessly!');
}
