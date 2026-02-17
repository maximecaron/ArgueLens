import { AnnotationType } from './types';

export const TYPE_COLORS = {
  [AnnotationType.CLAIM]: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-900',
    highlight: 'bg-blue-200/50 border-b-2 border-blue-400',
    icon: 'text-blue-600',
    label: 'Main Claim',
  },
  [AnnotationType.EVIDENCE]: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-900',
    highlight: 'bg-emerald-200/50 border-b-2 border-emerald-400',
    icon: 'text-emerald-600',
    label: 'Supporting Evidence',
  },
  [AnnotationType.REASONING]: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-900',
    highlight: 'bg-amber-200/50 border-b-2 border-amber-400',
    icon: 'text-amber-600',
    label: 'Reasoning / Logic',
  },
  [AnnotationType.COUNTERARGUMENT]: {
    bg: 'bg-rose-100',
    border: 'border-rose-400',
    text: 'text-rose-900',
    highlight: 'bg-rose-200/50 border-b-2 border-rose-400',
    icon: 'text-rose-600',
    label: 'Counterargument',
  },
};

export const SAMPLE_TEXT = `Electric cars are not the "silver bullet" for climate change that many claim them to be. While it is true that they produce zero tailpipe emissions, the production of their batteries is an incredibly energy-intensive process. A 2021 study by the International Energy Agency found that manufacturing an electric vehicle releases significantly more greenhouse gases than building a conventional car. Therefore, unless the electricity grid powering these factories and charging these cars is decarbonized, the net environmental benefit remains marginal at best. We must focus on a holistic approach to transportation that includes better public transit, rather than solely relying on replacing one type of personal vehicle with another.`;
