import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { DoctorSearch } from './pages/DoctorSearch';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';
import { AppointmentDetailsPage } from './pages/AppointmentDetailsPage';
import { MedicalRecordsPage } from './pages/MedicalRecordsPage';
import { UploadRecordPage } from './pages/UploadRecordPage';
import { MedicalHistoryPage } from './pages/MedicalHistoryPage';
import { MedicalHistoryTimelinePage } from './pages/MedicalHistoryTimelinePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ManageAvailabilityPage } from './pages/ManageAvailabilityPage';
import { DoctorAppointmentsPage } from './pages/DoctorAppointmentsPage';
import { AuthorizedPatientOverviewPage } from './pages/AuthorizedPatientOverviewPage';
import { ConsultationNotesPage } from './pages/ConsultationNotesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorVerificationPage } from './pages/DoctorVerificationPage';
import { HospitalManagementPage } from './pages/HospitalManagementPage';
import { AppointmentReportsPage } from './pages/AppointmentReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* 1. Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<DoctorSearch />} />
                <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />

                {/* 2. Patient Pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                      <PatientProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MyAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:doctorId"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <BookAppointmentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments/:id"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                      <AppointmentDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medical-records"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MedicalRecordsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medical-records/upload"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <UploadRecordPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medical-history"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MedicalHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/timeline"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MedicalHistoryTimelinePage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Notifications & Settings */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Doctor Pages */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/availability"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <ManageAvailabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patient/:patientId"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <AuthorizedPatientOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/consultation/:appointmentId"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <ConsultationNotesPage />
                    </ProtectedRoute>
                  }
                />

                {/* 5. Hospital Administrator Pages */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DoctorVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/hospitals"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <HospitalManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AppointmentReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
