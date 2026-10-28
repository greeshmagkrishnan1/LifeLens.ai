import React from 'react';
import { Sparkles, Sun, Moon, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  hasAnalysis: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onReset,
  hasAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-slate-950/85 border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          {/* Stylized Optical Lens Logo */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 group">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              {/* Concentric lens rings */}
              <div className="absolute inset-1 rounded-full border border-indigo-400/40 group-hover:scale-105 transition-transform duration-300"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-300/80"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-400/60 rounded-full blur-xs"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                LifeLens
              </span>
              <span className="text-[11px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500 to-indigo-600 text-white uppercase shadow-xs">
                AI V1
              </span>
            </div>
            <p className="text-xs text-cyan-400/90 font-medium tracking-wide">
              See it. Understand it. Act on it.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multimodal Situation Intelligence</span>
          </div>

          {hasAnalysis && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 hover:border-slate-600"
              title="Start a new analysis"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Analysis</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
