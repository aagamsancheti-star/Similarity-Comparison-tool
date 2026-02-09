
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              EV TWIN-TRACK
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-tighter">v1.0.4 - Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline-block">CONNECTED TO GEMINI_3_PRO_SEARCH</span>
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
