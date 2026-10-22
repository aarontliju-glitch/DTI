import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  Calendar, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Stethoscope
} from 'lucide-react';

export const DoctorSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('dept') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [hospitalId, setHospitalId] = useState(searchParams.get('hospital') || 'all');
  const [maxFee, setMaxFee] = useState<number>(Number(searchParams.get('maxFee')) || 2000);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'experience' | 'fee_low' | 'fee_high'>('experience');

  const hospitals = db.getHospitals();

  const filteredDoctors = useMemo(() => {
    let list = db.searchDoctors({
      query,
      specialization,
      city,
      hospitalId,
      maxFee,
      verifiedOnly,
    });

    if (sortBy === 'experience') {
      list.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sortBy === 'fee_low') {
      list.sort((a, b) => a.consultation_fee - b.consultation_fee);
    } else if (sortBy === 'fee_high') {
      list.sort((a, b) => b.consultation_fee - a.consultation_fee);
    }

    return list;
  }, [query, specialization, city, hospitalId, maxFee, verifiedOnly, sortBy]);

  const clearFilters = () => {
    setQuery('');
    setSpecialization('all');
    setCity('all');
    setHospitalId('all');
    setMaxFee(2000);
    setVerifiedOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5" />
            Hospital Verified Directory
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Discover Specialists & Book Appointments</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Filter by clinical discipline, hospital affiliation, and consultation fees. Every appointment slot is reserved atomically.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0">
          <div className="text-2xl font-extrabold text-white">{filteredDoctors.length}</div>
          <div className="text-xs text-brand-200">Matching Specialists Found</div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Doctor List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Search Filters</span>
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Search Doctor or Condition</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Dr. Priya, Cardiology..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Specialization Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Medical Specialty</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
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

          {/* Hospital Affiliation Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Hospital Facility</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="all">All Hospitals</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
              ))}
            </select>
          </div>

          {/* City / Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">City / Location</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="all">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Gurugram">Gurugram</option>
              <option value="New Delhi">New Delhi</option>
            </select>
          </div>

          {/* Consultation Fee Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Max Consultation Fee</span>
              <span className="text-brand-600 font-bold">₹{maxFee}</span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹400</span>
              <span>₹2,000</span>
            </div>
          </div>

          {/* Verified Doctors Only Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Hospital Verified Doctors Only</span>
            </label>
          </div>
        </div>

        {/* Doctor List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Sort Controls */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredDoctors.length}</strong> available doctors
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="border-none bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="experience">Experience (Highest First)</option>
                <option value="fee_low">Consultation Fee (Low to High)</option>
                <option value="fee_high">Consultation Fee (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          {filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">No doctors match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing specialty filters, or searching for a different city.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map(doctor => {
                const slots = db.getDoctorSlots(doctor.id).filter(s => s.status === 'available');
                const nextSlot = slots[0];

                return (
                  <div
                    key={doctor.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-brand-300 transition duration-200 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Doctor Photo and Credentials */}
                      <div className="flex items-start gap-4">
                        <img
                          src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
                          alt={doctor.profile?.full_name}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                              {doctor.profile?.full_name}
                            </h3>
                            <VerifiedDoctorBadge status={doctor.verification_status} />
                          </div>
                          <p className="text-xs font-semibold text-brand-600">{doctor.specialization}</p>
                          <p className="text-xs text-slate-500">{doctor.qualifications}</p>
                          <p className="text-xs text-slate-600 font-medium">
                            {doctor.experience_years} years experience
                          </p>
                        </div>
                      </div>

                      {/* Right: Hospital and Pricing */}
                      <div className="sm:text-right shrink-0 space-y-1">
                        <div className="text-xs text-slate-500">Consultation Fee</div>
                        <div className="text-2xl font-extrabold text-slate-900">₹{doctor.consultation_fee}</div>
                        <div className="text-xs text-emerald-600 font-semibold flex sm:justify-end items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Direct Hospital Booking</span>
                        </div>
                      </div>
                    </div>

                    {/* Biography Snippet */}
                    {doctor.biography && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {doctor.biography}
                      </p>
                    )}

                    {/* Affiliation and Slots Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>{doctor.hospital?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{doctor.hospital?.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {nextSlot ? (
                          <div className="text-right hidden md:block">
                            <span className="text-[10px] text-slate-400 block">Next Available Slot:</span>
                            <span className="font-semibold text-emerald-700">
                              {new Date(nextSlot.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                              {new Date(nextSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No open slots this week</span>
                        )}

                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="px-5 py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition flex items-center gap-1.5"
                        >
                          <span>View Profile & Slots</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
