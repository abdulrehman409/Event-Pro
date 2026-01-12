
import React from 'react';
import { TimeLeft } from '../types';
import { formatTimeUnit } from '../utils/timeUtils';

interface TimerDisplayProps {
  timeLeft: TimeLeft;
  isFinished: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, isFinished }) => {
  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <h2 className="text-4xl md:text-6xl font-black text-indigo-600 dark:text-indigo-400">
          EVENT STARTED!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">The countdown has reached zero.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4">
      {units.map((unit) => (
        <div 
          key={unit.label} 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/5 transition-all hover:scale-105"
        >
          <span className="mono text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-2">
            {formatTimeUnit(unit.value)}
          </span>
          <span className="text-xs md:text-sm font-bold tracking-widest text-slate-400 dark:text-slate-500">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimerDisplay;
