import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { Doctor } from '../types/database';
import { VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  FileCheck2, 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Building2, 
  Award, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';

export const DoctorVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const adminId = currentUser?.id || 'a0000000-0000-0000-0000-000000000001';

  const [doctors, setDoctors] = useState<Doctor[]>(db.getDoctors());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectModalDoc, setRejectModalDoc] = useState<Doctor | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reloadDoctors = () => {
    setDoctors(db.getDoctors());
  };

  const handleVerify = (doctorId: string) => {
    try {
      db.verifyDoctor(doctorId, adminId, 'verified');
      showToast('success', 'Doctor credentials verified and status updated to Verified.');
      reloadDoctors();
    } catch (err: any) {
      showToast('error', err.message || 'Verification failed.');
    }
  };

  const handleReject = () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      showToast('error', 'Please provide a justification for declining verification.');
      return;
    }

    try {
      db.verifyDoctor(rejectModalDoc.id, adminId, 'rejected', rejectReason.trim());
      showToast('info', 'Doctor verification declined.');
      setRejectModalDoc(null);
      setRejectReason('');
      reloadDoctors();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to decline doctor.');
    }
  };

  const handleSuspend = (doctorId: string) => {
    if (window.confirm('Are you sure you want to suspend this doctor profile? Patient bookings will be disabled.')) {
      try {
        db.verifyDoctor(doctorId, adminId, 'suspended', 'Administrative review hold');
        showToast('warning', 'Doctor profile suspended.');
        reloadDoctors();
      } catch (err: any) {
        showToast('error', err.message || 'Failed to suspend doctor.');
      }
    }
  };

  const filteredDoctors = doctors.filter(d => {
    if (filterStatus === 'all') return true;
    return d.verification_status === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Operations
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-600" />
            Doctor Credentials Verification Portal
          </h1>
          <p className="text-xs text-slate-500">
            Validate State Medical Council license numbers and medical qualifications before granting the Verified Doctor badge.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            All ({doctors.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Pending ({doctors.filter(d => d.verification_status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'verified' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Verified ({doctors.filter(d => d.verification_status === 'verified').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl transition ${filterStatus === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'}`}
          >
            Rejected ({doctors.filter(d => d.verification_status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-4">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <img
                  src={doc.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'}
                  alt={doc.profile?.full_name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{doc.profile?.full_name}</h3>
                    <VerifiedDoctorBadge status={doc.verification_status} />
                  </div>
                  <p className="text-xs font-semibold text-brand-600">{doc.specialization} • {doc.experience_years} yrs exp</p>
                  <p className="text-xs text-slate-500">{doc.qualifications}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {doc.hospital?.name} ({doc.hospital?.city})
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 shrink-0 text-xs">
                <span className="text-slate-400 block font-medium">Council License Number:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                  {doc.license_number}
                </span>
                <span className="text-[11px] text-slate-400 block">Registered: {new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Bio summary */}
            {doc.biography && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {doc.biography}
              </p>
            )}

            {/* Verification Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Current Status: <strong className="uppercase">{doc.verification_status}</strong>
              </span>

              <div className="flex items-center gap-2">
                {doc.verification_status !== 'verified' && (
                  <button
                    onClick={() => handleVerify(doc.id)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {doc.verification_status === 'pending' && (
                  <button
                    onClick={() => setRejectModalDoc(doc)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline Credentials</span>
                  </button>
                )}

                {doc.verification_status === 'verified' && (
                  <button
                    onClick={() => handleSuspend(doc.id)}
                    className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold transition"
                  >
                    Suspend Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base text-rose-600">Reject Doctor Verification</h3>
            <p className="text-xs text-slate-600">
              Please enter the reason for rejecting Dr. {rejectModalDoc.profile?.full_name}'s credentials.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Audit Justification *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. License number not found on state council registry, missing MD certificate..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
