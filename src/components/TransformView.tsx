import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { TransformationResult } from '../types/analysis';
import { ImageComparison } from './ImageComparison';

interface TransformViewProps {
  originalImage: string;
  transformationResult: TransformationResult | null;
  isLoading: boolean;
  onTransform: (userRequest: string, isRefinement?: boolean, isNextVersion?: boolean) => void;
  onReset: () => void;
  loadingPhase?: string;
}

const SUGGESTED_TRANSFORMATIONS = [
  'Rearrange the objects to make it cleaner and more balanced',
  'Make the room look cleaner and more organized',
  'Organize the desk with clean cable management',
  'Improve the decoration and aesthetic balance',
  'Make the bookshelf more organized with breathing room',
  'Create a minimalist arrangement with maximum negative space',
  'Improve the layout for better ergonomics and flow',
  'Remove visual clutter and unnecessary items',
  'Make the space look more spacious and open',
];

export const TransformView: React.FC<TransformViewProps> = ({
  originalImage,
  transformationResult,
  isLoading,
  onTransform,
  onReset,
}) => {
  const [userRequestInput, setUserRequestInput] = useState<string>('');
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [showPlanDetails, setShowPlanDetails] = useState<boolean>(false);

  const handleSubmitInitial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userRequestInput.trim() || isLoading) return;
    onTransform(userRequestInput.trim(), false, false);
  };

  const handleSelectChip = (chip: string) => {
    setUserRequestInput(chip);
    onTransform(chip, false, false);
  };

  const handleTryAnotherVersion = () => {
    if (!transformationResult || isLoading) return;
    // Always trigger a fresh generation request using original image reference and isNextVersion = true
    onTransform(transformationResult.userRequest, false, true);
  };

  const handleSubmitRefinement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    onTransform(refinementInput.trim(), true);
    setRefinementInput('');
  };

  const handleRefineChip = (chip: string) => {
    setRefinementInput(chip);
    onTransform(chip, true);
  };

  return (
    <div className="w-full space-y-8">
      {/* If No Transformation Result Yet: Input & Prompt Area */}
      {!transformationResult && !isLoading && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Preview on Left */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-80 flex items-center justify-center p-2 shadow-inner">
              <img
                src={originalImage}
                alt="Scene to transform"
                className="w-full h-auto max-h-72 object-contain rounded-xl"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-violet-300 border border-violet-500/30 flex items-center space-x-1">
                <Wand2 className="w-3 h-3 text-violet-400" />
                <span>Target Subject</span>
              </div>
            </div>

            {/* Request Form on Right */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-violet-400 text-xs font-semibold tracking-wide uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>V2 Vision → Transform</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  What would you like LifeLens to change?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  LifeLens will identify visible objects, plan spatial rearrangements, preserve key structural walls/furniture, and generate a proposed visual result.
                </p>
              </div>

              {/* Text Input */}
              <form onSubmit={handleSubmitInitial} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={userRequestInput}
                    onChange={(e) => setUserRequestInput(e.target.value)}
                    placeholder="e.g. Rearrange decorations to make it cleaner and more balanced..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-100 text-sm placeholder:text-slate-500 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || !userRequestInput.trim()}
                    className="flex-1 min-w-[200px] px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Plan & Generate Transformation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onReset}
                    className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </form>

              {/* Suggested Transformation Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Transformation Prompts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TRANSFORMATIONS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectChip(chip)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 hover:border-violet-500/40 transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Experience during transformation */}
      {isLoading && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center">
              <Wand2 className="w-10 h-10 text-violet-400 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-violet-400/10 blur-lg animate-ping"></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Generating Proposed Transformation...
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyzing visible objects, modeling spatial arrangement, and rendering your proposed visual outcome.
              </p>
            </div>

            {/* Stepper animation */}
            <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs text-violet-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span>1. Identifying objects and spatial anchoring</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-violet-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span>2. Formulating balanced transformation plan</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-violet-300 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>3. Generating proposed visual representation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* When Transformation Result is Ready: Before / After + Explanation */}
      {transformationResult && !isLoading && (
        <div className="space-y-8">
          {/* Header Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-violet-500/40 bg-violet-500/10 text-violet-300 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>Vision → Transform V2</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-600/25 text-violet-200 border border-violet-500/40 flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-fuchsia-400" />
                    <span>Version {transformationResult.version || 1}</span>
                  </span>
                  {transformationResult.variationDirection && (
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
                      {transformationResult.variationDirection}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {transformationResult.plan.environmentType}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  "{transformationResult.userRequest}"
                </h2>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleTryAnotherVersion}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-violet-500/50 transition-all flex items-center space-x-2 cursor-pointer group shadow-sm active:scale-95 disabled:opacity-50"
                  title="Generate another version using the original scene as reference"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Try Another Version</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    v{(transformationResult.version || 1) + 1}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start New Transformation</span>
                </button>
              </div>
            </div>

            {/* Before / After Visual Comparison */}
            <div className="mt-6">
              <ImageComparison
                beforeImage={originalImage}
                afterImage={transformationResult.transformedImage}
                beforeLabel="ORIGINAL SCENE"
                afterLabel={
                  transformationResult.version && transformationResult.version > 1
                    ? `PROPOSED TRANSFORMATION (VERSION ${transformationResult.version})`
                    : 'PROPOSED TRANSFORMATION'
                }
              />
            </div>
          </div>

          {/* Explanation Section: What Changed? and Why? */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* What Changed? (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">What Changed?</h3>
                  <p className="text-xs text-slate-400">
                    Specific rearrangements, decluttering, and alignments executed in the proposal
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {transformationResult.whatChanged.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3 text-xs sm:text-sm text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-violet-400 mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {/* Preserved Elements */}
              {transformationResult.preservedElements && transformationResult.preservedElements.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Preserved Structural Elements:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {transformationResult.preservedElements.map((el, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs"
                      >
                        ✓ {el}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Why It Matters / Rationale (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Why Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Why?</h3>
                    <p className="text-xs text-slate-400">Design rationale and spatial benefits</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {transformationResult.why}
                </div>
              </div>

              {/* Safety & Realism Note */}
              {transformationResult.safetyNotice && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">Physical Safety Check:</span>
                    <span className="leading-relaxed">{transformationResult.safetyNotice}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transformation Plan: Object-by-Object Spatial Mapping (Collapsible) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setShowPlanDetails(!showPlanDetails)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Detailed Transformation Plan & Spatial Map</span>
                    <span className="text-[11px] font-semibold text-slate-400 font-normal">
                      ({transformationResult.plan.rearrangedObjects.length} objects)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    See original vs. proposed placement for each identified object
                  </p>
                </div>
              </div>

              <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1">
                <span>{showPlanDetails ? 'Hide Plan' : 'View Plan'}</span>
                {showPlanDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showPlanDetails && (
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {transformationResult.plan.rearrangedObjects.map((obj, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{obj.name}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-violet-950 text-violet-300 border border-violet-800/50">
                          {obj.action}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-400">
                        <p>
                          <span className="text-slate-500">Original:</span> {obj.originalPosition}
                        </p>
                        <p>
                          <span className="text-violet-400">Proposed:</span> {obj.proposedPosition}
                        </p>
                        <p className="italic text-slate-400 pt-0.5 border-t border-slate-800/60">
                          "{obj.reason}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Control / Iterative Refinement Area */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Refine This Transformation</h3>
                <p className="text-xs text-slate-400">
                  Instruct LifeLens to adjust the current transformation (e.g. "Make it more minimal", "Keep the flowers where they are")
                </p>
              </div>
            </div>

            {/* Suggested Refinements Chips */}
            {transformationResult.suggestedFollowUps && transformationResult.suggestedFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {transformationResult.suggestedFollowUps.map((refineChip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRefineChip(refineChip)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 hover:border-violet-500/40 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span>{refineChip}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Refinement input */}
            <form onSubmit={handleSubmitRefinement} className="flex gap-2">
              <input
                type="text"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="e.g. Keep the flowers where they are but rearrange everything else..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors"
              />

              <button
                type="submit"
                disabled={isLoading || !refinementInput.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-violet-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-40"
              >
                <span>Update</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
