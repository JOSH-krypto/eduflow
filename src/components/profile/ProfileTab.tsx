import React, { useState, useRef, useEffect } from 'react';
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
import { UserProfile, UserPreferences, Course } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { api } from '../../services/api';
import { computeRealUserStats, loadSessionLogs } from '../../services/storage';
import { ACCENT_PALETTE, applyTheme, findAccentOption, DEFAULT_ACCENT_HEX, ThemeMode, getStoredThemeMode, setStoredThemeMode } from '../../utils/theme';
import { ThemeModeToggle } from '../common/ThemeModeToggle';

interface ProfileTabProps {
  profile: UserProfile;
  courses?: Course[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSignOut?: () => void;
  isBackendConnected?: boolean;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  courses = [],
  onUpdateProfile,
  onSignOut,
  isBackendConnected = false,
  themeMode: parentThemeMode,
  onThemeModeChange,
}) => {
  const [name, setName] = useState(profile.name || 'Student');
  const email = profile.email || '';
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(profile.weeklyTargetHours || 15);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Local theme mode state (falls back to preferences, stored theme, or parent theme)
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(
    parentThemeMode || profile.preferences?.themeMode || getStoredThemeMode()
  );

  // Compute stats directly from live courses and session logs for 100% truthful data
  const realStats = computeRealUserStats(courses, loadSessionLogs());
  const displayHours = realStats.totalHoursStudied;
  const displayTracks = courses.length;

  const [preferences, setPreferences] = useState<UserPreferences>(
    profile.preferences || {
      preferredStudyDays: [1, 2, 3, 4, 5],
      preferredStudyTime: 'morning',
      streakReminders: true,
      examCountdownAlerts: true,
      newResourceAlerts: true,
      accentColor: DEFAULT_ACCENT_HEX,
      themeMode: currentThemeMode,
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme when preferences change
  useEffect(() => {
    if (preferences.accentColor) {
      applyTheme(preferences.accentColor, currentThemeMode);
    }
  }, [preferences.accentColor, currentThemeMode]);

  const handleThemeModeSelect = (newMode: ThemeMode) => {
    setCurrentThemeMode(newMode);
    setStoredThemeMode(newMode);
    setPreferences((prev) => ({ ...prev, themeMode: newMode }));
    applyTheme(preferences.accentColor, newMode);
    if (onThemeModeChange) {
      onThemeModeChange(newMode);
    }
  };

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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be under 2 MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Unexpected error uploading avatar');
      setIsUploading(false);
    }
  };

  const handleSelectAccent = (hex: string) => {
    const updated = { ...preferences, accentColor: hex, themeMode: currentThemeMode };
    setPreferences(updated);
    applyTheme(hex, currentThemeMode);
  };

  const toggleDay = (day: number) => {
    const current = preferences.preferredStudyDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    setPreferences({ ...preferences, preferredStudyDays: updated });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || 'Student',
      email: email.trim(),
      avatar,
      weeklyTargetHours: Number(weeklyTargetHours) || 15,
      preferences: {
        ...preferences,
        themeMode: currentThemeMode,
      },
    };

    try {
      // Persist to Neon DB API first
      await api.updateProfile({
        name: updatedProfile.name,
        avatar: updatedProfile.avatar,
        weeklyTargetHours: updatedProfile.weeklyTargetHours,
        preferences: updatedProfile.preferences,
      });

      // Update parent component state and apply theme
      onUpdateProfile(updatedProfile);
      applyTheme(updatedProfile.preferences?.accentColor, currentThemeMode);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      // Fallback: save in local state so user doesn't lose current edits
      onUpdateProfile(updatedProfile);
      setSaveError(err.message || 'Could not save to server. Saved locally.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAccentHex = preferences.accentColor || DEFAULT_ACCENT_HEX;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 animate-fade-in font-sans">
      {/* Page Title & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-heading">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your schedule, appearance, and sync settings
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-light border border-theme-border rounded-full text-xs font-semibold text-theme-dark">
          <Cloud className={`w-4 h-4 ${isBackendConnected ? 'text-emerald-500' : 'text-theme-accent'}`} />
          <span>{isBackendConnected ? 'Cloud Synced' : 'Offline Ready'}</span>
        </div>
      </div>

      {/* Responsive Grid: 2 Columns on Desktop ≥1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (lg:col-span-6): Avatar, Personal Details, Study Schedule */}
        <div className="lg:col-span-6 space-y-6">
          {/* Avatar & Summary Card */}
          <div className="bg-white dark:bg-[#1C1929] rounded-3xl p-6 border border-purple-100/90 dark:border-[#2E2A44] shadow-card">
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
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-theme-accent hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 font-heading">{name || 'Student'}</h2>
                  {profile.planTier && profile.planTier.toLowerCase().includes('pro') ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-mono">
                      Pro Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300">
                      {profile.planTier || 'Student'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {email || 'No email registered'}
                </p>

                {uploadError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-slate-600 dark:text-slate-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-theme-accent" />
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{displayHours}h</strong> studied
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{displayTracks}</strong> tracks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="bg-white dark:bg-[#1C1929] rounded-3xl p-6 border border-purple-100/90 dark:border-[#2E2A44] shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-heading">
              <ShieldCheck className="w-4 h-4 text-theme-accent" />
              Account Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-theme-accent/30 focus:border-theme-accent transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                  <span className="text-[10px] text-slate-400 font-mono">Read-only account key</span>
                </div>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100/70 dark:bg-[#13111C]/60 border border-slate-200/70 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed select-all"
                  title="Email cannot be changed directly"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Weekly Target Study Hours: <span className="font-bold text-theme-accent">{weeklyTargetHours}h</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={weeklyTargetHours}
                    onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                    className="w-full accent-theme-accent cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono w-10 text-right">
                    {weeklyTargetHours}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Preferences Card */}
          <div className="bg-white dark:bg-[#1C1929] rounded-3xl p-6 border border-purple-100/90 dark:border-[#2E2A44] shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-heading">
              <Clock className="w-4 h-4 text-theme-accent" />
              Study Routine & Target Hours
            </h3>

            {/* Days of week selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Active Study Days</label>
              <div className="flex items-center justify-between gap-1.5">
                {daysOfWeek.map((d) => {
                  const isSelected = preferences.preferredStudyDays?.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => toggleDay(d.day)}
                      aria-label={`${d.full} study day`}
                      className={`w-10 h-10 rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-theme-accent text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-[#13111C] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200/60 dark:border-[#2E2A44]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Study Time Window */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Preferred Study Window</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const Icon = slot.icon;
                  const isSelected = preferences.preferredStudyTime === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() =>
                        setPreferences({ ...preferences, preferredStudyTime: slot.id as any })
                      }
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-theme-light border-theme-border text-theme-dark shadow-sm'
                          : 'bg-slate-50/60 dark:bg-[#13111C]/60 border-slate-200/70 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252236]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-theme-accent' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold font-heading">{slot.label}</div>
                        <div className="text-[10px] text-slate-400">{slot.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-6): Appearance & Theme, Alerts, Save CTA */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Appearance & Theme (Mode + Accent Tint) */}
          <div className="bg-white dark:bg-[#1C1929] rounded-3xl p-6 border border-purple-100/90 dark:border-[#2E2A44] shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-heading">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Appearance & Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Light, Dark, or System mode</p>
              </div>
              <ThemeModeToggle
                currentMode={currentThemeMode}
                onChange={handleThemeModeSelect}
                size="md"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2E2A44] space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-heading">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                Theme Accent Tint (WCAG AA Calibrated)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pick a high-contrast accent tint for badges, rings, and buttons
              </p>

              <div 
                role="radiogroup" 
                aria-label="Theme Accent Tint" 
                className="flex items-center gap-3 pt-1"
              >
                {ACCENT_PALETTE.map((color) => {
                  const isSelected = findAccentOption(currentAccentHex).id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      aria-label={`${color.name} accent tint`}
                      onClick={() => handleSelectAccent(color.hex)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectAccent(color.hex);
                        }
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${color.twClass} ${
                        isSelected 
                          ? 'ring-4 ring-offset-2 ring-slate-800/40 dark:ring-white/40 scale-105 shadow-md' 
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      } focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-700`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications & Reminders */}
          <div className="bg-white dark:bg-[#1C1929] rounded-3xl p-6 border border-purple-100/90 dark:border-[#2E2A44] shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-heading">
              <Bell className="w-4 h-4 text-theme-accent" />
              Alerts & Notifications
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-[#2E2A44]">
              <label className="flex items-center justify-between pt-2 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Streak Reminder</div>
                  <div className="text-[11px] text-slate-400">Daily alert to keep your study streak active</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, streakReminders: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C] focus:ring-purple-400"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Exam Countdown Alerts</div>
                  <div className="text-[11px] text-slate-400">Milestone updates at 30, 14, 7, and 1 day remaining</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.examCountdownAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, examCountdownAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C] focus:ring-purple-400"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">New Resource Alerts</div>
                  <div className="text-[11px] text-slate-400">Get notified when new cheat sheets or labs are added</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newResourceAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, newResourceAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C] focus:ring-purple-400"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 bg-theme-accent hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-card transition flex items-center justify-center gap-2 text-sm font-heading cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Profile Changes...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                  <span>Profile Changes Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
            {saveError && (
              <p className="text-xs text-rose-500 text-center font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {saveError}
              </p>
            )}
          </div>

          {/* Sign Out / Switch User */}
          {onSignOut && (
            <div>
              <button
                onClick={onSignOut}
                className="w-full py-3 bg-slate-50 dark:bg-[#1C1929] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2 font-heading cursor-pointer"
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

export default ProfileTab;
