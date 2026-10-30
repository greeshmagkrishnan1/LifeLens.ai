export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type AppMode = 'analyze' | 'transform';

// --- V1 Situation Analysis Types ---

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

// --- V2 Vision → Transform Types ---

export type ObjectTransformAction = 'kept' | 'repositioned' | 'decluttered' | 'realigned' | 'enhanced' | 'grouped';

export interface SpatialObject {
  name: string;
  originalPosition: string;
  proposedPosition: string;
  action: ObjectTransformAction;
  reason: string;
}

export interface TransformationPlan {
  environmentType: string;
  detectedObjects: string[];
  spatialRelationships: string;
  preservedElements: string[];
  rearrangedObjects: SpatialObject[];
  safetyAndRealismNotes?: string;
}

export interface TransformationResult {
  id: string;
  timestamp: number;
  userRequest: string;
  version?: number;
  variationDirection?: string;
  plan: TransformationPlan;
  whatChanged: string[];
  why: string;
  transformedImage: string; // Base64 or SVG data URI
  renderMethod?: 'ai-generated' | 'visual-synthesis';
  safetyNotice?: string;
  preservedElements: string[];
  suggestedFollowUps?: string[];
  disclaimer: string;
}

export interface TransformPreset {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  userRequest: string;
  imageSvg: string;
  suggestedRefinements: string[];
}
