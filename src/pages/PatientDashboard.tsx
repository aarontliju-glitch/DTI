import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/databaseService';
import { StatusBadge, VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  History,
  Heart,
  Droplet,
  Phone
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const appointments = db.getAppointments({ patient_id: patientId });
  const upcomingAppointment = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'completed');
  const medicalRecords = db.getPatientRecords(patientId);
  const healthProfile = db.getPatientMedicalProfile(patientId);
  const allergies = db.getAllergies(patientId);
  const conditions = db.getConditions(patientId);
  const recentTimeline = db.getTimelineEvents(patientId).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-teal-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Patient Health Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.full_name || 'Rahul Verma'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Track your hospital visits, review consultation summaries, and manage consent-gated medical records with zero wait time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/doctors"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
          <Link
            to="/medical-records/upload"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Record</span>
          </Link>
        </div>
      </div>

      {/* Grid: Upcoming Appointment Spotlight & Vital Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Appointment Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">Next Upcoming Appointment</h3>
            </div>
            {upcomingAppointment && <StatusBadge status={upcomingAppointment.status} />}
          </div>

          {upcomingAppointment ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                <div className="flex items-start gap-4">
                  <img
                    src={upcomingAppointment.doctor?.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
                    alt={upcomingAppointment.doctor?.profile?.full_name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-brand-300"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{upcomingAppointment.doctor?.profile?.full_name}</h4>
                      {upcomingAppointment.doctor && (
                        <VerifiedDoctorBadge status={upcomingAppointment.doctor.verification_status} />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-brand-600">{upcomingAppointment.doctor?.specialization}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {upcomingAppointment.doctor?.hospital?.name}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 shrink-0">
                  <div className="text-xs text-slate-500 font-medium">Scheduled Time</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {upcomingAppointment.slot ? new Date(upcomingAppointment.slot.start_time).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    }) : 'Scheduled'}
                  </div>
                  <div className="text-xs font-semibold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-md inline-block">
                    {upcomingAppointment.slot ? new Date(upcomingAppointment.slot.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : ''}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-700">Reason for visit:</span>
                <p className="italic text-slate-600">"{upcomingAppointment.reason_for_visit}"</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  to={`/appointments/${upcomingAppointment.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  View Appointment Details
                </Link>
                <Link
                  to="/appointments"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Manage or Reschedule →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No upcoming appointments</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need to see a specialist? Search through our verified doctors and pick an open slot.
              </p>
              <Link
                to="/doctors"
                className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow transition"
              >
                Find a Doctor
              </Link>
            </div>
          )}
        </div>

        {/* Vital Health Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Personal Health Card</h3>
            </div>
            <Link to="/profile" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Droplet className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</div>
              <div className="text-base font-extrabold text-slate-900">{healthProfile?.blood_group || 'B+'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Activity className="w-4 h-4 text-brand-500 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400 uppercase font-bold">Height</div>
              <div className="text-base font-extrabold text-slate-900">{healthProfile?.height || 178} cm</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Heart className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <div className="text-[10px] text-slate-400 uppercase font-bold">Weight</div>
              <div className="text-base font-extrabold text-slate-900">{healthProfile?.weight || 74.5} kg</div>
            </div>
          </div>

          {/* Prominent Allergy Callout */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Known Medical Allergies ({allergies.length})</span>
            </div>
            <div className="text-xs text-rose-950 font-medium">
              {allergies.map(a => `${a.allergen} (${a.severity})`).join(', ') || 'No allergies recorded.'}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
              <span className="font-semibold text-slate-800">
                {healthProfile?.emergency_contact_name || 'Sunita Verma'} ({healthProfile?.emergency_contact_phone || '+91 91234 98765'})
              </span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              to="/medical-history"
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <span>View Longitudinal Medical History</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Shortcuts & Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/medical-records"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition duration-200 space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center group-hover:scale-105 transition">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition">Medical Records Vault</h3>
            <p className="text-xs text-slate-500 mt-1">
              {medicalRecords.length} private documents stored (Lab reports, Prescriptions, X-Rays).
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 pt-2">
            Open documents vault →
          </span>
        </Link>

        <Link
          to="/medical-history"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition duration-200 space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition">Structured Health History</h3>
            <p className="text-xs text-slate-500 mt-1">
              Active conditions, drug allergies, and current medications distinguishing clinician diagnoses.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-600 flex items-center gap-1 pt-2">
            Manage health history →
          </span>
        </Link>

        <Link
          to="/timeline"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition duration-200 space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition">Health Event Timeline</h3>
            <p className="text-xs text-slate-500 mt-1">
              Chronological ledger connecting past consultations, prescription updates, and lab reports.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 pt-2">
            View chronological events →
          </span>
        </Link>
      </div>

      {/* Recent Activity Timeline Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-base">Recent Healthcare Activity</h3>
          </div>
          <Link to="/timeline" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
            View Complete Timeline
          </Link>
        </div>

        <div className="space-y-3">
          {recentTimeline.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-xs">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-brand-500"></div>
              <div className="flex-1">
                <p className="text-slate-800 font-medium leading-relaxed">{event.description}</p>
                <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                  {new Date(event.event_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
