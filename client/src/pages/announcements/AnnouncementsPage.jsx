import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { announcementService, classroomService } from '../../services';
import AnnouncementCard from '../../components/AnnouncementCard';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  Megaphone,
  PlusCircle,
  Search,
  Filter,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('all');

  // Post Announcement Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetClassroom, setTargetClassroom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, classRes] = await Promise.allSettled([
        announcementService.getAll(),
        classroomService.getAll(),
      ]);

      if (annRes.status === 'fulfilled') {
        const list = annRes.value.data?.data || annRes.value.data || [];
        setAnnouncements(list);
      }
      if (classRes.status === 'fulfilled') {
        const cList = classRes.value.data?.data || classRes.value.data || [];
        setClassrooms(cList);
        if (cList.length > 0) setTargetClassroom(cList[0]._id);
      }
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!targetClassroom) {
      toast.error('Please select a classroom');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await announcementService.create({
        classroomId: targetClassroom,
        title,
        message,
      });
      const created = res.data?.data || res.data;
      setAnnouncements((prev) => [created, ...prev]);
      toast.success('Announcement published!');
      setModalOpen(false);
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementService.delete(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success('Announcement deleted');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassroom =
      selectedClassroom === 'all' ||
      a.classroomId?._id === selectedClassroom ||
      a.classroomId === selectedClassroom;
    return matchesSearch && matchesClassroom;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Announcements & Notices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Important updates, scheduling changes, and campus notifications.
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Post Notice
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <EmptyState
            icon={Megaphone}
            title="No Announcements"
            description={
              searchTerm || selectedClassroom !== 'all'
                ? 'No notices match your search criteria.'
                : 'There are no active notices at the moment.'
            }
            actionLabel={user?.role === 'teacher' ? 'Post Announcement' : null}
            onAction={() => setModalOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <AnnouncementCard
              key={item._id}
              announcement={item}
              isOwner={
                user?.role === 'admin' ||
                (user?.role === 'teacher' &&
                  (item.createdBy?._id === user?._id || item.createdBy === user?._id))
              }
              onDelete={() => handleDelete(item._id)}
            />
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post New Classroom Notice"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Classroom *
            </label>
            <select
              required
              value={targetClassroom}
              onChange={(e) => setTargetClassroom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for Lab Exam"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notice Content *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message details for your students..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
