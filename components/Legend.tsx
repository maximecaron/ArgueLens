import React from 'react';
import { TYPE_COLORS } from '../constants';
import { AnnotationType } from '../types';
import { Scale, FileText, Quote, ShieldAlert } from 'lucide-react';

const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="text-sm font-medium text-slate-500 w-full md:w-auto md:mr-4">Key:</div>
      <div className="flex items-center space-x-2">
        <span className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${TYPE_COLORS[AnnotationType.CLAIM].bg} ${TYPE_COLORS[AnnotationType.CLAIM].text}`}>
           <Scale className="w-3 h-3 mr-1" /> Claim
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${TYPE_COLORS[AnnotationType.EVIDENCE].bg} ${TYPE_COLORS[AnnotationType.EVIDENCE].text}`}>
           <FileText className="w-3 h-3 mr-1" /> Evidence
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${TYPE_COLORS[AnnotationType.REASONING].bg} ${TYPE_COLORS[AnnotationType.REASONING].text}`}>
           <Quote className="w-3 h-3 mr-1" /> Reasoning
        </span>
      </div>
       <div className="flex items-center space-x-2">
        <span className={`flex items-center px-2 py-1 rounded text-xs font-semibold ${TYPE_COLORS[AnnotationType.COUNTERARGUMENT].bg} ${TYPE_COLORS[AnnotationType.COUNTERARGUMENT].text}`}>
           <ShieldAlert className="w-3 h-3 mr-1" /> Counterargument
        </span>
      </div>
    </div>
  );
};

export default Legend;