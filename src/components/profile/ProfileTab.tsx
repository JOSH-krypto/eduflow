import React, { useState, useRef } from 'react';
import {
  Camera,
  Mail,
  Clock,
  Award,
  Bell,
  Sparkles,
  Palette,
  ShieldCheck,
  LogOut,
  Check,
  Cloud,
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserPreferences } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { api } from '../../services/api';

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSignOut?: () => void;
  isBackendConnected?: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  onUpdateProfile,
  onSignOut,
  isBackendConnected = false,
}) => {
  const [name, setName] = useState(profile.name || 'Alex Chen');
  const [email, setEmail] = useState(profile.email || 'alex.chen@university.edu');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(profile.weeklyTargetHours || 15);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<UserPreferences>(
    profile.preferences || {
      preferredStudyDays: [1, 2, 3, 4, 5],
      preferredStudyTime: 'morning',
      streakReminders: true,
      examCountdownAlerts: true,
      newResourceAlerts: true,
      accentColor: '#8B5CF6',
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const daysOfWeek = [
    { label: 'M', day: 1, full: 'Mon' },
    { label: 'T', day: 2, full: 'Tue' },
    { label: 'W', day: 3, full: 'Wed' },
    { label: 'T', day: 4, full: 'Thu' },
    { label: 'F', day: 5, full: 'Fri' },
    { label: 'S', day: 6, full: 'Sat' },
    { label: 'S', day: 0, full: 'Sun' },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Morning', sub: '6am - 12pm', icon: Coffee },
    { id: 'afternoon', label: 'Afternoon', sub: '12pm - 5pm', icon: Sun },
    { id: 'evening', label: 'Evening', sub: '5pm - 9pm', icon: Sunset },
    { id: 'night', label: 'Night', sub: '9pm - 1am', icon: Moon },
  ];

  const accentColors = [
    { name: 'Lavender Violet', hex: '#8B5CF6', bg: 'bg-violet-500' },
    { name: 'Ocean Teal', hex: '#0D9488', bg: 'bg-teal-600' },
    { name: 'Emerald Sage', hex: '#10B981', bg: 'bg-emerald-500' },
    { name: 'Warm Amber', hex: '#F59E0B', bg: 'bg-amber-500' },
    { name: 'Soft Rose', hex: '#F43F5E', bg: 'bg-rose-500' },
  ];

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image size must be under 4MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const photoUrl = await api.uploadProfilePhoto(file);
      setAvatar(photoUrl);
      const updatedProfile = { ...profile, avatar: photoUrl };
      onUpdateProfile(updatedProfile);
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const localUrl = event.target?.result as string;
        setAvatar(localUrl);
        onUpdateProfile({ ...profile, avatar: localUrl });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDay = (day: number) => {
    const current = preferences.preferredStudyDays || [];
    const updatedDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setPreferences({ ...preferences, preferredStudyDays: updatedDays });
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name,
      email,
      avatar,
      weeklyTargetHours,
      preferences,
    };
    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 animate-fade-in font-sans">
      {/* Page Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-heading">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your schedule, study targets, and sync settings
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100/80 rounded-full text-xs font-semibold text-violet-700">
          <Cloud className={`w-4 h-4 ${isBackendConnected ? 'text-emerald-500' : 'text-violet-500'}`} />
          <span>{isBackendConnected ? 'Cloud Synced' : 'Offline Ready'}</span>
        </div>
      </div>

      {/* Responsive Grid: 2 Columns on Desktop ≥1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (lg:col-span-6): Avatar, Personal Details, Study Schedule */}
        <div className="lg:col-span-6 space-y-6">
          {/* Avatar & Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative self-center sm:self-auto">
                <InitialsAvatar
                  name={name}
                  avatarUrl={avatar}
                  size="xl"
                  className="w-20 h-20 sm:w-24 sm:h-24 text-2xl shadow-soft"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Upload profile photo"
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-heading">{name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 text-violet-700">
                    {profile.planTier || 'Pro Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {email}
                </p>

                {uploadError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-500" />
                    <span>
                      <strong className="text-slate-800 font-semibold">{profile.totalHoursStudied || 48.5}h</strong> studied
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      <strong className="text-slate-800 font-semibold">{profile.totalCertifications || 2}</strong> tracks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <ShieldCheck className="w-4 h-4 text-violet-500" />
              Account Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition"
                  placeholder="your.email@university.edu"
                />
              </div>
            </div>
          </div>

          {/* Study Routine & Target */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
                <Clock className="w-4 h-4 text-teal-600" />
                Study Schedule & Target
              </h3>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full font-mono">
                {weeklyTargetHours} hrs / week
              </span>
            </div>

            {/* Weekly Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>5 hrs</span>
                <span>20 hrs</span>
                <span>40 hrs</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex gap-2 pt-1">
                {[10, 15, 20, 25].map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setWeeklyTargetHours(target)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-xl border transition cursor-pointer ${
                      weeklyTargetHours === target
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                    }`}
                  >
                    {target}h
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Study Days */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Preferred Study Days</label>
              <div className="flex justify-between gap-1.5">
                {daysOfWeek.map(({ label, day, full }) => {
                  const isSelected = preferences.preferredStudyDays?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      title={full}
                      className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Study Time */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Peak Productivity Time</label>
              <div className="grid grid-cols-2 gap-2.5">
                {timeSlots.map(({ id, label, sub, icon: Icon }) => {
                  const isSelected = preferences.preferredStudyTime === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          preferredStudyTime: id as any,
                        })
                      }
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50/70 border-violet-300 text-violet-900 shadow-sm'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-violet-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold font-heading">{label}</div>
                        <div className="text-[10px] text-slate-400">{sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-6): Smart Alerts, Themes, Save Button */}
        <div className="lg:col-span-6 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Bell className="w-4 h-4 text-amber-500" />
              Smart Alerts & Reminders
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-700 font-heading">Daily Streak Reminders</div>
                  <div className="text-[11px] text-slate-400">Gentle nudge before your study streak expires</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, streakReminders: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-400"
                />
              </label>

              <div className="h-px bg-slate-100" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-700 font-heading">Exam Milestone Alerts</div>
                  <div className="text-[11px] text-slate-400">Phase deadline countdown notifications</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.examCountdownAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, examCountdownAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-400"
                />
              </label>

              <div className="h-px bg-slate-100" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-700 font-heading">AI Summarizer Recommendations</div>
                  <div className="text-[11px] text-slate-400">High-yield revision flashcards & summaries</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newResourceAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, newResourceAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-400"
                />
              </label>
            </div>
          </div>

          {/* App Accent Color */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Palette className="w-4 h-4 text-rose-500" />
              Theme Accent Tint
            </h3>
            <p className="text-xs text-slate-500">Pick a subtle accent tint for badges and highlights</p>

            <div className="flex items-center gap-3 pt-1">
              {accentColors.map((color) => {
                const isSelected = preferences.accentColor === color.hex;
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, accentColor: color.hex })}
                    title={color.name}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${color.bg} ${
                      isSelected ? 'ring-4 ring-slate-200 scale-105 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-card transition flex items-center justify-center gap-2 text-sm font-heading cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Sign Out / Switch User */}
          {onSignOut && (
            <div>
              <button
                onClick={onSignOut}
                className="w-full py-3 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2 font-heading cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Switch Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
