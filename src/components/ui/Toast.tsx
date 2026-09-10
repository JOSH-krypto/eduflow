import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Flame, X } from 'lucide-react';

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
        return <Flame className="w-5 h-5 text-[#F5A623] animate-pulse-subtle" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#2DD4BF]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F5A623]" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'streak':
        return 'border-[#F5A623]/50 bg-[#171512] shadow-lg shadow-[#F5A623]/10';
      case 'success':
        return 'border-[#2DD4BF]/50 bg-[#121816] shadow-lg shadow-[#2DD4BF]/10';
      case 'error':
        return 'border-red-500/50 bg-[#1a1212]';
      default:
        return 'border-white/[0.12] bg-[#141416]';
    }
  };

  return (
    <aside
      aria-label="Notification alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-none"
    >
      <div 
        className={`pointer-events-auto p-4 rounded-2xl border ${getBorderColor()} shadow-2xl flex items-start gap-3 animate-scale-in`}
        role="status"
        aria-live="polite"
      >
        <div className="p-2 rounded-xl bg-white/[0.05] flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white tracking-tight truncate">
            {toast.title}
          </h4>
          <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
