import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentService, classroomService } from '../../services';
import AssignmentCard from '../../components/AssignmentCard';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Upload,
} from 'lucide-react';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // Create Assignment Modal (Teachers)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, classRes] = await Promise.allSettled([
        assignmentService.getAll(),
        user?.role === 'teacher' ? classroomService.getAll() : Promise.resolve({ data: [] }),
      ]);

      if (assignRes.status === 'fulfilled') {
        const list = assignRes.value.data?.assignments || assignRes.value.data?.data || assignRes.value.data || [];
        setAssignments(list);
      }
      if (classRes.status === 'fulfilled') {
        const cList = classRes.value.data?.data || classRes.value.data || [];
        setClassrooms(cList);
        if (cList.length > 0) setClassroomId(cList[0]._id);
      }
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!classroomId) {
      toast.error('Please select a classroom');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('classroomId', classroomId);
    formData.append('dueDate', dueDate);
    formData.append('totalMarks', totalMarks);
    if (attachment) {
      formData.append('file', attachment);
    }

    try {
      setIsSubmitting(true);
      const res = await assignmentService.create(formData);
      const created = res.data?.assignment || res.data?.data || res.data;
      setAssignments((prev) => [created, ...prev]);
      toast.success('Assignment created successfully!');
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAttachment(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.classroomId?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') {
      return !a.submission;
    }
    if (filterTab === 'submitted') {
      return a.submission && a.submission.marks === undefined;
    }
    if (filterTab === 'graded') {
      return a.submission && a.submission.marks !== undefined;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Assignments & Coursework
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === 'teacher'
              ? 'Create assessments, review student deliverables, and submit graded marks.'
              : 'Submit homework files, verify due dates, and track your evaluation grades.'}
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Create Assignment
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {user?.role === 'student' && (
          <div className="flex items-center gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'To Do' },
              { key: 'submitted', label: 'Submitted' },
              { key: 'graded', label: 'Graded' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <EmptyState
            icon={FileText}
            title="No Assignments Found"
            description={
              searchTerm
                ? 'No assignments match your search.'
                : 'There are currently no assignments posted in this section.'
            }
            actionLabel={user?.role === 'teacher' ? 'Create Assignment' : null}
            onAction={() => setCreateModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((item) => (
            <AssignmentCard
              key={item._id}
              assignment={item}
              submission={item.submission || null}
              userRole={user?.role}
              onView={() => navigate(`/assignments/${item._id}`)}
              onGrade={
                user?.role === 'teacher'
                  ? () => navigate(`/assignments/${item._id}/grade`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classroom *
            </label>
            <select
              required
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
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
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Problem Set 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Marks *
              </label>
              <input
                type="number"
                required
                min={1}
                max={1000}
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed guidelines, formatting instructions, or requirements..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attachment / Worksheet (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
