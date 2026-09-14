import React from 'react';
import { CameraPreset } from '../../types/car';
import { useCar } from '../../context/CarContext';
import { RotateCcw } from 'lucide-react';

export const CameraControls: React.FC = () => {
  const { customization, setCameraPreset, resetView } = useCar();

  const presets: { id: CameraPreset; label: string; short: string }[] = [
    { id: 'three-quarter', label: '3/4 Perspective', short: '3/4' },
    { id: 'front', label: 'Front Angle', short: 'Front' },
    { id: 'side', label: 'Profile Side', short: 'Side' },
    { id: 'rear', label: 'Rear Angle', short: 'Rear' },
    { id: 'top', label: 'Top Aerial', short: 'Top' },
    { id: 'interior', label: 'Interior Cabin', short: 'Interior' },
  ];

  return (
    <div className="flex items-center p-1.5 rounded-full ios-glass space-x-1 shadow-2xl">
      {presets.map((p) => {
        const isActive = customization.cameraPreset === p.id && !customization.activeHotspotId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setCameraPreset(p.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all duration-200 focus:outline-none ${
              isActive
                ? 'bg-white text-black font-semibold shadow-md scale-105'
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title={p.label}
          >
            {p.short}
          </button>
        );
      })}

      <div className="w-[1px] h-4 bg-white/10 mx-1" />

      {/* Reset View Button */}
      <button
        type="button"
        onClick={resetView}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
        title="Reset Camera to Three-Quarter Angle"
      >
        <RotateCcw className="w-3 h-3" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
};
