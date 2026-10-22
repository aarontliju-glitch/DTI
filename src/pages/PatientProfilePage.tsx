import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Droplet, 
  Activity, 
  Heart, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  FileText
} from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { showToast } = useNotification();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const initialHealthProfile = db.getPatientMedicalProfile(patientId);

  // Form states
  const [fullName, setFullName] = useState(currentUser?.full_name || 'Rahul Verma');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 91234 56789');
  const [dob, setDob] = useState(initialHealthProfile?.date_of_birth || '1992-06-15');
  const [bloodGroup, setBloodGroup] = useState(initialHealthProfile?.blood_group || 'B+');
  const [height, setHeight] = useState<number | ''>(initialHealthProfile?.height || 178);
  const [weight, setWeight] = useState<number | ''>(initialHealthProfile?.weight || 74.5);
  const [emergencyName, setEmergencyName] = useState(initialHealthProfile?.emergency_contact_name || 'Sunita Verma (Spouse)');
  const [emergencyPhone, setEmergencyPhone] = useState(initialHealthProfile?.emergency_contact_phone || '+91 91234 98765');
  const [generalNotes, setGeneralNotes] = useState(initialHealthProfile?.general_notes || 'Non-smoker, mild seasonal allergic rhinitis, regular brisk walker.');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update basic profile
      updateCurrentUserProfile({
        full_name: fullName,
        phone: phone,
      });

      // 2. Update health profile
      db.updatePatientMedicalProfile(patientId, {
        date_of_birth: dob,
        blood_group: bloodGroup,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        general_notes: generalNotes,
      });

      showToast('success', 'Your health profile has been successfully updated.');
    } catch (err: any) {
      showToast('error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Encrypted Health Profile
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personal Health Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Keep your baseline biological metrics up to date. This information is shared with consulting doctors only when you grant explicit consent during appointment booking.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Contact & Account Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Basic Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || 'rahul.verma@example.com'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Biological Metrics & Blood Group */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Biological Health Metrics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-rose-500" />
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="175"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="70.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600" />
            Emergency Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Emergency Contact Name & Relationship</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Sunita Verma (Spouse)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Emergency Phone Number</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 91234 98765"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-semibold text-slate-700">General Health Notes & Lifestyle (Optional)</label>
            <textarea
              rows={3}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="e.g. Non-smoker, vegetarian, regular runner, history of motion sickness..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Updates...' : 'Save Health Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
