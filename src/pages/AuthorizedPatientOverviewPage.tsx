import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/databaseService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Pill, 
  FileText, 
  ArrowLeft, 
  Droplet, 
  Phone, 
  Calendar, 
  Lock, 
  Eye, 
  Building2,
  CheckCircle2,
  User
} from 'lucide-react';

export const AuthorizedPatientOverviewPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment') || '';

  const { doctorProfile } = useAuth();
  const doctorId = doctorProfile?.id || 'dddddddd-1111-1111-1111-111111111101';

  const patient = patientId ? db.getProfileById(patientId) : undefined;
  const healthProfile = patientId ? db.getPatientMedicalProfile(patientId) : null;
  const appointment = appointmentId ? db.getAppointmentById(appointmentId) : undefined;

  // Retrieve Consents
  const consentInfo = appointmentId ? db.getConsentsForAppointment(appointmentId) : { shares: [], historyConsent: undefined };
  const sharedSections = consentInfo.historyConsent?.shared_sections || ['conditions', 'allergies', 'medications'];
  const isHistoryRevoked = Boolean(consentInfo.historyConsent?.revoked_at);

  // Retrieve data conditionally based on active non-revoked consent
  const rawAllergies = patientId ? db.getAllergies(patientId) : [];
  const rawConditions = patientId ? db.getConditions(patientId) : [];
  const rawMedications = patientId ? db.getMedications(patientId) : [];
  const sharedRecords = (appointmentId && doctorId) ? db.getDoctorAuthorizedRecords(appointmentId, doctorId) : [];

  const allergies = (!isHistoryRevoked && sharedSections.includes('allergies')) ? rawAllergies : [];
  const conditions = (!isHistoryRevoked && sharedSections.includes('conditions')) ? rawConditions : [];
  const medications = (!isHistoryRevoked && sharedSections.includes('medications')) ? rawMedications : [];

  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Patient Record Not Found</h2>
        <Link to="/doctor/appointments" className="inline-block px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          Return to Consultation Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/doctor/appointments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Consultation Requests
        </Link>
      </div>

      {/* Top Banner with Patient Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={patient.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={patient.full_name}
              className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{patient.full_name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Consent Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Email: {patient.email} • Contact: {patient.phone || 'Not listed'}
              </p>
              {healthProfile?.date_of_birth && (
                <p className="text-xs text-slate-600">
                  DOB: {healthProfile.date_of_birth} (Age: {new Date().getFullYear() - new Date(healthProfile.date_of_birth).getFullYear()} yrs)
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Group</span>
              <span className="text-base font-extrabold text-slate-900">{healthProfile?.blood_group || 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Height</span>
              <span className="text-base font-extrabold text-slate-900">{healthProfile?.height ? `${healthProfile.height} cm` : 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Weight</span>
              <span className="text-base font-extrabold text-slate-900">{healthProfile?.weight ? `${healthProfile.weight} kg` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Appointment Context */}
        {appointment && (
          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-brand-900 font-bold block">Appointment Consultation Context</span>
              <p className="text-brand-800 italic mt-0.5">"{appointment.reason_for_visit}"</p>
            </div>
            {appointment.slot && (
              <div className="text-right shrink-0">
                <span className="text-slate-500 block text-[11px]">Appointment Slot</span>
                <span className="font-bold text-slate-900">
                  {new Date(appointment.slot.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revocation notice if patient revoked consent */}
      {isHistoryRevoked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Consent Notice:</strong> The patient has revoked general health history consent for this appointment. Only specific authorized medical documents can be accessed.
          </p>
        </div>
      )}

      {/* SECTION 1: ALLERGIES (CRITICAL PATIENT SAFETY CALLOUT) */}
      <div className="bg-white rounded-3xl border border-rose-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-slate-900">Life-Critical Allergy Flags</h2>
        </div>

        {allergies.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No known drug allergies reported or consented.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergies.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950 text-sm">{a.allergen}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    a.severity === 'life_threatening' || a.severity === 'severe'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {a.severity}
                  </span>
                </div>
                <p className="text-rose-900"><strong>Observed Reaction:</strong> {a.reaction}</p>
                {a.notes && <p className="text-slate-600 italic bg-white/70 p-2 rounded-lg">{a.notes}</p>}
                <span className="text-[10px] text-slate-400 block pt-1">
                  Source: {a.source_type === 'clinician_documented' ? 'Clinician Verified' : 'Patient Self-Reported'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE CONDITIONS & MEDICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Medical Conditions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Documented Medical Conditions</h3>
          </div>

          {conditions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No active conditions consented.</p>
          ) : (
            <div className="space-y-3">
              {conditions.map(c => (
                <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.condition_name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.status}
                    </span>
                  </div>
                  {c.description && <p className="text-slate-600 leading-relaxed">{c.description}</p>}
                  <span className="text-[10px] text-slate-400 block">
                    Source: {c.source_type.replace('_', ' ')} • Diagnosed: {c.diagnosed_date || 'Date not recorded'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Pill className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-sm">Active Patient Medications</h3>
          </div>

          {medications.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No active medications consented.</p>
          ) : (
            <div className="space-y-3">
              {medications.map(m => (
                <div key={m.id} className="p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.medicine_name}</span>
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {m.dosage}
                    </span>
                  </div>
                  <p className="text-slate-600">Frequency: {m.frequency}</p>
                  {m.prescribed_by && (
                    <span className="text-[10px] text-slate-400 block">Prescriber: {m.prescribed_by}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: SHARED UPLOADED MEDICAL DOCUMENTS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Consented Medical Documents ({sharedRecords.length})</h3>
          </div>
          <span className="text-xs text-slate-500">Authorized for this consultation</span>
        </div>

        {sharedRecords.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center bg-slate-50 rounded-2xl">
            No uploaded documents were shared for this consultation.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sharedRecords.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-brand-400 transition bg-white space-y-3 flex flex-col justify-between text-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 inline-block">
                    {doc.category.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500">{doc.hospital_name || 'Lab'} • {doc.record_date}</p>
                  {doc.notes && <p className="text-slate-600 italic line-clamp-2 mt-1">{doc.notes}</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{Math.round(doc.file_size / 1024)} KB</span>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action to Record Consultation Note */}
      {appointment && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base">Ready to document clinical findings?</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Save observations, formal diagnosis, treatment regimen, and signed prescription for this patient.
            </p>
          </div>
          <Link
            to={`/doctor/consultation/${appointment.id}`}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs text-white shadow-md transition shrink-0"
          >
            Open Clinical Notes Editor →
          </Link>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm truncate">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <p><strong>Category:</strong> {previewDoc.category.replace('_', ' ')}</p>
              <p><strong>Record Date:</strong> {previewDoc.record_date}</p>
              <p><strong>Healthcare Facility:</strong> {previewDoc.hospital_name || 'N/A'}</p>
              <p><strong>Clinical Context:</strong> {previewDoc.notes || 'None'}</p>
              <p><strong>File Type:</strong> {previewDoc.file_type} ({Math.round(previewDoc.file_size / 1024)} KB)</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
