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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl border border-purple-100 shadow-2xl overflow-hidden p-6 sm:p-7 z-10 animate-scale-in space-y-4"
        role="dialog"
        aria-label={mode === 'signin' ? 'Sign In to EduFlow' : 'Create an EduFlow Account'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white font-bold font-heading flex items-center justify-center text-xs">
              EF
            </div>
            <span className="font-heading font-extrabold text-base text-[#1E1B4B]">
              EduFlow
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Close authentication"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-xl font-extrabold text-[#1E1B4B] font-heading tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Start your study journey'}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === 'signin' 
              ? 'Sign in to access your synchronized study path' 
              : 'Create an account to track your certifications'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-600 block mb-1 font-heading">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8F7FC] border border-purple-100/80 rounded-2xl text-[#1E1B4B] placeholder-zinc-400 focus:outline-none focus:border-[#8B5CF6] focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-zinc-600 block mb-1 font-heading">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8F7FC] border border-purple-100/80 rounded-2xl text-[#1E1B4B] placeholder-zinc-400 focus:outline-none focus:border-[#8B5CF6] focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 block mb-1 font-heading">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8F7FC] border border-purple-100/80 rounded-2xl text-[#1E1B4B] placeholder-zinc-400 focus:outline-none focus:border-[#8B5CF6] focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-extrabold text-xs sm:text-sm font-heading shadow-md shadow-purple-200/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-zinc-500 border-t border-purple-50">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#7C3AED] font-bold hover:underline font-heading"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#7C3AED] font-bold hover:underline font-heading"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
