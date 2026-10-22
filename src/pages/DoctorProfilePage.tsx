import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { VerifiedDoctorBadge } from '../components/common/Badge';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight,
  Info,
  ArrowLeft
} from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const doctor = id ? db.getDoctorById(id) : undefined;
  const slots = id ? db.getDoctorSlots(id) : [];

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-sm text-slate-600">The requested doctor profile does not exist or has been removed.</p>
        <Link to="/doctors" className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Return to Doctors Directory
        </Link>
      </div>
    );
  }

  // Group slots by date
  const availableSlots = slots.filter(s => s.status === 'available');
  const slotsByDate: Record<string, typeof slots> = {};

  for (const s of availableSlots) {
    const dStr = new Date(s.start_time).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!slotsByDate[dStr]) slotsByDate[dStr] = [];
    slotsByDate[dStr].push(s);
  }

  const handleProceedToBooking = (slotId: string) => {
    navigate(`/book/${doctor.id}?slot=${slotId}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/doctors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors Directory
        </Link>
      </div>

      {/* Doctor Card Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
              alt={doctor.profile?.full_name}
              className="w-32 h-32 rounded-3xl object-cover ring-2 ring-brand-500/20 shadow-md"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {doctor.profile?.full_name}
                </h1>
                <VerifiedDoctorBadge status={doctor.verification_status} />
              </div>

              <p className="text-base font-semibold text-brand-600">{doctor.specialization}</p>
              <p className="text-xs text-slate-600 max-w-lg">{doctor.qualifications}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Award className="w-4 h-4 text-brand-600" />
                  {doctor.experience_years} Years Experience
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {doctor.hospital?.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {doctor.hospital?.city}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center md:text-right shrink-0 space-y-2">
            <span className="text-xs text-slate-500 block">Consultation Fee</span>
            <div className="text-3xl font-extrabold text-slate-900">₹{doctor.consultation_fee}</div>
            <p className="text-[11px] text-slate-500">Payable at clinic or online</p>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Verified Schedule
            </div>
          </div>
        </div>

        {/* Professional Biography */}
        <div className="pt-6 border-t border-slate-100 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Professional Summary</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            {doctor.biography}
          </p>
        </div>

        {/* License verification disclaimer */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Registration Verification:</strong> Verified with State Medical Council under License <code>{doctor.license_number}</code>. Doctor Appointment Booker independently validates credential records. Available calendar slots indicate scheduled hospital consultation hours.
          </p>
        </div>
      </div>

      {/* Available Slots Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Available Consultation Slots
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a convenient 30-minute consultation slot to reserve.</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {availableSlots.length} open slots available
          </span>
        </div>

        {Object.keys(slotsByDate).length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-700 text-sm">No Available Slots This Week</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Dr. {doctor.profile?.full_name} currently has no open consultation slots. Check back soon or contact the hospital directly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(slotsByDate).map(([dateLabel, dateSlots]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  <h4 className="font-bold text-slate-800 text-sm">{dateLabel}</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {dateSlots.map(slot => {
                    const timeStr = new Date(slot.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isSelected = selectedSlotId === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-3 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-brand-500 hover:bg-brand-50/50'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${isSelected ? 'text-brand-100' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs block">{timeStr}</span>
                        <span className={`text-[10px] block ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>30 min</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {selectedSlotId ? (
                  <span className="text-slate-900 font-semibold">
                    Slot selected! Click "Continue to Book" to enter reason and health records consent.
                  </span>
                ) : (
                  <span>Please click on an available time slot above to proceed.</span>
                )}
              </div>

              <button
                disabled={!selectedSlotId}
                onClick={() => handleProceedToBooking(selectedSlotId)}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                  selectedSlotId
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continue to Book Appointment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
