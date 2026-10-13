import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { formatDate, isOverdue } from '../utils/helpers';

const statusConfig = {
  Submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
  },
  Graded: {
    label: 'Graded',
    className: 'bg-green-100 text-green-700',
    icon: Star,
  },
  Pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  Late: {
    label: 'Late',
    className: 'bg-red-100 text-red-700',
    icon: AlertCircle,
  },
};

function getSubmissionStatus(submission, dueDate) {
  if (!submission) {
    return isOverdue(dueDate) ? 'Late' : 'Pending';
  }
  if (submission.grade !== undefined && submission.grade !== null) return 'Graded';
  return 'Submitted';
}

/**
 * Assignment card.
 *
 * Props:
 *  - assignment  {object}  – { title, classroomId{title}, dueDate, totalMarks, description }
 *  - submission  {object|null}
 *  - userRole    {string}
 *  - onView      {() => void}
 *  - onGrade     {() => void}
 */
export default function AssignmentCard({ assignment, submission, userRole, onView, onGrade }) {
  const { title, classroomId, dueDate, totalMarks, description } = assignment;

  const statusKey = getSubmissionStatus(submission, dueDate);
  const status = statusConfig[statusKey];
  const StatusIcon = status.icon;

  const dueDateOverdue = isOverdue(dueDate) && statusKey !== 'Submitted' && statusKey !== 'Graded';
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
            {classroomId?.title && (
              <p className="mt-0.5 text-xs text-gray-500">{classroomId.title}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">{description}</p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className={`flex items-center gap-1 ${dueDateOverdue ? 'text-red-500 font-medium' : ''}`}>
          <Clock className="h-4 w-4" />
          Due {formatDate(dueDate)}
          {dueDateOverdue && ' (Overdue)'}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-amber-400" />
          {totalMarks} marks
        </span>
      </div>

      {/* Graded marks */}
      {statusKey === 'Graded' && submission?.grade !== undefined && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm">
          <Star className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-700">
            {submission.grade} / {totalMarks}
          </span>
          <span className="text-green-600">marks obtained</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onView}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          View Assignment
        </button>
        {isTeacherOrAdmin && onGrade && (
          <button
            onClick={onGrade}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Grade
          </button>
        )}
      </div>
    </div>
  );
}
