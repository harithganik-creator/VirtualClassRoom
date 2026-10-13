import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  classroomService,
  classService,
  assignmentService,
  announcementService,
} from '../../services';
import StatsCard from '../../components/StatsCard';
import ClassCard from '../../components/ClassCard';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import {
  BookOpen,
  Users,
  Calendar,
  FileCheck,
  PlusCircle,
  Video,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [classroomsRes, classesRes, assignmentsRes, announcementsRes] =
        await Promise.allSettled([
          classroomService.getAll(),
          classService.getAll(),
          assignmentService.getAll(),
          announcementService.getAll(),
        ]);

      if (classroomsRes.status === 'fulfilled') {
        setClassrooms(classroomsRes.value.data?.data || classroomsRes.value.data || []);
      }
      if (classesRes.status === 'fulfilled') {
        setClasses(classesRes.value.data?.data || classesRes.value.data || []);
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.data?.data || assignmentsRes.value.data || []);
      }
      if (announcementsRes.status === 'fulfilled') {
        setAnnouncements(announcementsRes.value.data?.data || announcementsRes.value.data || []);
      }
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

  // Teacher calculations
  const totalStudents = classrooms.reduce(
    (acc, c) => acc + (c.studentIds ? c.studentIds.length : 0),
    0
  );
  const upcomingClasses = classes.filter(
    (c) => c.status !== 'completed' && c.status !== 'cancelled'
  );

  // Chart data
  const chartData = classrooms.slice(0, 5).map((c) => ({
    name: c.title.length > 14 ? c.title.slice(0, 12) + '..' : c.title,
    students: c.studentIds ? c.studentIds.length : 0,
    assignments: assignments.filter((a) => a.classroomId?._id === c._id || a.classroomId === c._id).length,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Teacher Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold uppercase tracking-wider text-indigo-100 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-300" /> Teacher Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome, Instructor {user?.name}! 🎓
          </h1>
          <p className="mt-2 text-indigo-100 text-sm md:text-base leading-relaxed">
            Managing <span className="font-semibold text-white">{classrooms.length} active classrooms</span> with{' '}
            <span className="font-semibold text-white">{totalStudents} enrolled students</span>. You have{' '}
            <span className="font-semibold text-white">{upcomingClasses.length} live sessions</span> on your schedule.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/classrooms/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
            >
              <PlusCircle className="w-4 h-4" /> Create Classroom
            </Link>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/30 backdrop-blur px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500/40 transition"
            >
              <Video className="w-4 h-4" /> Schedule Live Class
            </Link>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Classrooms"
          value={classrooms.length}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Scheduled Classes"
          value={upcomingClasses.length}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Active Assignments"
          value={assignments.length}
          icon={FileCheck}
          color="orange"
        />
      </div>

      {/* Visual Analytics & Classroom Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Classroom Enrollment & Activity Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Classroom Overview
                </h2>
                <p className="text-xs text-slate-500">Student enrollment and assignments across courses</p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.75rem',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="students" name="Students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="assignments" name="Assignments" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-10 text-slate-400 text-sm">
                Create classrooms to view student enrollment metrics.
              </p>
            )}
          </div>

          {/* Upcoming Classes Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Live Sessions</h2>
              <Link
                to="/schedule"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Manage Schedule <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingClasses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
                <EmptyState
                  icon={Calendar}
                  title="No Scheduled Sessions"
                  description="Schedule a class to conduct live video lectures via Jitsi Meet."
                  actionLabel="Schedule Now"
                  onAction={() => navigate('/schedule')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingClasses.slice(0, 4).map((item) => (
                  <ClassCard
                    key={item._id}
                    scheduledClass={item}
                    userRole="teacher"
                    onJoin={() => navigate(`/live/${item._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Fast Classroom Access & Announcements */}
        <div className="space-y-6">
          {/* Classrooms List */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> My Classrooms
              </h3>
              <Link to="/classrooms/create" className="text-xs font-semibold text-indigo-600 hover:underline">
                + Create
              </Link>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-3">You haven't created any classrooms yet.</p>
                <Link
                  to="/classrooms/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  <PlusCircle size={14} /> Create Your First Classroom
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {classrooms.slice(0, 5).map((c) => (
                  <Link
                    key={c._id}
                    to={`/classrooms/${c._id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 line-clamp-1">
                        {c.title}
                      </p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.studentIds?.length || 0} students
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>Code: <strong className="text-indigo-600 font-mono">{c.classroomCode}</strong></span>
                      <span>{c.subject}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notice Board */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900">Recent Announcements</h3>
              <Link to="/announcements" className="text-xs font-semibold text-indigo-600 hover:underline">
                View all
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No announcements posted yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-3 rounded-xl bg-slate-50 text-xs">
                    <p className="font-semibold text-slate-800 line-clamp-1">{a.title}</p>
                    <p className="text-slate-500 mt-1 line-clamp-2">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
