import React from 'react';
import { PRESET_SCENARIOS } from '../data/presets';
import { PresetScenario } from '../types/analysis';
import { Sparkles, ArrowRight, Eye, ShieldAlert, FileText, Cpu, Search } from 'lucide-react';
import { AnalysisService } from '../services/api';

interface ExamplePresetsProps {
  onSelectPreset: (scenario: PresetScenario, autoAnalyze?: boolean) => void;
  isLoading: boolean;
}

export const ExamplePresets: React.FC<ExamplePresetsProps> = ({ onSelectPreset, isLoading }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Analyze a Situation':
        return Eye;
      case 'Understand an Object':
        return Cpu;
      case 'Safety Observation':
        return ShieldAlert;
      case 'Understand a Diagram':
        return FileText;
      case 'Explain What I’m Seeing':
      default:
        return Search;
    }
  };

  return (
    <div className="w-full mt-12 pt-8 border-t border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demonstrations</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">
            Explore LifeLens Use Cases
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Select a verified scenario to test LifeLens multimodal situation reasoning across industrial, safety, diagrammatic, and diagnostic challenges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PRESET_SCENARIOS.map((scenario) => {
          const Icon = getCategoryIcon(scenario.category);
          return (
            <div
              key={scenario.id}
              className="group relative bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-3 group-hover:border-slate-700 transition-colors">
                  <img
                    src={scenario.imageSvg}
                    alt={scenario.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                    <Icon className="w-2.5 h-2.5" />
                    <span>{scenario.category}</span>
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                  {scenario.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {scenario.shortDesc}
                </p>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelectPreset(scenario, false)}
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Load
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelectPreset(scenario, true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-semibold border border-cyan-500/30 flex items-center space-x-1 transition-all disabled:opacity-40"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
