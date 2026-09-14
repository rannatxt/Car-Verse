import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Maximize2, Minimize2, Menu, X, Compass, Sliders, SplitSquareHorizontal, Info, Gamepad2 } from 'lucide-react';
import { useCar } from '../../context/CarContext';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { selectedCar, isFullscreen, toggleFullscreen, setIsSearchOpen } = useCar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Showroom', icon: Compass },
    { to: '/drive', label: 'Bengaluru Drive', icon: Gamepad2, badge: 'GAME' },
    { to: '/studio', label: 'Studio', icon: Sliders },
    { to: '/compare', label: 'Compare', icon: SplitSquareHorizontal },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* ================= BRAND LOGO ================= */}
        <Link
          to="/"
          className="pointer-events-auto flex items-center space-x-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-automotive uppercase text-white drop-shadow-sm">
              CARVERSE
            </span>
            <span className="text-[9px] tracking-widest text-neutral-400 font-mono">
              3D STUDIO
            </span>
          </div>
        </Link>

        {/* ================= DESKTOP NAV LINKS (iOS Pill) ================= */}
        <nav className="pointer-events-auto hidden md:flex items-center p-1 rounded-full ios-glass">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/15 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {'badge' in link && link.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-500/40 text-[8px] font-bold tracking-wider text-emerald-400 uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT CONTROLS ================= */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {/* iOS Dynamic Island Status Indicator (Desktop only) */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full ios-glass text-[11px] font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">{selectedCar.name}</span>
            <span className="text-neutral-500">•</span>
            <span>{selectedCar.specs.horsepower} HP</span>
          </div>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full ios-glass text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            title="Search Vehicles (Ctrl+K)"
            aria-label="Search Vehicles"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-9 h-9 rounded-full ios-glass text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full ios-glass text-neutral-300 hover:text-white focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 p-4 rounded-2xl ios-glass animate-in fade-in duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
