import React from 'react';
import { Play, RotateCcw, Home, Sun, Moon, X, Sparkles, ChevronRight } from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onResetCar: () => void;
  onMainMenu: () => void;
  timeOfDay: string;
  onTimeChange: (time: string) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onResetCar,
  onMainMenu,
  timeOfDay,
  onTimeChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Dynamic Background Laser Pulse & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-black/80 to-black pointer-events-none" />

      {/* Main Glassmorphism Pause Box */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#0a0a0f]/95 border border-cyan-500/30 p-7 shadow-[0_0_80px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-300">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <h2 className="text-3xl font-black font-mono tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                PAUSED
              </h2>
              <p className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
                BENGALURU DRIVE • FERRARI F40
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/20 active:scale-90 transition-all shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 mb-6">
          {/* 1. RESUME Button */}
          <button
            type="button"
            onClick={onResume}
            className="group w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-mono font-bold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] active:scale-98 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 transition-transform group-hover:scale-125 duration-300" />
              <span>RESUME</span>
            </div>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 duration-300" />
          </button>

          {/* 2. RESTART Button */}
          <button
            type="button"
            onClick={() => {
              onResetCar();
              onResume();
            }}
            className="group w-full flex items-center justify-between px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-amber-500/20 border border-white/15 hover:border-amber-500/50 text-neutral-200 hover:text-amber-300 font-mono font-bold text-sm uppercase tracking-wider active:scale-98 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-180 duration-700" />
              <span>RESTART</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* 3. MAIN MENU Button */}
          <button
            type="button"
            onClick={onMainMenu}
            className="group w-full flex items-center justify-between px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-neutral-300 hover:text-white font-mono font-bold text-sm uppercase tracking-wider active:scale-98 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <Home className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
              <span>MAIN MENU</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* TIME OF DAY SELECTOR (Only Day & Night) */}
        <div className="mb-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 mb-2.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIME OF DAY</span>
          </p>

          <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
            {/* DAY Option */}
            <button
              type="button"
              onClick={() => onTimeChange('day')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                timeOfDay === 'day'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-300'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sun className={`w-4 h-4 ${timeOfDay === 'day' ? 'text-black animate-spin-slow' : 'text-amber-400'}`} />
              <span>DAY</span>
            </button>

            {/* NIGHT Option */}
            <button
              type="button"
              onClick={() => onTimeChange('night')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                timeOfDay === 'night'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-indigo-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Moon className={`w-4 h-4 ${timeOfDay === 'night' ? 'text-cyan-300' : 'text-indigo-400'}`} />
              <span>NIGHT</span>
            </button>
          </div>
        </div>

        {/* Interactive Controls Reference Card */}
        <div className="rounded-2xl bg-black/60 border border-white/10 p-4 backdrop-blur-md">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 mb-2.5">
            DRIVING CONTROLS
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-colors">
              <span className="text-emerald-400 font-bold">W / ↑</span>
              <span className="text-neutral-300 text-[10px]">ACCEL</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-rose-500/40 transition-colors">
              <span className="text-rose-400 font-bold">S / ↓</span>
              <span className="text-neutral-300 text-[10px]">BRAKE</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/40 transition-colors">
              <span className="text-cyan-400 font-bold">A / D</span>
              <span className="text-neutral-300 text-[10px]">STEER</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/40 transition-colors">
              <span className="text-amber-400 font-bold">SPACE</span>
              <span className="text-neutral-300 text-[10px]">HANDBRAKE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
