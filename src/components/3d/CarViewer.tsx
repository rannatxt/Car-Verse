import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useCar } from '../../context/CarContext';
import { CarModel } from './CarModel';
import { StudioEnvironment } from './StudioEnvironment';
import { CameraRig } from './CameraRig';
import { Hotspots } from './Hotspots';

interface CarViewerProps {
  isExploreMode?: boolean;
}

export const CarViewer: React.FC<CarViewerProps> = ({ isExploreMode = true }) => {
  const { selectedCar, customization, setActiveHotspot, activeHotspot } = useCar();

  return (
    <div className="relative w-full h-full select-none cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [4.2, 1.8, 4.2], fov: 40, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          {/* Studio Lighting & Dynamic Shadows */}
          <StudioEnvironment
            environment={customization.environment}
            isDriving={customization.isDriving}
          />

          {/* Interactive Car Model */}
          <CarModel
            key={selectedCar.id}
            vehicle={selectedCar}
            customization={customization}
          />

          {/* Interactive 3D Hotspots */}
          <Hotspots
            hotspots={selectedCar.hotspots}
            activeHotspotId={customization.activeHotspotId}
            onSelectHotspot={setActiveHotspot}
            visible={isExploreMode && !customization.isDriving}
          />

          {/* Cinematic Smooth Camera Controller */}
          <CameraRig
            preset={customization.cameraPreset}
            activeHotspot={activeHotspot}
            isDriving={customization.isDriving}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
