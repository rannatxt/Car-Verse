import React from 'react';
import { Camera, Volume2, RotateCcw, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import { InputState } from './FerrariDriveController';

interface MobileControlsProps {
  onInputChange: (input: Partial<InputState>) => void;
  onCameraClick: () => void;
  onResetClick: () => void;
  currentCameraName: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onInputChange,
  onCameraClick,
  onResetClick,
  currentCameraName,
}) => {
  // Helpers to bind both mouse and touch events
  const bindControl = (key: keyof InputState) => {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        onInputChange({ [key]: true });
      },
      onPointerUp: (e: React.PointerEvent) => {
        e.preventDefault();
        onInputChange({ [key]: false });
      },
      onPointerLeave: (e: React.PointerEvent) => {
        e.preventDefault();
        onInputChange({ [key]: false });
      },
      onPointerCancel: (e: React.PointerEvent) => {
        e.preventDefault();
        onInputChange({ [key]: false });
      },
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar Quick Actions */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Reset Car button */}
        <button
          type="button"
          onClick={onResetClick}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300 hover:text-white hover:bg-black/70 active:scale-95 transition-all shadow-lg"
          title="Reset Car (R)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">RESET</span>
          <span className="text-[10px] text-neutral-500 font-bold sm:inline">[R]</span>
        </button>

        {/* Camera Switch Pill */}
        <button
          type="button"
          onClick={onCameraClick}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs font-medium text-neutral-200 hover:text-white hover:bg-black/70 active:scale-95 transition-all shadow-lg"
          title="Change Camera (C)"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider">{currentCameraName}</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-400">C</span>
        </button>
      </div>

      {/* Bottom Controls (Steering Left & Pedals Right) */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Left Side: Steering Cluster & Horn */}
        <div className="flex flex-col space-y-3">
          {/* Horn Button */}
          <div className="flex justify-start">
            <button
              type="button"
              {...bindControl('horn')}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 active:bg-amber-500/50 active:scale-90 transition-all shadow-lg"
              title="Horn (H)"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Steer Left & Right Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              {...bindControl('left')}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-cyan-500/30 active:border-cyan-400 active:scale-90 transition-all shadow-xl"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              type="button"
              {...bindControl('right')}
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-cyan-500/30 active:border-cyan-400 active:scale-90 transition-all shadow-xl"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Right Side: Handbrake & Pedals (Gas / Brake) */}
        <div className="flex flex-col items-end space-y-3">
          {/* Handbrake Button */}
          <button
            type="button"
            {...bindControl('handbrake')}
            className="px-5 py-2.5 rounded-xl bg-rose-600/30 backdrop-blur-md border border-rose-500/50 text-rose-200 font-mono text-xs font-bold uppercase tracking-wider active:bg-rose-600/70 active:scale-90 transition-all shadow-lg"
          >
            HANDBRAKE [SPACE]
          </button>

          {/* Pedals: Brake (Left) & Gas (Right) */}
          <div className="flex items-center space-x-3">
            {/* Brake / Reverse Pedal */}
            <button
              type="button"
              {...bindControl('backward')}
              className="w-16 h-24 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 flex flex-col items-center justify-center text-rose-300 active:bg-rose-500/50 active:border-rose-400 active:scale-95 transition-all shadow-xl"
            >
              <span className="text-[10px] font-mono tracking-widest uppercase mb-1">BRAKE</span>
              <span className="text-sm font-black">REV</span>
            </button>

            {/* Gas / Accelerate Pedal */}
            <button
              type="button"
              {...bindControl('forward')}
              className="w-20 h-28 rounded-2xl bg-emerald-500/25 backdrop-blur-md border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-300 active:bg-emerald-500/60 active:border-emerald-300 active:scale-95 transition-all shadow-2xl"
            >
              <Gauge className="w-6 h-6 mb-1 text-emerald-300" />
              <span className="text-xs font-mono font-black tracking-widest uppercase">GAS</span>
              <span className="text-[9px] text-emerald-200/70">[W / ↑]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
