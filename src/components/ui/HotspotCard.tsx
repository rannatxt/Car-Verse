import React from 'react';
import { useCar } from '../../context/CarContext';
import { X, Sparkles } from 'lucide-react';

export const HotspotCard: React.FC = () => {
  const { activeHotspot, setActiveHotspot } = useCar();

  if (!activeHotspot) return null;

  return (
    <div className="fixed bottom-24 left-4 sm:left-8 z-30 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 rounded-3xl ios-glass border border-white/20 shadow-2xl">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-mono uppercase tracking-widest text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{activeHotspot.category}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveHotspot(null)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit Feature View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold uppercase tracking-tight text-white mb-1.5">
          {activeHotspot.name}
        </h3>

        <p className="text-xs text-neutral-300 leading-relaxed font-light">
          {activeHotspot.description}
        </p>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveHotspot(null)}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-medium tracking-wide text-white transition-colors"
          >
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
