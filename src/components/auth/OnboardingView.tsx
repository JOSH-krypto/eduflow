import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'A calmer, clearer way to master your exam',
      subtitle: 'Personalized pacing, structured study paths, and active recall schedules designed around your real exam deadline.',
      badge: 'FOCUSED EXAM PREPARATION',
    },
    {
      title: 'AI research summaries without the noise',
      subtitle: 'Extract key concepts, compare architectures, and surface high-yield exam traps in seconds.',
      badge: 'INTELLIGENT SYNTHESIS',
    },
    {
      title: 'Real-time readiness and retention tracking',
      subtitle: 'Follow a clean visual roadmap from foundations to full-length timed mock simulations.',
      badge: 'PROVEN STUDY SCIENCE',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Background Soft Pastel Blobs (Pure CSS) */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#EDE9FE]/70 blur-3xl pointer-events-none"
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#CCFBF1]/60 blur-3xl pointer-events-none"
        aria-hidden="true" 
      />

      {/* Top Brand Tag */}
      <div className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white font-bold font-heading flex items-center justify-center shadow-sm">
            EF
          </div>
          <span className="font-heading font-extrabold text-lg text-[#1E1B4B]">
            EduFlow
          </span>
        </div>

        <button
          onClick={onSignIn}
          className="text-xs font-bold text-[#6D28D9] hover:underline font-heading"
        >
          Sign In
        </button>
      </div>

      {/* Center: Abstract Geometric Visual (No Mascot / No Clipart) */}
      <div className="my-auto py-6 flex flex-col items-center">
        {/* Abstract Stacked Pastel Cards with Circular Progress Ring Motif */}
        <div className="relative w-64 h-60 flex items-center justify-center">
          {/* Back Card (Teal) */}
          <div className="absolute top-2 w-52 h-36 rounded-3xl bg-[#CCFBF1] border border-[#99F6E4] rotate-6 opacity-70 shadow-sm" />
          
          {/* Middle Card (Amber) */}
          <div className="absolute top-6 w-52 h-36 rounded-3xl bg-[#FEF3C7] border border-[#FDE68A] -rotate-3 opacity-80 shadow-sm" />

          {/* Front Elevated Card (Violet & White) */}
          <div className="relative z-10 w-56 p-4 rounded-3xl bg-white border border-purple-100 shadow-card flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9] bg-[#F3E8FF] px-2 py-0.5 rounded-full font-heading">
                Active Track
              </span>
              <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1E1B4B] block font-heading">
                AWS Solutions Architect
              </span>
              <span className="text-[10px] text-zinc-400">
                Phase 2 · Resilient Architectures
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 font-mono">
                <span>Daily Pacing</span>
                <span className="text-[#0D9488]">64%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#0D9488] w-[64%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Text */}
        <div className="text-center mt-6 space-y-2 max-w-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] bg-[#F3E8FF] px-2.5 py-1 rounded-full inline-block font-heading">
            {slides[activeSlide].badge}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading tracking-tight leading-snug">
            {slides[activeSlide].title}
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans">
            {slides[activeSlide].subtitle}
          </p>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center gap-1.5 mt-5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                activeSlide === idx ? 'w-6 bg-[#8B5CF6]' : 'w-1.5 bg-purple-200'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA Buttons */}
      <div className="space-y-2.5 pb-2">
        <button
          onClick={onGetStarted}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-extrabold text-sm font-heading shadow-md shadow-purple-300/40 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <p className="text-center text-[11px] text-zinc-400">
          Already studying with EduFlow?{' '}
          <button
            onClick={onSignIn}
            className="text-[#6D28D9] font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
