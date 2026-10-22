import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white border-slate-200 text-slate-800';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-white border-emerald-200 text-slate-900';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-white border-rose-200 text-slate-900';
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-white border-amber-200 text-slate-900';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && <h5 className="font-semibold text-slate-900 mb-0.5">{toast.title}</h5>}
              <p className="text-slate-600 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
