import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { AvailabilitySlot } from '../types/database';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const ManageAvailabilityPage: React.FC = () => {
  const { doctorProfile } = useAuth();
  const { showToast } = useNotification();
  const doctorId = doctorProfile?.id || 'dddddddd-1111-1111-1111-111111111101';

  const [slots, setSlots] = useState<AvailabilitySlot[]>(db.getDoctorSlots(doctorId));

  // Slot Generator States
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30); // minutes
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [isGenerating, setIsGenerating] = useState(false);

  const reloadSlots = () => {
    setSlots(db.getDoctorSlots(doctorId));
  };

  const handleGenerateSlots = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const generated: { start_time: string; end_time: string }[] = [];
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const [bStartH, bStartM] = breakStart.split(':').map(Number);
      const [bEndH, bEndM] = breakEnd.split(':').map(Number);

      let current = new Date(`${targetDate}T${startTime}:00`);
      const limit = new Date(`${targetDate}T${endTime}:00`);
      const breakStartTime = new Date(`${targetDate}T${breakStart}:00`);
      const breakEndTime = new Date(`${targetDate}T${breakEnd}:00`);

      while (current.getTime() + slotDuration * 60000 <= limit.getTime()) {
        const slotEnd = new Date(current.getTime() + slotDuration * 60000);

        // Skip during break period
        const overlapsBreak = 
          (current >= breakStartTime && current < breakEndTime) ||
          (slotEnd > breakStartTime && slotEnd <= breakEndTime);

        if (!overlapsBreak) {
          generated.push({
            start_time: current.toISOString(),
            end_time: slotEnd.toISOString(),
          });
        }

        current = slotEnd;
      }

      const created = db.addDoctorSlots(doctorId, generated);
      showToast('success', `Generated ${created.length} available appointment slots for ${targetDate}.`);
      reloadSlots();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate slots.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    try {
      const success = db.deleteSlot(slotId);
      if (success) {
        showToast('info', 'Slot removed.');
        reloadSlots();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Cannot delete a booked slot.');
    }
  };

  // Group slots by date
  const groupedSlots: Record<string, AvailabilitySlot[]> = {};
  for (const s of slots) {
    const dStr = new Date(s.start_time).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groupedSlots[dStr]) groupedSlots[dStr] = [];
    groupedSlots[dStr].push(s);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/doctor/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctor Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Clock className="w-4 h-4" />
          Doctor Availability & Schedule Engine
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manage Consultation Hours & Slots
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Set your daily consultation window, define custom appointment durations, and add lunch break buffers. Schedule changes preserve all existing confirmed patient bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Slot Generator Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Batch Generate Slots</h3>
          </div>

          <form onSubmit={handleGenerateSlots} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Target Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Shift Starts</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Shift Ends</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-700"
              >
                <option value={15}>15 Minutes per Consultation</option>
                <option value={30}>30 Minutes per Consultation (Recommended)</option>
                <option value={45}>45 Minutes per Consultation</option>
                <option value={60}>60 Minutes per Consultation</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block text-[11px]">Break / Lunch Buffer</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Break Start</span>
                  <input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Break End</span>
                  <input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Open Slots'}</span>
            </button>
          </form>
        </div>

        {/* Existing Calendar Slots List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Current Calendar Slots ({slots.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">Auto-Synced</span>
          </div>

          {Object.keys(groupedSlots).length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center bg-slate-50 rounded-2xl">
              No slots currently on your calendar. Use the generator on the left to add open slots.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([dateStr, dateSlots]) => (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{dateStr}</span>
                    <span className="text-slate-400 font-medium">{dateSlots.length} slots</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dateSlots.map(s => {
                      const timeStr = new Date(s.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const isBooked = s.status === 'booked';

                      return (
                        <div
                          key={s.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                            isBooked
                              ? 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <span className="block font-bold">{timeStr}</span>
                            <span className="text-[10px] block opacity-75 capitalize">{s.status}</span>
                          </div>

                          {!isBooked && (
                            <button
                              onClick={() => handleDeleteSlot(s.id)}
                              className="text-slate-300 hover:text-rose-500 p-1"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
