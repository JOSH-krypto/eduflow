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
import { UserProfile, UserPreferences } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { api } from '../../services/api';
import { ACCENT_PALETTE, applyTheme, findAccentOption, DEFAULT_ACCENT_HEX } from '../../utils/theme';

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
  const [name, setName] = useState(profile.name || 'Student');
  const [email, setEmail] = useState(profile.email || '');
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
      accentColor: DEFAULT_ACCENT_HEX,
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme when preferences change
  useEffect(() => {
    if (preferences.accentColor) {
      applyTheme(preferences.accentColor);
    }
  }, [preferences.accentColor]);

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

    // Validate file size (< 4MB)
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

  const handleSelectAccent = (hex: string) => {
    const updatedPrefs = { ...preferences, accentColor: hex };
    setPreferences(updatedPrefs);
    applyTheme(hex);
    // Persist immediately to profile state & backend
    const updatedProfile: UserProfile = {
      ...profile,
      name,
      email,
      avatar,
      weeklyTargetHours,
      preferences: updatedPrefs,
    };
    onUpdateProfile(updatedProfile);
    api.updateProfile(updatedProfile).catch(() => {});
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
    api.updateProfile(updated).catch(() => {});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentAccentHex = preferences.accentColor || DEFAULT_ACCENT_HEX;

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
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-heading">{name || 'Student'}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-theme-light text-theme-dark">
                    {profile.planTier || 'Pro Student'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {email || 'No email set'}
                </p>

                {uploadError && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadError}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-slate-600 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-theme-accent" />
                    <span>
                      <strong className="text-slate-800 font-semibold">{profile.totalHoursStudied || 0}h</strong> studied
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>
                      <strong className="text-slate-800 font-semibold">{profile.totalCertifications || 0}</strong> tracks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <ShieldCheck className="w-4 h-4 text-theme-accent" />
              Account Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-theme-accent/30 focus:border-theme-accent transition"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-theme-accent/30 focus:border-theme-accent transition"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Study Routine & Weekly Target */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Clock className="w-4 h-4 text-theme-accent" />
              Weekly Target & Days
            </h3>

            {/* Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600 font-medium">Weekly Target Hours</span>
                <span className="text-xs font-bold text-theme-dark bg-theme-light px-2.5 py-1 rounded-full font-mono">
                  {weeklyTargetHours} hrs / week
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5 hrs (Casual)</span>
                <span>20 hrs (Recommended)</span>
                <span>40 hrs (Intensive)</span>
              </div>
            </div>

            {/* Days of week selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Active Study Days</label>
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
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
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
              <label className="block text-xs font-semibold text-slate-600 mb-2">Preferred Study Window</label>
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
                          : 'bg-slate-50/60 border-slate-200/70 text-slate-700 hover:bg-slate-50'
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

        {/* Right Column (lg:col-span-6): Notification Toggles, Accent Theme, Save CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Notifications & Reminders */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Bell className="w-4 h-4 text-theme-accent" />
              Alerts & Notifications
            </h3>

            <div className="space-y-3 divide-y divide-slate-100">
              <label className="flex items-center justify-between pt-2 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Streak Reminder</div>
                  <div className="text-[11px] text-slate-400">Daily alert to keep your study streak active</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.streakReminders}
                  onChange={(e) =>
                    setPreferences({ ...preferences, streakReminders: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-400"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Exam Countdown Alerts</div>
                  <div className="text-[11px] text-slate-400">Milestone updates at 30, 14, 7, and 1 day remaining</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.examCountdownAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, examCountdownAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-400"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">New Resource Alerts</div>
                  <div className="text-[11px] text-slate-400">Get notified when new cheat sheets or labs are added</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newResourceAlerts}
                  onChange={(e) =>
                    setPreferences({ ...preferences, newResourceAlerts: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-400"
                />
              </label>
            </div>
          </div>

          {/* Theme Accent Tint (WCAG AA Calibrated & Fully Accessible) */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-heading">
              <Palette className="w-4 h-4 text-rose-500" />
              Theme Accent Tint
            </h3>
            <p className="text-xs text-slate-500">Pick a subtle accent tint for badges and highlights</p>

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
                        ? 'ring-4 ring-offset-2 ring-slate-800/40 scale-105 shadow-md' 
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    } focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-slate-700`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-theme-accent hover:opacity-90 active:scale-[0.99] text-white font-bold rounded-2xl shadow-card transition flex items-center justify-center gap-2 text-sm font-heading cursor-pointer"
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

export default ProfileTab;
