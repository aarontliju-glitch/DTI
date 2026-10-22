import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, ArrowLeft } from 'lucide-react';

export const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <FileText className="w-4 h-4 text-slate-500" />
            Terms of Service
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: January 2025. Governing user and clinical interaction on Doctor Appointment Booker.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Emergency Care Disclaimer:</strong> DOCTOR APPOINTMENT BOOKER IS NOT AN EMERGENCY DISPATCH SERVICE. If you suspect an emergency medical condition, cardiac arrest, stroke, poisoning, severe trauma, or acute respiratory failure, immediately call <strong>112 / 108</strong> or go to the nearest emergency casualty hospital.
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Nature of the Appointment Platform</h2>
            <p>
              Doctor Appointment Booker is a digital platform connecting patients with hospital-credentialed healthcare practitioners. We facilitate scheduling, communication, and secure consent-based sharing of longitudinal health records. We do not provide medical diagnosis through artificial intelligence or algorithmic proxies. Clinical decisions remain the sole professional responsibility of the treating clinician.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Doctor Verification & Availability Notice</h2>
            <p>
              The "Verified Doctor" badge signifies that hospital administrators have reviewed the doctor’s credentials, degree qualifications, and registration with the appropriate Medical Council. Displaying an open slot on the platform indicates designated consulting hours; it does not guarantee immediate physical presence in cases of unforeseen hospital emergencies or trauma surgeries.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Transactional Slot Booking & Double Booking Safeguards</h2>
            <p>
              When you submit an appointment booking, our system executes an atomic reservation lock. A slot remains reserved pending doctor review. If a doctor declines an appointment, the slot is restored to available and you are notified immediately with the doctor’s reason.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Cancellations & Rescheduling Policy</h2>
            <p>
              Patients may cancel appointments via their dashboard prior to the consultation start time. A mandatory reason for cancellation must be specified to maintain fair scheduling for other patients. Rescheduling requests are subject to mutual clinician confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Patient Health Data Accuracy</h2>
            <p>
              Patients are responsible for providing truthful, accurate medical information, particularly regarding life-critical allergies and active prescriptions. Failure to disclose known drug allergies may result in adverse clinical consequences beyond the scope of this platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
