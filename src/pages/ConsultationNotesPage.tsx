import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { 
  FileText, 
  Stethoscope, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Pill, 
  Calendar, 
  Building2, 
  User, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ConsultationNotesPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { currentUser, doctorProfile } = useAuth();
  const { showToast } = useNotification();

  const appointment = appointmentId ? db.getAppointmentById(appointmentId) : undefined;
  const existingNote = appointmentId ? db.getConsultationNote(appointmentId) : undefined;

  const doctorId = appointment?.doctor_id || doctorProfile?.id || 'dddddddd-1111-1111-1111-111111111101';
  const patientId = appointment?.patient_id || 'c0000000-0000-0000-0000-000000000001';

  // Form states
  const [symptoms, setSymptoms] = useState(existingNote?.symptoms || appointment?.reason_for_visit || '');
  const [observations, setObservations] = useState(existingNote?.observations || '');
  const [diagnosis, setDiagnosis] = useState(existingNote?.diagnosis || '');
  const [treatmentPlan, setTreatmentPlan] = useState(existingNote?.treatment_plan || '');
  const [prescriptionDetails, setPrescriptionDetails] = useState(existingNote?.prescription_details || '');
  const [followUpRecommendations, setFollowUpRecommendations] = useState(existingNote?.follow_up_recommendations || '');
  const [followUpDate, setFollowUpDate] = useState(existingNote?.follow_up_date || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Appointment Record Not Found</h2>
        <Link to="/doctor/appointments" className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Back to Appointments
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !observations.trim() || !diagnosis.trim() || !treatmentPlan.trim()) {
      setError('Please complete the mandatory clinical fields: Symptoms, Observations, Diagnosis, and Treatment Plan.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      db.saveConsultationNote({
        appointment_id: appointment.id,
        patient_id: patientId,
        doctor_id: doctorId,
        symptoms: symptoms.trim(),
        observations: observations.trim(),
        diagnosis: diagnosis.trim(),
        treatment_plan: treatmentPlan.trim(),
        prescription_details: prescriptionDetails.trim() || undefined,
        follow_up_recommendations: followUpRecommendations.trim() || undefined,
        follow_up_date: followUpDate || undefined,
      });

      showToast('success', 'Clinical consultation note successfully signed and stored.');
      navigate('/doctor/appointments');
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical note.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/doctor/appointments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Appointments
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              <Stethoscope className="w-4 h-4" />
              Doctor Clinical Documentation
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Record Consultation Notes & Prescription
            </h1>
            <p className="text-xs text-slate-500">
              Document clinical findings, established diagnosis, treatment plan, and prescription. Saving will mark this appointment as Completed and log to patient history.
            </p>
          </div>

          <Link
            to={`/doctor/patient/${patientId}?appointment=${appointment.id}`}
            className="px-4 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition self-start sm:self-auto"
          >
            Inspect Patient History →
          </Link>
        </div>

        {/* Patient Reference Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Patient:</span>
            <span className="font-bold text-slate-800 text-sm">{appointment.patient?.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Appointment Scheduled:</span>
            <span className="font-semibold text-slate-800">
              {appointment.slot ? new Date(appointment.slot.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Hospital Facility:</span>
            <span className="font-semibold text-slate-800">{appointment.doctor?.hospital?.name}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clinical Notes Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Reported Symptoms & Chief Complaints <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Patient presents with elevated morning blood pressure (145/92 mmHg) and occasional occipital headaches..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Clinical Examination & Diagnostic Observations <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g. BP 138/88 seated right arm. Pulse 74 bpm regular. Heart sounds S1S2 present, lungs clear. Resting ECG shows normal sinus rhythm..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Established Clinical Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension (Stage 1), Primary Hypercholesterolemia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Treatment Plan & Lifestyle Modifications <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="e.g. Initiate low sodium DASH diet (<2g sodium/day). Daily 30-minute brisk walk. Weekly home BP monitoring log..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-brand-600" />
              Prescription Details (Medicines, Dosages & Regimen)
            </label>
            <textarea
              rows={4}
              value={prescriptionDetails}
              onChange={(e) => setPrescriptionDetails(e.target.value)}
              placeholder="e.g.
1. Tab. Telmisartan 40mg — 1 tablet once daily in the morning (after food) x 90 days.
2. Tab. Atorvastatin 10mg — 1 tablet at bedtime x 60 days."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Follow-up Advice & Recommendations</label>
              <input
                type="text"
                value={followUpRecommendations}
                onChange={(e) => setFollowUpRecommendations(e.target.value)}
                placeholder="e.g. Repeat Lipid profile and serum electrolytes before next visit."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Recommended Follow-up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Notes are cryptographically timestamped and signed with your clinician profile.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Signing & Storing...' : 'Sign & Complete Consultation'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
