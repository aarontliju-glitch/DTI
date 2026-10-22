import React from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Building2, 
  Calendar, 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck2, 
  BarChart3, 
  Clock,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const stats = db.getAdminStats();
  const doctors = db.getDoctors();
  const pendingDoctors = doctors.filter(d => d.verification_status === 'pending');
  const auditLogs = db.getAuditLogs().slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-brand-950 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Hospital Administrator Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Healthcare Platform Administration
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Oversee hospital facilities, review doctor credentials for verified status, monitor system reliability, and review clinical audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/verifications"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Verify Doctors ({pendingDoctors.length})</span>
          </Link>
          <Link
            to="/admin/hospitals"
            className="px-5 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Hospitals</span>
          </Link>
        </div>
      </div>

      {/* Real Statistics Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Verifications</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingVerifications}</div>
          <p className="text-[11px] text-slate-400">Doctors awaiting review</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified Doctors</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-teal-600">{stats.verifiedDoctors}</div>
          <p className="text-[11px] text-slate-400">of {stats.totalDoctors} total registered</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Appointments</span>
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-brand-600">{stats.totalAppointments}</div>
          <p className="text-[11px] text-slate-400">{stats.upcomingAppointments} upcoming</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cancellation Rate</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.cancellationRate}%</div>
          <p className="text-[11px] text-slate-400">{stats.completionRate}% completed</p>
        </div>
      </div>

      {/* Main Sections: Pending Verifications & System Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Pending Verifications Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Doctor Credential Verification Requests ({pendingDoctors.length})
              </h3>
            </div>
            <Link to="/admin/verifications" className="text-xs font-semibold text-purple-600 hover:text-purple-800">
              View All
            </Link>
          </div>

          {pendingDoctors.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-2xl">
              All registered doctor profiles have been reviewed and verified.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingDoctors.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'}
                      alt={doc.profile?.full_name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.profile?.full_name}</h4>
                      <p className="text-brand-600 font-semibold">{doc.specialization}</p>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        License: {doc.license_number}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/admin/verifications"
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    Review Credentials
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Logs Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-base">Immutable System Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Security Logs</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-700 text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Entity: <span className="font-semibold text-slate-800">{log.entity_type}</span> ({log.entity_id.slice(0, 8)}...)
                </p>
                {log.actor_profile && (
                  <span className="text-[10px] text-slate-400 block">
                    Actor: {log.actor_profile.full_name} ({log.actor_profile.role})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
