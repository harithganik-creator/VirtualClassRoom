import React from 'react';
import { getInitials, getAvatarColor } from '../utils/helpers';

const sizeConfig = {
  sm: { wrapper: 'h-8 w-8', text: 'text-xs', img: 'h-8 w-8' },
  md: { wrapper: 'h-10 w-10', text: 'text-sm', img: 'h-10 w-10' },
  lg: { wrapper: 'h-14 w-14', text: 'text-lg', img: 'h-14 w-14' },
  xl: { wrapper: 'h-20 w-20', text: 'text-2xl', img: 'h-20 w-20' },
};

/**
 * User avatar component.
 *
 * Props:
 *  - user  {object}  – { name, profileImage }
 *  - size  {'sm'|'md'|'lg'|'xl'}  default 'md'
 */
export default function Avatar({ user, size = 'md' }) {
  const cfg = sizeConfig[size] || sizeConfig.md;
  const name = user?.name || '';
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={name}
        className={`${cfg.img} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${cfg.wrapper} ${colorClass} flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${cfg.text}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
