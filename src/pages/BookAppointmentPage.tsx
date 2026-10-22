import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { VerifiedDoctorBadge } from '../components/common/Badge';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  Clock, 
  Building2, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  User,
  Heart,
  Droplet
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [searchParams] = useSearchParams();
  const preselectedSlotId = searchParams.get('slot') || '';
  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const doctor = doctorId ? db.getDoctorById(doctorId) : undefined;
  const patientRecords = db.getPatientRecords(patientId);
  const patientHealth = db.getPatientMedicalProfile(patientId);
  const allergies = db.getAllergies(patientId);
  const conditions = db.getConditions(patientId);
  const slots = doctorId ? db.getDoctorSlots(doctorId).filter(s => s.status === 'available') : [];

  // Stepper state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [selectedSlotId, setSelectedSlotId] = useState<string>(preselectedSlotId);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [sharedSections, setSharedSections] = useState<string[]>([
    'conditions',
    'allergies',
    'medications',
  ]);
  const [hasConsented, setHasConsented] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessAptId, setBookingSuccessAptId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedSlotId && slots.some(s => s.id === preselectedSlotId)) {
      setSelectedSlotId(preselectedSlotId);
      // If slot already selected from profile, advance to step 2
      setStep(2);
    }
  }, [preselectedSlotId]);

  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Doctor not found</h2>
        <Link to="/doctors" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Return to Doctors Directory
        </Link>
      </div>
    );
  }

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSectionSelection = (section: string) => {
    setSharedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleConfirmBooking = () => {
    if (!selectedSlotId) {
      showToast('error', 'Please select an appointment slot.');
      return;
    }
    if (!reasonForVisit.trim()) {
      showToast('error', 'Please specify the symptoms or reason for your consultation.');
      return;
    }
    if (!hasConsented) {
      showToast('error', 'Please accept the consent terms for consultation.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute Atomic Database Booking
      const result = db.bookAppointmentAtomic({
        patient_id: patientId,
        doctor_id: doctor.id,
        slot_id: selectedSlotId,
        reason_for_visit: reasonForVisit.trim(),
        shared_record_ids: selectedRecordIds,
        shared_sections: sharedSections,
      });

      if (result.success) {
        setBookingSuccessAptId(result.appointment.id);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('success', 'Appointment successfully requested! Doctor notified.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Unable to book appointment slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (bookingSuccessAptId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointment Request Sent!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Your appointment slot with <strong>{doctor.profile?.full_name}</strong> has been atomically reserved. Dr. {doctor.profile?.full_name?.split(' ')[1]} has been notified.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Appointment ID:</span>
            <span className="font-mono font-semibold text-slate-800">{bookingSuccessAptId.slice(0, 13)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hospital:</span>
            <span className="font-semibold text-slate-800">{doctor.hospital?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-semibold text-slate-800">₹{doctor.consultation_fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Shared Medical Records:</span>
            <span className="font-semibold text-slate-800">{selectedRecordIds.length} documents</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to={`/appointments/${bookingSuccessAptId}`}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow transition"
          >
            View Appointment Details
          </Link>
          <Link
            to="/appointments"
            className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            My Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to={`/doctors/${doctor.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctor Profile
        </Link>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
              alt={doctor.profile?.full_name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-base">{doctor.profile?.full_name}</h2>
                <VerifiedDoctorBadge status={doctor.verification_status} />
              </div>
              <p className="text-xs text-brand-600 font-semibold">{doctor.specialization} • {doctor.hospital?.name}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Fee</span>
            <span className="text-base font-extrabold text-slate-900">₹{doctor.consultation_fee}</span>
          </div>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <div className={`p-2 rounded-xl border transition ${step === 1 ? 'bg-brand-50 border-brand-500 text-brand-700' : step > 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            1. Select Slot
          </div>
          <div className={`p-2 rounded-xl border transition ${step === 2 ? 'bg-brand-50 border-brand-500 text-brand-700' : step > 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            2. Visit Reason
          </div>
          <div className={`p-2 rounded-xl border transition ${step === 3 ? 'bg-brand-50 border-brand-500 text-brand-700' : step > 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            3. Share Medical Data
          </div>
          <div className={`p-2 rounded-xl border transition ${step === 4 ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            4. Review & Book
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT SLOT */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Step 1: Choose an Available Consultation Slot
          </h3>

          {slots.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No available slots found for Dr. {doctor.profile?.full_name}. Please choose another doctor.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map(s => {
                const dateObj = new Date(s.start_time);
                const isSelected = selectedSlotId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-75">
                      {dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm font-extrabold block my-0.5">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] block opacity-75">30 mins</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              disabled={!selectedSlotId}
              onClick={() => setStep(2)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                selectedSlotId ? 'bg-brand-600 text-white hover:bg-brand-700 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Patient Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REASON FOR VISIT & PATIENT DETAILS */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Step 2: Reason for Visit & Patient Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name:</span>
              <span className="font-bold text-slate-800">{currentUser?.full_name || 'Rahul Verma'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Contact Phone:</span>
              <span className="font-bold text-slate-800">{currentUser?.phone || '+91 91234 56789'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Symptoms & Reason for Consultation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="e.g. Experiencing persistent headaches and dizziness over the past 5 days. Need review of recent blood tests."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              Clear symptoms assist Dr. {doctor.profile?.full_name?.split(' ')[1]} in preparing for your consultation.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Slot</span>
            </button>
            <button
              disabled={!reasonForVisit.trim()}
              onClick={() => setStep(3)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                reasonForVisit.trim() ? 'bg-brand-600 text-white hover:bg-brand-700 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Health Sharing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SHARE MEDICAL INFORMATION WITH YOUR DOCTOR */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
              <Lock className="w-3.5 h-3.5" />
              Consent-Based Access Control
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Share Medical Information With Your Doctor
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Your health history remains strictly private unless you authorize access. Choose the medical information you want Dr. {doctor.profile?.full_name} to see for this consultation.
            </p>
          </div>

          {/* Section Consents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Health Profile Sections to Share
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sharedSections.includes('conditions')}
                  onChange={() => toggleSectionSelection('conditions')}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Existing Conditions</span>
                  <span className="text-[11px] text-slate-500">{conditions.length} recorded</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sharedSections.includes('allergies')}
                  onChange={() => toggleSectionSelection('allergies')}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-rose-700 block">Known Drug Allergies</span>
                  <span className="text-[11px] text-slate-500">{allergies.length} recorded (Crucial)</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sharedSections.includes('medications')}
                  onChange={() => toggleSectionSelection('medications')}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Active Medications</span>
                  <span className="text-[11px] text-slate-500">Prescription drugs</span>
                </div>
              </label>
            </div>
          </div>

          {/* Uploaded Documents to Share */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Uploaded Medical Records to Share (Optional)
            </h4>

            {patientRecords.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl">
                No uploaded records in your vault yet. You can upload laboratory reports later.
              </p>
            ) : (
              <div className="space-y-2">
                {patientRecords.map(rec => {
                  const isChecked = selectedRecordIds.includes(rec.id);
                  return (
                    <label
                      key={rec.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                        isChecked ? 'bg-brand-50/60 border-brand-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRecordSelection(rec.id)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">{rec.title}</span>
                          <span className="text-[11px] text-slate-500">
                            {rec.hospital_name || 'Medical Report'} • {rec.record_date}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {rec.category.replace('_', ' ')}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-2 cursor-pointer"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Step 4: Review Booking Summary
          </h3>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-medium">Specialist Doctor:</span>
                <span className="font-bold text-slate-800 text-sm">{doctor.profile?.full_name}</span>
                <span className="text-brand-600 block">{doctor.specialization}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Hospital Affiliation:</span>
                <span className="font-bold text-slate-800">{doctor.hospital?.name}</span>
                <span className="text-slate-500 block">{doctor.hospital?.address}, {doctor.hospital?.city}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block font-medium">Confirmed Time Slot:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedSlot ? new Date(selectedSlot.start_time).toLocaleDateString([], {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : ''}
                </span>
                <span className="text-brand-600 font-semibold block">
                  {selectedSlot ? new Date(selectedSlot.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : ''} (30 mins)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Consultation Fee:</span>
                <span className="font-bold text-slate-900 text-base">₹{doctor.consultation_fee}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block font-medium">Reason for Consultation:</span>
              <p className="italic text-slate-700 font-medium">"{reasonForVisit}"</p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block font-medium">Authorized Data Sharing:</span>
              <p className="text-slate-700">
                Shared sections: <strong>{sharedSections.join(', ')}</strong> | Shared documents:{' '}
                <strong>{selectedRecordIds.length}</strong>
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-teal-50 border border-teal-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
            />
            <div className="text-xs text-teal-950">
              <span className="font-bold block">Patient Consent & Privacy Agreement</span>
              <p className="text-teal-800 mt-0.5 leading-relaxed">
                I authorize Dr. {doctor.profile?.full_name} to access the specified medical records and health history for the duration of this consultation. I understand that I may revoke future access at any time through my patient dashboard.
              </p>
            </div>
          </label>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sharing</span>
            </button>

            <button
              disabled={isSubmitting || !hasConsented}
              onClick={handleConfirmBooking}
              className={`px-8 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 transition flex items-center gap-2 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Reserving Slot Atomically...' : 'Confirm Appointment Booking'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
