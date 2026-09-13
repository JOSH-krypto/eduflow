import React, { useState } from 'react';
import { 
  BarChart2, 
  Clock, 
  CheckCircle2, 
  Target, 
  Flame, 
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Course, UserProfile } from '../../types/eduflow';
import { loadSessionLogs } from '../../services/storage';

interface ProgressTabProps {
  course?: Course | null;
  userProfile?: UserProfile;
}

type PeriodType = 'Day' | 'Week' | 'Month' | 'All Time';

export const ProgressTab: React.FC<ProgressTabProps> = ({
  course,
  userProfile: _userProfile,
}) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('Week');

  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 animate-fade-in font-sans space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-purple-100/90 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-theme-light text-theme-accent flex items-center justify-center mx-auto shadow-soft">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-heading">
              No Analytics Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and study a course to view activity trends, focus scores, and subject breakdowns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const logs = loadSessionLogs();
  const completedTasks = (course.agenda || []).filter((t) => t.status === 'completed');
  const totalTasks = course.agenda?.length || 0;
  const totalSessionsLogged = logs.length + completedTasks.length;
  const totalStudiedHours = course.studiedHoursThisWeek || 0;

  // Generate dynamic chart data based on weekly activity or session logs
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyActivityMap = course.weeklyActivity || [];

  const weeklyChartData = weekDays.map((dayLabel, idx) => {
    const act = weeklyActivityMap[idx];
    return {
      label: dayLabel,
      hours: act?.hours || 0,
      target: Math.round(((course.targetHoursPerWeek || 15) / 7) * 10) / 10,
    };
  });

  const chartDataMap: Record<PeriodType, { label: string; hours: number; target: number }[]> = {
    Day: [
      { label: '8 AM', hours: 0, target: 0.5 },
      { label: '12 PM', hours: 0, target: 0.5 },
      { label: '4 PM', hours: 0, target: 0.5 },
      { label: '8 PM', hours: 0, target: 0.5 },
    ],
    Week: weeklyChartData,
    Month: [
      { label: 'Wk 1', hours: 0, target: course.targetHoursPerWeek || 15 },
      { label: 'Wk 2', hours: 0, target: course.targetHoursPerWeek || 15 },
      { label: 'Wk 3', hours: 0, target: course.targetHoursPerWeek || 15 },
      { label: 'Wk 4', hours: totalStudiedHours, target: course.targetHoursPerWeek || 15 },
    ],
    'All Time': [
      { label: 'Current Target', hours: totalStudiedHours, target: (course.targetHoursPerWeek || 15) * 4 },
    ],
  };

  const currentChartData = chartDataMap[activePeriod];
  const hasPeriodActivity = currentChartData.some((d) => d.hours > 0);

  // Subject / Category Breakdown Donut Data from real tasks
  const categoryHoursMap: Record<string, { name: string; hours: number; color: string; bg: string }> = {
    video: { name: 'Study & Lectures', hours: 0, color: '#7C3AED', bg: '#F3E8FF' },
    reading: { name: 'Review & Notes', hours: 0, color: '#0F766E', bg: '#CCFBF1' },
    quiz: { name: 'Practice & Quizzes', hours: 0, color: '#047857', bg: '#D1FAE5' },
    lab: { name: 'Labs & Coding', hours: 0, color: '#C2410C', bg: '#FEF3C7' },
  };

  (course.agenda || []).forEach((t) => {
    const key = t.type === 'practice' ? 'quiz' : t.type in categoryHoursMap ? t.type : 'video';
    const hrs = (t.durationMinutes || 30) / 60;
    categoryHoursMap[key].hours = Math.round((categoryHoursMap[key].hours + hrs) * 10) / 10;
  });

  const categoryData = Object.values(categoryHoursMap).filter((c) => c.hours > 0);
  const totalCategoryHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

  // Focus score calculation
  const focusScore = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 bg-white border border-purple-100 rounded-2xl shadow-md text-xs">
          <p className="font-bold text-[#1E1B4B] font-heading">{label}</p>
          <p className="text-theme-dark font-bold mt-0.5">{payload[0].value} hours studied</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in pb-16 font-sans">
      {/* Top Header & Period Switcher */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-purple-100/90 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-theme-light text-theme-accent flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1B4B] font-heading">
                Study Performance & Metrics
              </h2>
              <p className="text-xs text-zinc-400">
                Weekly target tracking, time distribution, and session history
              </p>
            </div>
          </div>

          {/* Period Toggle Pills */}
          <div className="flex items-center p-1 bg-[#F8F7FC] rounded-2xl border border-purple-100/60 text-xs font-semibold">
            {(['Day', 'Week', 'Month', 'All Time'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1.5 rounded-xl transition-all font-heading cursor-pointer ${
                  activePeriod === period
                    ? 'bg-white text-theme-dark shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric KPI Chips Grid (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chip 1: Total Study Time */}
        <div className="p-4 rounded-3xl bg-white border border-purple-100/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-theme-light text-theme-accent flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-theme-dark bg-theme-light px-2 py-0.5 rounded-full font-mono">
              Target {course.targetHoursPerWeek || 15}h
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Study Time
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {course.studiedHoursThisWeek || 0}h
            </span>
          </div>
        </div>

        {/* Chip 2: Sessions */}
        <div className="p-4 rounded-3xl bg-white border border-purple-100/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-full font-mono">
              +{course.completedSessionsToday || 0} today
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Sessions Logged
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {totalSessionsLogged} Done
            </span>
          </div>
        </div>

        {/* Chip 3: Focus Score */}
        <div className="p-4 rounded-3xl bg-white border border-purple-100/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded-full font-mono">
              {totalTasks > 0 ? `${focusScore}%` : '—'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Focus Score
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {totalTasks > 0 ? (focusScore >= 75 ? 'High 🎯' : focusScore >= 40 ? 'Moderate' : 'Building') : '—'}
            </span>
          </div>
        </div>

        {/* Chip 4: Current Streak */}
        <div className="p-4 rounded-3xl bg-white border border-purple-100/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full font-mono">
              {course.streakDays > 0 ? 'Active 🔥' : 'Start Today'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Streak Active
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {course.streakDays || 0} Days
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chart: Study Time Trend Area Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
                Activity Distribution
              </span>
              <h3 className="text-base font-bold text-[#1E1B4B] font-heading">
                Study Time Trend ({activePeriod})
              </h3>
            </div>
            <span className="text-xs font-bold text-theme-dark bg-theme-light px-2.5 py-1 rounded-full font-mono">
              {totalStudiedHours > 0 ? `Total: ${totalStudiedHours}h` : '0h Logged'}
            </span>
          </div>

          {!hasPeriodActivity ? (
            <div className="h-56 sm:h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-2xl border border-slate-100 text-slate-400 space-y-1.5">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-600">No activity recorded in this period</div>
              <div className="text-[11px] text-slate-400 max-w-xs">
                Start a focus timer session or complete scheduled tasks to visualize your daily study curve.
              </div>
            </div>
          ) : (
            <div className="h-56 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#F3E8FF' }} 
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#F3E8FF' }} 
                    unit="h" 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="var(--theme-accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorStudy)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Chart: Subject & Category Breakdown Donut Chart */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
                Time Distribution
              </span>
              <h3 className="text-base font-bold text-[#1E1B4B] font-heading">
                Subject Breakdown
              </h3>
            </div>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              {totalCategoryHours}h Planned
            </span>
          </div>

          {totalCategoryHours === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50/60 border border-slate-100 text-slate-400 space-y-1.5">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-600">No study categories logged yet</div>
              <div className="text-[11px] text-slate-400">
                Categories are populated as you add modules and practice quizzes.
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
              <div className="w-36 h-36 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="hours"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-extrabold text-[#1E1B4B] font-mono leading-none">
                    {totalCategoryHours}h
                  </span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                    Total
                  </span>
                </div>
              </div>

              {/* Custom Category Legend List */}
              <div className="space-y-2 w-full sm:w-auto">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <span className="font-semibold text-zinc-700">{cat.name}</span>
                    </div>
                    <span className="font-bold text-[#1E1B4B] font-mono">{cat.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
