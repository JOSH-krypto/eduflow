import React from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import { Course } from '../../types/eduflow';

interface StatCardsProps {
  course: Course;
  totalHoursStudied?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  course,
}) => {
  const streak = course.streakDays || 7;
  const studiedHours = course.studiedHoursThisWeek || 12.5;
  const targetHours = course.targetHoursPerWeek || 20;
  const weeklyPercentage = Math.min(100, Math.round((studiedHours / targetHours) * 100));

  // 7-day mini heatmap array
  const weeklyDays = course.weeklyActivity || [
    { day: 'M', shortDate: '06/03', hours: 2.5, studied: true },
    { day: 'T', shortDate: '06/04', hours: 3.0, studied: true },
    { day: 'W', shortDate: '06/05', hours: 1.5, studied: true },
    { day: 'T', shortDate: '06/06', hours: 2.0, studied: true },
    { day: 'F', shortDate: '06/07', hours: 1.0, studied: true },
    { day: 'S', shortDate: '06/08', hours: 2.5, studied: true },
    { day: 'S', shortDate: '06/09', hours: 0.5, studied: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {/* ================= CARD 1: WEEKLY STREAK ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.14] transition-all">
        {/* Glow Accent */}
        <div 
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#2DD4BF]/10 blur-xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              WEEKLY STREAK
            </span>
            <div className="p-1.5 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF]">
              <Flame className="w-4 h-4 text-[#2DD4BF]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              {streak} Days
            </span>
            <span className="text-[11px] font-semibold text-[#2DD4BF] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +2 days from last week
            </span>
          </div>
        </div>

        {/* 7-Day Heatmap Strip (Mini Contribution Graph) */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium mb-1.5">
            <span>Last 7 Days</span>
            <span className="text-[#2DD4BF] font-semibold">100% Active</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeklyDays.map((d, index) => {
              const isStudied = d.studied;
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-5 sm:h-6 rounded-md transition-all ${
                      isStudied
                        ? 'bg-[#2DD4BF] shadow-sm shadow-[#2DD4BF]/20'
                        : 'bg-white/[0.06]'
                    }`}
                    title={`${d.day}: ${d.hours}h studied`}
                    aria-label={`${d.day}: ${d.hours} hours studied`}
                  />
                  <span className="text-[9px] text-zinc-400 font-mono font-medium">
                    {d.day.charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= CARD 2: TIME STUDIED ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.14] transition-all">
        {/* Glow Accent */}
        <div 
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#F5A623]/10 blur-xl pointer-events-none" 
          aria-hidden="true" 
        />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              TIME STUDIED
            </span>
            <div className="p-1.5 rounded-lg bg-[#F5A623]/10 text-[#F5A623]">
              <Clock className="w-4 h-4 text-[#F5A623]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              {studiedHours}h
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Target: {targetHours}h/week
            </span>
          </div>
        </div>

        {/* Progress Bar & Pace Status */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
            <span>Weekly Goal</span>
            <span className="text-white font-semibold">{weeklyPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F5A623] transition-all duration-700"
              style={{ width: `${weeklyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
            <span>{(targetHours - studiedHours).toFixed(1)}h remaining</span>
            <span className="text-[#2DD4BF] font-semibold">On Pace ⚡</span>
          </div>
        </div>
      </div>
    </div>
  );
};
