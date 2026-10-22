import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { RecordCategory } from '../types/database';
import { 
  Upload, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileUp,
  X
} from 'lucide-react';

export const UploadRecordPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('lab_reports');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10));
  const [hospitalName, setHospitalName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // File validation: PDF, JPG, JPEG, PNG
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) {
        setError('Unsupported file type. Please upload a PDF, JPG, or PNG document.');
        setSelectedFile(null);
        return;
      }

      // Max size: 15MB
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds the 15 MB threshold.');
        setSelectedFile(null);
        return;
      }

      setError('');
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose or drag a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please specify a title for this medical document.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      db.uploadMedicalRecord({
        patient_id: patientId,
        title: title.trim(),
        category,
        record_date: recordDate,
        file_path: `records/${Date.now()}_${selectedFile.name}`,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        hospital_name: hospitalName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showToast('success', 'Your medical record was uploaded successfully.');
      navigate('/medical-records');
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link to="/medical-records" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Medical Records
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Private Storage Upload
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Upload Medical Document
          </h1>
          <p className="text-xs text-slate-500">
            Add diagnostic lab tests, clinical prescriptions, or scan reports to your encrypted personal health record.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Drop Zone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Select File (PDF, PNG, JPG - Max 15MB)</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-8 text-center transition bg-slate-50/50 hover:bg-brand-50/20 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-slate-500">
                    {Math.round(selectedFile.size / 1024)} KB • {selectedFile.type}
                  </span>
                  <span className="text-xs text-brand-600 font-semibold mt-1">Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">Drag and drop file here, or click to browse</span>
                  <span className="text-xs text-slate-400">Supported formats: PDF, JPG, PNG (up to 15MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Document Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count & Lipid Panel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Record Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecordCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
              >
                <option value="lab_reports">Blood tests & laboratory reports</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="xrays_scans">X-rays & scan reports</option>
                <option value="discharge_summaries">Discharge summaries</option>
                <option value="surgery_reports">Surgery reports</option>
                <option value="vaccination_records">Vaccination records</option>
                <option value="diagnostic_reports">Diagnostic reports</option>
                <option value="other">Other medical documents</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Original Record Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hospital or Laboratory Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Apollo Diagnostics / Fortis Hospital"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Optional Notes or Clinical Context</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting 12 hours prior, HbA1c 5.8%, advised routine 6-month repeat..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/medical-records"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isUploading}
              className="px-7 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Securing & Storing...' : 'Save & Secure Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
