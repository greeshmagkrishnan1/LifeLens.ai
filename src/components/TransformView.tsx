import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  HelpCircle,
  Eye,
  Sliders,
  Send,
  SlidersHorizontal,
  History,
  Boxes,
  Camera,
} from 'lucide-react';
import { TransformationResult } from '../types/analysis';
import { ImageComparison } from './ImageComparison';
import { AnalysisService } from '../services/api';

interface TransformViewProps {
  originalImage: string;
  transformationResult: TransformationResult | null;
  history?: TransformationResult[];
  activeVersionIndex?: number;
  onSelectVersion?: (index: number) => void;
  isLoading: boolean;
  onTransform: (userRequest: string, isRefinement?: boolean, isNextVersion?: boolean) => void;
  onReset: () => void;
  loadingPhase?: string;
}

export const TransformView: React.FC<TransformViewProps> = ({
  originalImage,
  transformationResult,
  history = [],
  activeVersionIndex = 0,
  onSelectVersion,
  isLoading,
  onTransform,
  onReset,
}) => {
  const [userRequestInput, setUserRequestInput] = useState<string>('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [detectedEnvironment, setDetectedEnvironment] = useState<string>('');
  const lastFetchedImageRef = useRef<string | null>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);

  // Dynamically analyze uploaded scene and fetch 5-7 customized transformation suggestions
  useEffect(() => {
    let isMounted = true;
    if (!originalImage) return;

    if (lastFetchedImageRef.current === originalImage) return;
    lastFetchedImageRef.current = originalImage;

    const fetchSuggestions = async () => {
      setIsSuggestionsLoading(true);
      try {
        const res = await AnalysisService.getTransformSuggestions({
          imageBase64: originalImage,
        });
        if (isMounted && res.suggestions && res.suggestions.length > 0) {
          setDynamicSuggestions(res.suggestions);
          setDetectedEnvironment(res.environmentType || '');
        }
      } catch (err) {
        console.warn('Failed to load scene-aware suggestions, falling back:', err);
        if (isMounted) {
          setDynamicSuggestions([
            'Rearrange the objects to make it cleaner and more balanced',
            'Improve the decoration and aesthetic balance',
            'Create a minimalist arrangement with maximum negative space',
            'Remove visual clutter and organize essentials',
            'Make the space look more spacious and open',
          ]);
        }
      } finally {
        if (isMounted) {
          setIsSuggestionsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [originalImage]);


  const scrollHistory = (direction: 'left' | 'right') => {
    if (historyScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      historyScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
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

              {/* Scene-Aware Dynamic Transformation Suggestions */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>Scene-Aware Suggestions</span>
                    {detectedEnvironment && (
                      <span className="text-[10px] normal-case font-medium px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/50">
                        {detectedEnvironment}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    Click to transform immediately
                  </span>
                </div>

                {isSuggestionsLoading ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-violet-300">
                      <Sparkles className="w-3 h-3 text-violet-400 animate-spin" />
                      <span>Analyzing scene to generate customized transformation prompts...</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[130, 170, 140, 190, 150].map((width, idx) => (
                        <div
                          key={idx}
                          className="h-8 rounded-xl bg-slate-800/70 border border-slate-700/60 animate-pulse"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicSuggestions.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectChip(chip)}
                        disabled={isLoading}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-violet-950/70 text-slate-200 hover:text-white text-xs border border-slate-700/70 hover:border-violet-500/50 transition-all text-left flex items-center space-x-1.5 cursor-pointer group active:scale-95 disabled:opacity-50"
                      >
                        <Wand2 className="w-3 h-3 text-violet-400 group-hover:text-violet-300 shrink-0" />
                        <span>{chip}</span>
                      </button>
                    ))}
                  </div>
                )}
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

            {/* Transformation Version History Carousel */}
            {history && history.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Transformation History</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                          {history.length} {history.length === 1 ? 'version' : 'versions'}
                        </span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 hidden sm:inline mr-2">
                      Click any version to view without regenerating
                    </span>
                    {history.length > 3 && (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => scrollHistory('left')}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          title="Scroll left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollHistory('right')}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                          title="Scroll right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal scrollable version cards */}
                <div className="relative">
                  <div
                    ref={historyScrollRef}
                    className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent scroll-smooth focus:outline-none"
                  >
                    {history.map((ver, idx) => {
                      const isSelected = activeVersionIndex === idx;
                      const verNumber = ver.version || idx + 1;

                      return (
                        <button
                          key={ver.id || `v-${idx}`}
                          type="button"
                          onClick={() => onSelectVersion && onSelectVersion(idx)}
                          className={`shrink-0 w-36 sm:w-44 p-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10'
                              : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black mb-2 border border-slate-800/80">
                            <img
                              src={ver.transformedImage}
                              alt={`Version ${verNumber}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-slate-700 flex items-center space-x-1">
                              <span>V{verNumber}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-violet-600 text-[9px] font-extrabold text-white flex items-center space-x-0.5 shadow-sm">
                                <Check className="w-2.5 h-2.5" />
                                <span>ACTIVE</span>
                              </div>
                            )}
                          </div>

                          {/* Version Metadata */}
                          <div className="space-y-0.5 px-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-violet-300' : 'text-slate-200'}`}>
                                Version {verNumber}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1">
                              {ver.variationDirection || ver.plan?.environmentType || 'Variation'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scene Intelligence & Classified Elements */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Scene Intelligence & Classified Elements</h3>
                  <p className="text-xs text-slate-400">
                    How LifeLens understood "{transformationResult.plan.mainSubject || transformationResult.plan.environmentType}"
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {transformationResult.plan.environmentType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Important Elements (Preserved) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Important Elements</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Defines scene structure and identity; preserved faithfully:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(transformationResult.plan.importantElements || transformationResult.preservedElements).map((el, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-medium">
                      ✓ {el}
                    </span>
                  ))}
                </div>
              </div>

              {/* Transformable Elements */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Transformable Elements</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Rearranged, cleaned, styled, and aligned per user request:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(transformationResult.plan.transformableElements || transformationResult.plan.detectedObjects.slice(0, 4)).map((el, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-violet-950/40 border border-violet-800/50 text-violet-300 text-xs font-medium">
                      ⇄ {el}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Elements */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Perspective & Balance</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {transformationResult.plan.perspectiveAndLighting || 'Camera viewpoint, wall proportions, and surface tones preserved.'}
                </p>
                <div className="pt-1 text-[11px] text-slate-300">
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block">Optional / Clutter:</span>
                  <p className="italic text-slate-400 mt-0.5">
                    {transformationResult.plan.optionalElements?.join(', ') || 'Loose accessories, cables, and unneeded clutter neatly organized.'}
                  </p>
                </div>
              </div>
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
