import React, { useMemo, useState, useRef } from 'react';
import { Annotation, TextSegment, AnnotationType } from '../types';
import { TYPE_COLORS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Quote, Scale, FileText, AlertTriangle, CheckCircle, XCircle, ShieldAlert, ChevronDown, ChevronRight, AlertOctagon } from 'lucide-react';

interface TextHighlighterProps {
  text: string;
  annotations: Annotation[];
}

// Accordion Component
const Accordion = ({ 
  title, 
  children, 
  icon,
  defaultOpen = true,
  count
}: { 
  title: React.ReactNode, 
  children?: React.ReactNode, 
  icon?: React.ReactNode,
  defaultOpen?: boolean,
  count?: number
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="mb-2 border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
           {icon}
           <span>{title}</span>
           {count !== undefined && (
             <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] min-w-[1.25rem] text-center">
               {count}
             </span>
           )}
        </div>
        {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-2 border-t border-slate-100 text-xs">
          {children}
        </div>
      )}
    </div>
  );
};

const TextHighlighter: React.FC<TextHighlighterProps> = ({ text, annotations }) => {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const segments: TextSegment[] = useMemo(() => {
    if (!annotations || annotations.length === 0) {
      return [{ text, isHighlighted: false }];
    }

    // 1. Map annotations to their start/end indices in the text
    const matches = annotations
      .map((ann) => {
        const startIndex = text.indexOf(ann.quote);
        if (startIndex === -1) return null; // hallucinations or exact match fail
        return {
          start: startIndex,
          end: startIndex + ann.quote.length,
          annotation: ann,
        };
      })
      .filter((m): m is { start: number; end: number; annotation: Annotation } => m !== null)
      .sort((a, b) => a.start - b.start);

    // 2. Resolve overlaps (First come, first served)
    const filteredMatches: typeof matches = [];
    let lastEnd = 0;
    
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    // 3. Construct segments
    const result: TextSegment[] = [];
    let currentIndex = 0;

    filteredMatches.forEach((match) => {
      // Text before the match
      if (match.start > currentIndex) {
        result.push({
          text: text.slice(currentIndex, match.start),
          isHighlighted: false,
        });
      }
      // The matched text
      result.push({
        text: text.slice(match.start, match.end),
        isHighlighted: true,
        annotation: match.annotation,
      });
      currentIndex = match.end;
    });

    // Remaining text
    if (currentIndex < text.length) {
      result.push({
        text: text.slice(currentIndex),
        isHighlighted: false,
      });
    }

    return result;
  }, [text, annotations]);

  const handleMouseEnter = (e: React.MouseEvent, annotation: Annotation) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredAnnotation(annotation);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAnnotation(null);
    }, 300);
  };

  const handleTooltipEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAnnotation(null);
    }, 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Claim': return <Scale className="w-4 h-4 mr-1" />;
      case 'Evidence': return <FileText className="w-4 h-4 mr-1" />;
      case 'Reasoning': return <Quote className="w-4 h-4 mr-1" />;
      case 'Counterargument': return <ShieldAlert className="w-4 h-4 mr-1" />;
      default: return <Info className="w-4 h-4 mr-1" />;
    }
  };

  const renderTable = (headers: string[], rows: (string | React.ReactNode)[][]) => {
    if (rows.length === 0) return null;
    return (
      <div className="overflow-x-auto my-1 border border-slate-200 rounded">
        <table className="min-w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              {headers.map((h, i) => <th key={i} className="px-2 py-1 whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j} className="px-2 py-1 text-slate-700 whitespace-pre-wrap align-top">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="relative leading-loose text-lg text-slate-800 reading-text">
      {segments.map((segment, index) => {
        if (!segment.isHighlighted || !segment.annotation) {
          return <span key={index}>{segment.text}</span>;
        }

        const { type } = segment.annotation;
        const styles = TYPE_COLORS[type];

        return (
          <span
            key={index}
            className={`cursor-pointer transition-colors duration-200 rounded px-1 -mx-1 ${styles.highlight}`}
            onMouseEnter={(e) => handleMouseEnter(e, segment.annotation!)}
            onMouseLeave={handleMouseLeave}
          >
            {segment.text}
          </span>
        );
      })}

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredAnnotation && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 50,
            }}
            className="w-96 max-w-[90vw] pointer-events-auto"
            onMouseEnter={handleTooltipEnter}
            onMouseLeave={handleTooltipLeave}
          >
            <div 
              className={`shadow-2xl rounded-lg bg-white border border-slate-200 relative overflow-hidden flex flex-col`}
              key={hoveredAnnotation.id}
            >
              {/* Header */}
              <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${TYPE_COLORS[hoveredAnnotation.type].bg}`}>
                <div className={`flex items-center text-xs font-bold uppercase tracking-wider ${TYPE_COLORS[hoveredAnnotation.type].text}`}>
                  {getIcon(hoveredAnnotation.type)}
                  {TYPE_COLORS[hoveredAnnotation.type].label} <span className="ml-2 opacity-60">#{hoveredAnnotation.id}</span>
                </div>
                {hoveredAnnotation.is_logically_valid !== undefined && (
                  <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${hoveredAnnotation.is_logically_valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {hoveredAnnotation.is_logically_valid ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {hoveredAnnotation.is_logically_valid ? 'Valid' : 'Invalid'}
                  </div>
                )}
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Explanation */}
                <p className="text-sm text-slate-700 mb-4 italic leading-relaxed">
                  {hoveredAnnotation.explanation}
                </p>

                {/* Evidence Details */}
                {hoveredAnnotation.type === AnnotationType.EVIDENCE && (
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">Type</span>
                      <span className="capitalize text-slate-800 font-medium">{hoveredAnnotation.evidence_type?.replace(/_/g, ' ') || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="block text-slate-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">Credibility</span>
                      <span className={`capitalize font-bold ${
                        hoveredAnnotation.source_credibility === 'high' ? 'text-green-600' :
                        hoveredAnnotation.source_credibility === 'medium' ? 'text-yellow-600' :
                        hoveredAnnotation.source_credibility === 'low' ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {hoveredAnnotation.source_credibility || 'Unknown'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Invalid Logic Explanation */}
                {hoveredAnnotation.is_logically_valid === false && hoveredAnnotation.invalid_logic_explanation && (
                  <div className="mb-4 bg-red-50 p-3 rounded-md border border-red-200 text-xs">
                    <div className="flex items-center font-bold text-red-800 mb-1">
                      <AlertOctagon className="w-3.5 h-3.5 mr-1.5" />
                      Logic Flaw Detected
                    </div>
                    <p className="text-red-700 leading-relaxed">
                      {hoveredAnnotation.invalid_logic_explanation}
                    </p>
                  </div>
                )}

                {/* Accordions */}
                <div className="space-y-1">
                  
                  {/* Supported Claims */}
                  {hoveredAnnotation.supported_claim_ids && hoveredAnnotation.supported_claim_ids.length > 0 && (
                    <Accordion 
                      title="Supported Claims" 
                      count={hoveredAnnotation.supported_claim_ids.length}
                      icon={<Scale className="w-3.5 h-3.5 text-blue-500" />}
                    >
                       {renderTable(['Claim ID'], hoveredAnnotation.supported_claim_ids.map(id => [id]))}
                    </Accordion>
                  )}

                  {/* Supported Evidence */}
                  {hoveredAnnotation.supported_evidence_ids && hoveredAnnotation.supported_evidence_ids.length > 0 && (
                    <Accordion 
                      title="Supported Evidence"
                      count={hoveredAnnotation.supported_evidence_ids.length}
                      icon={<FileText className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      {renderTable(['Evidence ID'], hoveredAnnotation.supported_evidence_ids.map(id => [id]))}
                    </Accordion>
                  )}

                  {/* Bias Indicators */}
                  {hoveredAnnotation.bias_indicators && hoveredAnnotation.bias_indicators.length > 0 && (
                     <Accordion 
                       title="Bias Indicators"
                       count={hoveredAnnotation.bias_indicators.length}
                       icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                     >
                        {renderTable(
                          ['ID', 'Type', 'Indicator', 'Sev'],
                          hoveredAnnotation.bias_indicators.map(b => [
                            b.id,
                            b.type.replace(/_/g, ' '),
                            b.text,
                            <span key="sev" className={`${b.severity === 'high' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{b.severity}</span>
                          ])
                        )}
                     </Accordion>
                  )}

                  {/* Logical Fallacies */}
                  {hoveredAnnotation.logical_fallacies && hoveredAnnotation.logical_fallacies.length > 0 && (
                    <Accordion 
                      title="Logical Fallacies"
                      count={hoveredAnnotation.logical_fallacies.length}
                      icon={<ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                    >
                       {renderTable(
                          ['ID', 'Type', 'Fallacy', 'Sev'],
                          hoveredAnnotation.logical_fallacies.map(f => [
                            f.id,
                            f.fallacy_type.replace(/_/g, ' '),
                            f.text,
                            <span key="sev" className={`${f.severity === 'high' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{f.severity}</span>
                          ])
                        )}
                    </Accordion>
                  )}
                </div>

              </div>
              
              {/* Arrow */}
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45 transform"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TextHighlighter;