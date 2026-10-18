import React from 'react';
import { CheckCircle2, AlertCircle, Info, Flame, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'streak' | 'info' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'streak':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'streak':
        return 'border-amber-200 dark:border-amber-900/60 bg-white dark:bg-[#1C1929] text-slate-900 dark:text-white';
      case 'success':
        return 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-[#1C1929] text-slate-900 dark:text-white';
      case 'error':
        return 'border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#1C1929] text-slate-900 dark:text-white';
      default:
        return 'border-slate-200 dark:border-[#2E2A44] bg-white dark:bg-[#1C1929] text-slate-900 dark:text-white';
    }
  };

  return (
    <aside
      aria-label="Notification alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-none"
    >
      <div 
        className={`pointer-events-auto p-3.5 rounded-xl border ${getBorderColor()} shadow-md flex items-start gap-3 animate-scale-in`}
        role="status"
        aria-live="polite"
      >
        <div className="p-1 rounded-md bg-slate-100 dark:bg-[#13111C] flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight truncate">
            {toast.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
