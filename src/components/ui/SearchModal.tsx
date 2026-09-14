import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Search, X, Zap, ChevronRight } from 'lucide-react';
import { useCar } from '../../context/CarContext';
import { CARS_DATA } from '../../data/cars';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, selectCar } = useCar();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Filter vehicles
  const filteredCars = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CARS_DATA;
    return CARS_DATA.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.features.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl rounded-3xl ios-glass border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model, category (Sports, EV, SUV), specs..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-neutral-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/10 text-neutral-300 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Quick Filter Tag Suggestions */}
        <div className="flex items-center space-x-2 px-4 py-2.5 bg-black/30 border-b border-white/5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-neutral-500 font-mono text-[10px] uppercase mr-1">Quick:</span>
          {['Sports', 'Luxury', 'SUV', 'EV', 'Concept', 'Apex', 'Volt'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors text-[11px] whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <button
                key={car.id}
                type="button"
                onClick={() => {
                  selectCar(car.id);
                  setIsSearchOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xs uppercase text-white group-hover:scale-105 transition-transform">
                    {car.modelNumber}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white uppercase tracking-tight">
                        {car.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                        {car.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-light">
                      {car.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right">
                  <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                    <span className="text-white flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-400 inline" />
                      <span>{car.specs.horsepower} HP</span>
                    </span>
                    <span className="text-neutral-400 text-[10px]">{car.specs.acceleration} (0-100)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-neutral-400">
              <p className="text-sm">No vehicles found matching "{query}"</p>
              <p className="text-xs text-neutral-500 mt-1">
                Try searching for category names like Sports, EV, or SUV
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
