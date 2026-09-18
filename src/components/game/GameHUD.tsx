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

  const distance = telemetry.distanceMeters || 0;
  const hp = telemetry.carHp ?? 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-6">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Neighborhood Badge, Quick Mute & Corner Warning Notification */}
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

            {/* Corner Warning Notification when Engine Stunned */}
            {telemetry.isSlowedDown && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 backdrop-blur-md border border-rose-500/60 text-rose-200 text-xs font-mono font-bold shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse">
                <Zap className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>STUNNED ({telemetry.slowdownRemainingSec || 3.0}s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Score (Distance) & Smooth Continuous HP Health Bar */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="flex items-center space-x-3">
            {/* Score Reader */}
            <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-xl border border-amber-500/40 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-amber-400 font-bold tracking-widest text-[10px] uppercase">SCORE</span>
              <span className="text-lg font-black font-mono text-white tracking-wider">
                {distance.toLocaleString()}
                <span className="text-[10px] text-amber-300/80 font-bold ml-1">M</span>
              </span>
            </div>

            {/* Continuous Smooth Curved HP Bar */}
            <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/20 text-xs font-mono shadow-2xl">
              <span className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">HP</span>
              
              <div className="w-28 sm:w-36 h-3 rounded-full bg-neutral-900/90 border border-white/15 p-0.5 shadow-inner overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    hp > 75
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                      : hp > 50
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : hp > 25
                      ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : 'bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 shadow-[0_0_16px_rgba(244,63,94,1.0)] animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, hp))}%` }}
                />
              </div>

              <span
                className={`font-black font-mono text-xs ${
                  hp <= 25 ? 'text-rose-400 animate-pulse' : hp <= 50 ? 'text-amber-400' : 'text-white'
                }`}
              >
                {hp}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Camera Switcher & Pause Menu */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* Camera View Switcher Button */}
          <button
            type="button"
            onClick={onCameraChange}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:text-white hover:bg-black/80 hover:border-cyan-400 active:scale-95 transition-all shadow-xl"
            title="Switch Camera View (C)"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase">{cameraName}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-neutral-300">C</kbd>
          </button>

          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono uppercase text-amber-300">
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
