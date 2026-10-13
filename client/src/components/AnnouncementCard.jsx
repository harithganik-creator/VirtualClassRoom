import React from 'react';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getInitials, getAvatarColor } from '../utils/helpers';

/**
 * Announcement card.
 *
 * Props:
 *  - announcement  {object}  – { title, message, createdBy{name, profileImage}, createdAt, classroomId{title} }
 *  - onEdit        {() => void}
 *  - onDelete      {() => void}
 *  - isOwner       {boolean}
 */
export default function AnnouncementCard({ announcement, onEdit, onDelete, isOwner }) {
  const { title, message, createdBy, createdAt, classroomId } = announcement;

  const authorName = createdBy?.name || 'Unknown';
  const initials = getInitials(authorName);
  const avatarColor = getAvatarColor(authorName);

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : '';

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      {/* Author row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {createdBy?.profileImage ? (
            <img
              src={createdBy.profileImage}
              alt={authorName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor}`}
            >
              {initials}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>

        {/* Classroom badge */}
        {classroomId?.title && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            <BookOpen className="h-3 w-3" />
            {classroomId.title}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{message}</p>
      </div>

      {/* Actions (owner only) */}
      {isOwner && (
        <div className="mt-4 flex items-center gap-2 border-t border-gray-50 pt-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
