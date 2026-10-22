import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { 
  MedicalCondition, 
  PatientAllergy, 
  PatientMedication,
  ConditionStatus,
  AllergySeverity,
  AllergyType,
  MedicationStatus,
  SourceType
} from '../types/database';
import { 
  Activity, 
  AlertTriangle, 
  Pill, 
  HeartPulse, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  History, 
  User, 
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

export const MedicalHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const [conditions, setConditions] = useState<MedicalCondition[]>(db.getConditions(patientId));
  const [allergies, setAllergies] = useState<PatientAllergy[]>(db.getAllergies(patientId));
  const [medications, setMedications] = useState<PatientMedication[]>(db.getMedications(patientId));

  // Condition Modal State
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditionName, setConditionName] = useState('');
  const [conditionDesc, setConditionDesc] = useState('');
  const [conditionDate, setConditionDate] = useState('');
  const [conditionStatus, setConditionStatus] = useState<ConditionStatus>('active');
  const [conditionSource, setConditionSource] = useState<SourceType>('patient_reported');

  // Allergy Modal State
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [allergen, setAllergen] = useState('');
  const [allergyType, setAllergyType] = useState<AllergyType>('medicine');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('moderate');
  const [allergyNotes, setAllergyNotes] = useState('');

  // Medication Modal State
  const [showMedModal, setShowMedModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [medStatus, setMedStatus] = useState<MedicationStatus>('active');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [medNotes, setMedNotes] = useState('');

  const reloadData = () => {
    setConditions(db.getConditions(patientId));
    setAllergies(db.getAllergies(patientId));
    setMedications(db.getMedications(patientId));
  };

  // Condition Handlers
  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionName.trim()) return;

    db.addCondition({
      patient_id: patientId,
      condition_name: conditionName.trim(),
      description: conditionDesc.trim() || undefined,
      diagnosed_date: conditionDate || undefined,
      status: conditionStatus,
      source_type: conditionSource,
      recorded_by: patientId,
      verification_status: conditionSource === 'clinician_documented' ? 'verified_by_doctor' : 'unverified',
    });

    showToast('success', 'Medical condition recorded.');
    setShowConditionModal(false);
    setConditionName('');
    setConditionDesc('');
    reloadData();
  };

  const handleDeleteCondition = (id: string, name: string) => {
    if (window.confirm(`Delete condition "${name}"?`)) {
      db.deleteCondition(id, patientId);
      showToast('info', 'Condition removed.');
      reloadData();
    }
  };

  // Allergy Handlers
  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergen.trim() || !reaction.trim()) return;

    db.addAllergy({
      patient_id: patientId,
      allergen: allergen.trim(),
      allergy_type: allergyType,
      reaction: reaction.trim(),
      severity: severity,
      source_type: 'patient_reported',
      notes: allergyNotes.trim() || undefined,
    });

    showToast('success', 'Known allergy recorded.');
    setShowAllergyModal(false);
    setAllergen('');
    setReaction('');
    setAllergyNotes('');
    reloadData();
  };

  const handleDeleteAllergy = (id: string, name: string) => {
    if (window.confirm(`Delete allergy "${name}"?`)) {
      db.deleteAllergy(id, patientId);
      showToast('info', 'Allergy removed.');
      reloadData();
    }
  };

  // Medication Handlers
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim() || !frequency.trim()) return;

    db.addMedication({
      patient_id: patientId,
      medicine_name: medName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      start_date: startDate,
      status: medStatus,
      source_type: prescribedBy ? 'clinician_documented' : 'patient_reported',
      prescribed_by: prescribedBy.trim() || undefined,
      notes: medNotes.trim() || undefined,
    });

    showToast('success', 'Medication record saved.');
    setShowMedModal(false);
    setMedName('');
    setDosage('');
    setFrequency('');
    setPrescribedBy('');
    setMedNotes('');
    reloadData();
  };

  const handleDeleteMedication = (id: string, name: string) => {
    if (window.confirm(`Delete medication record "${name}"?`)) {
      db.deleteMedication(id, patientId);
      showToast('info', 'Medication removed.');
      reloadData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            <HeartPulse className="w-4 h-4" />
            Longitudinal Patient Health Vault
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Structured Medical History & Allergies
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Doctors review this background before your consultation. We clearly distinguish patient-reported observations from clinician-signed diagnoses.
          </p>
        </div>

        <Link
          to="/timeline"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2 self-start md:self-auto"
        >
          <History className="w-4 h-4" />
          <span>View Chronological Timeline</span>
        </Link>
      </div>

      {/* SECTION 1: ALLERGIES (PROMINENT HIGHLIGHT) */}
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Life-Critical Allergies</h2>
              <p className="text-xs text-slate-500">Prominently flagged to prevent adverse drug interactions.</p>
            </div>
          </div>

          <button
            onClick={() => setShowAllergyModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Allergy</span>
          </button>
        </div>

        {allergies.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-2xl">
            No known drug or food allergies recorded. Click "Add Allergy" if you have any adverse reactions.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergies.map(a => (
              <div
                key={a.id}
                className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{a.allergen}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      a.severity === 'life_threatening' || a.severity === 'severe'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {a.severity}
                    </span>
                  </div>

                  <p className="text-xs text-rose-950 font-medium">
                    <strong>Reaction:</strong> {a.reaction}
                  </p>

                  {a.notes && (
                    <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded-lg border border-rose-100">
                      {a.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="capitalize">{a.source_type.replace('_', ' ')}</span>
                  <button
                    onClick={() => handleDeleteAllergy(a.id, a.allergen)}
                    className="text-rose-600 hover:text-rose-800 p-1 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MEDICAL CONDITIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Existing & Past Medical Conditions</h2>
              <p className="text-xs text-slate-500">Chronic conditions, prior surgeries, and active diagnoses.</p>
            </div>
          </div>

          <button
            onClick={() => setShowConditionModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Condition</span>
          </button>
        </div>

        {conditions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-2xl">
            No medical conditions listed.
          </p>
        ) : (
          <div className="space-y-3">
            {conditions.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition bg-white space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{c.condition_name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.source_type === 'clinician_documented'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.source_type === 'clinician_documented' ? 'Clinician Verified' : 'Patient Reported'}
                    </span>
                    <button
                      onClick={() => handleDeleteCondition(c.id, c.condition_name)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                )}

                {c.diagnosed_date && (
                  <span className="text-[11px] text-slate-400 block">Diagnosed on: {c.diagnosed_date}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: CURRENT MEDICATIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current & Past Medications</h2>
              <p className="text-xs text-slate-500">Active prescriptions, dosages, and prescribing physicians.</p>
            </div>
          </div>

          <button
            onClick={() => setShowMedModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>

        {medications.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-2xl">
            No medications logged.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map(m => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 transition space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{m.medicine_name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-600 font-semibold">{m.dosage} • {m.frequency}</p>
                  {m.prescribed_by && (
                    <p className="text-xs text-slate-500">Prescribed by: {m.prescribed_by}</p>
                  )}
                  {m.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg">{m.notes}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Started: {m.start_date}</span>
                  <button
                    onClick={() => handleDeleteMedication(m.id, m.medicine_name)}
                    className="text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD CONDITION MODAL */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Medical Condition</h3>
            <form onSubmit={handleAddCondition} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Condition Name *</label>
                <input
                  type="text"
                  required
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Migraine, Asthma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Current Status</label>
                  <select
                    value={conditionStatus}
                    onChange={(e: any) => setConditionStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="managed">Managed</option>
                    <option value="resolved">Resolved</option>
                    <option value="in_remission">In Remission</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Approx. Diagnosed Date</label>
                  <input
                    type="date"
                    value={conditionDate}
                    onChange={(e) => setConditionDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Type</label>
                <select
                  value={conditionSource}
                  onChange={(e: any) => setConditionSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="patient_reported">Patient-Reported Symptom / Event</option>
                  <option value="clinician_documented">Documented by Healthcare Professional</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description & Clinical Details</label>
                <textarea
                  rows={3}
                  value={conditionDesc}
                  onChange={(e) => setConditionDesc(e.target.value)}
                  placeholder="Additional context on symptoms or past hospitalizations..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConditionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ALLERGY MODAL */}
      {showAllergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base text-rose-600">Add Known Medical Allergy</h3>
            <form onSubmit={handleAddAllergy} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Allergen / Substance *</label>
                <input
                  type="text"
                  required
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa Drugs"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Allergy Category</label>
                  <select
                    value={allergyType}
                    onChange={(e: any) => setAllergyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="medicine">Medicine / Drug</option>
                    <option value="food">Food</option>
                    <option value="environmental">Environmental</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Severity</label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="life_threatening">Life-Threatening / Anaphylaxis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Known Reaction Symptoms *</label>
                <input
                  type="text"
                  required
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value)}
                  placeholder="e.g. Hives, facial swelling, difficulty breathing"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notes & Prior Incidents</label>
                <textarea
                  rows={2}
                  value={allergyNotes}
                  onChange={(e) => setAllergyNotes(e.target.value)}
                  placeholder="Observed in 2019 during tooth extraction..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllergyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEDICATION MODAL */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Active Medication</h3>
            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Telmisartan, Metformin, Cetirizine"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 40 mg, 500 mg"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Frequency *</label>
                  <input
                    type="text"
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g. Once daily morning"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={medStatus}
                    onChange={(e: any) => setMedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Prescribing Doctor (Optional)</label>
                <input
                  type="text"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  placeholder="Take after food, avoid grapefruit..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMedModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
