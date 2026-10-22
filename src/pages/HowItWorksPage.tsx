import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Stethoscope, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Activity,
  HeartPulse
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<'patient' | 'doctor' | 'admin'>('patient');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-teal-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30 inline-block">
          End-to-End Healthcare Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          How Doctor Appointment Booker Works
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Discover how our platform eliminates crowded hospital waiting queues, ensures doctor credentials are legitimately validated, and puts patients in complete control of their medical records.
        </p>

        {/* Workflow Switcher Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveWorkflow('patient')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeWorkflow === 'patient'
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Patient Experience
          </button>
          <button
            onClick={() => setActiveWorkflow('doctor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeWorkflow === 'doctor'
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Doctor Workflow
          </button>
          <button
            onClick={() => setActiveWorkflow('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeWorkflow === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Hospital Administrator
          </button>
        </div>
      </div>

      {/* Workflow Content */}
      {activeWorkflow === 'patient' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Seamless Patient Journey</h2>
            <p className="text-xs text-slate-500">From finding a verified specialist to receiving signed clinical notes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">1</div>
              <h3 className="font-bold text-slate-900 text-sm">Discover & Compare</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search verified doctors by discipline (Cardiology, Neurology, Pediatrics, etc.), hospital branch, consultation fee, and real-time open slots.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">2</div>
              <h3 className="font-bold text-slate-900 text-sm">Atomic Slot Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick your preferred 30-minute consultation slot. PostgreSQL row-level locks prevent collision and double bookings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">3</div>
              <h3 className="font-bold text-slate-900 text-sm">Consent-Based Sharing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose precisely which past lab tests, drug allergies, or conditions to disclose with the consulting doctor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">4</div>
              <h3 className="font-bold text-slate-900 text-sm">Post-Visit Digital Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive the doctor’s signed clinical observations, treatment plan, and prescription automatically logged into your health timeline.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              to="/doctors"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Verified Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {activeWorkflow === 'doctor' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Doctor Clinical Workspace</h2>
            <p className="text-xs text-slate-500">Effortlessly manage appointments and clinical continuity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">1</div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule & Slot Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Set weekly consulting windows, slot durations (15 to 60 mins), and lunch buffers. Schedule updates never disrupt existing confirmed patients.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">2</div>
              <h3 className="font-bold text-slate-900 text-sm">Inspect Authorized Health History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review the patient's verified background before consultation: prominent drug allergy warnings, existing conditions, and shared lab reports.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">3</div>
              <h3 className="font-bold text-slate-900 text-sm">Document Signed Clinical Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record examination observations, formal diagnoses, treatment regimens, and signed prescriptions stored immutably against the appointment.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeWorkflow === 'admin' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Hospital Administration & Oversight</h2>
            <p className="text-xs text-slate-500">Quality assurance, credential verification, and facility management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">1</div>
              <h3 className="font-bold text-slate-900 text-sm">Doctor Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cross-reference doctor license numbers and medical qualifications before approving public booking availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">2</div>
              <h3 className="font-bold text-slate-900 text-sm">Hospital Network Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure partner hospital locations, clinical departments, emergency phone numbers, and specialist associations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">3</div>
              <h3 className="font-bold text-slate-900 text-sm">Strict Clinical Data Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hospital administrators can audit operational reliability and booking statistics, but are barred by database RLS from inspecting private medical notes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
