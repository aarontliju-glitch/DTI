import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/databaseService';
import { MedicalRecord, RecordCategory } from '../types/database';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Download, 
  Share2, 
  Calendar, 
  Building2, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  Plus
} from 'lucide-react';

export const MedicalRecordsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();
  const patientId = currentUser?.id || 'c0000000-0000-0000-0000-000000000001';

  const [records, setRecords] = useState<MedicalRecord[]>(db.getPatientRecords(patientId));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);

  const reloadRecords = () => {
    setRecords(db.getPatientRecords(patientId));
  };

  const filteredRecords = records.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        (r.hospital_name && r.hospital_name.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDeleteRecord = (recordId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      const success = db.deleteMedicalRecord(recordId, patientId);
      if (success) {
        showToast('info', 'Medical record removed from your vault.');
        reloadRecords();
      }
    }
  };

  const handleDownload = (record: MedicalRecord) => {
    showToast('success', `Downloading encrypted file: ${record.title}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Encrypted Document Vault
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Medical Records & Lab Reports
          </h1>
          <p className="text-xs text-slate-500">
            Securely upload, organize, and consent to share PDF diagnostics, prescriptions, and radiographic scans.
          </p>
        </div>

        <Link
          to="/medical-records/upload"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Record</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, lab, or notes..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 font-medium"
          >
            <option value="all">All Categories ({records.length})</option>
            <option value="lab_reports">Blood & Lab Reports</option>
            <option value="prescriptions">Prescriptions</option>
            <option value="xrays_scans">X-Rays & Scans</option>
            <option value="discharge_summaries">Discharge Summaries</option>
            <option value="surgery_reports">Surgery Reports</option>
            <option value="vaccination_records">Vaccination Records</option>
            <option value="diagnostic_reports">Diagnostic Reports</option>
            <option value="other">Other Documents</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No medical records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload blood work, prescriptions, or radiological images to maintain an accessible personal health vault.
          </p>
          <Link
            to="/medical-records/upload"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 text-white"
          >
            Upload First Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition duration-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {record.category.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2" title={record.title}>
                    {record.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Record Date: {record.record_date}
                    </p>
                    {record.hospital_name && (
                      <p className="flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {record.hospital_name}
                      </p>
                    )}
                  </div>
                </div>

                {record.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    {record.notes}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {Math.round(record.file_size / 1024)} KB • {record.file_type.split('/')[1]?.toUpperCase()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewRecord(record)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Preview record metadata"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(record)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id, record.title)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm truncate">{previewRecord.title}</h3>
              <button onClick={() => setPreviewRecord(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <p><strong>Category:</strong> {previewRecord.category.replace('_', ' ')}</p>
              <p><strong>Date of Record:</strong> {previewRecord.record_date}</p>
              <p><strong>Upload Timestamp:</strong> {new Date(previewRecord.uploaded_at).toLocaleString()}</p>
              <p><strong>Healthcare Facility:</strong> {previewRecord.hospital_name || 'N/A'}</p>
              <p><strong>File Format:</strong> {previewRecord.file_type} ({Math.round(previewRecord.file_size / 1024)} KB)</p>
              <div className="pt-2">
                <strong>Clinical Observations / Notes:</strong>
                <p className="text-slate-700 mt-1 italic">{previewRecord.notes || 'None recorded'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDownload(previewRecord)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Document
              </button>
              <button
                onClick={() => setPreviewRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
