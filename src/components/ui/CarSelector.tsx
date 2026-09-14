import React from 'react';
import { useCar } from '../../context/CarContext';
import { CARS_DATA, CATEGORIES } from '../../data/cars';
import { VehicleCategory } from '../../types/car';

export const CarSelector: React.FC = () => {
  const { selectedCar, selectedCategory, selectCar, selectCategory } = useCar();

  // Filter cars matching active category
  const activeCategoryCars = CARS_DATA.filter((car) => car.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto pointer-events-auto flex flex-col items-center space-y-3">
      {/* ================= CATEGORY PILLS ================= */}
      <div className="flex items-center p-1 rounded-full ios-glass space-x-1 shadow-xl overflow-x-auto max-w-full no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id as VehicleCategory)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 whitespace-nowrap focus:outline-none ${
                isSelected
                  ? 'bg-white text-black shadow-md scale-105'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= MODEL SELECTOR NUMBERED CARDS ================= */}
      <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto">
        {activeCategoryCars.map((car) => {
          const isSelected = selectedCar.id === car.id;
          return (
            <button
              key={car.id}
              type="button"
              onClick={() => selectCar(car.id)}
              className={`group relative flex flex-col p-3 sm:px-5 sm:py-3 rounded-2xl transition-all duration-200 text-left border focus:outline-none ${
                isSelected
                  ? 'bg-white/20 border-white/60 shadow-xl scale-102 backdrop-blur-2xl'
                  : 'ios-glass border-white/10 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {/* Active Indicator Top Light */}
              {isSelected && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white shadow-[0_0_8px_white] rounded-full" />
              )}

              {/* Number and Category */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono tracking-widest ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                  {car.modelNumber}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                  {car.specs.horsepower} HP
                </span>
              </div>

              {/* Vehicle Name */}
              <span className={`text-xs sm:text-sm font-bold uppercase tracking-tight ${isSelected ? 'text-white' : 'text-neutral-200 group-hover:text-white'}`}>
                {car.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
