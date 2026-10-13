import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    badge: 'text-blue-700',
  },
  green: {
    icon: 'bg-green-100 text-green-600',
    badge: 'text-green-700',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    badge: 'text-purple-700',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600',
    badge: 'text-orange-700',
  },
};

/**
 * Dashboard statistics card.
 *
 * Props:
 *  - title   {string}
 *  - value   {string|number}
 *  - icon    {LucideIcon}
 *  - change  {number}  (optional) – positive or negative percentage change
 *  - color   {'blue'|'green'|'purple'|'orange'}  default 'blue'
 */
export default function StatsCard({ title, value, icon: Icon, change, color = 'blue' }) {
  const colors = colorMap[color] || colorMap.blue;
  const isPositive = change >= 0;

  return (
    <div className="flex items-start justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md">
      {/* Left: text */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>

        {change !== undefined && change !== null && (
          <div
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change}% from last month
            </span>
          </div>
        )}
      </div>

      {/* Right: icon */}
      {Icon && (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
