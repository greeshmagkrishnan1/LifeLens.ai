import React, { useState, useEffect } from 'react';
import { Eye, Compass, BrainCircuit, AlertTriangle, ArrowRightCircle } from 'lucide-react';

interface AnalysisLoadingProps {
  imagePreviewUrl?: string | null;
}

const PIPELINE_PHASES = [
  {
    step: 1,
    title: 'Visual Observation',
    detail: 'Cataloging physical objects, environment, people, and detected text from pixels...',
    icon: Eye,
  },
  {
    step: 2,
    title: 'Contextual Disentanglement',
    detail: 'Separating direct visual facts from deductions and verifying information sufficiency...',
    icon: Compass,
  },
  {
    step: 3,
    title: 'Situational Meaning',
    detail: 'Understanding what is taking place and synthesizing why it matters...',
    icon: BrainCircuit,
  },
  {
    step: 4,
    title: 'Risk & Safety Evaluation',
    detail: 'Evaluating potential hazards, urgency level, and safety protocols...',
    icon: AlertTriangle,
  },
  {
    step: 5,
    title: 'Action Recommendation',
    detail: 'Structuring immediate next steps and verification checklist...',
    icon: ArrowRightCircle,
  },
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ imagePreviewUrl }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhaseIndex((prev) => (prev < PIPELINE_PHASES.length - 1 ? prev + 1 : prev));
    }, 1400);

    return () => clearInterval(timer);
  }, []);

  const currentPhase = PIPELINE_PHASES[activePhaseIndex];

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Background glowing sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-indigo-500/10 to-violet-500/5 animate-pulse pointer-events-none"></div>

      <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Optical Scanning Reticle & Thumbnail */}
        <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-xl mb-6">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="Scanning target"
              className="w-full h-full object-cover opacity-60 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center">
              <Eye className="w-12 h-12 text-cyan-400/40" />
            </div>
          )}

          {/* Futuristic laser scan line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce"></div>

          {/* Radar circle sweep */}
          <div className="absolute inset-0 border border-cyan-400/30 rounded-full scale-75 animate-ping opacity-40"></div>
          <div className="absolute inset-0 border border-indigo-400/20 rounded-full scale-110"></div>

          {/* Corner optical marks */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
        </div>

        {/* Phase badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>
            Pipeline Phase {currentPhase.step} of 5: {currentPhase.title}
          </span>
        </div>

        {/* Status text */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          Analyzing Situation with Multimodal Intelligence
        </h3>
        <p className="text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
          {currentPhase.detail}
        </p>

        {/* Stepper indicators */}
        <div className="flex items-center justify-center space-x-2 w-full max-w-sm">
          {PIPELINE_PHASES.map((phase, idx) => (
            <div
              key={phase.step}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                idx <= activePhaseIndex
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                  : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
