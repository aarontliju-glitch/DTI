import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Shield, HeartPulse, PhoneCall, Mail, MapPin, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-rose-950/40 border-b border-rose-900/40 py-3 px-4 text-xs text-rose-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Medical Emergency Notice:</strong> Doctor Appointment Booker is intended for scheduled consultations only. If you are experiencing acute chest pain, shortness of breath, loss of consciousness, or severe trauma, call <strong>112 / 108</strong> or visit your nearest hospital emergency department immediately.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">DoctorBooker Health</span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">
              Empowering patients with transparent doctor availability, zero hospital waiting lines, verified medical specialists, and an encrypted health records vault with consent-based clinician access.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Available across Hyderabad, Bengaluru, Gurugram & New Delhi</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Patient Support: +91 1800 200 4455 (8 AM – 8 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>care@doctorappointmentbooker.org</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Patient Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctors" className="hover:text-white transition">Find Verified Doctors</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Patient Dashboard</Link></li>
              <li><Link to="/appointments" className="hover:text-white transition">My Appointments</Link></li>
              <li><Link to="/medical-records" className="hover:text-white transition">Upload Medical Records</Link></li>
              <li><Link to="/medical-history" className="hover:text-white transition">Longitudinal Health History</Link></li>
              <li><Link to="/timeline" className="hover:text-white transition">Health Event Timeline</Link></li>
            </ul>
          </div>

          {/* For Clinicians & Hospitals */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Hospitals & Doctors</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctor/dashboard" className="hover:text-white transition">Doctor Workspace</Link></li>
              <li><Link to="/doctor/availability" className="hover:text-white transition">Availability Management</Link></li>
              <li><Link to="/admin/verifications" className="hover:text-white transition">Hospital Verification Portal</Link></li>
              <li><Link to="/admin/hospitals" className="hover:text-white transition">Hospital Facilities</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">Clinical Workflow & Consent</Link></li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Security & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy (DPDP Act)</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><span className="text-slate-400">PostgreSQL Row Level Security</span></li>
              <li><span className="text-slate-400">Consent Revocation Controls</span></li>
              <li><span className="text-slate-400">Immutable Audit Logging</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant Architecture</span>
          </div>
          <p>© {new Date().getFullYear()} Doctor Appointment Booker. All healthcare workflows reserved.</p>
        </div>
      </div>
    </footer>
  );
};
