import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/databaseService';
import { StatusBadge, VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Settings,
  FileText,
  Activity,
  ShieldCheck
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { currentUser, doctorProfile } = useAuth();
  const doctorId = doctorProfile?.id || 'dddddddd-1111-1111-1111-111111111101';
  const doctor = db.getDoctorById(doctorId);

  const stats = db.getDoctorStats(doctorId);
  const doctorAppointments = db.getAppointments({ doctor_id: doctorId });
  const pendingRequests = doctorAppointments.filter(a => a.status === 'pending');
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppointments = doctorAppointments.filter(a => {
    return a.slot && a.slot.start_time.startsWith(todayStr);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-brand-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <Stethoscope className="w-4 h-4" />
            Doctor Clinical Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {doctor?.profile?.full_name || 'Dr. Priya Sharma'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            {doctor?.specialization} • {doctor?.hospital?.name} ({doctor?.hospital?.city}). Review patient consultation requests, inspect consent-shared health records, and document signed clinical notes.
          </p>
          <div className="pt-1">
            {doctor && <VerifiedDoctorBadge status={doctor.verification_status} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/doctor/availability"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/20 transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Calendar & Slots</span>
          </Link>
          <Link
            to="/doctor/appointments"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Consultation Requests ({pendingRequests.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingCount}</div>
          <p className="text-[11px] text-slate-400">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Confirmed Appointments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.confirmedCount}</div>
          <p className="text-[11px] text-slate-400">Scheduled consultations</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Consultations</span>
            <FileText className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-brand-600">{stats.completedCount}</div>
          <p className="text-[11px] text-slate-400">Clinical notes recorded</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cancellation Rate</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.cancellationRate}%</div>
          <p className="text-[11px] text-slate-400">{stats.cancelledCount} cancelled total</p>
        </div>
      </div>

      {/* Main Sections: Pending Requests & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Pending Requests Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">
                Pending Booking Requests ({pendingRequests.length})
              </h3>
            </div>
            <Link to="/doctor/appointments" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Manage All
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-2xl">
              No pending booking requests. All consultations have been reviewed.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(apt => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{apt.patient?.full_name}</span>
                    <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {apt.slot ? new Date(apt.slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-slate-600 italic">"{apt.reason_for_visit}"</p>

                  <div className="pt-2 flex items-center justify-between border-t border-amber-100">
                    <span className="text-[11px] text-slate-500">
                      {apt.slot ? new Date(apt.slot.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                    </span>
                    <Link
                      to="/doctor/appointments"
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px]"
                    >
                      Review & Respond
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Schedule Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">Upcoming Consultations</h3>
            </div>
            <Link to="/doctor/availability" className="text-xs font-semibold text-teal-600 hover:text-teal-800">
              Availability Manager
            </Link>
          </div>

          {doctorAppointments.filter(a => a.status === 'confirmed').length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-2xl">
              No confirmed appointments currently scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {doctorAppointments.filter(a => a.status === 'confirmed').slice(0, 5).map(apt => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{apt.patient?.full_name}</span>
                      <span className="text-slate-400 text-[11px]">Phone: {apt.patient?.phone || 'Not provided'}</span>
                    </div>
                    <span className="font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {apt.slot ? new Date(apt.slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-slate-600"><strong>Reason:</strong> {apt.reason_for_visit}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <Link
                      to={`/doctor/patient/${apt.patient_id}?appointment=${apt.id}`}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>View Authorized Health Records</span>
                    </Link>

                    <Link
                      to={`/doctor/consultation/${apt.id}`}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px]"
                    >
                      Record Clinical Notes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
