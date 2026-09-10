import React from 'react';

interface ProgressGaugeProps {
  percentage: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
}

export const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  percentage,
  size = 56,
  strokeWidth = 5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc display: 75% circle gauge (270 degrees)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Amber progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F5A623"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[13px] font-bold text-white font-display tracking-tight leading-none">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
