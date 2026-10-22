import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/databaseService';
import { useNotification } from '../context/NotificationContext';
import { Hospital } from '../types/database';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Edit3, 
  Users, 
  ArrowLeft, 
  CheckCircle2 
} from 'lucide-react';

export const HospitalManagementPage: React.FC = () => {
  const { showToast } = useNotification();
  const [hospitals, setHospitals] = useState<Hospital[]>(db.getHospitals());
  const doctors = db.getDoctors();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [contact, setContact] = useState('');
  const [departmentsInput, setDepartmentsInput] = useState('Cardiology, Neurology, Pediatrics, Orthopedics');

  const reloadHospitals = () => {
    setHospitals(db.getHospitals());
  };

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !contact.trim()) return;

    const depts = departmentsInput.split(',').map(d => d.trim()).filter(Boolean);

    db.createHospital({
      name: name.trim(),
      address: address.trim(),
      city,
      contact_number: contact.trim(),
      departments: depts,
      image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    });

    showToast('success', 'Hospital facility added successfully.');
    setShowAddModal(false);
    setName('');
    setAddress('');
    setContact('');
    reloadHospitals();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Operations
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            Hospital Network & Facilities
          </h1>
          <p className="text-xs text-slate-500">
            Maintain partner hospitals, clinical departments, emergency phone numbers, and affiliated specialists.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hospital</span>
        </button>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospitals.map(hospital => {
          const affiliatedDoctors = doctors.filter(d => d.hospital_id === hospital.id);

          return (
            <div
              key={hospital.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                <img
                  src={hospital.image_url || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80'}
                  alt={hospital.name}
                  className="w-full h-44 object-cover"
                />

                <div className="p-6 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{hospital.name}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {hospital.city}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {hospital.address}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {hospital.contact_number}
                    </p>
                  </div>

                  {/* Departments Tags */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Clinical Departments
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.departments.map(dept => (
                        <span key={dept} className="px-2 py-0.5 rounded-md text-[11px] bg-brand-50 text-brand-700 font-medium">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Affiliated Doctors Footer */}
              <div className="p-6 pt-0 mt-auto border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-600" />
                  <strong>{affiliatedDoctors.length}</strong> Affiliated Doctors
                </span>

                <Link
                  to={`/doctors?hospital=${hospital.id}`}
                  className="font-bold text-brand-600 hover:text-brand-800"
                >
                  View Doctors →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Hospital Facility</h3>

            <form onSubmit={handleAddHospital} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Super Speciality Hospital"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="New Delhi">New Delhi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 40 2360 7777"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Road No 72, Jubilee Hills"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Departments (Comma separated) *</label>
                <input
                  type="text"
                  value={departmentsInput}
                  onChange={(e) => setDepartmentsInput(e.target.value)}
                  placeholder="Cardiology, Neurology, Pediatrics, Orthopedics"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
