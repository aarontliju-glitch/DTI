import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge, VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  Calendar, 
  Clock, 
  Building2, 
  MapPin, 
  FileText, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Stethoscope,
  Pill,
  Download,
  Eye,
  FileCheck2
} from 'lucide-react';

export const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const appointment = id ? db.getAppointmentById(id) : undefined;
  const consentInfo = id ? db.getConsentsForAppointment(id) : { shares: [], historyConsent: undefined };

  const [shares, setShares] = useState(consentInfo.shares);
  const [historyConsent, setHistoryConsent] = useState(consentInfo.historyConsent);
  const [previewRecord, setPreviewRecord] = useState<any | null>(null);

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Appointment Not Found</h2>
        <Link to="/appointments" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Back to Appointments
        </Link>
      </div>
    );
  }

  const handleRevokeRecord = (shareId: string) => {
    if (!currentUser) return;
    const success = db.revokeRecordShare(shareId, currentUser.id);
    if (success) {
      showToast('info', 'Doctor access to this document has been revoked.');
      if (id) {
        const updated = db.getConsentsForAppointment(id);
        setShares(updated.shares);
      }
    }
  };

  const handleRevokeHistory = () => {
    if (!currentUser || !historyConsent) return;
    const success = db.revokeHistoryConsent(historyConsent.id, currentUser.id);
    if (success) {
      showToast('info', 'Health history consent revoked for this appointment.');
      if (id) {
        const updated = db.getConsentsForAppointment(id);
        setHistoryConsent(updated.historyConsent);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/appointments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to My Appointments
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={appointment.doctor?.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
              alt={appointment.doctor?.profile?.full_name}
              className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{appointment.doctor?.profile?.full_name}</h1>
                {appointment.doctor && <VerifiedDoctorBadge status={appointment.doctor.verification_status} />}
              </div>
              <p className="text-xs font-semibold text-brand-600">{appointment.doctor?.specialization}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {appointment.doctor?.hospital?.name} • {appointment.doctor?.hospital?.city}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <StatusBadge status={appointment.status} />
            <span className="text-[11px] font-mono text-slate-400">Ref: {appointment.id}</span>
          </div>
        </div>

        {/* Schedule & Reason Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium block">Appointment Time</span>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>
                {appointment.slot ? new Date(appointment.slot.start_time).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }) : 'TBD'}
              </span>
            </div>
            <span className="text-brand-600 font-semibold block">
              {appointment.slot ? new Date(appointment.slot.start_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) : ''} (30 mins duration)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 md:col-span-2">
            <span className="text-slate-400 font-medium block">Reason for Consultation</span>
            <p className="italic text-slate-700 leading-relaxed font-medium">"{appointment.reason_for_visit}"</p>
          </div>
        </div>
      </div>

      {/* Doctor Consultation Notes (If Completed) */}
      {appointment.consultation_note && (
        <div className="bg-white rounded-3xl border border-blue-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Signed Clinical Consultation Summary</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Signed by Dr. {appointment.doctor?.profile?.full_name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Patient Symptoms</span>
                <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {appointment.consultation_note.symptoms}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Clinical Observations</span>
                <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {appointment.consultation_note.observations}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Established Diagnosis</span>
                <p className="text-blue-900 font-bold mt-1 leading-relaxed bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                  {appointment.consultation_note.diagnosis}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Treatment Plan & Regimen</span>
                <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {appointment.consultation_note.treatment_plan}
                </p>
              </div>

              {appointment.consultation_note.prescription_details && (
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-brand-600" />
                    Prescription Details
                  </span>
                  <p className="text-slate-800 mt-1 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {appointment.consultation_note.prescription_details}
                  </p>
                </div>
              )}

              {appointment.consultation_note.follow_up_recommendations && (
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Follow-up Advice</span>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {appointment.consultation_note.follow_up_recommendations}
                    {appointment.consultation_note.follow_up_date && (
                      <span className="block font-semibold text-brand-700 mt-1">
                        Recommended Date: {appointment.consultation_note.follow_up_date}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shared Health Information & Consent Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Information Consented with Doctor</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">DPDP Consent Architecture</span>
        </div>

        {/* Structured Sections Consent */}
        {historyConsent && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-teal-900 block">Health History Sections Access</span>
              <p className="text-teal-800">
                Shared categories: <strong>{historyConsent.shared_sections.join(', ')}</strong>
              </p>
              {historyConsent.revoked_at ? (
                <span className="text-rose-600 font-semibold block">Access Revoked on {new Date(historyConsent.revoked_at).toLocaleDateString()}</span>
              ) : (
                <span className="text-teal-700 block">Active consent granted on {new Date(historyConsent.consented_at).toLocaleDateString()}</span>
              )}
            </div>

            {!historyConsent.revoked_at && (
              <button
                onClick={handleRevokeHistory}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold self-start sm:self-auto"
              >
                Revoke History Access
              </button>
            )}
          </div>
        )}

        {/* Uploaded Documents Shares */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Shared Uploaded Medical Documents ({shares.length})
          </h4>

          {shares.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl">
              No specific uploaded documents were shared for this appointment.
            </p>
          ) : (
            <div className="space-y-2">
              {shares.map(share => {
                const record = db.getPatientRecords(appointment.patient_id).find(r => r.id === share.record_id);
                if (!record) return null;

                const isRevoked = Boolean(share.revoked_at);

                return (
                  <div
                    key={share.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200 text-xs gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-brand-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">{record.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {record.category.replace('_', ' ')} • {record.record_date} ({Math.round(record.file_size / 1024)} KB)
                        </span>
                        {isRevoked && (
                          <span className="text-rose-600 font-semibold text-[10px] block mt-0.5">
                            Revoked on {new Date(share.revoked_at!).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setPreviewRecord(record)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      {!isRevoked && (
                        <button
                          onClick={() => handleRevokeRecord(share.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm truncate">{previewRecord.title}</h3>
              <button onClick={() => setPreviewRecord(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p><strong>Category:</strong> {previewRecord.category.replace('_', ' ')}</p>
              <p><strong>Date:</strong> {previewRecord.record_date}</p>
              <p><strong>Facility:</strong> {previewRecord.hospital_name || 'N/A'}</p>
              <p><strong>Clinical Notes:</strong> {previewRecord.notes || 'None recorded'}</p>
              <p><strong>File Type:</strong> {previewRecord.file_type}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewRecord(null)}
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
