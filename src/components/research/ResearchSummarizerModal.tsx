import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  Copy,
  Plus,
  Clock,
  BookOpen,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Course, ResearchSummary, AgendaTask } from '../../types/eduflow';
import { api } from '../../services/api';

interface ResearchSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  summaries: ResearchSummary[];
  onSaveSummary: (summary: ResearchSummary) => void;
  onAddTaskToAgenda?: (task: Omit<AgendaTask, 'id' | 'status'>) => void;
}

export const ResearchSummarizerModal: React.FC<ResearchSummarizerModalProps> = ({
  isOpen,
  onClose,
  course,
  summaries,
  onSaveSummary,
  onAddTaskToAgenda,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');
  const [focusArea, setFocusArea] = useState('Key concepts and definitions');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const [currentSummary, setCurrentSummary] = useState<ResearchSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToAgenda, setAddedToAgenda] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const focusOptions = [
    'Key concepts and definitions',
    'Formulas and rules',
    'Comprehensive overview',
    'Review questions and notes',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit. Upload a smaller document.');
      return;
    }

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.txt', '.md'].includes(ext)) {
      setErrorMessage('Unsupported file format. Upload a .pdf, .txt, or .md file.');
      return;
    }

    setSelectedRawFile(file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRawFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSummarize = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const summaryTitle = title.trim() || (selectedRawFile ? selectedRawFile.name.replace(/\.[^/.]+$/, '') : 'Study notes summary');

      let summary: ResearchSummary;
      if (selectedRawFile) {
        summary = await api.summarizeDocument({
          file: selectedRawFile,
          title: summaryTitle,
          courseId: course?.id,
          focusArea,
        });
      } else {
        if (!inputText.trim()) {
          throw new Error('Enter study notes or upload a document to summarize.');
        }
        summary = await api.summarizeDocument({
          materialText: inputText.trim(),
          title: summaryTitle,
          courseId: course?.id,
          focusArea,
        });
      }

      setCurrentSummary(summary);
      onSaveSummary(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not generate summary. Check your document and try again.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!currentSummary) return;
    const text = `Title: ${currentSummary.title}\n\nOverview:\n${currentSummary.overview}\n\nKey Concepts:\n${(currentSummary.keyConcepts || []).map((k) => `• ${k.concept}: ${k.definition}`).join('\n')}\n\nHigh-Yield:\n${(currentSummary.examHighYield || []).map((y) => `• ${y}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToAgenda = () => {
    if (!currentSummary || !onAddTaskToAgenda) return;
    onAddTaskToAgenda({
      title: `Review: ${currentSummary.title}`,
      type: 'reading',
      durationMinutes: currentSummary.estimatedStudyTimeMinutes || 15,
      phaseId: course?.phases?.[0]?.id,
    });
    setAddedToAgenda(true);
    setTimeout(() => setAddedToAgenda(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summarizer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1C1929] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-lg overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#2E2A44]">
          <div>
            <h2
              id="summarizer-modal-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Document summarizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Extract key concepts and review notes from documents or text.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-4 pt-2.5 pb-1 flex gap-2 border-b border-slate-200 dark:border-[#2E2A44] bg-slate-50 dark:bg-[#13111C]">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3B3759]'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            New summary
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer tabular-nums ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3B3759]'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Saved summaries ({summaries.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'create' ? (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!currentSummary ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Distributed Consensus"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Focus area
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {focusOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFocusArea(opt)}
                          className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                            focusArea === opt
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                              : 'bg-slate-100 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252236]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                      selectedRawFile
                        ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-[#13111C]'
                        : 'border-slate-200 dark:border-[#2E2A44] hover:border-slate-400 bg-slate-50 dark:bg-[#13111C]'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    {selectedRawFile ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                            {selectedRawFile.name}
                          </p>
                          <button
                            type="button"
                            onClick={handleClearFile}
                            className="p-0.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white"
                            title="Remove file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {(selectedRawFile.size / 1024).toFixed(1)} KB ready
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          Upload study guide, notes, or PDF
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supports PDF, Markdown, and TXT up to 10MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.md,.pdf,application/pdf"
                      className="hidden"
                    />
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {selectedRawFile ? 'Additional notes (optional)' : 'Or paste study text'}
                    </label>
                    <textarea
                      rows={selectedRawFile ? 2 : 4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={selectedRawFile ? "Optional focus questions..." : "Paste study text or notes here..."}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={isProcessing || (!selectedRawFile && !inputText.trim())}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-slate-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer border border-slate-700/20 dark:border-white/20"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Summarizing document...</span>
                      </>
                    ) : (
                      <span>Summarize</span>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                    Generated summary. Document content is processed to extract key concepts.
                  </p>
                </div>
              ) : (
                /* Generated Summary */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-[#13111C] p-3 rounded-lg border border-slate-200 dark:border-[#2E2A44]">
                    <div className="flex items-center gap-1.5 tabular-nums text-xs text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentSummary.estimatedStudyTimeMinutes || 15} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252236] flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleAddToAgenda}
                        className="px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md text-[11px] font-medium hover:bg-slate-800 dark:hover:bg-white flex items-center gap-1 cursor-pointer"
                      >
                        {addedToAgenda ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{addedToAgenda ? 'Added' : 'Add to plan'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#13111C] p-4 rounded-lg border border-slate-200 dark:border-[#2E2A44]">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{currentSummary.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{currentSummary.overview}</p>
                  </div>

                  {currentSummary.keyConcepts && currentSummary.keyConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Key concepts
                      </h4>
                      <div className="grid gap-2">
                        {currentSummary.keyConcepts.map((kc, i) => (
                          <div key={i} className="bg-white dark:bg-[#13111C] p-3 rounded-lg border border-slate-200 dark:border-[#2E2A44]">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">{kc.concept}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 block">{kc.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSummary.examHighYield && currentSummary.examHighYield.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Key takeaways
                      </h4>
                      <div className="bg-slate-50 dark:bg-[#13111C] p-3 rounded-lg border border-slate-200 dark:border-[#2E2A44] space-y-1.5">
                        {currentSummary.examHighYield.map((takeaway, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentSummary(null)}
                    className="w-full py-2 bg-slate-100 dark:bg-[#13111C] hover:bg-slate-200 dark:hover:bg-[#252236] text-slate-700 dark:text-slate-200 font-medium rounded-lg text-xs transition cursor-pointer"
                  >
                    Summarize another document
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Saved Summaries */
            <div className="space-y-2.5">
              {summaries.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">No saved summaries yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generate a summary to access review notes here.
                  </p>
                </div>
              ) : (
                summaries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCurrentSummary(s);
                      setActiveTab('create');
                    }}
                    className="p-3 bg-white dark:bg-[#13111C] rounded-lg border border-slate-200 dark:border-[#2E2A44] hover:border-slate-400 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-white">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.overview}</p>
                      <span className="text-[10px] text-slate-500 tabular-nums">
                        {s.estimatedStudyTimeMinutes || 15}m read · {s.keyConcepts?.length || 0} concepts
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchSummarizerModal;
