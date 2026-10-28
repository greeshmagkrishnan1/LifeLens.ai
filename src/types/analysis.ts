export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface ObservationVsInference {
  directObservation: string;
  inferredMeaning: string;
}

export interface VisualObservation {
  objects: string[];
  people: string;
  textDetected: string[];
  environment: string;
  keyVisualDetails: string[];
}

export interface WhatIsHappening {
  summary: string;
  directObservationsVsInferences: ObservationVsInference[];
  isInformationSufficient: boolean;
  insufficientDetailsNote?: string;
}

export interface WhyItMatters {
  relevanceSummary: string;
  implications: string[];
}

export interface PotentialConcern {
  title: string;
  detail: string;
  severity: RiskLevel;
}

export interface PossibleRisksOrConcerns {
  level: RiskLevel;
  concerns: PotentialConcern[];
  safetyAdvice?: string;
}

export interface RecommendedAction {
  immediateSteps: string[];
  secondarySteps: string[];
  whenToSeekExpert: string;
}

export interface ConfidenceMetric {
  level: ConfidenceLevel;
  percentage: number;
  rationale: string;
}

export interface SituationAnalysis {
  id: string;
  timestamp: number;
  headline: string;
  whatISee: VisualObservation;
  whatIsHappening: WhatIsHappening;
  whyItMatters: WhyItMatters;
  possibleRisksOrConcerns: PossibleRisksOrConcerns;
  recommendedAction: RecommendedAction;
  confidence: ConfidenceMetric;
  thingsToCheck: string[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface PresetScenario {
  id: string;
  category: string;
  title: string;
  shortDesc: string;
  promptHint?: string;
  imageSvg: string; // Base64 or SVG data URI
  suggestedQuestions: string[];
}
