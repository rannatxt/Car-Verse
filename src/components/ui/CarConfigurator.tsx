import React, { useState } from 'react';
import { useCar } from '../../context/CarContext';
import { CALIPER_OPTIONS } from '../../data/cars';
import { Sun, Sunset, Moon, Disc, Play, Square, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { EnvironmentMode } from '../../types/car';

export const CarConfigurator: React.FC = () => {
  const {
    selectedCar,
    customization,
    setColorId,
    setWheelId,
    setCaliperId,
    toggleHeadlights,
    setEnvironment,
    toggleDriving,
  } = useCar();

  const [activeTab, setActiveTab] = useState<'paint' | 'wheels' | 'studio'>('paint');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { colors, wheels } = selectedCar;
  const { selectedColorId, selectedWheelId, selectedCaliperId, headlightsOn, environment, isDriving } = customization;

  const envOptions: { id: EnvironmentMode; label: string; icon: React.ElementType }[] = [
    { id: 'day', label: 'Day Studio', icon: Sun },
    { id: 'sunset', label: 'Sunset Amber', icon: Sunset },
    { id: 'night', label: 'Midnight Dark', icon: Moon },
  ];

  return (
    <div className="w-full max-w-md pointer-events-auto">
      <div className="rounded-3xl ios-glass overflow-hidden shadow-2xl transition-all duration-300">
        {/* ================= HEADER TABS ================= */}
        <div className="flex items-center justify-between p-3 pb-2 border-b border-white/10">
          <div className="flex items-center space-x-1 p-1 rounded-full bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('paint');
                setIsCollapsed(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'paint' && !isCollapsed
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Finish
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('wheels');
                setIsCollapsed(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'wheels' && !isCollapsed
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Wheels
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('studio');
                setIsCollapsed(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTab === 'studio' && !isCollapsed
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Studio
            </button>
          </div>

          {/* Quick Collapse / Expand Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            title={isCollapsed ? 'Expand Configurator' : 'Collapse Configurator'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* ================= TAB BODY ================= */}
        {!isCollapsed && (
          <div className="p-4 space-y-4 animate-in fade-in duration-200">
            {/* TAB 1: EXTERIOR PAINT & CALIPERS */}
            {activeTab === 'paint' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Exterior Body Paint
                    </span>
                    <span className="text-xs font-medium text-white">
                      {colors.find((c) => c.id === selectedColorId)?.name || 'Custom'}
                    </span>
                  </div>

                  {/* Swatches */}
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((color) => {
                      const isSelected = selectedColorId === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setColorId(color.id)}
                          className={`group relative w-8 h-8 rounded-full transition-transform duration-150 focus:outline-none ${
                            isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-105'
                          }`}
                          title={color.name}
                        >
                          <span
                            className="absolute inset-0 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Brake Caliper Color
                    </span>
                    <span className="text-xs font-medium text-white">
                      {CALIPER_OPTIONS.find((c) => c.id === selectedCaliperId)?.name}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {CALIPER_OPTIONS.map((caliper) => {
                      const isSelected = selectedCaliperId === caliper.id;
                      return (
                        <button
                          key={caliper.id}
                          type="button"
                          onClick={() => setCaliperId(caliper.id)}
                          className={`w-6 h-6 rounded-full transition-transform focus:outline-none ${
                            isSelected ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-black' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: caliper.hex }}
                          title={caliper.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WHEELS */}
            {activeTab === 'wheels' && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                  Wheel Architecture
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {wheels.map((wheel) => {
                    const isSelected = selectedWheelId === wheel.id;
                    return (
                      <button
                        key={wheel.id}
                        type="button"
                        onClick={() => setWheelId(wheel.id)}
                        className={`p-2.5 rounded-2xl text-left transition-all border ${
                          isSelected
                            ? 'bg-white/15 border-white text-white shadow-md'
                            : 'bg-white/5 border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Disc className="w-3.5 h-3.5 text-white/70" />
                          <span className="text-xs font-semibold">{wheel.name.split(' ')[0]}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 line-clamp-1">
                          {wheel.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STUDIO, LIGHTING & DRIVE MODE */}
            {activeTab === 'studio' && (
              <div className="space-y-3.5">
                {/* Environment Mood */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                    Studio Lighting Environment
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {envOptions.map((env) => {
                      const isSelected = environment === env.id;
                      const Icon = env.icon;
                      return (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => setEnvironment(env.id)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                            isSelected
                              ? 'bg-white text-black font-medium border-white shadow-md'
                              : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-[11px]">{env.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Headlights Toggle & Drive Simulation */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  {/* Headlights */}
                  <button
                    type="button"
                    onClick={toggleHeadlights}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      headlightsOn
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                        : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Headlights {headlightsOn ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Cinematic Drive Mode */}
                  <button
                    type="button"
                    onClick={toggleDriving}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isDriving
                        ? 'bg-red-500/90 text-white shadow-lg animate-pulse'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                    }`}
                  >
                    {isDriving ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>STOP</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>START DRIVE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
