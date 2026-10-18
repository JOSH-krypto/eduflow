import React from 'react';

interface InitialsAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return 'EF';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  if (avatarUrl && avatarUrl.trim().length > 0 && !avatarUrl.includes('placeholder')) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 dark:border-[#2E2A44] ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-[#2E2A44] flex items-center justify-center shrink-0 select-none ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};
