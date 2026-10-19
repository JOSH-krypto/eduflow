import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Mail,
  Clock,
  Award,
  Check,
  Save,
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertCircle,
  Trash2
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
  onResetData?: () => void;
  onSignOut?: () => void;
  isBackendConnected?: boolean;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  courses = [],
  onUpdateProfile,
  onResetData,
  onSignOut,
  isBackendConnected = false,
  themeMode: parentThemeMode,
  onThemeModeChange,
}) => {
  const [name, setName] = useState(profile.name || 'User');
  const email = profile.email || '';
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(profile.weeklyTargetHours || 15);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>(
    parentThemeMode || profile.preferences?.themeMode || getStoredThemeMode()
  );

  const realStats = computeRealUserStats(courses, loadSessionLogs());
  const displayHours = realStats.totalHoursStudied;
  const displayCourses = courses.length;

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

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

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
        setUploadError('Unable to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Unable to upload avatar');
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
      name: name.trim() || 'User',
      email: email.trim(),
      avatar,
      weeklyTargetHours: Number(weeklyTargetHours) || 15,
      preferences: {
        ...preferences,
        themeMode: currentThemeMode,
      },
    };

    try {
      await api.updateProfile({
        name: updatedProfile.name,
        avatar: updatedProfile.avatar,
        weeklyTargetHours: updatedProfile.weeklyTargetHours,
        preferences: updatedProfile.preferences,
      });

      onUpdateProfile(updatedProfile);
      applyTheme(updatedProfile.preferences?.accentColor, currentThemeMode);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to save to server. Saved locally.';
      onUpdateProfile(updatedProfile);
      setSaveError(message);
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAccentHex = preferences.accentColor || DEFAULT_ACCENT_HEX;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 font-sans select-none">
      {/* Title & Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Profile settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account details, study schedule, and notification preferences.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] rounded-md text-xs font-medium text-slate-700 dark:text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span>{isBackendConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Avatar & Summary Card */}
          <div className="bg-white dark:bg-[#1C1929] rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-[#2E2A44]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative self-center sm:self-auto">
                <InitialsAvatar
                  name={name}
                  avatarUrl={avatar}
                  size="xl"
                  className="w-20 h-20 text-xl"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Upload profile photo"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full flex items-center justify-center border border-white dark:border-slate-800 transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
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
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">{name || 'User'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {email || 'No email registered'}
                </p>

                {uploadError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-slate-200 font-medium">{displayHours}h</strong> studied
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-slate-200 font-medium">{displayCourses}</strong> courses
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="bg-white dark:bg-[#1C1929] rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-[#2E2A44] space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Account details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Email address</label>
                  <span className="text-[10px] text-slate-400">Read-only</span>
                </div>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#13111C]/60 border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-500 cursor-not-allowed select-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 tabular-nums">
                  Weekly study target: <span className="font-semibold text-slate-900 dark:text-white">{weeklyTargetHours}h</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={weeklyTargetHours}
                    onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                    className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 tabular-nums w-8 text-right">
                    {weeklyTargetHours}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Preferences Card */}
          <div className="bg-white dark:bg-[#1C1929] rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-[#2E2A44] space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Study schedule
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Active study days</label>
              <div className="flex items-center justify-between gap-1.5">
                {daysOfWeek.map((d) => {
                  const isSelected = preferences.preferredStudyDays?.includes(d.day);
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => toggleDay(d.day)}
                      aria-label={`${d.full} study day`}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-50 dark:bg-[#13111C] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44]'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred study window</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const Icon = slot.icon;
                  const isSelected = preferences.preferredStudyTime === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() =>
                        setPreferences({ ...preferences, preferredStudyTime: slot.id as 'morning' | 'afternoon' | 'evening' | 'night' })
                      }
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-[#2E2A44] border-slate-900 dark:border-slate-100 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-[#13111C] border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252236]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-2 text-slate-500 dark:text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold">{slot.label}</div>
                        <div className="text-[10px] text-slate-500">{slot.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Appearance & Mode */}
          <div className="bg-white dark:bg-[#1C1929] rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-[#2E2A44] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Appearance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Theme mode preference</p>
              </div>
              <ThemeModeToggle
                currentMode={currentThemeMode}
                onChange={handleThemeModeSelect}
                size="md"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2E2A44] space-y-3">
              <div>
                <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Accent color
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a theme accent color for interactive states
                </p>
              </div>

              <div 
                role="radiogroup" 
                aria-label="Accent color" 
                className="flex items-center gap-2.5 pt-1"
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
                      aria-label={`${color.name} accent`}
                      onClick={() => handleSelectAccent(color.hex)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectAccent(color.hex);
                        }
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${color.twClass} ${
                        isSelected 
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105' 
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications & Reminders */}
          <div className="bg-white dark:bg-[#1C1929] rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-[#2E2A44] space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Notification settings
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-[#2E2A44]">
              <label className="flex items-center justify-between pt-2 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">Streak reminders</div>
                  <div className="text-[11px] text-slate-500">Daily reminder to maintain your study schedule</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, streakReminders: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">Exam countdown alerts</div>
                  <div className="text-[11px] text-slate-500">Milestone updates at 30, 14, 7, and 1 day remaining</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.examCountdownAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, examCountdownAlerts: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C]"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">Resource updates</div>
                  <div className="text-[11px] text-slate-500">Notifications when course study materials are updated</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newResourceAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, newResourceAlerts: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-[#2E2A44] dark:bg-[#13111C]"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-slate-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer border border-slate-700/20 dark:border-white/20"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving changes...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Changes saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save changes</span>
                </>
              )}
            </button>
            {saveError && (
              <p className="text-xs text-rose-500 text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {saveError}
              </p>
            )}
          </div>

          {/* Reset All Study Data */}
          {(onResetData || onSignOut) && (
            <div className="pt-2">
              {showResetConfirm ? (
                <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 space-y-2.5">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    Are you sure? This will reset all local courses, tasks, and study records.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowResetConfirm(false);
                        if (onResetData) {
                          onResetData();
                        } else if (onSignOut) {
                          onSignOut();
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Yes, reset all data
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2.5 bg-white dark:bg-[#1C1929] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-[#2E2A44] hover:border-rose-200 dark:hover:border-rose-800 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset all study data</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
