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
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
      case 'streak':
        return <Award className="w-3.5 h-3.5 text-slate-500" />;
      case 'resource':
        return <BookOpen className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        aria-hidden="true" 
      />

      <div 
        className="absolute right-0 top-12 w-80 sm:w-96 z-50 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] shadow-lg overflow-hidden select-none font-sans"
        role="dialog"
        aria-label="Notifications"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#2E2A44] bg-slate-50 dark:bg-[#13111C]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-medium rounded-md bg-slate-200 dark:bg-[#2E2A44] text-slate-800 dark:text-slate-200 tabular-nums">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#2E2A44]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No notifications right now
            </div>
          ) : (
            notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-[#252236] transition-colors cursor-pointer ${
                  !item.read ? 'bg-slate-50/70 dark:bg-[#252236]/40' : ''
                }`}
              >
                <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-[#2E2A44] shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold truncate ${!item.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
