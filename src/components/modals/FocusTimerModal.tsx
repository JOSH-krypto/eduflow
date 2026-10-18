import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2 
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
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          setTimeLeftSeconds((prev) => {
            if (prev <= 1) {
              if (interval) clearInterval(interval);
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
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
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

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#1C1929] rounded-xl shadow-lg border border-slate-200 dark:border-[#2E2A44] overflow-hidden flex flex-col select-none"
        role="dialog"
        aria-label="Focus timer"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#2E2A44] flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {theme.name}
          </span>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{taskTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Study session</p>
          </div>

          {/* Countdown Ring */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-slate-100 dark:stroke-[#252236]"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#0F172A"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatTime(currentSeconds)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isRunning ? 'Running' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetTimer}
              className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className="w-12 h-12 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border border-slate-700/20 dark:border-white/20"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
            </button>

            <button
              onClick={handleFinishEarly}
              className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              title="Finish session"
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
