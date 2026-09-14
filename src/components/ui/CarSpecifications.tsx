import React, { useState } from 'react';
import { useCar } from '../../context/CarContext';
import { ChevronRight, X, Gauge, Zap, Compass, Shield, Wind, Sparkles } from 'lucide-react';

export const CarSpecifications: React.FC = () => {
  const { selectedCar } = useCar();
  const [specsModalOpen, setSpecsModalOpen] = useState(false);

  const { name, category, tagline, description, specs, basePrice, features } = selectedCar;

  return (
    <>
      {/* ================= FLOATING HUD TELEMETRY PANEL ================= */}
      <div className="flex flex-col max-w-sm pointer-events-auto">
        {/* Category & Badge */}
        <div className="flex items-center space-x-2.5 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-white/10 text-white/80 border border-white/15">
            {category}
          </span>
          <span className="text-xs font-mono text-neutral-400">
            {basePrice}
          </span>
        </div>

        {/* Model Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase drop-shadow-md">
          {name}
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1 mb-4 line-clamp-1">
          {tagline}
        </p>

        {/* Telemetry Stat Strip (iOS Glass) */}
        <div className="p-3 rounded-2xl ios-glass grid grid-cols-3 gap-3 divide-x divide-white/10 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
              0–100 km/h
            </span>
            <span className="text-base sm:text-lg font-bold text-white mt-0.5">
              {specs.acceleration}
            </span>
          </div>

          <div className="flex flex-col pl-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
              Output
            </span>
            <span className="text-base sm:text-lg font-bold text-white mt-0.5">
              {specs.horsepower} <span className="text-xs font-normal text-neutral-400">HP</span>
            </span>
          </div>

          <div className="flex flex-col pl-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
              Top Speed
            </span>
            <span className="text-base sm:text-lg font-bold text-white mt-0.5">
              {specs.topSpeed}
            </span>
          </div>
        </div>

        {/* Expand Details Trigger */}
        <button
          type="button"
          onClick={() => setSpecsModalOpen(true)}
          className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl ios-glass-subtle text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="font-medium tracking-wide">Full Engineering Specifications</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= FULL TECHNICAL SPECS MODAL ================= */}
      {specsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
          <div className="relative w-full max-w-xl p-6 rounded-3xl ios-glass border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono text-neutral-400 tracking-widest uppercase">
                  Engineering Blueprint • {category}
                </span>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-0.5">
                  {name}
                </h2>
                <p className="text-xs text-neutral-300 mt-1 font-light">
                  {description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSpecsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Close specifications dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Horsepower</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.horsepower} HP</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5 text-orange-400" />
                  <span>Torque</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.torque} Nm</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Wind className="w-3.5 h-3.5 text-blue-400" />
                  <span>0–100 km/h</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.acceleration}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Top Speed</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.topSpeed}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Estimated Range</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.range}</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                <div className="flex items-center space-x-1.5 text-neutral-400 text-xs mb-1">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>Curb Weight</span>
                </div>
                <span className="text-base font-semibold text-white">{specs.weight}</span>
              </div>
            </div>

            {/* Drivetrain & Transmission */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-4 flex flex-col space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Drivetrain:</span>
                <span className="text-white font-medium">{specs.driveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Transmission:</span>
                <span className="text-white font-medium">{specs.transmission}</span>
              </div>
            </div>

            {/* Features list */}
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 block">
                Standard Highlights & Innovations
              </span>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
