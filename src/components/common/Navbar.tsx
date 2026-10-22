import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Building2, 
  BarChart3, 
  FileCheck2, 
  History,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/database';

export const Navbar: React.FC = () => {
  const { currentUser, userRole, logout, switchDemoRole, isLiveSupabase } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = (role: UserRole) => {
    switchDemoRole(role);
    setRoleSwitcherOpen(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-banner for backend connection state & quick role switch */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isLiveSupabase ? 'bg-emerald-400 animate-ping' : 'bg-brand-400'}`}></span>
            <span>
              {isLiveSupabase 
                ? 'Connected to Live Supabase Backend & PostgreSQL' 
                : 'Doctor Appointment Booker • Direct Hospital Booking & Consent-Secured Health Vault'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden sm:inline">Role Switcher:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => handleRoleSwitch('patient')}
                className={`px-2 py-0.5 rounded text-xs transition ${userRole === 'patient' ? 'bg-brand-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:text-white'}`}
              >
                Patient
              </button>
              <button
                onClick={() => handleRoleSwitch('doctor')}
                className={`px-2 py-0.5 rounded text-xs transition ${userRole === 'doctor' ? 'bg-teal-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:text-white'}`}
              >
                Doctor
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2 py-0.5 rounded text-xs transition ${userRole === 'admin' ? 'bg-purple-600 text-white font-medium shadow-sm' : 'text-slate-300 hover:text-white'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight text-lg tracking-tight flex items-center gap-1.5">
              DoctorBooker
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded">
                Health
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Verified Hospital Care</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          <Link
            to="/doctors"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/doctors') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Find Doctors
          </Link>

          <Link
            to="/how-it-works"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/how-it-works') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            How It Works
          </Link>

          {/* Role-Specific Portal Links */}
          {userRole === 'patient' && (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/appointments"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/appointments') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Appointments
              </Link>
              <Link
                to="/medical-records"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/medical-records') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Medical Records
              </Link>
              <Link
                to="/medical-history"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/medical-history') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Health Profile & History
              </Link>
              <Link
                to="/timeline"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/timeline') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Timeline
              </Link>
            </>
          )}

          {userRole === 'doctor' && (
            <>
              <Link
                to="/doctor/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/doctor/dashboard') ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor/appointments"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/doctor/appointments') ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Consultation Requests
              </Link>
              <Link
                to="/doctor/availability"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/doctor/availability') ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Manage Schedule
              </Link>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/verifications"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin/verifications') ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Doctor Verification
              </Link>
              <Link
                to="/admin/hospitals"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin/hospitals') ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Hospitals
              </Link>
              <Link
                to="/admin/reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin/reports') ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Reports
              </Link>
            </>
          )}
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Notification Center Popover */}
              <div className="relative">
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-brand-100 text-brand-700 font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-slate-500 text-sm">
                          No notifications at this time
                        </div>
                      ) : (
                        notifications.slice(0, 6).map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.appointment_id) {
                                setNotificationDropdownOpen(false);
                                if (userRole === 'doctor') navigate('/doctor/appointments');
                                else navigate(`/appointments/${n.appointment_id}`);
                              }
                            }}
                            className={`p-3 text-xs cursor-pointer transition hover:bg-slate-50 flex items-start gap-2.5 ${
                              !n.is_read ? 'bg-brand-50/50' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-brand-500"></div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 pt-2 border-t border-slate-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setNotificationDropdownOpen(false)}
                        className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="hidden md:block text-left text-xs pr-1">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{currentUser.full_name}</p>
                    <p className="text-[10px] uppercase font-bold text-brand-600">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                        {currentUser.role} Account
                      </span>
                    </div>

                    {userRole === 'patient' && (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Activity className="w-4 h-4 text-brand-500" />
                          Patient Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-brand-500" />
                          Health Profile
                        </Link>
                      </>
                    )}

                    {userRole === 'doctor' && (
                      <Link
                        to="/doctor/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        Doctor Workspace
                      </Link>
                    )}

                    {userRole === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Operations
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Settings & Security
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition shadow-brand-500/20"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Doctors
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </Link>

          {userRole === 'patient' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Appointments
              </Link>
              <Link
                to="/medical-records"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medical Records
              </Link>
              <Link
                to="/medical-history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Medical History
              </Link>
              <Link
                to="/timeline"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Health Timeline
              </Link>
            </>
          )}

          {userRole === 'doctor' && (
            <>
              <Link
                to="/doctor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor/appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                Patient Appointments
              </Link>
              <Link
                to="/doctor/availability"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                Availability Calendar
              </Link>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/verifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Doctor Verifications
              </Link>
              <Link
                to="/admin/hospitals"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Hospitals
              </Link>
              <Link
                to="/admin/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Operational Reports
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
