import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Vehicle, VehicleCategory, CameraPreset, EnvironmentMode, CustomizationState, Hotspot } from '../types/car';
import { CARS_DATA, CALIPER_OPTIONS } from '../data/cars';

interface CarContextType {
  selectedCar: Vehicle;
  selectedCategory: VehicleCategory;
  selectCar: (carId: string) => void;
  selectCategory: (category: VehicleCategory) => void;
  
  // Customization
  customization: CustomizationState;
  setColorId: (colorId: string) => void;
  setWheelId: (wheelId: string) => void;
  setCaliperId: (caliperId: string) => void;
  toggleHeadlights: () => void;
  setEnvironment: (env: EnvironmentMode) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setActiveHotspot: (hotspotId: string | null) => void;
  toggleDriving: () => void;
  resetView: () => void;
  
  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Compare
  compareCarA: Vehicle;
  compareCarB: Vehicle;
  setCompareCarA: (car: Vehicle) => void;
  setCompareCarB: (car: Vehicle) => void;
  swapCompareCars: () => void;
  resetCompareCars: () => void;

  // Fullscreen
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // Active Hotspot Object
  activeHotspot: Hotspot | null;
}
const CarContext = createContext<CarContextType | undefined>(undefined);
const STORAGE_KEY = 'carverse_user_config_v1';

export const CarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved config from localStorage if available
  const savedConfig = React.useMemo(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const initialCar = React.useMemo(() => {
    if (savedConfig?.carId) {
      const found = CARS_DATA.find((c) => c.id === savedConfig.carId);
      if (found) return found;
    }
    return CARS_DATA[0];
  }, [savedConfig]);

  const [selectedCar, setSelectedCarState] = useState<Vehicle>(initialCar);
  const [selectedCategory, setSelectedCategoryState] = useState<VehicleCategory>(initialCar.category);

  // Customization State
  const [customization, setCustomization] = useState<CustomizationState>({
    selectedColorId: savedConfig?.colorId || initialCar.colors[0].id,
    selectedWheelId: savedConfig?.wheelId || initialCar.wheels[0].id,
    selectedCaliperId: savedConfig?.caliperId || CALIPER_OPTIONS[1].id,
    headlightsOn: savedConfig?.headlightsOn ?? true,
    environment: savedConfig?.environment || 'day',
    cameraPreset: 'three-quarter',
    activeHotspotId: null,
    isDriving: false,
  });

  // Save to localStorage whenever user configuration changes
  useEffect(() => {
    try {
      const configToSave = {
        carId: selectedCar.id,
        colorId: customization.selectedColorId,
        wheelId: customization.selectedWheelId,
        caliperId: customization.selectedCaliperId,
        headlightsOn: customization.headlightsOn,
        environment: customization.environment,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
    } catch (e) {
      console.warn('Failed to save carverse configuration to localStorage:', e);
    }
  }, [selectedCar.id, customization.selectedColorId, customization.selectedWheelId, customization.selectedCaliperId, customization.headlightsOn, customization.environment]);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compare State (Default comparing Apex R1 vs Volt GT)
  const [compareCarA, setCompareCarA] = useState<Vehicle>(CARS_DATA[0]); // Apex R1
  const [compareCarB, setCompareCarB] = useState<Vehicle>(CARS_DATA[7]); // Volt GT

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Synchronize fullscreen state with DOM
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Exit fullscreen failed:', err);
        });
      }
    }
  }, []);

  // Select Car
  const selectCar = useCallback((carId: string) => {
    const car = CARS_DATA.find((c) => c.id === carId);
    if (car) {
      setSelectedCarState(car);
      setSelectedCategoryState(car.category);
      setCustomization((prev) => ({
        ...prev,
        // Reset active hotspot and drive mode when switching car
        activeHotspotId: null,
        isDriving: false,
        cameraPreset: 'three-quarter',
      }));
    }
  }, []);

  // Select Category
  const selectCategory = useCallback((category: VehicleCategory) => {
    setSelectedCategoryState(category);
    const firstCarInCategory = CARS_DATA.find((c) => c.category === category);
    if (firstCarInCategory && selectedCar.category !== category) {
      setSelectedCarState(firstCarInCategory);
      setCustomization((prev) => ({
        ...prev,
        activeHotspotId: null,
        isDriving: false,
        cameraPreset: 'three-quarter',
      }));
    }
  }, [selectedCar.category]);

  const setColorId = useCallback((colorId: string) => {
    setCustomization((prev) => ({ ...prev, selectedColorId: colorId }));
  }, []);

  const setWheelId = useCallback((wheelId: string) => {
    setCustomization((prev) => ({ ...prev, selectedWheelId: wheelId }));
  }, []);

  const setCaliperId = useCallback((caliperId: string) => {
    setCustomization((prev) => ({ ...prev, selectedCaliperId: caliperId }));
  }, []);

  const toggleHeadlights = useCallback(() => {
    setCustomization((prev) => ({ ...prev, headlightsOn: !prev.headlightsOn }));
  }, []);

  const setEnvironment = useCallback((env: EnvironmentMode) => {
    setCustomization((prev) => ({ ...prev, environment: env }));
  }, []);

  const setCameraPreset = useCallback((preset: CameraPreset) => {
    setCustomization((prev) => ({
      ...prev,
      cameraPreset: preset,
      activeHotspotId: null, // Clear active hotspot if manually changing camera preset
    }));
  }, []);

  const setActiveHotspot = useCallback((hotspotId: string | null) => {
    setCustomization((prev) => ({
      ...prev,
      activeHotspotId: hotspotId,
    }));
  }, []);

  const toggleDriving = useCallback(() => {
    setCustomization((prev) => ({
      ...prev,
      isDriving: !prev.isDriving,
      activeHotspotId: null,
      cameraPreset: prev.isDriving ? 'three-quarter' : 'side',
    }));
  }, []);

  const resetView = useCallback(() => {
    setCustomization((prev) => ({
      ...prev,
      cameraPreset: 'three-quarter',
      activeHotspotId: null,
      isDriving: false,
    }));
  }, []);

  const swapCompareCars = useCallback(() => {
    setCompareCarA((prevA) => {
      setCompareCarB(prevA);
      return compareCarB;
    });
  }, [compareCarB]);

  const resetCompareCars = useCallback(() => {
    setCompareCarA(CARS_DATA[0]);
    setCompareCarB(CARS_DATA[7]);
  }, []);

  // Compute active hotspot object
  const activeHotspot = customization.activeHotspotId
    ? selectedCar.hotspots.find((h) => h.id === customization.activeHotspotId) || null
    : null;

  return (
    <CarContext.Provider
      value={{
        selectedCar,
        selectedCategory,
        selectCar,
        selectCategory,
        customization,
        setColorId,
        setWheelId,
        setCaliperId,
        toggleHeadlights,
        setEnvironment,
        setCameraPreset,
        setActiveHotspot,
        toggleDriving,
        resetView,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        compareCarA,
        compareCarB,
        setCompareCarA,
        setCompareCarB,
        swapCompareCars,
        resetCompareCars,
        isFullscreen,
        toggleFullscreen,
        activeHotspot,
      }}
    >
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
};
