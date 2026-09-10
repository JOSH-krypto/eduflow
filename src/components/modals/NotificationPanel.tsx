import React from 'react';
import { Bell, Clock, Award, BookOpen, Info } from 'lucide-react';
import { NotificationItem } from '../../types/eduflow';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4 text-[#F5A623]" />;
      case 'streak':
        return <Award className="w-4 h-4 text-[#2DD4BF]" />;
      case 'resource':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Dropdown Container */}
      <div 
        className="absolute right-0 top-14 w-80 sm:w-96 z-50 rounded-2xl bg-[#141416] border border-white/[0.12] shadow-2xl overflow-hidden animate-scale-in"
        role="dialog"
        aria-label="Notifications Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-[#18181C]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F5A623]" />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-[#F5A623] text-black">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-zinc-400 hover:text-[#F5A623] font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No notifications right now
            </div>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-white/[0.04] transition-colors ${
                  !item.read ? 'bg-[#F5A623]/[0.03]' : ''
                }`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-white/[0.04] flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold truncate ${!item.read ? 'text-white' : 'text-zinc-300'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex-shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] mt-2 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#18181C] border-t border-white/[0.06] text-center">
          <span className="text-[11px] text-zinc-400">
            Study streaks & deadlines sync automatically
          </span>
        </div>
      </div>
    </>
  );
};
