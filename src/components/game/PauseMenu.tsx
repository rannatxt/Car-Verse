import React from 'react';
import { Play, RotateCcw, Sun, Moon, Sunset, Sparkles, Volume2, X } from 'lucide-react';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onResetCar: () => void;
  timeOfDay: string;
  onTimeChange: (time: string) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  onResetCar,
  timeOfDay,
  onTimeChange,
}) => {
  if (!isOpen) return null;

  const timeOptions = [
    { id: 'day', label: 'Sunny Day', icon: Sun, color: 'text-amber-400' },
    { id: 'sunset', label: 'Golden Hour', icon: Sunset, color: 'text-orange-400' },
    { id: 'night', label: 'Monsoon Night', icon: Moon, color: 'text-blue-400' },
    { id: 'cyber', label: 'Cyber Midnight', icon: Sparkles, color: 'text-purple-400' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-md mx-4 rounded-3xl bg-neutral-900/95 border border-white/15 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">PAUSED</h2>
            <p className="text-xs font-mono text-neutral-400 mt-1">BENGALURU DRIVE</p>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/20 active:scale-90 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resume Button */}
        <button
          type="button"
          onClick={onResume}
          className="w-full flex items-center justify-center space-x-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-cyan-500 active:scale-[0.97] transition-all shadow-[0_8px_30px_rgba(16,185,129,0.4)] mb-4"
        >
          <Play className="w-5 h-5" />
          <span>RESUME DRIVING</span>
        </button>

        {/* Reset Car */}
        <button
          type="button"
          onClick={() => { onResetCar(); onResume(); }}
          className="w-full flex items-center justify-center space-x-3 py-3 rounded-2xl bg-white/10 border border-white/15 text-neutral-200 font-semibold text-sm uppercase tracking-wider hover:bg-white/15 active:scale-[0.97] transition-all mb-6"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>Reset Car Position</span>
        </button>

        {/* Time of Day Selector */}
        <div className="mb-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-3">TIME OF DAY</p>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = timeOfDay === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTimeChange(opt.id)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    isActive
                      ? 'bg-white/15 border border-white/30 text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-neutral-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? opt.color : 'text-neutral-500'}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Reference */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-3">CONTROLS</p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            {[
              ['W / ↑', 'Accelerate', 'text-emerald-400'],
              ['S / ↓', 'Brake / Rev', 'text-rose-400'],
              ['A / ←', 'Steer Left', 'text-white'],
              ['D / →', 'Steer Right', 'text-white'],
              ['SPACE', 'Handbrake', 'text-amber-400'],
              ['R', 'Reset Car', 'text-cyan-400'],
              ['C', 'Camera', 'text-purple-400'],
              ['H', 'Horn 📯', 'text-yellow-300'],
              ['L', 'Headlights', 'text-sky-400'],
              ['ESC', 'Pause', 'text-neutral-300'],
            ].map(([key, label, color]) => (
              <div key={key} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-lg">
                <span className="text-neutral-500">{label}</span>
                <span className={`font-bold ${color}`}>{key}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-neutral-500 mt-4">
          🇮🇳 Drive on the LEFT • Namma Bengaluru
        </p>
      </div>
    </div>
  );
};
