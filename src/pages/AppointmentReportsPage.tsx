import React from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { 
  BarChart3, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock,
  PieChart
} from 'lucide-react';

export const AppointmentReportsPage: React.FC = () => {
  const stats = db.getAdminStats();
  const appointments = db.getAppointments();

  const statusCounts = {
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
  };

  const total = appointments.length || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Operations
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
          <BarChart3 className="w-4 h-4 text-brand-600" />
          Operational Analytics & Reports
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Appointment Volume & Department Statistics
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl">
          Visual reporting on booking completion rates, departmental workload distribution, and patient cancellation metrics across hospital network facilities.
        </p>
      </div>

      {/* Progress Bars & Rate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-600" />
            Appointment Status Breakdown
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Completed Consultations</span>
                <span className="text-blue-600 font-bold">{statusCounts.completed} ({Math.round((statusCounts.completed / total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(statusCounts.completed / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Upcoming Confirmed</span>
                <span className="text-emerald-600 font-bold">{statusCounts.confirmed} ({Math.round((statusCounts.confirmed / total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(statusCounts.confirmed / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Pending Review</span>
                <span className="text-amber-600 font-bold">{statusCounts.pending} ({Math.round((statusCounts.pending / total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(statusCounts.pending / total) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Cancelled by Patient</span>
                <span className="text-rose-600 font-bold">{statusCounts.cancelled} ({Math.round((statusCounts.cancelled / total) * 100)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${(statusCounts.cancelled / total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Volume Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Specialty Consultation Workload
          </h3>

          <div className="space-y-3 text-xs">
            {Object.keys(stats.deptCount).length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No departmental data available yet.</p>
            ) : (
              Object.entries(stats.deptCount).map(([dept, count]) => {
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={dept}>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{dept}</span>
                      <span className="font-bold text-teal-700">{count} visits ({percentage}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
