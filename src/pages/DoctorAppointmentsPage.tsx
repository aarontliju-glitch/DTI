import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { Appointment } from '../types/database';
import { StatusBadge } from '../components/common/Badge';
import { 
  Users, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  FileText, 
  Activity, 
  ArrowLeft, 
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const { doctorProfile, currentUser } = useAuth();
  const { showToast } = useNotification();
  const doctorId = doctorProfile?.id || 'dddddddd-1111-1111-1111-111111111101';
  const doctorUserId = currentUser?.id || 'd0000000-0000-0000-0000-000000000001';

  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments({ doctor_id: doctorId }));
  const [rejectModalApt, setRejectModalApt] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const reloadAppointments = () => {
    setAppointments(db.getAppointments({ doctor_id: doctorId }));
  };

  const handleAcceptAppointment = (aptId: string) => {
    try {
      db.updateAppointmentStatus(aptId, 'confirmed', doctorUserId);
      showToast('success', 'Appointment confirmed! Patient has been notified.');
      reloadAppointments();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to confirm appointment.');
    }
  };

  const handleRejectAppointment = () => {
    if (!rejectModalApt) return;
    if (!rejectionReason.trim()) {
      showToast('error', 'Please provide a reason for declining.');
      return;
    }

    try {
      db.updateAppointmentStatus(rejectModalApt.id, 'rejected', doctorUserId, {
        rejection_reason: rejectionReason.trim(),
      });
      showToast('info', 'Appointment request declined and slot freed.');
      setRejectModalApt(null);
      setRejectionReason('');
      reloadAppointments();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to decline appointment.');
    }
  };

  const filtered = appointments.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return a.status === 'pending';
    if (activeFilter === 'confirmed') return a.status === 'confirmed';
    if (activeFilter === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link to="/doctor/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctor Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Patient Consultation Management
          </h1>
          <p className="text-xs text-slate-500">
            Accept or decline incoming booking requests, inspect authorized health backgrounds, and document clinical notes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Pending ({appointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'confirmed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition ${activeFilter === 'completed' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No appointments in this category</h3>
          <p className="text-xs text-slate-500">When patients book consultations, they will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div
              key={apt.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{apt.patient?.full_name}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient Phone: {apt.patient?.phone || 'Not specified'} • Email: {apt.patient?.email}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">Scheduled Time</span>
                  <div className="font-bold text-slate-800 text-sm">
                    {apt.slot ? new Date(apt.slot.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date not set'}
                  </div>
                  <span className="text-teal-700 font-semibold text-xs">
                    {apt.slot ? new Date(apt.slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>

              <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium block">Reason for Consultation:</span>
                <p className="italic text-slate-700 font-medium">"{apt.reason_for_visit}"</p>
              </div>

              {apt.rejection_reason && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <strong>Decline Reason:</strong> {apt.rejection_reason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Link to Patient Medical Background */}
                <Link
                  to={`/doctor/patient/${apt.patient_id}?appointment=${apt.id}`}
                  className="px-4 py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold transition flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Inspect Shared Health Records & Allergies</span>
                </Link>

                <div className="flex items-center gap-2">
                  {/* Pending Decision Buttons */}
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptAppointment(apt.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Confirm</span>
                      </button>
                      <button
                        onClick={() => setRejectModalApt(apt)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {/* Confirmed Actions */}
                  {apt.status === 'confirmed' && (
                    <Link
                      to={`/doctor/consultation/${apt.id}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Document Clinical Note & Rx</span>
                    </Link>
                  )}

                  {apt.status === 'completed' && (
                    <Link
                      to={`/doctor/consultation/${apt.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Review Clinical Note</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Appointment Modal */}
      {rejectModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Decline Appointment Request</h3>
              <button onClick={() => setRejectModalApt(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please enter the reason for declining <strong>{rejectModalApt.patient?.full_name}</strong>'s appointment. The patient will be notified and the slot restored to available.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Decline Reason (Required)</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Emergency surgery schedule conflict, please choose afternoon slot..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectAppointment}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
