import React from 'react';
import { X, Calendar, Printer, Download, FileText } from 'lucide-react';
import { Course } from '../../types/eduflow';
import { downloadCourseICS } from '../../services/icsExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  if (!isOpen) return null;

  const handleDownloadICS = () => {
    downloadCourseICS(course);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(course, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eduflow-${course.code.toLowerCase()}-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
        aria-hidden="true" 
      />

      <div 
        className="relative w-full max-w-lg bg-[#141416] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
        role="dialog"
        aria-label="Export Study Plan"
      >
        <div className="p-5 sm:p-6 bg-[#18181C] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Export Study Schedule
              </h2>
              <p className="text-xs text-zinc-400">
                Take your study plan anywhere: calendar, print, or backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white"
            aria-label="Close export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Option 1: Calendar ICS */}
          <button
            onClick={handleDownloadICS}
            className="w-full p-4 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-[#F5A623] hover:bg-[#F5A623]/5 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-[#F5A623]/10 text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-black transition-colors flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white group-hover:text-[#F5A623] transition-colors block">
                Download iCalendar (.ics)
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                Sync exam day milestones and upcoming agenda study blocks directly to Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
          </button>

          {/* Option 2: Print / PDF */}
          <button
            onClick={handlePrint}
            className="w-full p-4 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] group-hover:bg-[#2DD4BF] group-hover:text-black transition-colors flex-shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white group-hover:text-[#2DD4BF] transition-colors block">
                Print or Save as PDF
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                Generate a clean printable study schedule and phase checklist for offline review.
              </p>
            </div>
          </button>

          {/* Option 3: JSON Backup */}
          <button
            onClick={handleExportJSON}
            className="w-full p-4 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-purple-400 hover:bg-purple-500/5 transition-all text-left flex items-start gap-3.5 group"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors block">
                Export JSON Data Backup
              </span>
              <p className="text-xs text-zinc-400 mt-1">
                Download full raw data payload including completed sessions, streak logs, and custom tasks.
              </p>
            </div>
          </button>
        </div>

        <div className="p-4 bg-[#18181C] border-t border-white/[0.08] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
