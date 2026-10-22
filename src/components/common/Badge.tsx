import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { AppointmentStatus, DoctorVerificationStatus } from '../../types/database';

export const StatusBadge: React.FC<{ status: AppointmentStatus | string }> = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Confirmed
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending Doctor Review
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Cancelled
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          Declined
        </span>
      );
    case 'reschedule_requested':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          Reschedule Requested
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

export const VerifiedDoctorBadge: React.FC<{ status: DoctorVerificationStatus }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200" title="Hospital Verified Practitioner">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        Verified Doctor
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200" title="Awaiting Administrator Credential Verification">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Verification Pending
      </span>
    );
  }
  return null;
};
