import React from 'react';
import { Video, Clock, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatDateTime, getClassStatus } from '../utils/helpers';

const statusStyles = {
  live: {
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500 animate-pulse',
    label: 'Live',
  },
  upcoming: {
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
    label: 'Scheduled',
  },
  completed: {
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
    label: 'Completed',
  },
  cancelled: {
    badge: 'bg-red-100 text-red-600',
    dot: 'bg-red-400',
    label: 'Cancelled',
  },
};

/**
 * Scheduled class card.
 *
 * Props:
 *  - scheduledClass  {object}  – { title, classroomId{title}, teacherId{name}, startTime, endTime, status, meetingRoomId }
 *  - onJoin          {() => void}
 *  - onEdit          {() => void}
 *  - onDelete        {() => void}
 *  - userRole        {string}
 */
export default function ClassCard({ scheduledClass, onJoin, onEdit, onDelete, userRole }) {
  const { title, classroomId, teacherId, startTime, endTime, status, meetingRoomId } =
    scheduledClass;

  const effectiveStatus = getClassStatus(startTime, endTime, status);
  const style = statusStyles[effectiveStatus] || statusStyles.upcoming;

  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';
  const canJoin = effectiveStatus === 'live' || effectiveStatus === 'upcoming';
  const isLive = effectiveStatus === 'live';

  // Disable join button if upcoming but hasn't started yet (extra guard)
  const startDate = new Date(startTime);
  const joinDisabled = !isLive && new Date() < startDate;

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              isLive ? 'bg-green-50' : 'bg-indigo-50'
            }`}
          >
            <Video className={`h-5 w-5 ${isLive ? 'text-green-600' : 'text-indigo-600'}`} />
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
          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        {teacherId?.name && (
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            {teacherId.name}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          {formatDate(startTime)}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          {new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          {' – '}
          {new Date(endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 border-t border-gray-50 pt-1">
        {canJoin && (
          <button
            onClick={onJoin}
            disabled={joinDisabled}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isLive
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Video className="h-4 w-4" />
            {isLive ? 'Join Now' : 'Join Class'}
          </button>
        )}

        {isTeacherOrAdmin && (
          <>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
