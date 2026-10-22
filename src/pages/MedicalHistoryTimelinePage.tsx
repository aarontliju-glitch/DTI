import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/databaseService';
import { 
  History, 
  Calendar, 
  FileText, 
  Activity, 
  Pill, 
  Stethoscope, 
  ArrowLeft, 
  ShieldCheck, 
  Upload, 
  Eye,
  CheckCircle2
} from 'lucide-react';

export const MedicalHistoryTimelinePage: React.FC = () => {
  const { currentUser } = useAuth();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const events = db.getTimelineEvents(patientId);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-brand-600" />;
      case 'consultation_summary':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'recorded_diagnosis':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'medication_change':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'uploaded_report':
        return <Upload className="w-4 h-4 text-emerald-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventBadgeClass = (eventType: string) => {
    switch (eventType) {
      case 'appointment':
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'consultation_summary':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'recorded_diagnosis':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'medication_change':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'uploaded_report':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back link */}
      <div>
        <Link to="/medical-history" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Medical History
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
          <History className="w-4 h-4" />
          Audit-Verified Healthcare Ledger
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Chronological Health Timeline
        </h1>
        <p className="text-xs text-slate-600 max-w-xl">
          A longitudinal timeline tracking doctor visits, clinical diagnoses, medication regimens, and document uploads over time.
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Dot node */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition">
              {getEventIcon(event.event_type)}
            </div>

            {/* Event Content Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getEventBadgeClass(event.event_type)}`}>
                    {event.event_type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    Source: {event.source_type}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800">
                  {new Date(event.event_date).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {event.description}
              </p>

              {/* Extra Metadata Details */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  {event.metadata.doctor_name && (
                    <p><strong>Doctor:</strong> {event.metadata.doctor_name} ({event.metadata.specialization})</p>
                  )}
                  {event.metadata.hospital && (
                    <p><strong>Hospital:</strong> {event.metadata.hospital}</p>
                  )}
                  {event.metadata.diagnosis && (
                    <p><strong>Clinical Diagnosis:</strong> {event.metadata.diagnosis}</p>
                  )}
                  {event.metadata.treatment_plan && (
                    <p><strong>Treatment Plan:</strong> {event.metadata.treatment_plan}</p>
                  )}
                </div>
              )}

              {/* Connected Entity Links */}
              {event.source_id && (
                <div className="pt-1 flex items-center justify-end">
                  {event.event_type === 'appointment' ? (
                    <Link
                      to={`/appointments/${event.source_id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <span>View Appointment</span>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  ) : event.event_type === 'uploaded_report' ? (
                    <Link
                      to="/medical-records"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <span>Open Document in Vault</span>
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
