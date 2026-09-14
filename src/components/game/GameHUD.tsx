import React, { useState, useEffect } from 'react';
import { CarTelemetry } from './FerrariDriveController';
import { Flame, Keyboard, X, Volume2, VolumeX, Eye, Activity, Gauge, Zap } from 'lucide-react';
import { audioEngine } from './AudioEngine';

interface GameHUDProps {
  telemetry: CarTelemetry;
  cameraName: string;
  onCameraChange: () => void;
  onPauseToggle: () => void;
  timeOfDay: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  telemetry,
  cameraName,
  onCameraChange,
  onPauseToggle,
  timeOfDay,
}) => {
  const [showControlsGuide, setShowControlsGuide] = useState(false);
  const [showCameraHint, setShowCameraHint] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-fade camera hint
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCameraHint(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Neighborhood by infinite Z coordinate
  const getNeighborhood = () => {
    const { x, z } = telemetry.position;
    const absZ = Math.abs(z);
    if (absZ % 1200 < 300) return '📍 Silk Board Junction • Hosur Road';
    if (absZ % 1200 < 600) return '📍 Electronic City Expressway • Flyover';
    if (absZ % 1200 < 900) return '📍 Indiranagar 100ft Boulevard';
    return '📍 Outer Ring Road • Namma Bengaluru';
  };

  // RPM Calculations for Gauges & Shift Lights
  const maxRpm = 8500;
  const rpmPercent = Math.min(100, Math.max(0, (telemetry.rpm / maxRpm) * 100));
  const isRedline = telemetry.rpm > 7500;
  const isRevLimiter = telemetry.rpm > 8100;

  // F1 Shift Light LEDs (9 LEDs total)
  // 1-3: Green (3000-5500 RPM), 4-6: Red (5500-7500 RPM), 7-9: Blue (7500-8500 RPM)
  const getShiftLedState = (index: number) => {
    const threshold = 3000 + index * 600;
    const isActive = telemetry.rpm >= threshold;
    if (!isActive) return 'bg-neutral-800 border-neutral-700';

    if (index < 3) return 'bg-emerald-400 shadow-[0_0_8px_#34d399] border-emerald-300';
    if (index < 6) return 'bg-rose-500 shadow-[0_0_8px_#f43f5e] border-rose-400';
    return isRevLimiter
      ? 'bg-cyan-400 shadow-[0_0_12px_#38bdf8] border-white animate-ping'
      : 'bg-blue-500 shadow-[0_0_10px_#3b82f6] border-blue-400';
  };

  // Turbo boost calculation
  const boostBar = telemetry.boostBar || 0;
  const boostPercent = Math.min(100, Math.max(0, (boostBar / 2.2) * 100));

  // G-Force Meter Coordinates (-1.5G to +1.5G mapped to 40px radius)
  const latG = telemetry.lateralG || 0;
  const gDotX = Math.min(22, Math.max(-22, latG * 18));
  const gDotY = Math.min(22, Math.max(-22, (telemetry.speedKmh > 10 ? -0.4 : 0) * 18));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-6">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Neighborhood Badge & Quick Mute */}
        <div className="flex flex-col space-y-2 pointer-events-auto">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-xs font-mono text-neutral-200 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">{getNeighborhood()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:bg-black/70 active:scale-95 transition-all text-xs shadow-lg"
              title="Toggle Audio"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-mono uppercase font-bold">
                {isMuted ? 'MUTED' : 'V8 SOUND'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowControlsGuide(!showControlsGuide)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:bg-black/70 active:scale-95 transition-all text-xs shadow-lg"
              title="Toggle Controls Guide"
            >
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono uppercase">KEYS</span>
            </button>
          </div>
        </div>

        {/* Center: Camera Hint */}
        {showCameraHint && (
          <div className="pointer-events-auto flex items-center space-x-2 px-4 py-2 rounded-2xl bg-cyan-950/85 backdrop-blur-md border border-cyan-500/40 text-cyan-200 text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <Eye className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-cyan-500/30 text-white font-bold">C</kbd> to Change Camera ({cameraName})
            </span>
            <button
              type="button"
              onClick={() => setShowCameraHint(false)}
              className="text-cyan-400/60 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right: Pause Menu */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono uppercase text-amber-300">
            {timeOfDay}
          </div>
          <button
            type="button"
            onClick={onPauseToggle}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono text-neutral-300 hover:text-white hover:bg-black/80 active:scale-95 transition-all shadow-xl"
          >
            <span>PAUSE</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-neutral-400">ESC</kbd>
          </button>
        </div>
      </div>

      {/* ================= DRIFT COMBO BANNER ================= */}
      {telemetry.driftScore > 0 && (
        <div className="self-center flex flex-col items-center pointer-events-none transition-all duration-300 my-auto">
          <div
            className={`flex items-center space-x-3 px-7 py-2.5 rounded-2xl backdrop-blur-xl border ${
              telemetry.isDrifting
                ? 'bg-amber-500/35 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] scale-110'
                : 'bg-black/50 border-white/10 opacity-70'
            } transition-all duration-200`}
          >
            <Flame
              className={`w-6 h-6 ${
                telemetry.isDrifting ? 'text-amber-400 animate-bounce' : 'text-neutral-400'
              }`}
            />
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                {telemetry.driftScore.toLocaleString()}
              </span>
              <span className="text-sm font-bold font-mono text-amber-400">
                x{telemetry.driftMultiplier}
              </span>
            </div>
            {telemetry.isDrifting && (
              <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-300 ml-1 animate-pulse">
                DRIFT!
              </span>
            )}
          </div>
        </div>
      )}

      {/* ================= CONTROLS FLOATING MODAL ================= */}
      {showControlsGuide && (
        <div className="pointer-events-auto self-start max-w-sm rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/20 p-4 text-white shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 z-50">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider uppercase">DRIVING CONTROLS</span>
            </div>
            <button
              type="button"
              onClick={() => setShowControlsGuide(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Drive Forward</span>
              <span className="font-bold text-emerald-400">W / ↑</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Brake / Reverse</span>
              <span className="font-bold text-rose-400">S / ↓</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Steer Left</span>
              <span className="font-bold text-cyan-400">A / ←</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Steer Right</span>
              <span className="font-bold text-cyan-400">D / →</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Handbrake</span>
              <span className="font-bold text-amber-400">SPACE</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Reset Position</span>
              <span className="font-bold text-cyan-400">R</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Cycle Camera</span>
              <span className="font-bold text-purple-400">C</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
              <span className="text-neutral-400">Italian Horn</span>
              <span className="font-bold text-yellow-300">H</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= HIGH-TECH RACING COCKPIT DASHBOARD ================= */}
      <div className="flex flex-col items-center justify-center w-full pointer-events-auto mt-auto">
        <div className="relative flex flex-col items-center px-6 py-4 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-xl w-full">
          {/* F1 Progressive Shift-Light LEDs (Row of 9 across the top) */}
          <div className="flex items-center space-x-2 mb-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`shift-led-${i}`}
                className={`w-3.5 h-2.5 rounded-sm border transition-all duration-75 ${getShiftLedState(i)}`}
              />
            ))}
          </div>

          {/* Main Instrument Cluster Grid */}
          <div className="grid grid-cols-5 gap-3 w-full items-center">
            {/* 1. Turbo Boost Gauge */}
            <div className="col-span-1 flex flex-col items-center justify-center bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-1 text-[9px] font-mono text-cyan-300 uppercase mb-1">
                <Zap className="w-3 h-3" />
                <span>BOOST</span>
              </div>
              <span className="text-sm font-mono font-black text-white">
                {boostBar} <span className="text-[9px] text-neutral-400">BAR</span>
              </span>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-1.5 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-75"
                  style={{ width: `${boostPercent}%` }}
                />
              </div>
            </div>

            {/* 2. Big Gear Display */}
            <div className="col-span-1 flex flex-col items-center justify-center bg-white/5 p-2 rounded-2xl border border-white/10">
              <span className="text-[9px] font-mono text-neutral-400 uppercase">GEAR</span>
              <span
                className={`text-3xl font-black font-mono transition-transform duration-100 ${
                  telemetry.gear === 'R'
                    ? 'text-rose-500'
                    : isRedline
                    ? 'text-amber-400 animate-pulse scale-110'
                    : 'text-cyan-400'
                }`}
              >
                {telemetry.gear}
              </span>
            </div>

            {/* 3. Center Digital Speedometer & Tachometer */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
                  {telemetry.speedKmh}
                </span>
                <span className="text-xs font-bold font-mono tracking-widest text-neutral-400 uppercase">
                  KM/H
                </span>
              </div>

              {/* Tachometer Progress Bar */}
              <div className="w-full mt-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                  <span className="text-neutral-400">RPM x1000</span>
                  <span
                    className={
                      isRedline
                        ? 'text-rose-400 font-bold animate-pulse'
                        : 'text-neutral-300 font-medium'
                    }
                  >
                    {telemetry.rpm}
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/15">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      isRedline
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 shadow-[0_0_12px_#ef4444]'
                        : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500'
                    }`}
                    style={{ width: `${rpmPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4. G-Force Crosshair Meter */}
            <div className="col-span-1 flex flex-col items-center justify-center bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-1 text-[9px] font-mono text-neutral-400 uppercase mb-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>G-METER</span>
              </div>
              {/* Circular 2D G-Force Grid */}
              <div className="relative w-12 h-12 rounded-full border border-white/15 flex items-center justify-center bg-black/40">
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white/15" />
                <div className="absolute h-full w-[1px] bg-white/15" />
                {/* Dynamic G-Force Dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] transition-transform duration-75"
                  style={{
                    transform: `translate(${gDotX}px, ${gDotY}px)`,
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-neutral-300 mt-1 font-bold">
                {Math.abs(latG).toFixed(1)} G
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
