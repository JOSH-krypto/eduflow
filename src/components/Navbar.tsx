import React, { useState, useRef, useEffect } from 'react';
import { ExamPlan, GlobalStats } from '../types/plan';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Printer, 
  Sparkles, 
  Flame, 
  Clock, 
  Key, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  Lightbulb,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface NavbarProps {
  exams: ExamPlan[];
  activeExam: ExamPlan | null;
  globalStats: GlobalStats;
  apiKeyPresent: boolean;
  onSelectExam: (examId: string) => void;
  onNewExam: () => void;
  onEditExam: () => void;
  onDeleteExam: (examId: string) => void;
  onReplan: () => void;
  onExportIcs: () => void;
  onPrint: () => void;
  onOpenApiKeyModal: () => void;
  onToggleTips: () => void;
  showTips: boolean;
  onToggleOutlineView: () => void;
  isOutlineView: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  exams,
  activeExam,
  globalStats,
  apiKeyPresent,
  onSelectExam,
  onNewExam,
  onEditExam,
  onDeleteExam,
  onReplan,
  onExportIcs,
  onPrint,
  onOpenApiKeyModal,
  onToggleTips,
  showTips,
  onToggleOutlineView,
  isOutlineView,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="no-print bg-chalkboard-darkest/95 backdrop-blur border-b border-chalkboard-border sticky top-0 z-40 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand + Exam Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-chalk text-lg md:text-xl font-bold tracking-wide text-chalk-white leading-tight flex items-center gap-1.5">
                Exam Prep Planner
                <span className="text-[10px] font-sans font-normal px-1.5 py-0.5 rounded bg-chalkboard-surface text-chalk-muted border border-chalkboard-border">
                  Mind Map
                </span>
              </h1>
            </div>
          </div>

          <div className="h-5 w-px bg-chalkboard-border hidden sm:block" />

          {/* Exam Dropdown Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border border-chalkboard-border text-sm font-medium text-chalk-white transition-colors"
            >
              <span className="truncate max-w-[140px] md:max-w-[200px]">
                {activeExam ? activeExam.title : 'No exams'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-chalk-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-chalkboard-surface border border-chalkboard-borderStrong rounded-xl shadow-2xl p-1.5 z-50 animate-node-in">
                <div className="text-[11px] font-semibold text-chalk-muted px-2.5 py-1 uppercase tracking-wider">
                  Saved Exams
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        onSelectExam(exam.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        activeExam?.id === exam.id
                          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30 font-semibold'
                          : 'text-chalk-white hover:bg-chalkboard-surfaceHover'
                      }`}
                    >
                      <span className="truncate pr-2">{exam.title}</span>
                      {activeExam?.id === exam.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-chalkboard-border mt-1.5 pt-1.5 flex items-center gap-1">
                  <button
                    onClick={() => {
                      onNewExam();
                      setDropdownOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal text-xs font-medium border border-accent-teal/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Exam
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Exam Management Actions */}
          {activeExam && (
            <div className="flex items-center gap-1">
              <button
                onClick={onEditExam}
                title="Edit Exam details & syllabus"
                className="p-1.5 rounded-lg text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surface border border-transparent hover:border-chalkboard-border transition-colors text-xs flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {exams.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${activeExam.title}"?`)) {
                      onDeleteExam(activeExam.id);
                    }
                  }}
                  title="Delete Exam"
                  className="p-1.5 rounded-lg text-chalk-muted hover:text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/20 transition-colors text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center/Right: Global Stats Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Study Streak Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chalkboard-surface border border-chalkboard-border text-xs text-chalk-white shadow-sm"
            title="Continuous daily study streak"
          >
            <Flame className={`w-3.5 h-3.5 ${globalStats.currentStreak > 0 ? 'text-accent-gold animate-pulse' : 'text-chalk-muted'}`} />
            <span className="font-semibold text-accent-gold">{globalStats.currentStreak}</span>
            <span className="text-chalk-muted text-[11px] hidden sm:inline">day streak</span>
          </div>

          {/* Total Hours Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-chalkboard-surface border border-chalkboard-border text-xs text-chalk-white shadow-sm"
            title="All-time hours studied across all exams"
          >
            <Clock className="w-3.5 h-3.5 text-accent-teal" />
            <span className="font-semibold text-accent-teal">{globalStats.totalHoursStudied}</span>
            <span className="text-chalk-muted text-[11px] hidden sm:inline">hrs total</span>
          </div>

          {/* API Key Status / Setup */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              apiKeyPresent
                ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/30 hover:bg-accent-teal/25'
                : 'bg-accent-gold/20 text-accent-gold border-accent-gold/40 hover:bg-accent-gold/30 animate-pulse'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3 h-3" />
            <span>{apiKeyPresent ? 'Gemini AI Ready' : 'Setup API Key'}</span>
          </button>
        </div>

        {/* Right Actions: Replan, Export ICS, Print, Tips, Outline toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {activeExam && (
            <>
              {/* Replan Button */}
              <button
                onClick={onReplan}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chalkboard-surface hover:bg-chalkboard-surfaceHover text-accent-gold border border-accent-gold/40 hover:border-accent-gold text-xs font-semibold shadow-sm transition-all"
                title="Replan remaining days based on completed topics"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Replan Remaining</span>
              </button>

              {/* Add to Calendar Button */}
              <button
                onClick={onExportIcs}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chalkboard-surface hover:bg-chalkboard-surfaceHover text-chalk-white border border-chalkboard-border text-xs font-medium transition-colors"
                title="Download .ics iCalendar file for all scheduled study sessions"
              >
                <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                <span className="hidden lg:inline">Calendar (.ics)</span>
              </button>

              {/* Print / Flat Outline Mode */}
              <button
                onClick={onToggleOutlineView}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isOutlineView
                    ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/40'
                    : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover text-chalk-white border-chalkboard-border'
                }`}
                title="Toggle between Interactive Mind Map and Flat Outline view"
              >
                <FileText className="w-3.5 h-3.5 text-accent-gold" />
                <span className="hidden lg:inline">{isOutlineView ? 'Mind Map' : 'Outline'}</span>
              </button>

              {/* Print Button */}
              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chalkboard-surface hover:bg-chalkboard-surfaceHover text-chalk-white border border-chalkboard-border text-xs font-medium transition-colors"
                title="Print clean study plan outline / Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-chalk-muted" />
                <span className="hidden xl:inline">Print / PDF</span>
              </button>

              {/* Study Tips Button */}
              {activeExam.tips && activeExam.tips.length > 0 && (
                <button
                  onClick={onToggleTips}
                  className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    showTips
                      ? 'bg-accent-gold/25 text-accent-gold border-accent-gold/50'
                      : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover text-chalk-muted hover:text-chalk-white border-chalkboard-border'
                  }`}
                  title="View AI-generated study tips"
                >
                  <Lightbulb className="w-4 h-4 text-accent-gold" />
                </button>
              )}
            </>
          )}

          {/* New Exam Button (if not on dropdown) */}
          <button
            onClick={onNewExam}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest font-semibold text-xs shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Exam</span>
          </button>
        </div>

      </div>
    </header>
  );
};
