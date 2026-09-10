import React from 'react';
import { 
  Check, 
  Play, 
  Lock, 
  Plus, 
  Calendar as CalendarIcon, 
  Download, 
  Trash2, 
  Video,
  Terminal,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';
import { AgendaTask, TaskType } from '../../types/eduflow';
import { getTodayFormatted } from '../../utils/dateUtils';

interface TodayAgendaProps {
  tasks: AgendaTask[];
  onToggleTask: (taskId: string) => void;
  onOpenAddTaskModal: () => void;
  onDeleteTask: (taskId: string) => void;
  onPlayTask: (task: AgendaTask) => void;
  onExportCalendar: () => void;
}

export const TodayAgenda: React.FC<TodayAgendaProps> = ({
  tasks,
  onToggleTask,
  onOpenAddTaskModal,
  onDeleteTask,
  onPlayTask,
  onExportCalendar,
}) => {
  const todayDateStr = getTodayFormatted();
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-sky-400" />;
      case 'lab':
        return <Terminal className="w-3.5 h-3.5 text-[#F5A623]" />;
      case 'reading':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'quiz':
      case 'practice':
        return <HelpCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card overflow-hidden">
      {/* Header: X/Y Done + Dynamic Today's Date */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-[#18181C]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-white font-heading uppercase tracking-wider">
              Today's Plan
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] font-extrabold font-mono">
              {completedCount}/{tasks.length} done
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 font-sans">
            <CalendarIcon className="w-3 h-3 text-zinc-500" />
            <span>{todayDateStr}</span>
          </p>
        </div>

        <button
          onClick={onExportCalendar}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Export agenda to .ics calendar"
          aria-label="Export to Calendar"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="p-3 sm:p-4 space-y-2">
        {tasks.map((task) => {
          const isCompleted = task.status === 'completed';
          const isCurrent = task.status === 'current';

          // 1. COMPLETED TASK: Single-line, checked, strikethrough (no multiline subtitles)
          if (isCompleted) {
            return (
              <div
                key={task.id}
                className="group flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#121214]/50 border border-white/[0.03] text-zinc-500 transition-all hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="w-4 h-4 rounded bg-[#2DD4BF] text-[#0A0A0C] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
                    aria-label={`Uncheck ${task.title}`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <span
                    onClick={() => onToggleTask(task.id)}
                    className="text-xs line-through text-zinc-500 select-none truncate cursor-pointer font-sans"
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete task"
                  title="Remove task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          }

          // 2. CURRENT TASK: The only row that shows duration and a play action
          if (isCurrent) {
            return (
              <div
                key={task.id}
                className="group relative flex items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#18181C] to-[#141A18] border border-[#2DD4BF]/50 shadow-md shadow-[#2DD4BF]/5 ring-1 ring-[#2DD4BF]/30 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 w-5 h-5 rounded-md border-2 border-[#2DD4BF] bg-transparent hover:bg-[#2DD4BF]/20 flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label={`Mark ${task.title} complete`}
                  />

                  <div className="min-w-0 flex-1">
                    <span 
                      onClick={() => onToggleTask(task.id)}
                      className="text-xs font-bold text-white block truncate leading-snug cursor-pointer font-sans"
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-300 font-sans">
                      <span className="flex items-center gap-1">
                        {getTaskIcon(task.type)}
                        <span className="capitalize">{task.type}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-[#2DD4BF] font-semibold">
                        {task.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onPlayTask(task)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0A0A0C] font-extrabold text-xs font-heading shadow-md shadow-[#2DD4BF]/20 transition-all hover:scale-105"
                    aria-label={`Start session: ${task.title}`}
                    title="Start focus timer"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          }

          // 3. FUTURE / LOCKED TASKS: Compact row with title + duration + lock icon
          return (
            <div
              key={task.id}
              className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#121214] border border-white/[0.04] text-zinc-400 transition-all hover:border-white/[0.08]"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="w-4 h-4 rounded border border-zinc-600 bg-transparent hover:border-zinc-400 flex items-center justify-center flex-shrink-0"
                  aria-label={`Mark ${task.title} complete`}
                />
                <span 
                  onClick={() => onToggleTask(task.id)}
                  className="text-xs text-zinc-300 truncate select-none cursor-pointer font-sans"
                >
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {task.durationMinutes}m
                </span>
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Compact "+ Add study task" Trigger Button (No default inline form) */}
        <button
          onClick={onOpenAddTaskModal}
          className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-white/[0.12] hover:border-[#F5A623]/50 hover:bg-[#F5A623]/5 text-xs font-bold text-zinc-400 hover:text-[#F5A623] flex items-center justify-center gap-2 transition-all font-heading"
          aria-label="Add study task to today's agenda"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add study task</span>
        </button>
      </div>
    </div>
  );
};
