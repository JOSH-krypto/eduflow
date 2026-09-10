import React from 'react';
import { Check } from 'lucide-react';

interface CircularProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // width/height in px (default 32)
  strokeWidth?: number; // border stroke (default 3)
  color?: string; // e.g. '#8B5CF6'
  bgColor?: string;
  showPercentText?: boolean;
  className?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  size = 32,
  strokeWidth = 3,
  color = '#8B5CF6',
  bgColor = 'rgba(139, 92, 246, 0.12)',
  showPercentText = true,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;
  const isComplete = clampedProgress === 100;

  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} 
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transition-all duration-300"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Centered label or checkmark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isComplete ? (
          <Check className="w-3 h-3 stroke-[3]" style={{ color }} />
        ) : showPercentText ? (
          <span className="text-[9px] font-bold font-heading text-zinc-600">
            {clampedProgress}%
          </span>
        ) : null}
      </div>
    </div>
  );
};
