import React from 'react';

/**
 * Empty state display with optional call-to-action.
 *
 * Props:
 *  - icon        {LucideIcon} – Lucide React icon component
 *  - title       {string}
 *  - description {string}
 *  - actionLabel {string}   (optional)
 *  - onAction    {() => void} (optional)
 */
export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <Icon className="h-8 w-8 text-indigo-400" strokeWidth={1.5} />
        </div>
      )}

      <h3 className="mb-1 text-lg font-semibold text-gray-800">{title}</h3>

      {description && (
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
