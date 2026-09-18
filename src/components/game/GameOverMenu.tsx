import React, { useEffect, useState } from 'react';
import { RotateCcw, Home, Trophy, Flame, ShieldAlert, Sparkles, Award } from 'lucide-react';
import { CarTelemetry } from './FerrariDriveController';

interface GameOverMenuProps {
  isOpen: boolean;
  telemetry: CarTelemetry;
  onRestart: () => void;
  onMainMenu: () => void;
}

interface HighScoreEntry {
  distance: number;
  drift: number;
  date: string;
}

const HIGH_SCORES_KEY = 'bengaluru_drive_high_scores';

export const GameOverMenu: React.FC<GameOverMenuProps> = ({
  isOpen,
  telemetry,
  onRestart,
  onMainMenu,
}) => {
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  const distance = telemetry.distanceMeters || 0;
  const drift = telemetry.driftScore || 0;

  useEffect(() => {
    if (!isOpen) return;

    // Load existing high scores
    let existing: HighScoreEntry[] = [];
    try {
      const stored = localStorage.getItem(HIGH_SCORES_KEY);
      if (stored) {
        existing = JSON.parse(stored);
      }
    } catch {
      existing = [];
    }

    // Default high score seeds if empty
    if (existing.length === 0) {
      existing = [
        { distance: 37000, drift: 25000, date: 'PILOT 01' },
        { distance: 23000, drift: 19000, date: 'PILOT 02' },
        { distance: 16000, drift: 14000, date: 'PILOT 03' },
        { distance: 9500, drift: 8000, date: 'PILOT 04' },
      ];
    }

    // Add current run if distance > 0
    if (distance > 0) {
      const currentEntry: HighScoreEntry = {
        distance,
        drift,
        date: 'YOU (NOW)',
      };

      const updated = [...existing, currentEntry]
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 4);

      // Check if current run is in top rank
      if (updated[0].distance === distance && distance > 0) {
        setIsNewRecord(true);
      }

      try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updated));
      } catch {
        // ignore fallback
      }
      setHighScores(updated);
    } else {
      setHighScores(existing.slice(0, 4));
    }
  }, [isOpen, distance, drift]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* FULL BOX CONTAINER WITH FULL BACKGROUND IMAGE */}
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-rose-500/50 shadow-[0_0_120px_rgba(244,63,94,0.45)] overflow-hidden flex flex-col items-center p-6 sm:p-9 text-center bg-black">
        {/* Full Image Background covering entire box - Bright & Vivid */}
        <img
          src="/cyber_ferrari_bg.jpg"
          alt="Cyber Ferrari Background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Subtle Cyber Vignette for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

        {/* Content Wrapper inside full box */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Top Header Badge */}
          <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
            <span>CRITICAL IMPACT • 0% HP</span>
          </div>

          {/* Arcade Neon Frame Title */}
          <div className="relative px-6 py-2 rounded-2xl border-2 border-yellow-400/80 bg-black/70 backdrop-blur-md shadow-[0_0_35px_rgba(250,204,21,0.4)] mb-4">
            <h2 className="text-4xl sm:text-6xl font-black uppercase font-mono tracking-tighter text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
              GAME OVER
            </h2>
            {isNewRecord && (
              <span className="absolute -top-3 -right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-black text-[9px] font-mono font-black tracking-widest uppercase shadow-lg animate-pulse">
                ★ NEW RECORD
              </span>
            )}
          </div>

          {/* Current Run Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-5">
            {/* Score */}
            <div className="flex flex-col items-center p-3 rounded-2xl bg-black/70 border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-mono font-bold uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>DISTANCE SCORE</span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                {distance.toLocaleString()} <span className="text-xs text-amber-400">M</span>
              </span>
            </div>

            {/* Drift */}
            <div className="flex flex-col items-center p-3 rounded-2xl bg-black/70 border border-orange-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <div className="flex items-center space-x-1.5 text-orange-400 text-[10px] font-mono font-bold uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>DRIFT POINTS</span>
              </div>
              <span className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                {drift.toLocaleString()}
              </span>
            </div>
          </div>

          {/* HIGH-SCORE LEADERBOARD TABLE */}
          <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2.5">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>HIGH-SCORE LEADERBOARD</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300/70 font-semibold uppercase">
                HALL OF FAME
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {highScores.map((entry, idx) => {
                const isCurrent = entry.date === 'YOU (NOW)';
                return (
                  <div
                    key={`hs-${idx}`}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/25 border border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : idx === 0
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-5 text-center font-bold ${
                          idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-neutral-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-left font-mono tracking-wider">{entry.date}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-white font-black">{entry.distance.toLocaleString()} M</span>
                      <span className="text-amber-400 text-[10px]">{entry.drift.toLocaleString()} PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arcade Pulsing Hint */}
          <div className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase mb-5 animate-pulse flex items-center space-x-1">
            <span>PRESS TRY AGAIN TO RESTART ENGINE</span>
          </div>

          {/* Action Buttons inside full box */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            {/* TRY AGAIN Button */}
            <button
              type="button"
              onClick={onRestart}
              className="group flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-black font-mono font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-95 transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-700 text-black" />
              <span>TRY AGAIN</span>
              <Sparkles className="w-4 h-4 text-black animate-pulse" />
            </button>

            {/* MAIN MENU Button */}
            <button
              type="button"
              onClick={onMainMenu}
              className="flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/20 text-neutral-200 hover:text-white font-mono font-bold text-sm uppercase tracking-wider active:scale-95 transition-all duration-200"
            >
              <Home className="w-4 h-4 text-neutral-400" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
