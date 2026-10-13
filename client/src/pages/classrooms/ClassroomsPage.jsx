import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classroomService } from '../../services';
import ClassroomCard from '../../components/ClassroomCard';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  GraduationCap,
} from 'lucide-react';

const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
];

export default function ClassroomsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  // Delete modal state
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
      toast.success('Classroom deleted successfully');
      setClassrooms((prev) => prev.filter((c) => c._id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete classroom');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClassrooms = classrooms.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === 'All Subjects' || item.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'student' ? 'My Enrolled Classrooms' : 'Classrooms'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.role === 'student'
              ? 'Browse your enrolled courses, lecture notes, and classroom communities.'
              : 'Manage virtual learning spaces, student enrollments, and syllabus materials.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'teacher' && (
            <Link
              to="/classrooms/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" /> Create Classroom
            </Link>
          )}

          {user?.role === 'student' && (
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <GraduationCap className="w-4 h-4" /> Join Classroom
            </Link>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search classrooms or subjects..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Classrooms Grid or Empty */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <EmptyState
            icon={BookOpen}
            title="No Classrooms Found"
            description={
              searchTerm || selectedSubject !== 'All Subjects'
                ? 'No classrooms match your search filters. Try adjusting your search term.'
                : user?.role === 'student'
                ? "You haven't joined any classrooms yet. Use an invite code from your teacher."
                : "You haven't created any classrooms yet. Start by creating your first classroom."
            }
            actionLabel={
              user?.role === 'student' ? 'Join Classroom' : user?.role === 'teacher' ? 'Create Classroom' : null
            }
            onAction={() =>
              navigate(user?.role === 'student' ? '/join' : '/classrooms/create')
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((item) => (
            <ClassroomCard
              key={item._id}
              classroom={item}
              userRole={user?.role}
              onClick={() => navigate(`/classrooms/${item._id}`)}
              onDelete={
                user?.role === 'teacher' || user?.role === 'admin'
                  ? () => setDeleteId(item._id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Classroom"
        message="Are you sure you want to delete this classroom? All materials, assignments, and schedules linked to it will be permanently removed."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Classroom'}
        confirmVariant="danger"
      />
    </div>
  );
}
