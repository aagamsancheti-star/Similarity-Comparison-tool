
import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-red-500";
  if (score > 40) colorClass = "stroke-yellow-500";
  if (score > 70) colorClass = "stroke-emerald-500";

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-zinc-800"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Similarity</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-400 text-center max-w-[200px]">
        {score > 80 ? "These models are highly direct competitors." : 
         score > 50 ? "Significant overlap in target segments." : 
         "Distinct categories or value propositions."}
      </p>
    </div>
  );
};
