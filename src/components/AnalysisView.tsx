import React, { useState } from 'react';
import {
  Eye,
  BrainCircuit,
  Compass,
  AlertTriangle,
  ArrowRightCircle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Info,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { SituationAnalysis, RiskLevel } from '../types/analysis';

interface AnalysisViewProps {
  analysis: SituationAnalysis;
  imageSrc: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, imageSrc }) => {
  const [copied, setCopied] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'comparison' | 'actions'>('pipeline');

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          dot: 'bg-rose-500',
          label: 'Critical Risk',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
          dot: 'bg-orange-500',
          label: 'High Risk',
        };
      case 'moderate':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-500',
          label: 'Moderate Risk',
        };
      case 'low':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Low Risk',
        };
      case 'none':
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
          dot: 'bg-slate-400',
          label: 'No Evident Risk',
        };
    }
  };

  const getConfidenceBadge = (level: string, percentage: number) => {
    let color = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (level === 'Medium') color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    if (level === 'Low') color = 'text-rose-400 border-rose-500/30 bg-rose-500/10';

    return { color, label: `${level} Confidence (${percentage}%)` };
  };

  const riskBadge = getRiskBadge(analysis.possibleRisksOrConcerns.level);
  const confBadge = getConfidenceBadge(analysis.confidence.level, analysis.confidence.percentage);

  const copyAnalysisSummary = () => {
    const textSummary = `
LIFELENS AI - SITUATION ANALYSIS REPORT
Headline: ${analysis.headline}
Confidence: ${analysis.confidence.level} (${analysis.confidence.percentage}%) - ${analysis.confidence.rationale}
Risk Level: ${analysis.possibleRisksOrConcerns.level.toUpperCase()}

1. WHAT I SEE:
- Objects: ${analysis.whatISee.objects.join(', ')}
- People: ${analysis.whatISee.people}
- Text Detected: ${analysis.whatISee.textDetected.join(', ') || 'None detected'}
- Environment: ${analysis.whatISee.environment}
- Verified Details: ${analysis.whatISee.keyVisualDetails.join('; ')}

2. WHAT IS HAPPENING:
${analysis.whatIsHappening.summary}

3. WHY IT MATTERS:
${analysis.whyItMatters.relevanceSummary}
Implications:
${analysis.whyItMatters.implications.map((i) => `* ${i}`).join('\n')}

4. POSSIBLE RISKS OR CONCERNS:
${analysis.possibleRisksOrConcerns.concerns.map((c) => `* [${c.severity.toUpperCase()}] ${c.title}: ${c.detail}`).join('\n')}
Safety Advice: ${analysis.possibleRisksOrConcerns.safetyAdvice}

5. RECOMMENDED ACTION:
Immediate:
${analysis.recommendedAction.immediateSteps.map((s) => `1. ${s}`).join('\n')}
Secondary:
${analysis.recommendedAction.secondarySteps.map((s) => `- ${s}`).join('\n')}
When to seek specialist: ${analysis.recommendedAction.whenToSeekExpert}

6. THINGS TO CHECK:
${analysis.thingsToCheck.map((t) => `[ ] ${t}`).join('\n')}

Disclaimer: ${analysis.disclaimer}
    `.trim();

    navigator.clipboard.writeText(textSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card: Headline, Badges, Quick Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Risk Badge */}
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${riskBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`}></span>
                <span>{riskBadge.label}</span>
              </span>

              {/* Confidence Badge */}
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${confBadge.color}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{confBadge.label}</span>
              </span>

              {/* Sufficiency Badge */}
              {analysis.whatIsHappening.isInformationSufficient ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sufficient Detail</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Limited Perspective</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {analysis.headline}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={copyAnalysisSummary}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-2"
              title="Copy comprehensive text report"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Report Copied!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={() => setIsImageExpanded(!isImageExpanded)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Toggle image preview size"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible/Expandable Image Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <img src={imageSrc} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Active Visual Subject</p>
              <p className="text-[11px] text-slate-400">Context retained for continuous follow-up questions</p>
            </div>
          </div>
          <button
            onClick={() => setIsImageExpanded(!isImageExpanded)}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>{isImageExpanded ? 'Collapse Image' : 'Expand Image'}</span>
            {isImageExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isImageExpanded && (
          <div className="mt-4 p-2 rounded-2xl bg-slate-950 border border-slate-800 flex justify-center">
            <img src={imageSrc} alt="Expanded visual" className="max-h-96 rounded-xl object-contain shadow-lg" />
          </div>
        )}
      </div>

      {/* Grid of the 6 Structured Pipeline Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 1. What I See & 2. What Is Happening (Observation -> Context -> Meaning) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: WHAT I SEE */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>1. What I See</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800/40">
                    Direct Observations
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Visible physical entities verified directly in the pixels without assumptions
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Visible Objects */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Visible Objects & Equipment:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.whatISee.objects.map((obj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-medium"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Text / Markings */}
              {analysis.whatISee.textDetected && analysis.whatISee.textDetected.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Text / Markings / Labels Detected:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.whatISee.textDetected.map((txt, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-mono text-xs"
                      >
                        "{txt}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Verified Details */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Verified Physical Attributes:
                </span>
                <ul className="space-y-1.5">
                  {analysis.whatISee.keyVisualDetails.map((detail, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Environment & People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Environment Setting
                  </span>
                  <p className="text-xs text-slate-300">{analysis.whatISee.environment}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    People & Presence
                  </span>
                  <p className="text-xs text-slate-300">{analysis.whatISee.people}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: WHAT IS HAPPENING */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>2. What Is Happening</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 bg-violet-950 px-2 py-0.5 rounded-full border border-violet-800/40">
                    Situational Synthesis
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Reasoned interpretation of the scenario, strictly paired with visible facts
                </p>
              </div>
            </div>

            {/* Summary narrative */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm leading-relaxed mb-4">
              {analysis.whatIsHappening.summary}
            </div>

            {/* Observation vs Inference Explicit Pairing */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Fact vs. Inference Separation:
              </span>
              <div className="space-y-2.5">
                {analysis.whatIsHappening.directObservationsVsInferences.map((pair, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start space-x-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 shrink-0">
                        DIRECT FACT
                      </span>
                      <span className="text-xs text-slate-300 font-medium">{pair.directObservation}</span>
                    </div>
                    <div className="flex items-start space-x-2 pl-4 border-l border-slate-800">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 shrink-0">
                        INFERRED MEANING
                      </span>
                      <span className="text-xs text-slate-400 italic">{pair.inferredMeaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sufficiency Note */}
            {!analysis.whatIsHappening.isInformationSufficient && analysis.whatIsHappening.insufficientDetailsNote && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Missing Information Note:</span>
                  <span>{analysis.whatIsHappening.insufficientDetailsNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: WHY IT MATTERS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>3. Why It Matters</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800/40">
                    Significance & Impact
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Operational, safety, functional, or structural relevance of this state
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {analysis.whyItMatters.relevanceSummary}
            </p>

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Key Implications If Unaddressed:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.whyItMatters.implications.map((imp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start space-x-2 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 4. Risks & 5. Recommended Actions & 6. Things to Check */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 4: POSSIBLE RISKS OR CONCERNS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>4. Possible Risks & Concerns</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Potential safety hazards, failure modes, or vulnerabilities
                </p>
              </div>
            </div>

            {/* List of Concerns */}
            <div className="space-y-3 mb-4">
              {analysis.possibleRisksOrConcerns.concerns.map((concern, i) => {
                const concernBadge = getRiskBadge(concern.severity);
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{concern.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${concernBadge.bg}`}>
                        {concern.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{concern.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Safety Advice Callout */}
            {analysis.possibleRisksOrConcerns.safetyAdvice && (
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start space-x-2.5">
                <Shield className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-rose-300 block mb-0.5">Safety Priority:</span>
                  <span className="leading-relaxed">{analysis.possibleRisksOrConcerns.safetyAdvice}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: RECOMMENDED ACTION */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ArrowRightCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>5. Recommended Action</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    What to Do Next
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Practical steps to mitigate risks or resolve situation</p>
              </div>
            </div>

            {/* Immediate Next Steps */}
            <div className="mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Immediate Next Steps:</span>
              </span>
              <div className="space-y-2">
                {analysis.recommendedAction.immediateSteps.map((step, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Steps */}
            {analysis.recommendedAction.secondarySteps && analysis.recommendedAction.secondarySteps.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Secondary / Preventive Measures:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysis.recommendedAction.secondarySteps.map((step, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* When to seek professional expert */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
              <span className="font-bold text-slate-300 block mb-1">When to Consult a Qualified Professional:</span>
              <p className="text-slate-400 leading-relaxed">{analysis.recommendedAction.whenToSeekExpert}</p>
            </div>
          </div>

          {/* SECTION 6: THINGS TO CHECK */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>6. Things to Check</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Information or physical checks that would confirm or improve this analysis
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {analysis.thingsToCheck.map((checkItem, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-300"
                >
                  <div className="w-4 h-4 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="leading-relaxed">{checkItem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CONFIDENCE & RATIONALE CARD */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Diagnostic Confidence Metric</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{analysis.confidence.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${analysis.confidence.percentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">{analysis.confidence.rationale}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
