import React from 'react';
import {
  Eye,
  Compass,
  BrainCircuit,
  AlertTriangle,
  ArrowRightCircle,
  Wand2,
  Sliders,
  Sparkles,
  Layers,
  Columns,
} from 'lucide-react';
import { AppMode } from '../types/analysis';

interface PipelineBarProps {
  mode?: AppMode;
  currentStage?: 'input' | 'observation' | 'context' | 'meaning' | 'risk' | 'action' | 'complete';
}

export const PipelineBar: React.FC<PipelineBarProps> = ({
  mode = 'analyze',
  currentStage = 'input',
}) => {
  const isTransform = mode === 'transform';

  const analyzeSteps = [
    { id: 'observation', label: 'Observation', icon: Eye, desc: 'What is visible' },
    { id: 'context', label: 'Context', icon: Compass, desc: 'Environment & state' },
    { id: 'meaning', label: 'Meaning', icon: BrainCircuit, desc: 'What is happening' },
    { id: 'risk', label: 'Importance & Risk', icon: AlertTriangle, desc: 'Why it matters' },
    { id: 'action', label: 'Action', icon: ArrowRightCircle, desc: 'What to do next' },
  ];

  const transformSteps = [
    { id: 'understand', label: 'Understand', icon: Eye, desc: 'Objects & environment' },
    { id: 'request', label: 'Request', icon: Sliders, desc: 'User goals & constraints' },
    { id: 'plan', label: 'Plan', icon: Layers, desc: 'Spatial rearrangement' },
    { id: 'visual', label: 'Visual Result', icon: Wand2, desc: 'Proposed outcome' },
    { id: 'explain', label: 'Explanation', icon: Sparkles, desc: 'What changed & why' },
  ];

  const steps = isTransform ? transformSteps : analyzeSteps;
  const isComplete = currentStage === 'complete';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isTransform ? 'bg-violet-400' : 'bg-cyan-400'
            }`}
          ></span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {isTransform
              ? 'LifeLens V2: Vision → Transform Pipeline'
              : 'LifeLens V1: Situation Intelligence Pipeline'}
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          {isTransform
            ? 'Image → Understand Space → User Request → Plan → Visual Result → Explain'
            : 'Image → Observation → Context → Meaning → Risk → Action'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center space-x-2.5 p-2 rounded-xl border transition-all ${
                isComplete
                  ? isTransform
                    ? 'bg-slate-800/60 border-violet-500/30 text-slate-200'
                    : 'bg-slate-800/60 border-cyan-500/30 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800/50 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isComplete
                    ? isTransform
                      ? 'bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate flex items-center gap-1">
                  <span>{step.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
