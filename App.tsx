
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ScoreGauge } from './components/ScoreGauge';
import { compareVehicles } from './services/geminiService';
import { ComparisonResult } from './types';

const App: React.FC = () => {
  const [model1, setModel1] = useState('');
  const [model2, setModel2] = useState('');
  const [csvContent, setCsvContent] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleCompare = async () => {
    if (!model1.trim() || !model2.trim()) {
      setError('Please provide names for both models.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const comparisonResult = await compareVehicles(model1, model2, csvContent);
      setResult(comparisonResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setModel1('');
    setModel2('');
    setCsvContent(undefined);
    setError(null);
  };

  // Helper to parse sections from Gemini's response with more robust regex
  const sections = useMemo(() => {
    if (!result?.analysis) return {};
    
    const parsed: Record<string, string[]> = {};
    let currentSection = 'GENERAL';
    
    result.analysis.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Robust check for headers: matches "1. KEY_SIMILARITIES:", "**KEY_SIMILARITIES**:", "### KEY_SIMILARITIES", etc.
      const headerRegex = /(SCORE_RATIONALE|KEY_SIMILARITIES|KEY_DIFFERENCES|TECH_SPECS|QUALITATIVE_EDGE)/i;
      const match = trimmedLine.match(headerRegex);
      
      // We check if the line looks like a header (short, contains the keyword, usually followed by colon or ends there)
      const isHeader = match && (trimmedLine.includes(':') || trimmedLine.length < 40);

      if (isHeader && match) {
        currentSection = match[1].toUpperCase();
        const contentAfterLabel = trimmedLine.split(/[:#*]/).pop()?.trim();
        // If there's content on the same line as the label, add it
        parsed[currentSection] = (contentAfterLabel && contentAfterLabel.toUpperCase() !== currentSection) 
          ? [contentAfterLabel] 
          : [];
      } else {
        if (!parsed[currentSection]) parsed[currentSection] = [];
        parsed[currentSection].push(trimmedLine);
      }
    });
    return parsed;
  }, [result]);

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-cyan-500/30 pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6 sticky top-24">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Vehicle Matcher</h2>
                <p className="text-sm text-zinc-500 mb-6">Enter exact model names for best accuracy.</p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Model 1</label>
                    <input
                      type="text"
                      value={model1}
                      onChange={(e) => setModel1(e.target.value)}
                      placeholder="e.g. Ather 450X"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Model 2</label>
                    <input
                      type="text"
                      value={model2}
                      onChange={(e) => setModel2(e.target.value)}
                      placeholder="e.g. Ola S1 Pro"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Supplemental Data (CSV)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center gap-3 w-full bg-zinc-950 border border-zinc-800 border-dashed group-hover:border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-500 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="truncate">{csvContent ? 'Local CSV Loaded' : 'Upload custom data'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompare}
                disabled={isLoading || !model1 || !model2}
                className="w-full bg-cyan-500 text-black font-bold py-4 rounded-xl hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    COMPUTING INTEL...
                  </>
                ) : 'ANALYZE & COMPARE'}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-500 text-xs font-medium leading-relaxed">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8 space-y-8">
            {!result && !isLoading && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-zinc-900 rounded-3xl opacity-50">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-zinc-700">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.711 2.489a2 2 0 01-2.485 1.333l-2.433-.608a2 2 0 01-1.412-2.384l.477-2.387a2 2 0 00-.547-1.022L5.428 10.428a2 2 0 010-2.856l1.524-1.524a2 2 0 00.547-1.022l.477-2.387a2 2 0 012.384-1.412l2.433.608a2 2 0 011.333 2.485l-.711 2.489a2 2 0 001.414 1.96l2.387.477a2 2 0 001.022.547l1.524 1.524a2 2 0 010 2.856l-1.524 1.524z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-zinc-300">Intelligent Comparative Engine</h3>
                <p className="text-zinc-500 max-w-sm mt-2 font-light">Input two models to analyze market alignment and technical variance.</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce delay-225"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white tracking-widest uppercase">Deep Search Grounding</h3>
                  <p className="text-zinc-500 text-sm font-mono mt-2 italic">Scanning technical datasheets...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {/* Score Summary Header */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <ScoreGauge score={result.similarityScore} />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-cyan-500/10 text-cyan-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-cyan-500/20">Market Score</span>
                        <button onClick={clearResults} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4">Reset</button>
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2">
                        <span>{model1}</span>
                        <span className="text-zinc-700 font-light mx-2">VS</span>
                        <span>{model2}</span>
                      </h2>
                      {sections.SCORE_RATIONALE && sections.SCORE_RATIONALE.length > 0 && (
                        <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-cyan-500/50 pl-4 italic">
                          {sections.SCORE_RATIONALE.join(' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Highlights: Similarities & Differences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <h3 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Common Ground
                    </h3>
                    <ul className="space-y-3">
                      {sections.KEY_SIMILARITIES?.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-3">
                          <span className="text-emerald-500 shrink-0 mt-1.5">•</span>
                          {item.replace(/^[#*\s\d.-]+/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                    <h3 className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Key Contrasts
                    </h3>
                    <ul className="space-y-3">
                      {sections.KEY_DIFFERENCES?.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex gap-3">
                          <span className="text-orange-500 shrink-0 mt-1.5">•</span>
                          {item.replace(/^[#*\s\d.-]+/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technical Specification Table */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hard Specification Comparison</h3>
                  </div>
                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800">
                          <th className="pb-3 font-medium uppercase text-[10px] tracking-widest">Feature</th>
                          <th className="pb-3 font-medium uppercase text-[10px] tracking-widest text-center">{model1}</th>
                          <th className="pb-3 font-medium uppercase text-[10px] tracking-widest text-center">{model2}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {sections.TECH_SPECS?.filter(l => l.includes('|') && !l.includes('---')).map((line, i) => {
                          const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
                          if (cells.length < 3) return null;
                          return (
                            <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-semibold text-zinc-400">{cells[0]}</td>
                              <td className="py-3 text-center text-zinc-200">{cells[1]}</td>
                              <td className="py-3 text-center text-zinc-200">{cells[2]}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Qualitative Insights */}
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6">
                  <h3 className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-3">Qualitative Benchmarking (Software & UX)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.QUALITATIVE_EDGE?.map((line, i) => (
                      <p key={i} className="text-sm text-zinc-400 leading-relaxed">
                        {line.replace(/^[#*\s\d.-]+/, '')}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Grounding Attribution */}
                {result.sources.length > 0 && (
                  <div className="pt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mr-2">Verified via:</span>
                    {result.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-[9px] text-zinc-500 hover:text-cyan-400 hover:border-cyan-400/30 transition-all flex items-center gap-2"
                      >
                        <svg className="w-2 h-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none"></div>
      <div className="fixed -bottom-20 -left-20 -z-10 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full opacity-30 pointer-events-none"></div>
    </div>
  );
};

export default App;
