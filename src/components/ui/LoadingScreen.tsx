import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(12);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsDone(true), 400);
          return 100;
        }
        const step = Math.floor(Math.random() * 25) + 15;
        return Math.min(prev + step, 100);
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507] transition-opacity duration-700 pointer-events-none ${
        progress === 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6">
        {/* Brand emblem */}
        <div className="w-12 h-12 mb-6 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        <span className="text-xs font-semibold tracking-automotive uppercase text-white mb-1">
          CARVERSE
        </span>

        <span className="text-[10px] font-mono tracking-widest text-neutral-400 mb-6 uppercase">
          Initializing 3D Environment
        </span>

        {/* Minimalist Progress Track */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] font-mono text-neutral-500">
          {progress}%
        </span>
      </div>
    </div>
  );
};
