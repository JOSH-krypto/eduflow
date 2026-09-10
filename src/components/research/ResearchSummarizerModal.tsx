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
import { parseUploadedFile, ParsedFileResult } from '../../services/fileParser';

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
  const [uploadedFile, setUploadedFile] = useState<ParsedFileResult | null>(null);
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
    try {
      const parsed = await parseUploadedFile(file);
      setUploadedFile(parsed);
      setInputText(parsed.text);
      if (!title) {
        setTitle(parsed.fileName.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to parse file. Please try pasting raw text.');
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please enter notes or upload a document to summarize.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentSummary(null);

    try {
      const result = await api.summarizeResearchMaterial(
        inputText,
        title || 'Untitled Study Note',
        course.id
      );
      setCurrentSummary(result);
      onSaveSummary(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate AI summary. Please check your backend connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!currentSummary) return;
    const text = `
# ${currentSummary.title}
${currentSummary.overview}

## Key Concepts
${currentSummary.keyConcepts.map((k) => `- **${k.concept}**: ${k.definition}`).join('\n')}

## High-Yield Takeaways
${currentSummary.examHighYield.map((t) => `- ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToAgenda = () => {
    if (!currentSummary || !onAddTaskToAgenda) return;
    onAddTaskToAgenda({
      title: `Review: ${currentSummary.title}`,
      type: 'reading',
      durationMinutes: currentSummary.estimatedStudyTimeMinutes || 20,
      phaseId: course.phases[0]?.id,
    });
    setAddedToAgenda(true);
    setTimeout(() => setAddedToAgenda(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-teal-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">AI Research Summarizer</h2>
              <p className="text-xs text-slate-500">Transform study guides into high-yield takeaways</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-violet-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Generate Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-violet-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Saved Summaries ({summaries.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'create' ? (
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {!currentSummary ? (
                <div className="space-y-4">
                  {/* Topic Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Note or Document Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Distributed Consensus & Raft Algorithm"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                    />
                  </div>

                  {/* Focus Area Pill Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Focus
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {focusOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFocusArea(opt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            focusArea === opt
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                    className="border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/30 rounded-2xl p-4 text-center cursor-pointer transition"
                  >
                    <UploadCloud className="w-6 h-6 text-violet-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">
                      {uploadedFile ? uploadedFile.fileName : 'Upload Study Guide or PDF'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports Markdown, PDF, TXT up to 5MB
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.md,.pdf"
                      className="hidden"
                    />
                  </div>

                  {/* Raw Text Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Or Paste Study Notes / Lecture Transcript
                    </label>
                    <textarea
                      rows={5}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste research text, slides, textbook chapters, or question sets here..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={isProcessing || !inputText.trim()}
                    className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-card transition flex items-center justify-center gap-2 text-xs"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing & Extracting Concepts...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate High-Yield Summary</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Generated Summary View */
                <div className="space-y-4 animate-fade-in">
                  {/* Actions Bar */}
                  <div className="flex items-center justify-between bg-violet-50/60 p-3 rounded-2xl border border-violet-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-600" />
                      <span className="text-xs font-bold text-violet-900">
                        {currentSummary.estimatedStudyTimeMinutes || 15} min study time
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={handleAddToAgenda}
                        className="px-2.5 py-1 bg-violet-600 text-white rounded-xl text-[11px] font-semibold hover:bg-violet-700 flex items-center gap-1 shadow-sm"
                      >
                        {addedToAgenda ? <CheckCircle2 className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                        <span>{addedToAgenda ? 'Added' : 'Add to Plan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Title & Overview */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">{currentSummary.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentSummary.overview}</p>
                  </div>

                  {/* Key Concepts */}
                  {currentSummary.keyConcepts && currentSummary.keyConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-slate-500">
                        Key Concepts & Formulas
                      </h4>
                      <div className="grid gap-2">
                        {currentSummary.keyConcepts.map((kc, i) => (
                          <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-soft">
                            <span className="text-xs font-bold text-violet-700 block">{kc.concept}</span>
                            <span className="text-xs text-slate-600 mt-0.5 block">{kc.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* High Yield Takeaways */}
                  {currentSummary.examHighYield && currentSummary.examHighYield.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        High-Yield Exam Takeaways
                      </h4>
                      <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-100 space-y-1.5">
                        {currentSummary.examHighYield.map((takeaway, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-teal-900">
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
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
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
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
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
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-soft transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{s.overview}</p>
                      <span className="text-[10px] text-violet-600 font-medium">
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
