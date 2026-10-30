import React from 'react';
import { Sparkles, Wand2, Eye, Layout, Sliders, ArrowRight } from 'lucide-react';
import { AppMode } from '../types/analysis';

interface HeroIntroProps {
  mode: AppMode;
  onChangeMode: (mode: AppMode) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ mode, onChangeMode }) => {
  if (mode === 'transform') {
    return (
      <div className="w-full text-center max-w-3xl mx-auto space-y-5 mb-8">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 text-xs text-slate-300 shadow-sm">
          <Wand2 className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-semibold text-violet-200">AI V2 — Vision → Transform</span>
          <span className="text-slate-600">•</span>
          <span className="text-violet-400 font-medium">Spatial Visual AI</span>
        </div>

        {/* Main Headline & Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Visually transform, reorganize, and redesign any space.
          </h1>
          <p className="text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
            “See it. Understand it. Act on it.”
          </p>
        </div>

        {/* Narrative Explanation */}
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Upload an image of a desk, bookshelf, living room, or cluttered surface. LifeLens analyzes the visible objects, plans an optimal spatial arrangement, generates a visual proposal, and explains exactly what changed.
        </p>

        {/* 3 Transform Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-violet-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Understand Space</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maps visible objects, relative coordinates, architectural walls, and lighting anchors.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-fuchsia-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Plan Reorganization</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Formulates intentional decluttering, aesthetic rhythm, balance, and cord safety.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1">
              <span className="w-5 h-5 rounded-md bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Visual Before / After</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Renders the proposed visual result with interactive split slider and detailed rationale.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Analyze Mode (V1 Default)
  return (
    <div className="w-full text-center max-w-3xl mx-auto space-y-5 mb-8">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-200">Multimodal Situation Intelligence V1</span>
        <span className="text-slate-600">•</span>
        <span className="text-cyan-400 font-medium">Powered by Gemini Multimodal</span>
      </div>

      {/* Main Headline & Tagline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Intelligent situation analysis for the visual world.
        </h1>
        <p className="text-lg sm:text-xl font-semibold tracking-wide bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
          “See it. Understand it. Act on it.”
        </p>
      </div>

      {/* Narrative Explanation */}
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
        LifeLens AI goes beyond basic object recognition. Upload any image to understand what is happening in the scene, separate physical facts from interpretations, evaluate risks, and get actionable recommendations on what to do next.
      </p>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>See it</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Extracts objects, visible text, spatial environment, and directly verified physical facts.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Understand it</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Synthesizes what is happening, why it matters, and evaluates risk severity with confidence ratings.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-1">
            <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Act on it</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Provides immediate next steps, safety precautions, checklist items, and expert consultation guidance.
          </p>
        </div>
      </div>

      {/* Mode Callout banner */}
      <div className="pt-2">
        <button
          onClick={() => onChangeMode('transform')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all group"
        >
          <Wand2 className="w-3.5 h-3.5 text-violet-400" />
          <span>Want to redesign or reorganize a space? Try Vision → Transform Mode</span>
          <ArrowRight className="w-3.5 h-3.5 text-violet-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
