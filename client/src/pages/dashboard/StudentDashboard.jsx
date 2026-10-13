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
import AnnouncementCard from '../../components/AnnouncementCard';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import { formatDate } from '../../utils/helpers';
import {
  BookOpen,
  Calendar,
  FileText,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboard() {
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

  // Calculate stats
  const totalEnrolled = classrooms.length;
  const upcomingClasses = classes.filter((c) => c.status !== 'completed' && c.status !== 'cancelled');
  const pendingAssignments = assignments.filter((a) => !a.mySubmission);
  const completedAssignments = assignments.filter((a) => !!a.mySubmission);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold uppercase tracking-wider text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Student Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-indigo-100 text-sm md:text-base leading-relaxed">
            You have <span className="font-semibold text-white">{upcomingClasses.length} upcoming classes</span> and{' '}
            <span className="font-semibold text-white">{pendingAssignments.length} pending assignments</span> this week. Keep up the great work!
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition"
            >
              <PlusCircle className="w-4 h-4" /> Join Classroom
            </Link>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/30 backdrop-blur px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500/40 transition"
            >
              <Calendar className="w-4 h-4" /> View Timetable
            </Link>
          </div>
        </div>

        {/* Decorative circle shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Enrolled Classrooms"
          value={totalEnrolled}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Upcoming Classes"
          value={upcomingClasses.length}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Pending Tasks"
          value={pendingAssignments.length}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Completed Tasks"
          value={completedAssignments.length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Main Grid: Upcoming Classes & Pending Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Upcoming Classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Live Sessions</h2>
              <p className="text-xs text-slate-500">Scheduled video classes with your teachers</p>
            </div>
            <Link
              to="/schedule"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
              <EmptyState
                icon={Calendar}
                title="No Upcoming Classes"
                description="Your teachers have not scheduled any live classes for today or tomorrow."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingClasses.slice(0, 4).map((item) => (
                <ClassCard
                  key={item._id}
                  scheduledClass={item}
                  userRole="student"
                  onJoin={() => navigate(`/live/${item._id}`)}
                />
              ))}
            </div>
          )}

          {/* Recent Announcements */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Classroom Announcements</h2>
              <Link
                to="/announcements"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
                <EmptyState
                  icon={BookOpen}
                  title="No Announcements Yet"
                  description="When your teachers publish notices, they'll appear right here."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((ann) => (
                  <AnnouncementCard key={ann._id} announcement={ann} isOwner={false} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Pending Assignments & Classrooms Quick List */}
        <div className="space-y-6">
          {/* Due Soon Box */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Assignments Due
              </h3>
              <Link to="/assignments" className="text-xs font-semibold text-indigo-600 hover:underline">
                See all
              </Link>
            </div>

            {pendingAssignments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                🎉 All caught up! No assignments due right now.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 4).map((assign) => (
                  <Link
                    key={assign._id}
                    to={`/assignments/${assign._id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-slate-800 group-hover:text-indigo-600 line-clamp-1">
                        {assign.title}
                      </p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
                        {assign.totalMarks} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>{assign.classroomId?.title || 'Classroom'}</span>
                      <span className="text-rose-500 font-medium">
                        Due {formatDate(assign.dueDate)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Classrooms Snapshot */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> My Classrooms
              </h3>
              <Link to="/classrooms" className="text-xs font-semibold text-indigo-600 hover:underline">
                Explore
              </Link>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-3">You are not enrolled in any classrooms yet.</p>
                <Link
                  to="/join"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100"
                >
                  <PlusCircle size={14} /> Join a Classroom
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {classrooms.slice(0, 4).map((c) => (
                  <Link
                    key={c._id}
                    to={`/classrooms/${c._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{c.subject} &bull; {c.teacherId?.name}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
