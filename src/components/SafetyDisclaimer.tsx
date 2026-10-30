import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <footer className="w-full mt-16 pt-8 pb-12 border-t border-slate-800/80 text-center text-xs text-slate-500">
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-center space-x-2 text-slate-400 font-semibold text-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          <span>LifeLens AI Operational Safety Notice</span>
        </div>

        <p className="leading-relaxed text-[11px] text-slate-500 max-w-3xl mx-auto">
          LifeLens AI is an automated situational intelligence and visual transformation prototype. It does not provide certified medical, legal, structural engineering, architectural, or emergency services advice. For visual transformations, always verify physical feasibility, furniture weight limits, and electrical cable safety before moving heavy items.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
          <span>LifeLens AI V2.0</span>
          <span>•</span>
          <span>Analyze & Vision → Transform</span>
          <span>•</span>
          <span>“See it. Understand it. Act on it.”</span>
        </div>
      </div>
    </footer>
  );
};
