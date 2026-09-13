import React, { useState, useRef } from 'react';
import { X, User, Mail, Calendar, Clock, RotateCcw, Sparkles, Camera, Upload, Trash2 } from 'lucide-react';
import { UserProfile, Course } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  activeCourse?: Course | null;
  onSaveProfile: (profile: UserProfile, updatedExamDate?: string, updatedTargetHours?: number) => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  activeCourse,
  onSaveProfile,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [avatar, setAvatar] = useState(userProfile.avatar || '');
  const [planTier, setPlanTier] = useState(userProfile.planTier || 'Student');
  const [examDate, setExamDate] = useState(activeCourse?.examDate || '');
  const [targetHours, setTargetHours] = useState(activeCourse?.targetHoursPerWeek || 15);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side file size and format check
    if (file.size > 4 * 1024 * 1024) {
      alert('Photo must be smaller than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleClearPhoto = () => {
    setAvatar('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(
      {
        ...userProfile,
        name: name.trim() || 'Student',
        email: email.trim(),
        avatar,
        planTier,
      },
      examDate,
      Number(targetHours) || 15
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
        className="relative w-full max-w-lg bg-[#141416] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleIn z-10 font-sans"
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
                Customize Profile & Persona
              </h2>
              <p className="text-xs text-zinc-400">
                Set your name, custom picture, and study goals
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
          {/* Custom Avatar Creator & Uploader */}
          <div className="p-4 rounded-2xl bg-[#18181C] border border-white/[0.06] space-y-3">
            <label className="text-xs font-bold text-zinc-300 block font-heading">
              Custom Profile Picture
            </label>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <InitialsAvatar
                  name={name || 'Student'}
                  avatarUrl={avatar}
                  size="xl"
                  className="w-16 h-16 text-xl shadow-lg ring-2 ring-[#F5A623]/60"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#F5A623] text-black shadow hover:opacity-90 transition active:scale-95"
                  aria-label="Upload custom image"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium transition"
                  >
                    Image Link
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Use Initials</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500">
                  Upload your own photo (JPG, PNG, WebP) or use personalized initials.
                </p>
              </div>
            </div>

            {/* Optional URL Input */}
            {showUrlInput && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#141416] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#2DD4BF]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-black text-xs font-bold rounded-xl"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1 font-heading">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623]"
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
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>
          </div>

          {/* Current Certification Target Date & Weekly Goal (if course exists) */}
          {activeCourse && (
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
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#141416] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623]"
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
                      min="1"
                      max="80"
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#141416] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Membership / Plan Tier */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1 font-heading">
              Plan Badge / Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Student, Researcher, Pro Scholar"
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#18181C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Reset Data Danger Zone */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all stored session logs and reset profile to clean state?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear local cache & reset state</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0A0A0C] text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 font-heading"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
