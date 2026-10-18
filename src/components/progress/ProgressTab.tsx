import React, { useState } from 'react';
import { 
  Clock, 
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

type PeriodType = 'Day' | 'Week' | 'Month' | 'All time';

export const ProgressTab: React.FC<ProgressTabProps> = ({
  course,
  userProfile: _userProfile,
}) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('Week');

  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 font-sans space-y-6 select-none">
        <div className="p-8 sm:p-10 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 font-bold text-sm tracking-tight flex items-center justify-center mx-auto border border-slate-200 dark:border-[#2E2A44]">
            EF
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No analytics available
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create a course to view study duration, activity trends, and time distribution.
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
    'All time': [
      { label: 'Current target', hours: totalStudiedHours, target: (course.targetHoursPerWeek || 15) * 4 },
    ],
  };

  const currentChartData = chartDataMap[activePeriod];
  const hasPeriodActivity = currentChartData.some((d) => d.hours > 0);

  const categoryHoursMap: Record<string, { name: string; hours: number; color: string }> = {
    video: { name: 'Study and lectures', hours: 0, color: '#475569' },
    lab: { name: 'Hands-on practice', hours: 0, color: '#0D9488' },
    reading: { name: 'Documentation', hours: 0, color: '#059669' },
    quiz: { name: 'Quizzes and reviews', hours: 0, color: '#6366F1' },
  };

  (course.agenda || []).forEach((t) => {
    const key = t.type === 'practice' ? 'quiz' : t.type in categoryHoursMap ? t.type : 'video';
    const hrs = (t.durationMinutes || 30) / 60;
    categoryHoursMap[key].hours = Math.round((categoryHoursMap[key].hours + hrs) * 10) / 10;
  });

  const categoryData = Object.values(categoryHoursMap).filter((c) => c.hours > 0);
  const totalCategoryHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

  const focusScore = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] rounded-lg shadow-sm text-xs tabular-nums">
          <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{payload[0].value} hours studied</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 font-sans select-none">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Study performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target tracking, time distribution, and session history
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#13111C] rounded-lg border border-slate-200 dark:border-[#2E2A44] text-xs">
            {(['Day', 'Week', 'Month', 'All time'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activePeriod === period
                    ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Time */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Study time
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Target: {course.targetHoursPerWeek || 15}h
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {course.studiedHoursThisWeek || 0}h
            </span>
          </div>
        </div>

        {/* Sessions */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sessions logged
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              +{course.completedSessionsToday || 0} today
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalSessionsLogged}
            </span>
          </div>
        </div>

        {/* Focus Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completion score
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {totalTasks > 0 ? `${focusScore}%` : '-'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {totalTasks > 0 ? (focusScore >= 75 ? 'High' : focusScore >= 40 ? 'Moderate' : 'Building') : '-'}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active streak
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {course.streakDays > 0 ? 'Active' : 'Not started'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {course.streakDays || 0} days
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Activity distribution
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Study time trend ({activePeriod.toLowerCase()})
              </h3>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
              {totalStudiedHours > 0 ? `Total: ${totalStudiedHours}h` : '0h logged'}
            </span>
          </div>

          {!hasPeriodActivity ? (
            <div className="h-56 sm:h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#13111C] rounded-lg border border-slate-100 dark:border-[#2E2A44] text-slate-400 space-y-1">
              <Clock className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">No activity recorded in this period</div>
              <div className="text-[11px] text-slate-400 max-w-xs">
                Log study sessions or complete scheduled tasks to view your study trends.
              </div>
            </div>
          ) : (
            <div className="h-56 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="label" 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    unit="h" 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#0F172A" 
                    strokeWidth={2} 
                    fill="#E2E8F0"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Chart */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Time distribution
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Subject breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {totalCategoryHours}h planned
            </span>
          </div>

          {totalCategoryHours === 0 ? (
            <div className="p-8 text-center rounded-lg bg-slate-50 dark:bg-[#13111C] border border-slate-100 dark:border-[#2E2A44] text-slate-400 space-y-1">
              <Compass className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">No categories logged yet</div>
              <div className="text-[11px] text-slate-400">
                Categories are populated as you add study modules and practice tasks.
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
              <div className="w-32 h-32 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={2}
                      dataKey="hours"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none tabular-nums">
                  <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                    {totalCategoryHours}h
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                    Total
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 w-full sm:w-auto tabular-nums">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{cat.hours}h</span>
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
