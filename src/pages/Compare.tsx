import React, { useState } from 'react';
import { useCar } from '../context/CarContext';
import { CARS_DATA } from '../data/cars';
import { ArrowLeftRight, RotateCcw, Zap, Gauge, Wind, Compass, Shield, BatteryCharging } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { ProceduralCar } from '../components/3d/ProceduralCar';
import * as THREE from 'three';

export const Compare: React.FC = () => {
  const {
    compareCarA,
    compareCarB,
    setCompareCarA,
    setCompareCarB,
    swapCompareCars,
    resetCompareCars,
    customization,
  } = useCar();

  const [active3DView, setActive3DView] = useState<'A' | 'B'>('A');

  // Compute differential ratios for progress bars
  const hpRatioA = Math.min(100, Math.round((compareCarA.specs.horsepower / 1400) * 100));
  const hpRatioB = Math.min(100, Math.round((compareCarB.specs.horsepower / 1400) * 100));

  const torqueRatioA = Math.min(100, Math.round((compareCarA.specs.torque / 1800) * 100));
  const torqueRatioB = Math.min(100, Math.round((compareCarB.specs.torque / 1800) * 100));

  // Parse acceleration float (e.g., "3.6s" -> 3.6)
  const accelA = parseFloat(compareCarA.specs.acceleration);
  const accelB = parseFloat(compareCarB.specs.acceleration);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-start">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Comparative Telemetry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">
            Head-to-Head Comparison
          </h1>
        </div>

        {/* Comparison Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={swapCompareCars}
            className="flex items-center space-x-2 px-4 py-2 rounded-full ios-glass text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap Positions</span>
          </button>

          <button
            type="button"
            onClick={resetCompareCars}
            className="flex items-center space-x-2 px-4 py-2 rounded-full ios-glass text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE 3D PREVIEW STAGE ================= */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl ios-glass overflow-hidden border border-white/15 mb-8 shadow-2xl">
        {/* Toggle between viewing Car A or Car B in 3D */}
        <div className="absolute top-4 left-4 z-20 flex items-center p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
          <button
            type="button"
            onClick={() => setActive3DView('A')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
              active3DView === 'A'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {compareCarA.name}
          </button>
          <button
            type="button"
            onClick={() => setActive3DView('B')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
              active3DView === 'B'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {compareCarB.name}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-20 text-[11px] font-mono text-neutral-400 uppercase">
          Drag to Rotate 360°
        </div>

        {/* 3D Canvas */}
        <Canvas
          shadows
          camera={{ position: [3.8, 1.6, 3.8], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[6, 8, 5]} intensity={2.2} castShadow />
          <directionalLight position={[-6, 4, -4]} intensity={1.2} />
          <directionalLight position={[0, 5, -7]} intensity={2.5} />

          <ContactShadows position={[0, 0, 0]} opacity={0.75} scale={10} blur={2.0} far={4} />

          <ProceduralCar
            vehicle={active3DView === 'A' ? compareCarA : compareCarB}
            customization={customization}
          />

          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={1.8}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2 - 0.02}
          />
        </Canvas>
      </div>

      {/* ================= COMPARISON METRIC GRIDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= VEHICLE A ================= */}
        <div className="p-6 rounded-3xl ios-glass border border-white/10 flex flex-col">
          {/* Select Dropdown */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              Vehicle Alpha
            </span>
            <select
              value={compareCarA.id}
              onChange={(e) => {
                const found = CARS_DATA.find((c) => c.id === e.target.value);
                if (found) setCompareCarA(found);
              }}
              className="bg-black/60 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              {CARS_DATA.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-1">
            {compareCarA.name}
          </h2>
          <span className="text-xs font-mono text-neutral-400 mb-6">
            {compareCarA.category} • {compareCarA.basePrice}
          </span>

          {/* Metric Rows with Visual Comparative Bars */}
          <div className="space-y-4">
            {/* Horsepower */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Output Power</span>
                </span>
                <span className="text-white font-bold">{compareCarA.specs.horsepower} HP</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${hpRatioA}%` }}
                />
              </div>
            </div>

            {/* Torque */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-orange-400" />
                  <span>Torque</span>
                </span>
                <span className="text-white font-bold">{compareCarA.specs.torque} Nm</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${torqueRatioA}%` }}
                />
              </div>
            </div>

            {/* 0-100 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-400" />
                  <span>0–100 km/h</span>
                </span>
                <span className={`font-bold ${accelA <= accelB ? 'text-emerald-400' : 'text-white'}`}>
                  {compareCarA.specs.acceleration}
                </span>
              </div>
            </div>

            {/* Top Speed */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top Speed</span>
              </span>
              <span className="text-white font-semibold">{compareCarA.specs.topSpeed}</span>
            </div>

            {/* Range */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
                <span>Range</span>
              </span>
              <span className="text-white font-semibold">{compareCarA.specs.range}</span>
            </div>

            {/* Weight */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Curb Weight</span>
              </span>
              <span className="text-white font-semibold">{compareCarA.specs.weight}</span>
            </div>

            {/* Drive Type */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400">Drivetrain</span>
              <span className="text-white font-semibold">{compareCarA.specs.driveType}</span>
            </div>
          </div>
        </div>

        {/* ================= VEHICLE B ================= */}
        <div className="p-6 rounded-3xl ios-glass border border-white/10 flex flex-col">
          {/* Select Dropdown */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              Vehicle Beta
            </span>
            <select
              value={compareCarB.id}
              onChange={(e) => {
                const found = CARS_DATA.find((c) => c.id === e.target.value);
                if (found) setCompareCarB(found);
              }}
              className="bg-black/60 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              {CARS_DATA.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-1">
            {compareCarB.name}
          </h2>
          <span className="text-xs font-mono text-neutral-400 mb-6">
            {compareCarB.category} • {compareCarB.basePrice}
          </span>

          {/* Metric Rows with Visual Comparative Bars */}
          <div className="space-y-4">
            {/* Horsepower */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Output Power</span>
                </span>
                <span className="text-white font-bold">{compareCarB.specs.horsepower} HP</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${hpRatioB}%` }}
                />
              </div>
            </div>

            {/* Torque */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Gauge className="w-3.5 h-3.5 text-orange-400" />
                  <span>Torque</span>
                </span>
                <span className="text-white font-bold">{compareCarB.specs.torque} Nm</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${torqueRatioB}%` }}
                />
              </div>
            </div>

            {/* 0-100 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-blue-400" />
                  <span>0–100 km/h</span>
                </span>
                <span className={`font-bold ${accelB <= accelA ? 'text-emerald-400' : 'text-white'}`}>
                  {compareCarB.specs.acceleration}
                </span>
              </div>
            </div>

            {/* Top Speed */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Top Speed</span>
              </span>
              <span className="text-white font-semibold">{compareCarB.specs.topSpeed}</span>
            </div>

            {/* Range */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
                <span>Range</span>
              </span>
              <span className="text-white font-semibold">{compareCarB.specs.range}</span>
            </div>

            {/* Weight */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Curb Weight</span>
              </span>
              <span className="text-white font-semibold">{compareCarB.specs.weight}</span>
            </div>

            {/* Drive Type */}
            <div className="flex justify-between text-xs py-2 border-t border-white/5">
              <span className="text-neutral-400">Drivetrain</span>
              <span className="text-white font-semibold">{compareCarB.specs.driveType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
