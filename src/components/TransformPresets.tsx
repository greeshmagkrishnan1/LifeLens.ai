import React from 'react';
import { TRANSFORM_PRESETS } from '../data/presets';
import { TransformPreset } from '../types/analysis';
import { Wand2, ArrowRight, Layout, Sparkles } from 'lucide-react';

interface TransformPresetsProps {
  onSelectPreset: (preset: TransformPreset, autoTransform?: boolean) => void;
  isLoading: boolean;
}

export const TransformPresets: React.FC<TransformPresetsProps> = ({
  onSelectPreset,
  isLoading,
}) => {
  return (
    <div className="w-full mt-12 pt-8 border-t border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>V2 Vision → Transform Demos</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">
            Explore Visual Transformation Scenarios
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Test how LifeLens reorganizes spaces, reduces visual clutter, and plans aesthetic arrangements with these verified real-world scenarios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRANSFORM_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="group relative bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-violet-500/50 rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-0.5"
          >
            <div>
              {/* Thumbnail */}
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-3 group-hover:border-slate-700 transition-colors">
                <img
                  src={preset.imageSvg}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-violet-300 border border-violet-500/30 flex items-center space-x-1">
                  <Layout className="w-2.5 h-2.5" />
                  <span>{preset.category}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1 mb-1">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {preset.shortDesc}
              </p>

              {/* Default transformation request */}
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3">
                <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wide block mb-0.5">
                  Proposed Transformation:
                </span>
                <p className="text-[11px] text-slate-300 italic line-clamp-2">
                  "{preset.userRequest}"
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(preset, false)}
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Load Image
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onSelectPreset(preset, true)}
                className="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200 text-xs font-semibold border border-violet-500/30 flex items-center space-x-1 transition-all disabled:opacity-40"
              >
                <Wand2 className="w-3 h-3 text-violet-400" />
                <span>Transform</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
