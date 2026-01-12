
import React, { useState, useEffect, useCallback } from 'react';
import { TimeLeft, GroundingSource } from './types';
import { calculateTimeLeft } from './utils/timeUtils';
import TimerDisplay from './components/TimerDisplay';
import GeminiAssistant from './components/GeminiAssistant';
import { searchEventDates } from './services/geminiService';

const App: React.FC = () => {
  const [targetDate, setTargetDate] = useState<string>(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1, 0, 1);
    nextYear.setHours(0, 0, 0, 0);
    return nextYear.toISOString().slice(0, 16);
  });
  
  const [eventTitle, setEventTitle] = useState('New Year');
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(new Date(targetDate)));
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  // Update timer every second
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        const remaining = calculateTimeLeft(new Date(targetDate));
        setTimeLeft(remaining);
        if (remaining.totalSeconds <= 0) {
          setIsActive(false);
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, targetDate]);

  const handleStart = () => setIsActive(true);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(calculateTimeLeft(new Date(targetDate)));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    try {
      const { text, sources } = await searchEventDates(searchQuery);
      setSearchResult(text);
      setSources(sources);
      
      // Try to extract date from AI response automatically
      const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
      const match = text.match(isoRegex);
      if (match) {
        setTargetDate(match[0]);
        setEventTitle(searchQuery);
      }
    } catch (err) {
      console.error(err);
      setSearchResult("Failed to search. Check console.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-widest mb-2">
          Event Countdown Pro
        </h1>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
          {isActive ? eventTitle : "Set Your Countdown"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
          {isActive 
            ? `Counting down to ${new Date(targetDate).toLocaleString()}` 
            : "Use the inputs below or ask Gemini to find an event date for you."
          }
        </p>
      </header>

      <main className="w-full flex flex-col items-center gap-12">
        <TimerDisplay timeLeft={timeLeft} isFinished={timeLeft.totalSeconds === 0 && isActive === false && new Date(targetDate) < new Date()} />

        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
          {/* Main Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Event Name</label>
              <input 
                type="text" 
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. World Cup 2026"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Date & Time</label>
              <input 
                type="datetime-local" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {!isActive ? (
              <button 
                onClick={handleStart}
                className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
              >
                Start Countdown
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="flex-1 py-5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl transition-all active:scale-95"
              >
                Reset
              </button>
            )}
          </div>

          {/* AI Helper Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find an event date with Google Search..."
                className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white dark:border-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
            
            {searchResult && (
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl animate-in fade-in duration-300">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  {searchResult}
                </p>
                {sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-indigo-500 font-bold hover:bg-indigo-50 transition-colors"
                      >
                        SOURCE: {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-400 dark:text-slate-600 text-xs font-medium tracking-widest uppercase">
        <p>© 2024 Event Countdown Pro • Powered by Gemini Flash 3</p>
        <div className="mt-4 flex gap-4 justify-center">
          <button className="hover:text-indigo-500 transition-colors">Privacy Policy</button>
          <button className="hover:text-indigo-500 transition-colors">Help</button>
        </div>
      </footer>

      <GeminiAssistant />
    </div>
  );
};

export default App;
