import React, { useState, useCallback } from 'react';
import { analyzeText } from './services/geminiService';
import { AnalysisResult, AnnotationType } from './types';
import TextHighlighter from './components/TextHighlighter';
import Legend from './components/Legend';
import { SAMPLE_TEXT } from './constants';
import { BookOpen, Sparkles, AlertCircle, RotateCcw, PencilLine } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'input' | 'analysis'>('input');

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeText(inputText);
      setResult(data);
      setViewMode('analysis');
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze text. Please check your API key, internet connection, or try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText]);

  const handleReset = () => {
    setViewMode('input');
    setResult(null);
  };

  // Calculate stats
  const stats = result ? {
    claims: result.annotations.filter(a => a.type === AnnotationType.CLAIM).length,
    evidence: result.annotations.filter(a => a.type === AnnotationType.EVIDENCE).length,
    reasoning: result.annotations.filter(a => a.type === AnnotationType.REASONING).length,
    counterarguments: result.annotations.filter(a => a.type === AnnotationType.COUNTERARGUMENT).length,
  } : { claims: 0, evidence: 0, reasoning: 0, counterarguments: 0 };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl w-full mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start space-x-3 mb-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
             <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ArgueLens</h1>
        </div>
        <p className="text-slate-500 mt-2 max-w-2xl">
          Deconstruct arguments instantly. Paste your text below to identify core claims, supporting evidence, and logical reasoning using advanced AI.
        </p>
      </header>

      <main className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Input Mode */}
        {viewMode === 'input' && (
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-4">
              <label htmlFor="input-text" className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Argumentative Text
              </label>
              <button 
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
              >
                Load Sample
              </button>
            </div>
            
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-80 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-serif text-lg leading-relaxed shadow-inner"
              placeholder="Paste an article, essay, or speech here..."
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 animate-pulse">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className={`
                  flex items-center px-6 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all
                  ${isAnalyzing || !inputText.trim() 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:shadow-indigo-500/30 active:scale-95'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Text
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Analysis Mode */}
        {viewMode === 'analysis' && result && (
          <div className="flex flex-col h-full">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium text-xs uppercase">Claims</span>
                  <span className="text-xl font-bold text-blue-700">{stats.claims}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium text-xs uppercase">Evidence</span>
                  <span className="text-xl font-bold text-emerald-700">{stats.evidence}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium text-xs uppercase">Reasoning</span>
                  <span className="text-xl font-bold text-amber-700">{stats.reasoning}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium text-xs uppercase">Counters</span>
                  <span className="text-xl font-bold text-rose-700">{stats.counterarguments}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                 <button
                  onClick={() => setViewMode('input')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <PencilLine className="w-4 h-4 mr-2" />
                  Edit Text
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Analysis
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-white min-h-[500px]">
              <TextHighlighter text={inputText} annotations={result.annotations} />
              <Legend />
            </div>
          </div>
        )}

      </main>

      <footer className="mt-8 text-slate-400 text-sm">
        <p>Powered by Gemini 3 Flash Preview</p>
      </footer>
    </div>
  );
}

export default App;