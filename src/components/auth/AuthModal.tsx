import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile } from '../../types/eduflow';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.register({
          email: email.trim(),
          password,
          name: name.trim() || email.split('@')[0],
        });
        onAuthSuccess(res.user);
      } else {
        const res = await api.login({
          email: email.trim(),
          password,
        });
        onAuthSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true" 
      />

      <div 
        className="relative w-full max-w-sm bg-white dark:bg-[#1C1929] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-md p-6 sm:p-7 z-10 space-y-4"
        role="dialog"
        aria-label={mode === 'signin' ? 'Sign in to EduFlow' : 'Create an EduFlow account'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs tracking-tight">
              EF
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">
              EduFlow
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-[#2E2A44] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {mode === 'signin' 
              ? 'Enter your credentials to access your courses' 
              : 'Create an account to track your certification courses'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Your name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#2E2A44]">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-slate-900 dark:text-white font-semibold hover:underline underline-offset-2 cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-slate-900 dark:text-white font-semibold hover:underline underline-offset-2 cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
