import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, Layers, Sparkles, ShieldCheck } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-4xl mx-auto flex flex-col justify-center">
      <div className="p-8 sm:p-12 rounded-3xl ios-glass border border-white/15 shadow-2xl">
        {/* Brand Header */}
        <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase mb-2 block">
          Automotive Digital Experience
        </span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-4">
          CARVERSE
        </h1>
        <p className="text-lg sm:text-xl text-neutral-300 font-light leading-relaxed mb-8">
          An interactive exploration of automotive design, engineering excellence, and next-generation WebGL experiences.
        </p>

        {/* Tech Stack Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm mb-1">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Real-Time 3D Rendering</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Powered by Three.js and React Three Fiber with custom PBR clearcoat shaders, multi-tier studio lighting, and smooth damping OrbitControls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Procedural Vehicle Engine</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Modular 3D geometry generator that dynamically shapes Sports, Luxury, SUV, EV, and Concept cars with zero external dependency risks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm mb-1">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>iOS Theme Pack UI</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tailored with Apple SF-style typography, frosted glass materials, tactile spring animations, and minimalist automotive telemetry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Production & Vercel Ready</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Zero-configuration SPA routing, lightning-fast Vite build, responsive from mobile to 4K displays, and strict TypeScript safety.
            </p>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-500">
            Version 1.0.0 • Production Build
          </span>
          <Link
            to="/"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors shadow-lg"
          >
            <span>Enter Showroom</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
