import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { UserRole } from '../types/database';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await login(email);
      showToast('success', 'Logged in successfully!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    setError('');
    try {
      let demoEmail = 'rahul.verma@example.com';
      let dest = '/dashboard';

      if (role === 'doctor') {
        demoEmail = 'dr.priya@apollo.org';
        dest = '/doctor/dashboard';
      } else if (role === 'admin') {
        demoEmail = 'admin@healthcare.org';
        dest = '/admin';
      }

      await login(demoEmail, role);
      showToast('success', `Signed in as Demo ${role.toUpperCase()}`);
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500">Access your hospital appointments, medical records, and consultations.</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Instant Demo Account Sign-in
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('patient')}
              className="px-2 py-2 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition text-center"
            >
              Patient
              <span className="text-[10px] block font-normal text-brand-600">Rahul Verma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('doctor')}
              className="px-2 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition text-center"
            >
              Doctor
              <span className="text-[10px] block font-normal text-teal-600">Dr. Priya</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-2 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition text-center"
            >
              Admin
              <span className="text-[10px] block font-normal text-purple-600">Hospital Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
