export type VehicleCategory = 'SPORTS' | 'LUXURY' | 'SUV' | 'EV' | 'CONCEPT';

export type CameraPreset = 'three-quarter' | 'front' | 'side' | 'rear' | 'top' | 'interior';

export type EnvironmentMode = 'day' | 'sunset' | 'night';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  metallic: number;
  roughness: number;
  clearcoat: number;
}

export interface WheelOption {
  id: string;
  name: string;
  description: string;
  rimColor: string;
  spokeCount: number;
  style: 'sport' | 'performance' | 'classic' | 'aero';
}

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
}

export interface Hotspot {
  id: string;
  name: string;
  category: 'engine' | 'interior' | 'wheels' | 'headlights' | 'aerodynamics';
  description: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  target: [number, number, number];
}

export interface VehicleSpecs {
  horsepower: number;
  torque: number; // Nm
  acceleration: string; // "3.6s"
  topSpeed: string; // "290 km/h"
  range: string; // "520 km"
  weight: string; // "1,520 kg"
  driveType: string; // "All-Wheel Drive (AWD)"
  transmission: string; // "8-Speed Dual-Clutch"
}

export interface ProceduralShapeConfig {
  bodyLength: number;
  bodyWidth: number;
  bodyHeight: number;
  rideHeight: number;
  wheelRadius: number;
  wheelWidth: number;
  hasSpoiler: boolean;
  spoilerHeight?: number;
  hasRoofRails: boolean;
  roofCurvature: number; // 0 (boxier/SUV) to 1 (streamlined fastback)
  frontGrilleStyle: 'aggressive' | 'chrome-horizontal' | 'closed-ev' | 'hyper-splitter';
  exhaustType: 'quad' | 'dual' | 'none'; // none for EV
  accentStripe?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  modelNumber: string; // "01", "02", etc.
  modelPath: string; // "/models/apex-r1.glb"
  tagline: string;
  description: string;
  specs: VehicleSpecs;
  basePrice: string;
  colors: ColorOption[];
  wheels: WheelOption[];
  features: string[];
  hotspots: Hotspot[];
  shapeConfig: ProceduralShapeConfig;
}

export interface CustomizationState {
  selectedColorId: string;
  selectedWheelId: string;
  selectedCaliperId: string;
  headlightsOn: boolean;
  environment: EnvironmentMode;
  cameraPreset: CameraPreset;
  activeHotspotId: string | null;
  isDriving: boolean;
}
