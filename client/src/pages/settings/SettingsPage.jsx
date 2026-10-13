import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Lock,
  Globe,
  Palette,
  Shield,
  Save,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [classReminders, setClassReminders] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    toast.success('Notification preferences updated!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please complete both password fields');
      return;
    }
    toast.success('Security settings saved!');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize notifications, privacy preferences, and account security.
        </p>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Alert & Notification Delivery</h2>
            <p className="text-xs text-slate-500">Choose which notifications you wish to receive</p>
          </div>
        </div>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive summaries and announcements via email</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-800">Live Class Reminders</p>
              <p className="text-xs text-slate-500">Get alerted 15 minutes before scheduled meetings</p>
            </div>
            <input
              type="checkbox"
              checked={classReminders}
              onChange={(e) => setClassReminders(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-800">Assignment Grade Alerts</p>
              <p className="text-xs text-slate-500">Immediate push notification when grades are posted</p>
            </div>
            <input
              type="checkbox"
              checked={gradeAlerts}
              onChange={(e) => setGradeAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Save size={14} /> Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Security & Authentication</h2>
            <p className="text-xs text-slate-500">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Check size={14} /> Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
