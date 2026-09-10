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
  // Extract clean initials
  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return 'EF';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Size styling mapping
  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-20 h-20 text-xl',
  };

  // If real uploaded photo exists (and not empty)
  if (avatarUrl && avatarUrl.trim().length > 0 && !avatarUrl.includes('placeholder')) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-purple-200/60 shadow-sm ${className}`}
      />
    );
  }

  // Initials Avatar on solid pastel lavender background
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] text-[#6D28D9] font-bold font-heading flex items-center justify-center ring-2 ring-white shadow-sm flex-shrink-0 select-none ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};
