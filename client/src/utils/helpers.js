import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a date to a readable string like 'Oct 13, 2026'
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date+time like 'Oct 13, 2026 at 2:30 PM'
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}

/**
 * Formats a date as relative time, e.g. '3 hours ago'
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTimeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Returns the first 2 initials from a full name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns a consistent Tailwind bg-color class based on the name string
 * @param {string} name
 * @returns {string}
 */
export function getAvatarColor(name) {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  if (!name) return colors[0];
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Returns true if the given date is in the past
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

/**
 * Derives the effective class status considering real-time window
 * @param {string|Date} startTime
 * @param {string|Date} endTime
 * @param {string} status - stored status from DB
 * @returns {'live'|'upcoming'|'completed'|'cancelled'}
 */
export function getClassStatus(startTime, endTime, status) {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';

  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  return 'completed';
}

/**
 * Truncates text to maxLength characters, appending '...' if truncated
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}
