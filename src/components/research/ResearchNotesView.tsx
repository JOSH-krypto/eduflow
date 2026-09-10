import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Check, 
  Copy, 
  BookmarkPlus, 
  PlusCircle, 
  Trash2, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  BookOpen, 
  History,
  Info
} from 'lucide-react';
import { Course, ResearchSummary, AgendaTask } from '../../types/eduflow';
import { parseUploadedFile, ParsedFileResult } from '../../services/fileParser';
import { summarizeResearchMaterial, getGeminiApiKeyStatus, SummarizerStatus } from '../../services/aiSummarizer';
import { setStoredApiKey } from '../../services/storage';

interface ResearchNotesViewProps {
  course: Course;
  summaries: ResearchSummary[];
  onSaveSummaryToLibrary: (summary: ResearchSummary) => void;
  onAddTaskToAgenda: (task: Omit<AgendaTask, 'id' | 'status'>) => void;
  onDeleteSummary: (summaryId: string) => void;
  onSelectSummary?: (summary: ResearchSummary) => void;
}

export const ResearchNotesView: React.FC<ResearchNotesViewProps> = ({
  course,
  summaries,
  onSaveSummaryToLibrary,
  onAddTaskToAgenda,
  onDeleteSummary,
}) => {
  // Input State
  const [inputText, setInputText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<ParsedFileResult | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [focusArea, setFocusArea] = useState<string>('Comprehensive Exam Breakdown');
  
  // Processing State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentSummary, setCurrentSummary] = useState<ResearchSummary | null>(summaries[0] || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedToAgenda, setAddedToAgenda] = useState<boolean>(false);
  const [savedToLibrary, setSavedToLibrary] = useState<boolean>(false);

  // API Key State
  const [apiKeyStatus, setApiKeyStatus] = useState<SummarizerStatus>(getGeminiApiKeyStatus());
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = inputText.length;

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const parsed = await parseUploadedFile(file);
      setUploadedFile(parsed);
      setInputText(parsed.text);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read file. Please try another text or PDF document.');
    }
  };

  // Handle API Key Save
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim()) return;
    setStoredApiKey(customApiKey.trim());
    setApiKeyStatus(getGeminiApiKeyStatus());
    setShowApiKeyInput(false);
    setCustomApiKey('');
  };

  // Sample Material Loader
  const handleLoadSample = () => {
    const sample = `# AWS VPC Peering & Transit Gateway Architecture Notes
A Virtual Private Cloud (VPC) peering connection is a networking connection between two VPCs that enables you to route traffic between them using private IPv4 or IPv6 addresses.
Instances in either VPC can communicate with each other as if they are within the same network.

## Key Limitations & Rules:
1. Non-Transitive Peering: You cannot route traffic through a VPC to reach another VPC. If VPC A is peered with VPC B, and VPC B is peered with VPC C, VPC A cannot communicate with VPC C through VPC B.
2. No Overlapping CIDR Blocks: The CIDR blocks of the peered VPCs must not match or overlap.
3. Bandwidth Limits: VPC Peering has NO bandwidth bottleneck and NO hourly connection charge—only standard intra-region or inter-region data transfer fees apply.

## AWS Transit Gateway Alternative:
AWS Transit Gateway acts as a central cloud router connecting thousands of VPCs and your on-premises data centers via Direct Connect or VPN.
It supports transitive routing, centralized route tables, and multicast traffic. However, Transit Gateway charges an hourly attachment fee per VPC plus per-GB data processing fees.

## Exam Scenarios:
- For 2 to 3 VPCs with high throughput data replication, choose VPC Peering for lowest cost and minimal latency.
- For complex multi-account hub-and-spoke topologies with > 5 VPCs and VPN connections, choose Transit Gateway.`;
    setInputText(sample);
    setUploadedFile({
      fileName: 'aws-vpc-architecture-sample.md',
      fileType: 'markdown',
      text: sample,
      charCount: sample.length,
      wordCount: sample.split(/\s+/).filter(Boolean).length,
    });
  };

  // Analyze Action
  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 20) {
      setErrorMessage('Please enter or upload at least 20 characters of study notes to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setCopied(false);
    setAddedToAgenda(false);
    setSavedToLibrary(false);

    try {
      const result = await summarizeResearchMaterial({
        materialText: inputText,
        courseTitle: course.title,
        fileName: uploadedFile?.fileName,
        customPromptFocus: focusArea,
      });

      const newSummary: ResearchSummary = {
        ...result,
        id: `sum-${Date.now()}`,
        createdAt: new Date().toISOString(),
        courseId: course.id,
      };

      setCurrentSummary(newSummary);
      // Auto-save to summary history
      onSaveSummaryToLibrary(newSummary);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while analyzing the material. You can trim the text or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!currentSummary) return;
    const content = `# ${currentSummary.title}

## Overview
${currentSummary.overview}

## Key Concepts
${currentSummary.keyConcepts.map(c => `- **${c.concept}**: ${c.definition}`).join('\n')}

## High-Yield Exam Points
${currentSummary.examHighYield.map(p => `- ${p}`).join('\n')}
`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Add As Study Task to Today's Agenda
  const handleAddAsStudyTask = () => {
    if (!currentSummary) return;
    onAddTaskToAgenda({
      title: `Review Notes: ${currentSummary.title}`,
      type: 'reading',
      durationMinutes: currentSummary.estimatedStudyTimeMinutes || 20,
    });
    setAddedToAgenda(true);
    setTimeout(() => setAddedToAgenda(false), 3500);
  };

  // Save to Library
  const handleSaveToLibraryClick = () => {
    if (!currentSummary) return;
    onSaveSummaryToLibrary(currentSummary);
    setSavedToLibrary(true);
    setTimeout(() => setSavedToLibrary(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="text-[11px] font-bold text-[#F5A623] uppercase tracking-wider font-heading">
                AI Research Summarizer
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
              Synthesize Study Notes & Lecture Materials
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl font-sans">
              Paste raw study text or upload documents (.txt, .md, .pdf) to extract structured overviews, key concept definitions, and high-yield exam callouts.
            </p>
          </div>

          {/* API Key Status Pill & Toggle */}
          <div className="flex items-center gap-2.5 bg-[#18181C] p-2.5 px-3.5 rounded-xl border border-white/[0.06] flex-shrink-0 self-start md:self-auto">
            <Key className={`w-4 h-4 ${apiKeyStatus.hasKey ? 'text-[#2DD4BF]' : 'text-[#F5A623]'}`} />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white font-heading">Gemini API:</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-heading ${
                  apiKeyStatus.hasKey 
                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' 
                    : 'bg-[#F5A623]/20 text-[#F5A623]'
                }`}>
                  {apiKeyStatus.hasKey ? 'Active' : 'Offline Heuristic'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-sans">
                {apiKeyStatus.hasKey ? `${apiKeyStatus.source} key configured` : 'Local heuristic analyzer active'}
              </span>
            </div>
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="ml-2 text-xs font-bold text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors font-heading"
            >
              {showApiKeyInput ? 'Hide' : 'Configure'}
            </button>
          </div>
        </div>

        {/* Clear Inline Setup Message if API Key is missing */}
        {!apiKeyStatus.hasKey && !showApiKeyInput && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#F5A623]/[0.08] border border-[#F5A623]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-200">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
              <span>
                <strong>Gemini API Key Setup:</strong> To enable live synthesis with Google's Gemini models, configure your API key (or provide <code className="px-1 py-0.5 bg-black/40 rounded text-[#F5A623]">VITE_GEMINI_API_KEY</code>). Offline smart heuristic mode is currently ready.
              </span>
            </div>
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black font-bold text-xs hover:bg-[#E09215] flex-shrink-0 font-heading"
            >
              Enter API Key
            </button>
          </div>
        )}

        {/* Inline API Key Configuration Form */}
        {showApiKeyInput && (
          <form onSubmit={handleSaveApiKey} className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="Enter custom Gemini API Key (e.g. AIzaSy...)"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623] font-sans"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#F5A623] hover:bg-[#E09215] text-black font-bold text-xs rounded-xl transition-all font-heading"
              >
                Save API Key
              </button>
              <button
                type="button"
                onClick={() => setShowApiKeyInput(false)}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Two-Column Layout: Input / Upload (Left) + Structured Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form & Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                Source Study Material
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-[#F5A623] hover:underline font-bold font-heading"
              >
                Load Sample Notes
              </button>
            </div>

            {/* Drag & Drop File Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                isDragging
                  ? 'border-[#F5A623] bg-[#F5A623]/10'
                  : 'border-white/[0.12] hover:border-white/[0.25] bg-[#18181C]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-white">
                {uploadedFile ? uploadedFile.fileName : 'Drop study material file here or click to browse'}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Supports .txt, .md, and .pdf documents
              </p>
            </div>

            {/* Direct Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans">
                <span>Or paste text directly:</span>
                <span className="font-mono">{wordCount} words · {charCount} chars</span>
              </div>
              <textarea
                rows={10}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setUploadedFile(null);
                }}
                placeholder="Paste lecture transcripts, textbook excerpts, architecture whitepapers, or documentation sections here..."
                className="w-full p-3.5 text-xs bg-[#18181C] border border-white/[0.08] focus:border-[#F5A623] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#F5A623] font-sans leading-relaxed resize-y"
              />
            </div>

            {/* Focus Strategy Selector */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1.5 font-heading">
                Analysis Focus & Depth:
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#18181C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#F5A623] font-sans"
              >
                <option value="Comprehensive Exam Breakdown">Comprehensive Exam Breakdown (Recommended)</option>
                <option value="High-Yield Core Definitions">High-Yield Core Definitions & Formulas</option>
                <option value="Disaster Recovery & Architecture Scenarios">Disaster Recovery & Architecture Scenarios</option>
                <option value="Exam Trap & Limit Detector">Exam Trap & Service Limit Detector</option>
              </select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2 font-sans">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputText.trim()}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all font-heading ${
                isLoading || !inputText.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-[#F5A623] hover:bg-[#E09215] text-black shadow-[#F5A623]/25 hover:scale-[1.01]'
              }`}
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Study Material with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Generate Exam Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Past Summaries History Card */}
          <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#2DD4BF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                  Summary History ({summaries.length})
                </span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {summaries.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center font-sans">No saved summaries yet.</p>
              ) : (
                summaries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentSummary(s)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors flex items-center justify-between gap-2 group ${
                      currentSummary?.id === s.id
                        ? 'bg-[#F5A623]/10 border-[#F5A623]/40 text-white'
                        : 'bg-[#18181C] border-white/[0.04] text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold truncate block group-hover:text-[#F5A623] font-sans">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(s.createdAt).toLocaleDateString()} · {s.wordCount} words · {s.keyConcepts.length} concepts
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSummary(s.id);
                      }}
                      className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete summary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Summary Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentSummary ? (
            <div className="p-6 rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card space-y-6 animate-fadeIn">
              {/* Summary Header & Metadata */}
              <div className="pb-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] text-[10px] font-bold uppercase tracking-wider font-heading">
                      Structured Exam Synthesis
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Est. Study Time: {currentSummary.estimatedStudyTimeMinutes} min
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                    {currentSummary.title}
                  </h3>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopySummary}
                    className="p-2 px-3 rounded-xl bg-[#18181C] border border-white/[0.08] hover:border-white/[0.16] text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors font-sans"
                    aria-label="Copy summary to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToLibraryClick}
                    className="p-2 px-3 rounded-xl bg-[#18181C] border border-white/[0.08] hover:border-[#F5A623] text-xs font-semibold text-zinc-300 hover:text-[#F5A623] flex items-center gap-1.5 transition-colors font-sans"
                    aria-label="Save summary to Library"
                  >
                    {savedToLibrary ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                    <span>{savedToLibrary ? 'Saved' : 'Save to Library'}</span>
                  </button>

                  <button
                    onClick={handleAddAsStudyTask}
                    className="p-2 px-3 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm font-heading"
                    aria-label="Add summary as task to Today's Agenda"
                  >
                    {addedToAgenda ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    <span>{addedToAgenda ? 'Added to Agenda' : '+ Add as Study Task'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Overview */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block font-heading">
                  1. Executive Overview
                </span>
                <div className="p-4 rounded-xl bg-[#18181C] border border-white/[0.06] text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {currentSummary.overview}
                </div>
              </div>

              {/* 2. Key Concepts & Definitions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-heading">
                    2. Core Concepts & Definitions ({currentSummary.keyConcepts.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentSummary.keyConcepts.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#18181C] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />
                        <h4 className="text-xs font-bold text-white font-heading">
                          {item.concept}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed pl-3.5 font-sans">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. High-Yield Exam Callouts */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  3. High-Yield Exam Points & Scenario Traps ({currentSummary.examHighYield.length})
                </span>

                <div className="p-4 rounded-xl bg-[#121816] border border-[#2DD4BF]/30 space-y-2.5 font-sans">
                  {currentSummary.examHighYield.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                      <span className="px-1.5 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                        TIP #{idx + 1}
                      </span>
                      <p className="leading-relaxed flex-1">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Footer */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 font-sans">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentSummary.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
                <span>Word count: {currentSummary.wordCount}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#141416] border border-white/[0.08] text-zinc-400 space-y-3 font-sans">
              <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white font-heading">No Summary Generated Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Paste study notes or upload a document on the left and click "Analyze & Generate Exam Summary".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
