import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarViewer } from '../components/3d/CarViewer';
import { CarSpecifications } from '../components/ui/CarSpecifications';
import { CameraControls } from '../components/ui/CameraControls';
import { CarSelector } from '../components/ui/CarSelector';
import { CarConfigurator } from '../components/ui/CarConfigurator';
import { HotspotCard } from '../components/ui/HotspotCard';
import { ChevronRight, Compass, Gamepad2 } from 'lucide-react';
import { useCar } from '../context/CarContext';

export const Home: React.FC = () => {
  const [hasExplored, setHasExplored] = useState<boolean>(false);
  const { setCameraPreset } = useCar();

  const handleExplore = () => {
    setHasExplored(true);
    setCameraPreset('three-quarter');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507]">
      {/* ================= PRIMARY 3D CANVAS ================= */}
      <div className="absolute inset-0 z-0">
        <CarViewer isExploreMode={hasExplored} />
      </div>

      {/* ================= LANDING SCREEN OVERLAY ================= */}
      {!hasExplored ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-8 sm:p-12 pointer-events-none transition-all duration-700">
          {/* Top spacer */}
          <div />

          {/* Hero Center Typography */}
          <div className="flex flex-col items-center text-center max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-3">
              Automotive Design Redefined
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white drop-shadow-2xl">
              CARVERSE
            </h1>
            <p className="text-base sm:text-xl text-neutral-300 font-light mt-4 max-w-lg leading-relaxed">
              Explore automotive design in an interactive 3D showroom.
            </p>

            {/* Explore Trigger Button */}
            <div className="mt-8 pointer-events-auto flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={handleExplore}
                className="group flex items-center space-x-3 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm tracking-widest uppercase hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.7)] hover:scale-105 focus:outline-none"
              >
                <span>EXPLORE</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* Bengaluru Drive Play Button */}
              <Link
                to="/drive"
                className="group flex items-center space-x-3 px-7 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold text-sm tracking-widest uppercase hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:scale-105 focus:outline-none"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>PLAY BENGALURU DRIVE</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="text-[11px] font-mono tracking-widest uppercase text-neutral-500">
            Drag to Orbit • Scroll to Zoom • Three.js WebGL
          </div>
        </div>
      ) : (
        /* ================= MAIN SHOWROOM HUD OVERLAYS ================= */
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-8 pt-20 animate-in fade-in duration-500">
          {/* TOP ROW: Specifications HUD on left, Camera presets on center/right */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <CarSpecifications />

            <div className="pointer-events-auto self-center md:self-start">
              <CameraControls />
            </div>
          </div>

          {/* MIDDLE: Active Hotspot Card */}
          <HotspotCard />

          {/* BOTTOM ROW: CarSelector in center, Configurator docked on right */}
          <div className="flex flex-col lg:flex-row items-end justify-between gap-4 mt-auto">
            {/* Quick Explore Mode Pill Button */}
            <div className="hidden lg:flex flex-col space-y-2 pointer-events-auto">
              <div className="p-3 rounded-2xl ios-glass text-[11px] text-neutral-400 max-w-[200px] leading-relaxed">
                <div className="flex items-center space-x-1.5 text-white font-semibold mb-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>360° Showroom</span>
                </div>
                Click any glowing hotspot on the vehicle to inspect key engineering systems.
              </div>
            </div>

            {/* Center Vehicle Category & Model Selector */}
            <div className="w-full lg:max-w-2xl mx-auto">
              <CarSelector />
            </div>

            {/* Right Configurator Dock */}
            <div className="w-full lg:w-auto self-center lg:self-end">
              <CarConfigurator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
