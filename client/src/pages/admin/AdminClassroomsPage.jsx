import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classroomService } from '../../services';
import Spinner from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Search,
  Trash2,
  ExternalLink,
  Users,
} from 'lucide-react';

export default function AdminClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await classroomService.getAll();
      setClassrooms(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await classroomService.delete(deleteId);
      setClassrooms((prev) => prev.filter((c) => c._id !== deleteId));
      toast.success('Classroom deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete classroom');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClassrooms = classrooms.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          All Classrooms ({classrooms.length})
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor all active learning spaces and course offerings across the platform.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classrooms or instructors..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Classroom Title</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Instructor</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Enrolled</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassrooms.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {c.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {c.subject || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {c.teacherId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600">
                      {c.classroomCode}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.studentIds?.length || 0} students
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/classrooms/${c._id}`}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                          title="View classroom"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(c._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete classroom"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Classroom (Platform Admin)"
        message="Are you sure you want to permanently delete this classroom and all associated records?"
        confirmText={isDeleting ? 'Deleting...' : 'Delete Classroom'}
        confirmVariant="danger"
      />
    </div>
  );
}
