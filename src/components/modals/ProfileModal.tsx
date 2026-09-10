import React, { useState } from 'react';
import { X, User, Mail, Calendar, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { UserProfile, Course } from '../../types/eduflow';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activeCourse: Course;
  onSaveProfile: (profile: UserProfile, updatedExamDate?: string, updatedTargetHours?: number) => void;
  onResetData: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  activeCourse,
  onSaveProfile,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email || 'alex.rivera@example.com');
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [planTier, setPlanTier] = useState(userProfile.planTier || 'Pro Student');
  const [examDate, setExamDate] = useState(activeCourse.examDate || '2026-09-24');
  const [targetHours, setTargetHours] = useState(activeCourse.targetHoursPerWeek || 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(
      {
        ...userProfile,
        name: name.trim(),
        email: email.trim(),
        avatar,
        planTier,
      },
      examDate,
      Number(targetHours) || 20
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-lg bg-[#141416] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn z-10"
        role="dialog"
        aria-label="Edit User Profile and Study Goals"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#18181C] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                User Profile & Study Goals
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Customize your study persona and exam deadline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2 font-heading">
              Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#F5A623] shadow-md flex-shrink-0"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden transition-all ${
                      avatar === preset ? 'ring-2 ring-[#2DD4BF] scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1 font-heading">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623] font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1 font-heading">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623] font-sans"
                />
              </div>
            </div>
          </div>

          {/* Current Certification Target Date & Weekly Goal */}
          <div className="p-4 rounded-2xl bg-[#18181C] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5A623] font-heading">
              <Sparkles className="w-4 h-4 text-[#F5A623]" />
              <span>Active Track: {activeCourse.title}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1 font-heading">
                  Exam Date Deadline
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#141416] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623] font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1 font-heading">
                  Target Study Hours/Week
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#141416] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership / Plan Tier */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 font-heading">
              Plan Badge
            </label>
            <select
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#18181C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623] font-sans"
            >
              <option value="Pro Student">Pro Student (Full Access)</option>
              <option value="Free Tier">Free Tier</option>
              <option value="Enterprise Scholar">Enterprise Scholar</option>
            </select>
          </div>

          {/* Reset All Data Danger Zone */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all courses, progress, and summaries back to initial seed data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all progress to demo defaults</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0A0A0C] text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 font-heading"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
