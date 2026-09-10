import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Award, 
  Target, 
  Sparkles
} from 'lucide-react';
import { Course, UserProfile } from '../../types/eduflow';

interface AnalyticsViewProps {
  course: Course;
  userProfile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  course,
  userProfile,
}) => {
  // Weekly Chart Data
  const weeklyData = course.weeklyActivity.map(item => ({
    name: item.day,
    hours: item.hours,
    target: item.targetHours,
  }));

  // Topic Mastery Radar Data
  const masteryData = course.topicMastery.map(m => ({
    topic: m.topic,
    score: m.masteryPercent,
    fullMark: 100,
  }));

  // Session Type Breakdown Data
  const sessionTypeData = [
    { name: 'Video Lectures', value: 45, color: '#38BDF8' },
    { name: 'Hands-on Labs', value: 30, color: '#F5A623' },
    { name: 'Reading & Notes', value: 15, color: '#A855F7' },
    { name: 'Practice Quizzes', value: 10, color: '#2DD4BF' },
  ];

  // 30-Day Activity Heatmap Data
  const past30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const isRecent = i >= 23; // Last 7 days active
    const randomIntensity = isRecent ? (i % 3 === 0 ? 3 : 2) : (i % 4 === 0 ? 2 : (i % 5 === 0 ? 1 : 0));
    return {
      day: i + 1,
      date: d.toISOString().split('T')[0],
      intensity: randomIntensity,
    };
  });

  // Calculate Exam Readiness Score
  const avgMastery = Math.round(
    course.topicMastery.reduce((acc, m) => acc + m.masteryPercent, 0) / (course.topicMastery.length || 1)
  );
  const readinessScore = Math.min(95, Math.round(avgMastery * 0.9 + 5));

  // Custom Dark Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[#18181C] border border-white/[0.12] rounded-xl shadow-xl text-xs">
          <p className="font-bold text-white mb-1">{label}</p>
          <p className="text-[#F5A623] font-semibold">
            Studied: {payload[0].value} hours
          </p>
          <p className="text-zinc-400">
            Target: {payload[0].payload.target} hours
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#141416] via-[#17171C] to-[#121817] border border-white/[0.08] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span className="text-[11px] font-semibold text-[#2DD4BF] uppercase tracking-wider">
              Performance & Mastery Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Study Insights: {course.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time tracking of weekly study pacing, domain retention scores, and 30-day consistency heatmap.
          </p>
        </div>

        {/* Big Readiness Score Card */}
        <div className="flex items-center gap-4 bg-[#18181C] p-4 rounded-2xl border border-white/[0.08] flex-shrink-0">
          <div className="text-right">
            <span className="text-[11px] uppercase font-bold text-zinc-400 block">
              Exam Readiness Score
            </span>
            <span className="text-2xl font-extrabold text-[#2DD4BF] font-display">
              {readinessScore}%
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              Pass Probability: <strong className="text-white">HIGH 🎯</strong>
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF] font-extrabold text-lg">
            {readinessScore}
          </div>
        </div>
      </div>

      {/* Top 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Total Hours</span>
            <Clock className="w-4 h-4 text-[#F5A623]" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display mt-2">
            {userProfile.totalHoursStudied}h
          </p>
          <span className="text-[10px] text-[#2DD4BF] font-medium mt-1 block">
            +4.5h this week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Streak Record</span>
            <Flame className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display mt-2">
            {course.streakDays} Days
          </p>
          <span className="text-[10px] text-[#2DD4BF] font-medium mt-1 block">
            Personal Best 🔥
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Domain Retention</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display mt-2">
            {avgMastery}%
          </p>
          <span className="text-[10px] text-zinc-400 font-medium mt-1 block">
            Across 6 core domains
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Simulated Exams</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-display mt-2">
            2 Passed
          </p>
          <span className="text-[10px] text-[#2DD4BF] font-medium mt-1 block">
            Avg Score: 860/1000
          </span>
        </div>
      </div>

      {/* Row 2: Weekly Hours Bar Chart + Topic Mastery Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours Bar Chart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                Weekly Study Time vs Target
              </h3>
              <p className="text-xs text-zinc-400">Hours spent per day this week</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5A623]/15 text-[#F5A623]">
              12.5h / 20h
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#71717A" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 4]} 
                />
                <Tooltip content={<CustomBarTooltip />} />
                <ReferenceLine y={2.8} stroke="#2DD4BF" strokeDasharray="3 3" label={{ value: 'Daily Target', fill: '#2DD4BF', fontSize: 10 }} />
                <Bar 
                  dataKey="hours" 
                  fill="#F5A623" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery Radar Chart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                Domain Mastery Breakdown
              </h3>
              <p className="text-xs text-zinc-400">Knowledge retention by AWS exam domain</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={masteryData} outerRadius="75%">
                <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                <PolarAngleAxis 
                  dataKey="topic" 
                  stroke="#A1A1AA" 
                  fontSize={10} 
                  tick={{ fill: '#D4D4D8' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke="#52525B" 
                  fontSize={9} 
                />
                <Radar 
                  name="Mastery" 
                  dataKey="score" 
                  stroke="#2DD4BF" 
                  fill="#2DD4BF" 
                  fillOpacity={0.35} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: 30-Day Activity Heatmap + Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Contribution Heatmap Grid */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                30-Day Study Activity Matrix
              </h3>
              <p className="text-xs text-zinc-400">Daily study intensity & habit consistency</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.06]" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]/70" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]" />
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 gap-2 pt-2">
            {past30Days.map((item) => {
              const bgClass =
                item.intensity === 3
                  ? 'bg-[#2DD4BF] shadow-sm shadow-[#2DD4BF]/30 ring-1 ring-[#2DD4BF]'
                  : item.intensity === 2
                  ? 'bg-[#2DD4BF]/60'
                  : item.intensity === 1
                  ? 'bg-[#2DD4BF]/25'
                  : 'bg-white/[0.05]';

              return (
                <div
                  key={item.day}
                  className={`h-8 sm:h-9 rounded-lg ${bgClass} flex items-center justify-center text-[10px] font-mono text-zinc-300 font-semibold cursor-pointer hover:scale-110 transition-transform`}
                  title={`${item.date}: Level ${item.intensity} study session`}
                >
                  {item.day}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-zinc-500 mt-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            Maintaining a daily study habit increases retention by 68% for cloud certifications.
          </p>
        </div>

        {/* Study Format Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              Study Modality Breakdown
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Time distribution by media format</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            {sessionTypeData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <span className="font-bold text-white font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
