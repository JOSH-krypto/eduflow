import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  UploadCloud,
  Check,
  Copy,
  PlusCircle,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
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
  const [focusArea, setFocusArea] = useState('High-Yield Exam Concepts');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);
  const [currentSummary, setCurrentSummary] = useState<ResearchSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToAgenda, setAddedToAgenda] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const focusOptions = [
    'High-Yield Exam Concepts',
    'Quick Formula & Key Definitions',
    'Comprehensive Summary',
    'Practice Questions & Pitfalls',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // 10MB file limit check
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit. Please upload a smaller document.');
      return;
    }

    // Client-side extension validation
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.txt', '.md'].includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload a .pdf, .txt, or .md file.');
      return;
    }

    // Save the raw file for multipart direct upload
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
      const summaryTitle = title.trim() || (selectedRawFile ? selectedRawFile.name.replace(/\.[^/.]+$/, '') : 'Study Notes Summary');

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
          throw new Error('Please enter study notes or upload a document to summarize.');
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
    } catch (err: any) {
      console.error('Summarize error:', err);
      setErrorMessage(err.message || 'Could not generate summary. Please check your document and try again.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#1C1929] rounded-3xl border border-slate-200/90 dark:border-[#2E2A44] shadow-2xl overflow-hidden z-10 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-[#2E2A44]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="summarizer-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading"
              >
                AI Research Notes & PDF Summarizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract high-yield concepts, key definitions, and exam takeaways
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-100 dark:border-[#2E2A44] bg-slate-50/50 dark:bg-[#13111C]/50">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-[#2E2A44] text-amber-600 dark:text-amber-300 shadow-sm border border-slate-200/60 dark:border-[#3B3759]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Generate Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#2E2A44] text-amber-600 dark:text-amber-300 shadow-sm border border-slate-200/60 dark:border-[#3B3759]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Saved Summaries ({summaries.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'create' ? (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!currentSummary ? (
                <div className="space-y-4">
                  {/* Topic Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Note or Document Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Distributed Consensus & Raft Algorithm"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Focus Area Pill Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Focus
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {focusOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFocusArea(opt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            focusArea === opt
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                              : 'bg-slate-100 dark:bg-[#13111C] border border-transparent dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252236]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                      selectedRawFile
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-[#2E2A44] hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-[#13111C]/50'
                    }`}
                  >
                    <UploadCloud className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                    {selectedRawFile ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate max-w-xs">
                            {selectedRawFile.name}
                          </p>
                          <button
                            type="button"
                            onClick={handleClearFile}
                            className="p-1 rounded-full bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-800 dark:text-amber-200 transition"
                            title="Remove attached file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium font-mono">
                          {(selectedRawFile.size / 1024).toFixed(1)} KB • Ready for native AI document analysis
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Upload Study Guide, Slides, or PDF
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

                  {/* Raw Text Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {selectedRawFile ? 'Or Add Additional Notes (Optional)' : 'Or Paste Study Notes / Lecture Transcript'}
                    </label>
                    <textarea
                      rows={selectedRawFile ? 3 : 5}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={selectedRawFile ? "Add any specific questions or focus areas for the AI..." : "Paste research text, slides, textbook chapters, or question sets here..."}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={isProcessing || (!selectedRawFile && !inputText.trim())}
                    className="w-full py-3.5 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] disabled:opacity-50 text-white font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 text-xs cursor-pointer ring-1 ring-white/10"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing & Extracting Concepts with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Generate High-Yield Summary</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                    🔒 AI Notice: Uploaded files and study notes are processed securely via Google Gemini AI.
                  </p>
                </div>
              ) : (
                /* Generated Summary View */
                <div className="space-y-4 animate-fade-in">
                  {/* Actions Bar */}
                  <div className="flex items-center justify-between bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        {currentSummary.estimatedStudyTimeMinutes || 15} min study time
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252236] flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleAddToAgenda}
                        className="px-2.5 py-1 bg-slate-900 dark:bg-[#2E2A44] text-white rounded-xl text-[11px] font-semibold hover:bg-slate-800 dark:hover:bg-[#3B3759] flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        {addedToAgenda ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <PlusCircle className="w-3 h-3 text-amber-400" />}
                        <span>{addedToAgenda ? 'Added' : 'Add to Plan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Title & Overview */}
                  <div className="bg-slate-50 dark:bg-[#13111C] p-4 rounded-2xl border border-slate-100 dark:border-[#2E2A44]">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">{currentSummary.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{currentSummary.overview}</p>
                  </div>

                  {/* Key Concepts */}
                  {currentSummary.keyConcepts && currentSummary.keyConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                        Key Concepts & Formulas
                      </h4>
                      <div className="grid gap-2">
                        {currentSummary.keyConcepts.map((kc, i) => (
                          <div key={i} className="bg-white dark:bg-[#13111C] p-3 rounded-2xl border border-slate-100 dark:border-[#2E2A44] shadow-soft">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">{kc.concept}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 block">{kc.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* High Yield Takeaways */}
                  {currentSummary.examHighYield && currentSummary.examHighYield.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 font-mono">
                        High-Yield Exam Takeaways
                      </h4>
                      <div className="bg-teal-50/50 dark:bg-teal-950/20 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-900/40 space-y-1.5">
                        {currentSummary.examHighYield.map((takeaway, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-teal-900 dark:text-teal-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset / New Button */}
                  <button
                    onClick={() => setCurrentSummary(null)}
                    className="w-full py-2.5 bg-slate-100 dark:bg-[#13111C] hover:bg-slate-200 dark:hover:bg-[#252236] text-slate-700 dark:text-slate-200 font-semibold rounded-2xl text-xs transition cursor-pointer"
                  >
                    Summarize Another Note
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Saved Summaries Tab */
            <div className="space-y-3">
              {summaries.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">No saved summaries yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Generate an AI breakdown to store high-yield study cards here
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
                    className="p-3.5 bg-white dark:bg-[#13111C] rounded-2xl border border-slate-100 dark:border-[#2E2A44] hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-soft transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.overview}</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        {s.estimatedStudyTimeMinutes || 15}m study time • {s.keyConcepts?.length || 0} concepts
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
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
