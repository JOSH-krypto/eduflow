import React, { useState } from 'react';
import { 
  BarChart2, 
  Clock, 
  CheckCircle2, 
  Target, 
  Flame, 
  Calendar as CalendarIcon 
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

interface ProgressTabProps {
  course: Course;
  userProfile?: UserProfile;
}

type PeriodType = 'Day' | 'Week' | 'Month' | 'All Time';

export const ProgressTab: React.FC<ProgressTabProps> = ({
  course,
  userProfile,
}) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('Week');

  // Study Time Line/Area Chart Data based on active period
  const chartDataMap: Record<PeriodType, { label: string; hours: number; target: number }[]> = {
    Day: [
      { label: '8 AM', hours: 0.5, target: 0.5 },
      { label: '10 AM', hours: 1.2, target: 0.8 },
      { label: '12 PM', hours: 0.8, target: 0.5 },
      { label: '2 PM', hours: 0.4, target: 0.5 },
      { label: '4 PM', hours: 1.5, target: 1.0 },
      { label: '6 PM', hours: 0.6, target: 0.5 },
    ],
    Week: [
      { label: 'Mon', hours: 2.5, target: 2.8 },
      { label: 'Tue', hours: 3.0, target: 2.8 },
      { label: 'Wed', hours: 1.8, target: 2.8 },
      { label: 'Thu', hours: 2.2, target: 2.8 },
      { label: 'Fri', hours: 1.0, target: 2.8 },
      { label: 'Sat', hours: 2.5, target: 2.8 },
      { label: 'Sun', hours: 1.5, target: 2.8 },
    ],
    Month: [
      { label: 'Wk 1', hours: 14.5, target: 20 },
      { label: 'Wk 2', hours: 18.0, target: 20 },
      { label: 'Wk 3', hours: 16.5, target: 20 },
      { label: 'Wk 4', hours: 12.5, target: 20 },
    ],
    'All Time': [
      { label: 'May', hours: 38, target: 50 },
      { label: 'Jun', hours: 52, target: 50 },
      { label: 'Jul', hours: 64, target: 50 },
      { label: 'Aug', hours: 48, target: 50 },
      { label: 'Sep', hours: 35, target: 50 },
    ],
  };

  const currentChartData = chartDataMap[activePeriod];

  // Subject / Category Breakdown Donut Data
  const categoryData = [
    { name: 'Study & Lectures', hours: 22.5, color: '#8B5CF6', bg: '#F3E8FF' },
    { name: 'Review & Notes', hours: 12.0, color: '#0D9488', bg: '#CCFBF1' },
    { name: 'Practice & Quizzes', hours: 8.5, color: '#10B981', bg: '#D1FAE5' },
    { name: 'Labs & Coding', hours: 15.5, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const totalStudiedHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 bg-white border border-purple-100 rounded-2xl shadow-md text-xs">
          <p className="font-bold text-[#1E1B4B] font-heading">{label}</p>
          <p className="text-[#7C3AED] font-bold mt-0.5">{payload[0].value} hours studied</p>
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
            <div className="w-8 h-8 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1B4B] font-heading">
                Overview & Learning Analytics
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Track your mastery, pacing, and retention breakdown</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F7FC] border border-purple-100/60 text-xs font-semibold text-zinc-600">
            <CalendarIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Target: {userProfile?.weeklyTargetHours || course.targetHoursPerWeek} hrs/week</span>
          </div>
        </div>

        {/* Segmented Pill Control: Day / Week / Month / All Time */}
        <div className="flex items-center justify-between p-1 rounded-2xl bg-[#F8F7FC] border border-purple-100/60 mt-5 max-w-md">
          {(['Day', 'Week', 'Month', 'All Time'] as PeriodType[]).map((period) => {
            const isSelected = activePeriod === period;
            return (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 font-heading ${
                  isSelected
                    ? 'bg-[#8B5CF6] text-white shadow-sm scale-[1.02]'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row of 4 Stat Chips (2 cols on mobile, 4 cols on tablet/desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Chip 1: Study Time */}
        <div className="p-4 rounded-3xl bg-white border border-purple-100/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#047857] bg-[#D1FAE5] px-2 py-0.5 rounded-full font-mono">
              +4.5h
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Study Time
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {course.studiedHoursThisWeek}h
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
              +3 today
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Sessions Logged
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              18 Done
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
              92%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Focus Score
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              High 🎯
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
              Best 🔥
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
              Streak Active
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              {course.streakDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns on Desktop (7 cols Area + 5 cols Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chart: Study Time Trend Area Chart (lg:col-span-7) */}
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
            <span className="text-xs font-bold text-[#7C3AED] bg-[#F3E8FF] px-2.5 py-1 rounded-full font-mono">
              Avg 2.4h/day
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
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
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorStudy)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Subject & Category Breakdown Donut Chart (lg:col-span-5) */}
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
              {totalStudiedHours}h Logged
            </span>
          </div>

          {/* Donut Chart & Legend Stack */}
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
                  {totalStudiedHours}h
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
        </div>
      </div>
    </div>
  );
};
