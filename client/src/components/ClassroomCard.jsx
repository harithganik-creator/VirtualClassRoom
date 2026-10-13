import React from 'react';
import { Users, BookOpen, Edit, Trash2, Code } from 'lucide-react';

const subjectGradients = {
  Mathematics: 'from-blue-500 to-indigo-600',
  Science: 'from-green-500 to-teal-600',
  English: 'from-yellow-500 to-orange-500',
  History: 'from-amber-600 to-red-500',
  Geography: 'from-teal-500 to-cyan-600',
  Physics: 'from-indigo-500 to-purple-600',
  Chemistry: 'from-purple-500 to-pink-600',
  Biology: 'from-emerald-500 to-green-600',
  'Computer Science': 'from-cyan-500 to-blue-600',
  Art: 'from-pink-500 to-rose-600',
  Music: 'from-violet-500 to-purple-600',
  default: 'from-indigo-500 to-purple-600',
};

/**
 * Classroom card for the listing page.
 *
 * Props:
 *  - classroom  {object}  – { title, description, subject, teacherId{name}, classroomCode, studentIds, createdAt, status }
 *  - onClick    {() => void}
 *  - onEdit     {() => void}
 *  - onDelete   {() => void}
 *  - userRole   {string}
 */
export default function ClassroomCard({ classroom, onClick, onEdit, onDelete, userRole }) {
  const {
    title,
    description,
    subject,
    teacherId,
    classroomCode,
    studentIds = [],
    status,
  } = classroom;

  const gradient = subjectGradients[subject] || subjectGradients.default;
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Gradient header */}
      <div className={`relative bg-gradient-to-br ${gradient} px-5 py-6`}>
        {/* Subject badge */}
        <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {subject || 'General'}
        </span>

        {/* Status dot */}
        {status === 'active' && (
          <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
        )}

        {/* Title */}
        <h3 className="mt-3 truncate text-lg font-bold text-white">{title}</h3>

        {/* Teacher */}
        <p className="mt-1 text-sm text-white/80">
          {teacherId?.name || 'Unknown Teacher'}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            {studentIds.length} student{studentIds.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-gray-400" />
            {subject || 'General'}
          </span>
        </div>

        {/* Classroom code (teachers/admin only) */}
        {isTeacherOrAdmin && classroomCode && (
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <Code className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-mono font-semibold tracking-widest">{classroomCode}</span>
          </div>
        )}

        {/* Action buttons */}
        {isTeacherOrAdmin && (onEdit || onDelete) && (
          <div className="mt-auto flex items-center gap-2 pt-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
