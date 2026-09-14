import React from 'react';
import { Html } from '@react-three/drei';
import { Hotspot } from '../../types/car';

interface HotspotsProps {
  hotspots: Hotspot[];
  activeHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  visible: boolean;
}

export const Hotspots: React.FC<HotspotsProps> = ({
  hotspots,
  activeHotspotId,
  onSelectHotspot,
  visible,
}) => {
  if (!visible) return null;

  return (
    <group>
      {hotspots.map((h) => {
        const isActive = activeHotspotId === h.id;

        return (
          <group key={h.id} position={h.position}>
            <Html center distanceFactor={7}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(isActive ? null : h.id);
                }}
                className="group relative flex items-center justify-center w-8 h-8 focus:outline-none cursor-pointer"
                title={h.name}
              >
                {/* Outer animated pulsating ripple */}
                <span
                  className={`absolute w-full h-full rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-white/30 ring-2 ring-white scale-125 animate-ping'
                      : 'bg-white/20 group-hover:bg-white/30 group-hover:scale-125'
                  }`}
                />

                {/* Glass circle */}
                <span
                  className={`relative flex items-center justify-center w-5 h-5 rounded-full backdrop-blur-md border transition-transform duration-200 ${
                    isActive
                      ? 'bg-white border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.8)]'
                      : 'bg-black/70 border-white/60 group-hover:scale-110 group-hover:border-white'
                  }`}
                >
                  {/* Center Dot */}
                  <span
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      isActive ? 'bg-black' : 'bg-white'
                    }`}
                  />
                </span>

                {/* Tooltip Badge on hover */}
                <div className="pointer-events-none absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-medium tracking-wide uppercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
                  {h.name}
                </div>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
