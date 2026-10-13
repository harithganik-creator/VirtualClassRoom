import React from 'react';
import { FileText, Bell, Video, Star, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  assignment: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  announcement: { icon: Bell, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  class: { icon: Video, color: 'text-green-500', bg: 'bg-green-50' },
  grade: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  system: { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' },
};

/**
 * Notification list item.
 *
 * Props:
 *  - notification  {object}  – { title, message, type, readAt, createdAt, link }
 *  - onClick       {() => void}
 */
export default function NotificationItem({ notification, onClick }) {
  const { title, message, type, readAt, createdAt } = notification;

  const isUnread = !readAt;
  const cfg = typeConfig[type] || typeConfig.system;
  const Icon = cfg.icon;

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        isUnread ? 'bg-indigo-50/60' : 'bg-white'
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
      >
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {title}
          </p>
          {isUnread && (
            <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
          )}
        </div>
        {message && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{message}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{timeAgo}</p>
      </div>
    </button>
  );
}
