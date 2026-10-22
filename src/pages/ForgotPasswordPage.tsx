import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Stethoscope } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useNotification();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSent(true);
    showToast('info', 'Password recovery instructions sent to your email.');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset your password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered email and we'll send you secure instructions to reset your password.
          </p>
        </div>

        {isSent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Check your inbox</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We've dispatched a password reset link to <strong>{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Registered Email Address</label>
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition cursor-pointer"
            >
              Send Password Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
