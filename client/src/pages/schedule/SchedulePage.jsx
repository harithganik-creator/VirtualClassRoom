import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classService, classroomService } from '../../services';
import ClassCard from '../../components/ClassCard';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  Calendar,
  Video,
  PlusCircle,
  Filter,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [classTitle, setClassTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, classroomRes] = await Promise.allSettled([
        classService.getAll(),
        user?.role === 'teacher' ? classroomService.getAll() : Promise.resolve({ data: [] }),
      ]);

      if (classRes.status === 'fulfilled') {
        const list = classRes.value.data?.classes || classRes.value.data?.data || classRes.value.data || [];
        setClasses(list);
      }
      if (classroomRes.status === 'fulfilled') {
        const cList = classroomRes.value.data?.data || classroomRes.value.data || [];
        setClassrooms(cList);
        if (cList.length > 0) setSelectedClassroom(cList[0]._id);
      }
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!selectedClassroom) {
      toast.error('Please select a classroom');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await classService.create({
        classroomId: selectedClassroom,
        title: classTitle,
        startTime,
        endTime,
      });
      const created = res.data?.class || res.data?.data || res.data;
      setClasses((prev) => [created, ...prev]);
      toast.success('Live class scheduled successfully!');
      setScheduleModalOpen(false);
      setClassTitle('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await classService.delete(deleteId);
      setClasses((prev) => prev.filter((c) => c._id !== deleteId));
      toast.success('Class session cancelled and removed');
      setDeleteId(null);
    } catch {
      toast.error('Failed to cancel session');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'live') return c.status === 'live';
    if (filterStatus === 'scheduled') return c.status === 'scheduled';
    if (filterStatus === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Live Class Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Join ongoing video meetings and review upcoming lectures.
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Schedule New Session
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-fit">
        {[
          { key: 'all', label: 'All Sessions' },
          { key: 'live', label: '🟢 Live Now' },
          { key: 'scheduled', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === item.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Class List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <EmptyState
            icon={Calendar}
            title="No Class Sessions Found"
            description={
              filterStatus !== 'all'
                ? `There are no sessions with status "${filterStatus}".`
                : 'No classes are scheduled at the moment.'
            }
            actionLabel={user?.role === 'teacher' ? 'Schedule a Session' : null}
            onAction={() => setScheduleModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item._id}
              scheduledClass={item}
              userRole={user?.role}
              onJoin={() => navigate(`/live/${item._id}`)}
              onDelete={
                user?.role === 'teacher' || user?.role === 'admin'
                  ? () => setDeleteId(item._id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Schedule Live Class Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Live Class (Jitsi Meet)"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Classroom *
            </label>
            <select
              required
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Title *
            </label>
            <input
              type="text"
              required
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              placeholder="e.g. Chapter 6: Thermodynamics Discussion"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
            <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
            <span>
              A unique Jitsi video conference room ID will be automatically generated and shared with all students enrolled in this classroom.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Class Session"
        message="Are you sure you want to cancel this scheduled class? Enrolled students will be notified."
        confirmText={isDeleting ? 'Cancelling...' : 'Cancel Session'}
        confirmVariant="danger"
      />
    </div>
  );
}
