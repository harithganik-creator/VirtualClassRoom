import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import StatsCard from '../../components/StatsCard';
import Spinner from '../../components/Spinner';
import Avatar from '../../components/Avatar';
import { formatDate } from '../../utils/helpers';
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  ShieldCheck,
  UserCheck,
  UserX,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      setData(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    activeUsers: 0,
    suspendedUsers: 0,
  };
  const recentUsers = data?.recentUsers || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> System Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Platform Administration
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
            Monitor real-time system health, manage accounts, audit classroom compliance, and maintain community safety.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <Users className="w-4 h-4" /> Manage All Users
            </Link>
            <Link
              to="/admin/classrooms"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <BookOpen className="w-4 h-4" /> View All Classrooms
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Enrolled Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="Active Teachers"
          value={stats.totalTeachers}
          icon={Briefcase}
          color="purple"
        />
        <StatsCard
          title="Created Classrooms"
          value={stats.totalClassrooms}
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Accounts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeUsers}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Suspended Accounts</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.suspendedUsers}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Assignments</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalAssignments}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recently Registered Users</h2>
            <p className="text-xs text-slate-500">Latest members who joined the LearnConnect platform</p>
          </div>
          <Link
            to="/admin/users"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage users <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-700'
                          : u.role === 'teacher'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.accountStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {u.accountStatus || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/admin/users"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
