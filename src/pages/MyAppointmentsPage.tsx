import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { StatusBadge, VerifiedDoctorBadge } from '../components/common/Badge';
import { Appointment, AppointmentStatus } from '../types/database';
import { 
  Calendar, 
  Clock, 
  Building2, 
  MapPin, 
  FileText, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react';

export const MyAppointmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled'>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments({ patient_id: patientId }));

  // Cancellation Modal state
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Reschedule Modal state
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const reloadAppointments = () => {
    setAppointments(db.getAppointments({ patient_id: patientId }));
  };

  const filteredAppointments = appointments.filter(apt => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return apt.status === 'confirmed';
    if (activeTab === 'pending') return apt.status === 'pending' || apt.status === 'reschedule_requested';
    if (activeTab === 'completed') return apt.status === 'completed';
    if (activeTab === 'cancelled') return apt.status === 'cancelled' || apt.status === 'rejected';
    return true;
  });

  const handleCancelAppointment = () => {
    if (!cancelModalApt) return;
    if (!cancellationReason.trim()) {
      showToast('error', 'Please provide a reason for cancelling this appointment.');
      return;
    }

    setIsSubmittingAction(true);
    try {
      db.updateAppointmentStatus(cancelModalApt.id, 'cancelled', patientId, {
        cancellation_reason: cancellationReason.trim(),
      });
      showToast('info', 'Appointment has been cancelled and the doctor notified.');
      setCancelModalApt(null);
      setCancellationReason('');
      reloadAppointments();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to cancel appointment.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRequestReschedule = () => {
    if (!rescheduleModalApt) return;
    if (!rescheduleReason.trim()) {
      showToast('error', 'Please provide a reason for requesting a reschedule.');
      return;
    }

    setIsSubmittingAction(true);
    try {
      db.updateAppointmentStatus(rescheduleModalApt.id, 'reschedule_requested', patientId, {
        reschedule_reason: rescheduleReason.trim(),
        preferred_reschedule_time: preferredTime ? new Date(preferredTime).toISOString() : undefined,
      });
      showToast('success', 'Rescheduling request sent to the doctor.');
      setRescheduleModalApt(null);
      setRescheduleReason('');
      setPreferredTime('');
      reloadAppointments();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to request reschedule.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            My Hospital Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review status, consultation summaries, or manage cancellations with your doctor.
          </p>
        </div>

        <Link
          to="/doctors"
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-xl transition ${activeTab === 'all' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          All Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-2 rounded-xl transition ${activeTab === 'upcoming' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Upcoming Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-2 rounded-xl transition ${activeTab === 'pending' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Pending Review ({appointments.filter(a => a.status === 'pending' || a.status === 'reschedule_requested').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-2 rounded-xl transition ${activeTab === 'completed' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Completed ({appointments.filter(a => a.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-3 py-2 rounded-xl transition ${activeTab === 'cancelled' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Cancelled / Declined ({appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length})
        </button>
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No appointments in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Find qualified medical specialists across our verified hospital network.
          </p>
          <Link
            to="/doctors"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white"
          >
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <img
                    src={appointment.doctor?.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
                    alt={appointment.doctor?.profile?.full_name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {appointment.doctor?.profile?.full_name}
                      </h3>
                      {appointment.doctor && (
                        <VerifiedDoctorBadge status={appointment.doctor.verification_status} />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-brand-600">{appointment.doctor?.specialization}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {appointment.doctor?.hospital?.name} ({appointment.doctor?.hospital?.city})
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <StatusBadge status={appointment.status} />
                  <span className="text-[10px] text-slate-400">ID: {appointment.id.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Slot Details & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">Appointment Schedule:</span>
                  <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>
                      {appointment.slot ? new Date(appointment.slot.start_time).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Date not set'}
                    </span>
                    <span className="text-brand-600">
                      {appointment.slot ? new Date(appointment.slot.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : ''}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">Reason for Visit:</span>
                  <p className="italic text-slate-700 leading-relaxed font-medium">"{appointment.reason_for_visit}"</p>
                </div>
              </div>

              {/* Cancellation or rejection notes if present */}
              {appointment.cancellation_reason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <strong>Cancellation Reason:</strong> {appointment.cancellation_reason}
                </div>
              )}
              {appointment.rejection_reason && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <strong>Doctor Decline Note:</strong> {appointment.rejection_reason}
                </div>
              )}

              {/* Consultation Notes preview if completed */}
              {appointment.status === 'completed' && appointment.consultation_note && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Signed Clinical Note Available</span>
                  </div>
                  <p className="text-blue-800">
                    <strong>Diagnosis:</strong> {appointment.consultation_note.diagnosis}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <Link
                  to={`/appointments/${appointment.id}`}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Details & Records</span>
                </Link>

                <div className="flex items-center gap-2">
                  {/* Reschedule Button */}
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <button
                      onClick={() => setRescheduleModalApt(appointment)}
                      className="px-3.5 py-2 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Request Reschedule
                    </button>
                  )}

                  {/* Cancel Button */}
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <button
                      onClick={() => setCancelModalApt(appointment)}
                      className="px-3.5 py-2 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Cancel Appointment
              </h3>
              <button onClick={() => setCancelModalApt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your consultation with{' '}
              <strong>{cancelModalApt.doctor?.profile?.full_name}</strong>? This slot will immediately be made available to other patients.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Reason for Cancellation (Required)</label>
              <textarea
                rows={3}
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better, relocated..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleCancelAppointment}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
              >
                {isSubmittingAction ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Request Modal */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                Request Reschedule
              </h3>
              <button onClick={() => setRescheduleModalApt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Submit your preferred alternate time to Dr. {rescheduleModalApt.doctor?.profile?.full_name}. The doctor will review your request.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Preferred New Date & Time</label>
              <input
                type="datetime-local"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Reason for Rescheduling (Required)</label>
              <textarea
                rows={3}
                required
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Flight delay, sudden work commitment..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalApt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleRequestReschedule}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition"
              >
                {isSubmittingAction ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
