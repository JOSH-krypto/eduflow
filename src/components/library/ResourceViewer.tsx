import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  FileText, 
  Layers, 
  Edit3, 
  RotateCw, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { ResourceItem } from '../../types/eduflow';

interface ResourceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  onToggleBookmark: (resourceId: string) => void;
  onStartFocusOnResource: (resource: ResourceItem) => void;
}

export const ResourceViewer: React.FC<ResourceViewerProps> = ({
  isOpen,
  onClose,
  resource,
  onToggleBookmark,
  onStartFocusOnResource,
}) => {
  if (!isOpen || !resource) return null;

  const [activeTab, setActiveTab] = useState<'content' | 'flashcards' | 'notes'>('content');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  const flashcards = resource.flashcards || [];
  const currentCard = flashcards.length > 0 ? flashcards[currentFlashcardIndex % flashcards.length] : null;

  const handleNextCard = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#141416] border border-white/[0.12] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
        role="dialog"
        aria-label={resource.title}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#18181C] border-b border-white/[0.08] flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5A623]/15 text-[#F5A623] text-[10px] font-bold uppercase tracking-wider">
                {resource.category}
              </span>
              <span className="text-xs text-zinc-400">· {resource.estimatedTime}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display truncate">
              {resource.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onToggleBookmark(resource.id)}
              className={`p-2 rounded-xl border transition-colors ${
                resource.isBookmarked
                  ? 'bg-[#F5A623]/20 border-[#F5A623]/40 text-[#F5A623]'
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white'
              }`}
              aria-label={resource.isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
            >
              <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              aria-label="Close resource modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-white/[0.06] bg-[#141416]">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'content'
                ? 'border-[#F5A623] text-[#F5A623]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Study Notes & Reference</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'flashcards'
                ? 'border-[#2DD4BF] text-[#2DD4BF]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards ({flashcards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>My Session Notes</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Content Markdown / Guide */}
          {activeTab === 'content' && (
            <div className="space-y-4 text-zinc-300 text-xs sm:text-sm leading-relaxed prose prose-invert max-w-none">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-zinc-300 font-medium">{resource.description}</p>
              </div>

              {resource.contentMarkdown ? (
                <div className="whitespace-pre-line font-sans bg-[#0D0D0F] p-5 rounded-2xl border border-white/[0.06] text-zinc-200">
                  {resource.contentMarkdown}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#0D0D0F] rounded-2xl border border-white/[0.06]">
                  <Sparkles className="w-8 h-8 text-[#F5A623] mx-auto mb-2" />
                  <p className="text-white font-bold">Standard Exam Reference Document</p>
                  <p className="text-xs text-zinc-500 mt-1">This module contains curated exam objectives and best practice architectural patterns.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Interactive Flashcards Flip Mode */}
          {activeTab === 'flashcards' && (
            flashcards.length === 0 ? (
              <div className="p-12 text-center bg-[#0D0D0F] rounded-2xl border border-white/[0.06] my-4">
                <Sparkles className="w-8 h-8 text-[#2DD4BF] mx-auto mb-2 opacity-60" />
                <p className="text-white font-bold text-sm">No flashcards available</p>
                <p className="text-xs text-zinc-500 mt-1">This topic does not have flashcards generated yet.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 space-y-6">
                <div className="flex items-center justify-between w-full max-w-md text-xs text-zinc-400">
                  <span>Card {currentFlashcardIndex + 1} of {flashcards.length}</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 text-[10px] uppercase font-bold">
                    {currentCard?.tag || 'General'}
                  </span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-md h-60 rounded-3xl bg-gradient-to-br from-[#18181C] to-[#121817] border border-white/[0.12] hover:border-[#2DD4BF]/50 p-6 flex flex-col justify-between cursor-pointer shadow-2xl relative transition-all duration-300 transform hover:scale-[1.02] select-none"
                  role="button"
                  tabIndex={0}
                  aria-label="Flip flashcard"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {isFlipped ? '💡 ANSWER' : '❓ QUESTION'}
                    </span>
                    <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 flex items-center gap-1 text-[10px]">
                      <RotateCw className="w-3 h-3" />
                      <span>Click to Flip</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center px-4">
                    <p className={`font-medium ${isFlipped ? 'text-[#2DD4BF] text-sm leading-relaxed font-sans' : 'text-white text-base font-display font-semibold'}`}>
                      {isFlipped ? currentCard?.answer : currentCard?.question}
                    </p>
                  </div>

                  <div className="text-center text-[10px] text-zinc-500">
                    {isFlipped ? 'Tap card again to return to question' : 'Tap to reveal correct answer'}
                  </div>
                </div>

                {/* Next / Previous Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevCard}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    aria-label="Previous flashcard"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={handleNextCard}
                    className="px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                    aria-label="Next flashcard"
                  >
                    <span>Next Card</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}

          {/* TAB 3: User Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-white block">
                Personal Study Notes & Key Takeaways
              </label>
              <textarea
                rows={8}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Type your notes, acronyms, or exam reminders here..."
                className="w-full p-4 text-xs sm:text-sm bg-[#0D0D0F] border border-white/[0.08] focus:border-purple-400 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed font-sans"
              />
              <p className="text-[11px] text-zinc-500">
                Notes are automatically saved locally and synchronized across your revision sessions.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#18181C] border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {resource.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              onStartFocusOnResource(resource);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-[#E09215] text-black text-xs font-bold shadow-md transition-all hover:scale-105"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>Start Focused Study</span>
          </button>
        </div>
      </div>
    </div>
  );
};
