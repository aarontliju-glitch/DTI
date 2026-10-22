import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileCheck2, AlertCircle, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
            <ShieldCheck className="w-4 h-4" />
            Healthcare Data Protection Architecture
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy & Consent Governance
          </h1>
          <p className="text-xs text-slate-500">
            Compliant with the Digital Personal Data Protection (DPDP) Act 2023 & International Healthcare Data Standards.
          </p>
        </div>

        {/* Prototype compliance callout */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Demonstration & Production Architecture Notice:</strong>
            <p className="text-amber-800 leading-relaxed">
              This application implements strict security controls including PostgreSQL Row Level Security (RLS) policies, private Supabase Storage buckets, and explicit granular consent tracking. Unless full institutional ISO 27001, DISHA/HIPAA compliance audits, and legal agreements are formalized, this deployment operates in demonstration mode.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Data Minimization & Collection Principles</h2>
            <p>
              We collect only the personal and health data strictly necessary to facilitate verified doctor appointments and provide continuity of care. This encompasses your name, email, phone number, date of birth, blood group, uploaded medical reports, reported allergies, and active medications. Optional fields are explicitly identified and never mandatory for registration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Granular Consent Architecture</h2>
            <p>
              Under our consent framework:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Zero Default Exposure:</strong> Merely booking an appointment does not expose your entire lifetime medical records to a clinician.</li>
              <li><strong>Selective Sharing:</strong> During the booking workflow, you affirmatively choose which specific uploaded documents and health sections (such as allergies or medications) to share.</li>
              <li><strong>Revocation at Will:</strong> You retain the statutory right to revoke future access to any shared record or medical history category directly from your appointment dashboard. Revocation is enforced via database RLS checks.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Clinician vs. Patient Provenance</h2>
            <p>
              In adherence to medical informatics best practices, clinical entries documented and digitally signed by authorized healthcare professionals are segregated from patient self-reported symptoms. Patients cannot silently alter or delete a doctor’s signed clinical note. An immutable audit trail preserves all clinical additions and modifications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Private Document Storage & Short-Lived Signed URLs</h2>
            <p>
              Medical documents (PDFs, X-Rays, lab results) uploaded to Supabase Storage are contained in non-public, encrypted buckets. We never expose permanent public URLs for sensitive medical files. Any document access generates a temporary cryptographic signed URL with strictly limited validity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Administrator Role Isolation</h2>
            <p>
              Hospital administrators hold operations and doctor verification privileges, but are strictly barred by database access policies from viewing private clinical notes and personal medical records. Administrative privileges do not grant unmonitored clinical data surveillance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Data Rights & Inquiries</h2>
            <p>
              To request a copy of your structured health history or submit a data erasure request pursuant to the DPDP Act 2023, contact our Data Protection Officer at <code>dpo@doctorappointmentbooker.org</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
