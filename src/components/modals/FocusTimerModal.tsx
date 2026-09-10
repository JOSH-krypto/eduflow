import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { fireCelebrationConfetti } from '../../services/confetti';
import { TaskType, getCategoryTheme } from '../../types/eduflow';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  taskType?: TaskType;
  defaultDurationMinutes?: number;
  onCompleteSession: (durationMinutes: number, taskTitle: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  taskTitle,
  taskType = 'video',
  defaultDurationMinutes = 25,
  onCompleteSession,
}) => {
  if (!isOpen) return null;

  const [mode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(defaultDurationMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const initialDuration = defaultDurationMinutes * 60;
  const theme = getCategoryTheme(taskType);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          setTimeLeftSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              fireCelebrationConfetti();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const togglePlay = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(initialDuration);
    setStopwatchSeconds(0);
  };

  const handleAddFiveMinutes = () => {
    setTimeLeftSeconds((prev) => prev + 5 * 60);
  };

  const handleFinish = () => {
    setIsRunning(false);
    const completedMinutes =
      mode === 'pomodoro'
        ? Math.max(1, Math.round((initialDuration - timeLeftSeconds) / 60))
        : Math.max(1, Math.round(stopwatchSeconds / 60));

    fireCelebrationConfetti();
    onCompleteSession(completedMinutes, taskTitle);
    onClose();
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSeconds = mode === 'pomodoro' ? timeLeftSeconds : stopwatchSeconds;
  const progressPercent =
    mode === 'pomodoro'
      ? Math.min(100, Math.max(0, ((initialDuration - timeLeftSeconds) / initialDuration) * 100))
      : 100;

  // SVG ring calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col"
        role="dialog"
        aria-label="Focus Timer"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-teal-50/30">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              {theme.name}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{taskTitle}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Stay focused • Deep work in progress</p>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={theme.accent}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>

            {/* Centered Timer Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-800 font-mono tracking-tight">
                {formatTime(currentSeconds)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                {isRunning ? 'Flowing' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              title="Reset Timer"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-3xl bg-violet-600 hover:bg-violet-700 text-white shadow-card flex items-center justify-center transition-all active:scale-95"
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleAddFiveMinutes}
              title="Add 5 minutes"
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <span className="text-xs font-bold">+5m</span>
            </button>
          </div>

          {/* Complete Button */}
          <button
            onClick={handleFinish}
            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark Session Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
