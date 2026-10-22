import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Activity, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  ArrowRight, 
  ChevronRight,
  HeartPulse,
  UserCheck,
  Lock,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import { db } from '../lib/databaseService';
import { VerifiedDoctorBadge } from '../components/common/Badge';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const doctors = db.getDoctors().filter(d => d.verification_status === 'verified').slice(0, 4);
  const hospitals = db.getHospitals();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedSpecialization !== 'all') params.set('dept', selectedSpecialization);
    if (selectedCity !== 'all') params.set('city', selectedCity);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-100/50 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and Tagline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Hospital-Verified Doctors & Zero Queues
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Book Your Doctor Appointment <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">Without the Wait.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Find verified doctors, check their real-time availability, book appointments, and keep your medical history organized in one secure place.
              </p>

              {/* SEARCH FORM */}
              <form 
                onSubmit={handleSearch} 
                className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200/80 max-w-2xl mx-auto lg:mx-0 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
              >
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Doctor name, symptom, or hospital..."
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="sm:w-44">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
                  >
                    <option value="all">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div className="sm:w-36">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
                  >
                    <option value="all">All Cities</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="New Delhi">New Delhi</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 transition shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="px-6 py-3 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow transition flex items-center gap-2"
                >
                  <span>Find a Doctor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
                >
                  How It Works
                </Link>
              </div>

              {/* Trust Metric Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-left">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Verified Doctors</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-brand-600">0 min</div>
                  <div className="text-xs text-slate-500 font-medium">Unexpected Queues</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-teal-600">DPDP</div>
                  <div className="text-xs text-slate-500 font-medium">Encrypted Vault</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Trust Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 to-teal-500 rounded-3xl blur-xl opacity-30"></div>

                <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-6">
                  {/* Floating Doctor Spotlight */}
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
                      alt="Dr. Priya Sharma"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900">Dr. Priya Sharma</h3>
                        <VerifiedDoctorBadge status="verified" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Cardiology • Apollo Health City</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Available Today (10:30 AM)
                      </div>
                    </div>
                  </div>

                  {/* Interactive Quick Slot Preview */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Next Available Slots</span>
                      <span>Tomorrow</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="px-2.5 py-2 text-center text-xs font-semibold rounded-lg bg-brand-500 text-white shadow-sm cursor-pointer">
                        09:30 AM
                      </span>
                      <span className="px-2.5 py-2 text-center text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-brand-500 transition cursor-pointer">
                        11:00 AM
                      </span>
                      <span className="px-2.5 py-2 text-center text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-brand-500 transition cursor-pointer">
                        02:30 PM
                      </span>
                    </div>
                  </div>

                  {/* Consent & Medical Sharing Highlight Pill */}
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-teal-900">Granular Patient Consent</p>
                      <p className="text-teal-700 mt-0.5 leading-relaxed">
                        You choose which medical records, conditions, and allergies the doctor can view. Revoke at any time.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/doctors/dddddddd-1111-1111-1111-111111111101"
                    className="w-full py-3 rounded-xl font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow transition flex items-center justify-center gap-1 text-sm"
                  >
                    <span>View Dr. Priya's Calendar</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">Expert Clinicians</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Verified Doctors</h2>
            <p className="text-slate-500 text-sm mt-1">Hospital-credentialed specialists with guaranteed appointment availability.</p>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Browse all doctors</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(doctor => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
                    alt={doctor.profile?.full_name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition">
                      {doctor.profile?.full_name}
                    </h3>
                    <p className="text-xs text-brand-600 font-semibold">{doctor.specialization}</p>
                    <div className="mt-1">
                      <VerifiedDoctorBadge status={doctor.verification_status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="truncate"><span className="text-slate-400">Hospital:</span> {doctor.hospital?.name}</p>
                  <p><span className="text-slate-400">Experience:</span> {doctor.experience_years} years</p>
                  <p><span className="text-slate-400">Qualifications:</span> {doctor.qualifications}</p>
                </div>
              </div>

              <div className="p-5 pt-0 mt-auto border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                  <span className="text-base font-bold text-slate-900">₹{doctor.consultation_fee}</span>
                </div>
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW THE BOOKING PROCESS WORKS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">Effortless Healthcare</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Appointment Booking Works</h2>
            <p className="text-slate-600 text-sm mt-2">
              Say goodbye to morning hospital line-ups and uncertain doctor shifts. Direct, transparent digital reservations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900">Find Doctor & View Slots</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by specialty, city, hospital, or consultation fee. Examine real verified calendar slots.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900">Describe Reason & Consent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your symptoms and choose which medical records or history sections to share with the clinician.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900">Instant Atomic Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend locks the slot with PostgreSQL constraints, preventing double booking or queue jumping.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900">Consultation & Health Log</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attend on time. Receive signed clinical notes and updated prescriptions automatically logged to your timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-xl space-y-4">
            <Clock className="w-10 h-10 text-brand-200" />
            <h3 className="text-2xl font-bold">Zero Physical Queues</h3>
            <p className="text-brand-100 text-sm leading-relaxed">
              Arrive precisely when your slot starts. No more taking half-days off from work waiting in crowded hospital lobbies.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-xl space-y-4">
            <ShieldCheck className="w-10 h-10 text-teal-200" />
            <h3 className="text-2xl font-bold">Verified Medical Credentials</h3>
            <p className="text-teal-100 text-sm leading-relaxed">
              Every doctor is rigorously checked against state medical council registries and verified by hospital administrators before listing.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl space-y-4">
            <HeartPulse className="w-10 h-10 text-brand-300" />
            <h3 className="text-2xl font-bold">Longitudinal Health Vault</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Carry your lifetime medical history, allergies, medications, and diagnostic lab reports with encrypted privacy and instant consent revocation.
            </p>
          </div>
        </div>
      </section>

      {/* SECURE MEDICAL HISTORY INTRODUCTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30">
                Patient-Owned Healthcare Data
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Never Lose Track of Your Medical History Again.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                When you visit a new doctor, communicating previous treatments, drug allergies, and recent blood tests is critical. Our secure health profile distinguishes clinician-documented diagnoses from patient observations, ensuring clinical accuracy and patient safety.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Highlight life-critical drug allergies prominently to doctors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Chronological timeline connecting appointments, lab tests, and clinical notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Revoke doctor access anytime through database-enforced RLS policies</span>
                </li>
              </ul>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/medical-history"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-600 text-white shadow-md transition"
                >
                  Explore Medical History Vault
                </Link>
                <Link
                  to="/medical-records"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                >
                  Upload Records
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-semibold text-sm">Rahul Verma's Health Card</span>
                <span className="text-xs px-2 py-0.5 rounded bg-brand-500/30 text-brand-200">Blood Group: B+</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
                  <span className="font-bold text-rose-300 block mb-0.5">Critical Allergy Alert</span>
                  <span className="text-slate-200">Penicillin & Amoxicillin (Severe hypersensitivity, anaphylactic potential)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-bold text-teal-300 block mb-0.5">Active Managed Condition</span>
                  <span className="text-slate-200">Essential Hypertension (Rx: Telmisartan 40mg OD)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">Got Questions?</div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">How does slot booking prevent two patients from booking at the same time?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We enforce database-level transactional locks using PostgreSQL atomic operations (`SELECT ... FOR UPDATE`). When you confirm a slot, it is immediately reserved, guaranteeing zero double bookings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Can any doctor view all of my uploaded medical documents?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. By default, your health records are completely private. When booking an appointment, you select only the specific documents and health sections (such as allergies or medications) you consent to share. You can also revoke access anytime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">How are doctors verified on the platform?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctors submit their State Medical Council registration number, medical degrees, and hospital affiliation. Hospital administrators verify these credentials before granting the Verified Doctor badge.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">What happens if I need to cancel or reschedule my appointment?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can cancel or request rescheduling directly from your My Appointments dashboard. You will be prompted to provide a reason, and the doctor is notified instantly while freeing the slot for others.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
