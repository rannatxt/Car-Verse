import React from 'react';
import { CarViewer } from '../components/3d/CarViewer';
import { CameraControls } from '../components/ui/CameraControls';
import { CarConfigurator } from '../components/ui/CarConfigurator';
import { useCar } from '../context/CarContext';
import { Sliders, Sparkles, Check } from 'lucide-react';

export const Studio: React.FC = () => {
  const { selectedCar, customization } = useCar();

  const currentColor = selectedCar.colors.find((c) => c.id === customization.selectedColorId);
  const currentWheel = selectedCar.wheels.find((w) => w.id === customization.selectedWheelId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050507]">
      {/* 3D Viewer Canvas */}
      <div className="absolute inset-0 z-0">
        <CarViewer isExploreMode={false} />
      </div>

      {/* Studio UI Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 sm:p-8 pt-20">
        {/* Top Header & Camera Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="pointer-events-auto">
            <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono uppercase tracking-widest mb-1">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Bespoke Design Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              {selectedCar.name}
            </h1>
            <span className="text-sm font-mono text-neutral-300">
              Starting from {selectedCar.basePrice}
            </span>
          </div>

          <div className="pointer-events-auto self-center sm:self-auto">
            <CameraControls />
          </div>
        </div>

        {/* Bottom Area: Active Configuration Summary & Controls */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-4 mt-auto">
          {/* Active Spec Capsule */}
          <div className="pointer-events-auto hidden md:flex flex-col space-y-2 p-4 rounded-3xl ios-glass max-w-xs text-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Active Configuration
            </span>
            <div className="space-y-1 text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Color:</span>
                <span className="text-white font-medium">{currentColor?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Wheels:</span>
                <span className="text-white font-medium">{currentWheel?.name.split(' ')[0]} Alloy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Environment:</span>
                <span className="text-white font-medium capitalize">{customization.environment}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center space-x-1 text-emerald-400 text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>Real-Time PBR Shader Rendering</span>
            </div>
          </div>

          {/* Configurator Dock */}
          <div className="pointer-events-auto w-full lg:w-auto self-center lg:self-end">
            <CarConfigurator />
          </div>
        </div>
      </div>
    </div>
  );
};
