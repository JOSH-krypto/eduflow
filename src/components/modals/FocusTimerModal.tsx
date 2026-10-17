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
  onCompleteSession: (sessionLog: {
    durationMinutes: number;
    taskTitle: string;
    taskType: TaskType;
    completedAt: string;
  }) => void;
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

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds(initialDuration);
    setStopwatchSeconds(0);
  };

  const handleFinishEarly = () => {
    const completedMinutes =
      mode === 'pomodoro'
        ? Math.max(1, Math.round((initialDuration - timeLeftSeconds) / 60))
        : Math.max(1, Math.round(stopwatchSeconds / 60));

    fireCelebrationConfetti();
    onCompleteSession({
      durationMinutes: completedMinutes,
      taskTitle,
      taskType,
      completedAt: new Date().toISOString(),
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1C1929] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#2E2A44] overflow-hidden animate-slide-up flex flex-col select-none"
        role="dialog"
        aria-label="Focus Timer"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-[#2E2A44] flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-teal-50/30 dark:from-[#13111C] dark:to-[#1C1929]">
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
            className="w-7 h-7 rounded-full bg-white dark:bg-[#2E2A44] hover:bg-slate-100 dark:hover:bg-[#3B3759] text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 font-heading">{taskTitle}</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Stay focused • Deep work in progress</p>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-[#252236]"
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
              <span className="text-4xl font-extrabold text-slate-800 dark:text-white font-mono tracking-tight">
                {formatTime(currentSeconds)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {isRunning ? 'Flowing' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              title="Reset Timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className="w-14 h-14 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ring-1 ring-white/10"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? <Pause className="w-6 h-6 stroke-[2.5]" /> : <Play className="w-6 h-6 stroke-[2.5] ml-0.5 fill-current" />}
            </button>

            <button
              onClick={handleFinishEarly}
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#2E2A44] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition cursor-pointer"
              title="Finish & Log Block"
              aria-label="Finish and log session"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusTimerModal;
