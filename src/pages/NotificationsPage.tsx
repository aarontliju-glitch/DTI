import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCircle2, Clock, Shield, Calendar, ArrowRight } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { userRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    if (n.appointment_id) {
      if (userRole === 'doctor') {
        navigate('/doctor/appointments');
      } else {
        navigate(`/appointments/${n.appointment_id}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-brand-600" />
              Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time updates regarding appointment requests, doctor confirmations, and verification decisions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition self-start sm:self-auto cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You will receive updates here whenever appointment requests or clinical status updates take place.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 transition cursor-pointer flex items-start gap-4 hover:bg-slate-50 ${
                !n.is_read ? 'bg-brand-50/40' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                !n.is_read ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {n.notification_type.includes('appointment') ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.appointment_id && (
                  <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 pt-1">
                    <span>View associated appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
