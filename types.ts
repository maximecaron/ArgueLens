export enum AnnotationType {
  CLAIM = 'Claim',
  EVIDENCE = 'Evidence',
  REASONING = 'Reasoning',
  COUNTERARGUMENT = 'Counterargument',
}

export interface BiasIndicator {
  id: string;
  type: 'emotionally_charged_language' | 'one_sidedness' | 'omission' | 'cherry_picking' | 'lack_of_sources' | 'other';
  text: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LogicalFallacy {
  id: string;
  fallacy_type: 'ad_hominem' | 'straw_man' | 'slippery_slope' | 'red_herring' | 'false_cause' | 'overgeneralization' | 'other';
  text: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Annotation {
  id: string;
  quote: string;
  type: AnnotationType;
  explanation: string;
  
  // Evidence Specific
  evidence_type?: 'fact' | 'statistic' | 'example' | 'expert_testimony' | 'anecdote' | 'other';
  source_credibility?: 'high' | 'medium' | 'low' | 'unknown';

  // Analysis Data
  supported_claim_ids?: string[];
  supported_evidence_ids?: string[];
  is_logically_valid?: boolean;
  invalid_logic_explanation?: string;
  bias_indicators?: BiasIndicator[];
  logical_fallacies?: LogicalFallacy[];
}

export interface AnalysisResult {
  annotations: Annotation[];
}

export interface TextSegment {
  text: string;
  isHighlighted: boolean;
  annotation?: Annotation;
}