import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { FerrariDriveController, CarTelemetry, InputState } from '../components/game/FerrariDriveController';
import { OpenWorld } from '../components/world/OpenWorld';
import { AITraffic } from '../components/game/AITraffic';
import { TireVFX } from '../components/game/TireVFX';
import { DrivingCamera, CameraMode, CAMERA_MODES } from '../components/game/DrivingCamera';
import { GameHUD } from '../components/game/GameHUD';
import { MobileControls } from '../components/game/MobileControls';
import { PauseMenu } from '../components/game/PauseMenu';
import { audioEngine } from '../components/game/AudioEngine';
import { Play, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type GamePhase = 'start' | 'playing' | 'paused';

export const BengaluruDrive: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [timeOfDay, setTimeOfDay] = useState<string>('sunset');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');

  const [telemetry, setTelemetry] = useState<CarTelemetry>({
    speedKmh: 0,
    rpm: 1100,
    gear: 'N',
    driftScore: 0,
    driftMultiplier: 1.0,
    isDrifting: false,
    position: new THREE.Vector3(-7.5, 0, -60),
    heading: 0,
    slipRatio: 0,
    headlightsOn: true,
    carVelocity: new THREE.Vector3(),
    leftTirePos: new THREE.Vector3(),
    rightTirePos: new THREE.Vector3(),
  });

  const [virtualInput, setVirtualInput] = useState<Partial<InputState>>({});
  const carGroupRef = useRef<THREE.Group | null>(null);

  // Start the game
  const handlePlay = useCallback(() => {
    audioEngine.init();
    audioEngine.resume();
    setPhase('playing');
  }, []);

  // Camera cycle
  const handleCameraToggle = useCallback(() => {
    setCameraMode((prev) => {
      const idx = CAMERA_MODES.findIndex((m) => m.id === prev);
      return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length].id;
    });
  }, []);

  // Mobile input handler
  const handleMobileInput = useCallback((input: Partial<InputState>) => {
    setVirtualInput((prev) => ({ ...prev, ...input }));
  }, []);

  // Reset car
  const handleResetCar = useCallback(() => {
    // Dispatch R key event
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR' }));
    }, 50);
  }, []);

  // ESC for pause
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (phase === 'playing') setPhase('paused');
        else if (phase === 'paused') setPhase('playing');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.cleanup();
    };
  }, []);

  const currentCameraLabel = CAMERA_MODES.find((m) => m.id === cameraMode)?.label || 'Chase';

  // ======= START SCREEN =======
  if (phase === 'start') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#050507]">
        {/* 3D Background Preview */}
        <div className="absolute inset-0 z-0">
          <Canvas
            shadows
            style={{ background: '#050507' }}
            camera={{ position: [15, 8, 20], fov: 55, near: 0.1, far: 400 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
            }}
          >
            <Suspense fallback={null}>
              <OpenWorld timeOfDay={timeOfDay as any} playerZ={-20} />
              <FerrariDriveController
                initialPosition={[-7.5, 0, -20]}
                cameraMode="chase"
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Cinematic Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-8 sm:p-12">
          {/* Top: Back to Showroom */}
          <div className="w-full flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SHOWROOM</span>
            </Link>

            {/* Time of Day Selector */}
            <div className="flex items-center space-x-1.5">
              {['day', 'sunset', 'night', 'cyber'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeOfDay(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                    timeOfDay === t
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Hero */}
          <div className="flex flex-col items-center text-center max-w-3xl">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                🇮🇳 OPEN WORLD
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                FERRARI F40
              </span>
            </div>

            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.15)] leading-[0.85]">
              BENGALURU
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                DRIVE
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-light mt-4 max-w-lg leading-relaxed">
              Drive your Ferrari through Namma Bengaluru — Silk Board Flyover, Outer Ring Road, Indiranagar 100ft Road, and the iconic traffic of India's Silicon Valley.
            </p>

            {/* PLAY Button */}
            <button
              type="button"
              onClick={handlePlay}
              className="group mt-10 flex items-center space-x-4 px-10 py-5 rounded-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white font-black text-lg uppercase tracking-widest
              hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 hover:scale-105
              active:scale-95
              shadow-[0_0_50px_rgba(16,185,129,0.5),0_0_100px_rgba(6,182,212,0.3)]
              hover:shadow-[0_0_70px_rgba(16,185,129,0.7),0_0_140px_rgba(6,182,212,0.5)]
              transition-all duration-300 ease-out"
            >
              <Play className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
              <span>PLAY NOW</span>
              <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Bottom: Hints */}
          <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-500 text-center space-y-1">
            <p>W A S D / Arrow Keys to Drive • SPACE Handbrake • C Camera • H Horn</p>
            <p>🇮🇳 Indian Left-Hand Traffic • Three.js WebGL • Web Audio V8 Engine</p>
          </div>
        </div>
      </div>
    );
  }

  // ======= GAMEPLAY / PAUSED =======
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Driving Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          style={{ background: '#050507' }}
          camera={{ position: [0, 5, -15], fov: 60, near: 0.1, far: 500 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
        >
          <Suspense fallback={null}>
            {/* World Environment (Infinite Seamless Tiling) */}
            <OpenWorld timeOfDay={timeOfDay as any} playerZ={telemetry.position.z} />

            {/* Ferrari Physics Controller */}
            <FerrariDriveController
              virtualInput={virtualInput}
              onTelemetryUpdate={setTelemetry}
              onCameraToggle={handleCameraToggle}
              carRef={carGroupRef}
              cameraMode={cameraMode}
            />

            {/* AI Traffic */}
            <AITraffic playerPos={telemetry.position} />

            {/* Tire Skid Marks & Smoke */}
            <TireVFX
              isSkidding={telemetry.isDrifting || telemetry.slipRatio > 0.2}
              leftTirePos={telemetry.leftTirePos}
              rightTirePos={telemetry.rightTirePos}
              carVelocity={telemetry.carVelocity}
            />

            {/* Dynamic Camera System */}
            <DrivingCamera
              carPosition={telemetry.position}
              carHeading={telemetry.heading}
              carSpeedKmh={telemetry.speedKmh}
              mode={cameraMode}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* HUD Overlay */}
      {phase === 'playing' && (
        <>
          <GameHUD
            telemetry={telemetry}
            cameraName={currentCameraLabel}
            onCameraChange={handleCameraToggle}
            onPauseToggle={() => setPhase('paused')}
            timeOfDay={timeOfDay}
          />

          <MobileControls
            onInputChange={handleMobileInput}
            onCameraClick={handleCameraToggle}
            onResetClick={handleResetCar}
            currentCameraName={currentCameraLabel}
          />
        </>
      )}

      {/* Pause Menu */}
      <PauseMenu
        isOpen={phase === 'paused'}
        onResume={() => setPhase('playing')}
        onResetCar={handleResetCar}
        timeOfDay={timeOfDay}
        onTimeChange={setTimeOfDay}
      />
    </div>
  );
};
