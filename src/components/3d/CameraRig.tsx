import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CameraPreset, Hotspot } from '../../types/car';

interface CameraRigProps {
  preset: CameraPreset;
  activeHotspot: Hotspot | null;
  isDriving: boolean;
}

const PRESET_COORDINATES: Record<
  CameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  'three-quarter': {
    position: [4.2, 1.8, 4.2],
    target: [0, 0.45, 0],
  },
  front: {
    position: [0, 0.95, 4.6],
    target: [0, 0.45, 0],
  },
  side: {
    position: [5.4, 1.15, 0],
    target: [0, 0.45, 0],
  },
  rear: {
    position: [0, 1.1, -4.6],
    target: [0, 0.45, 0],
  },
  top: {
    position: [0, 6.8, 0.01],
    target: [0, 0.45, 0],
  },
  interior: {
    position: [-0.18, 1.05, 0.05],
    target: [0, 0.95, 0.7],
  },
};

export const CameraRig: React.FC<CameraRigProps> = ({ preset, activeHotspot, isDriving }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const isTransitioningRef = useRef<boolean>(true);

  // Determine desired position and target based on active hotspot or preset
  const { targetPosition, targetLookAt } = useMemo(() => {
    if (activeHotspot) {
      return {
        targetPosition: new THREE.Vector3(...activeHotspot.cameraPosition),
        targetLookAt: new THREE.Vector3(...activeHotspot.target),
      };
    }
    const coords = PRESET_COORDINATES[preset] || PRESET_COORDINATES['three-quarter'];
    return {
      targetPosition: new THREE.Vector3(...coords.position),
      targetLookAt: new THREE.Vector3(...coords.target),
    };
  }, [preset, activeHotspot]);

  // When preset or hotspot changes, mark as transitioning
  useEffect(() => {
    isTransitioningRef.current = true;
  }, [preset, activeHotspot]);

  // Smooth lerp camera and controls target in animation frame
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioningRef.current) {
      // Smooth lerp factor adjusted for frame delta
      const factor = Math.min(delta * 4.5, 0.12);

      camera.position.lerp(targetPosition, factor);
      controlsRef.current.target.lerp(targetLookAt, factor);
      controlsRef.current.update();

      // Check if close enough to hand over complete manual control to user
      const distPos = camera.position.distanceTo(targetPosition);
      const distTarget = controlsRef.current.target.distanceTo(targetLookAt);

      if (distPos < 0.02 && distTarget < 0.02) {
        isTransitioningRef.current = false;
      }
    } else {
      // Subtle dynamic camera tracking during driving mode
      if (isDriving) {
        camera.position.x += Math.sin(Date.now() * 0.001) * 0.0008;
      }
      controlsRef.current.update();
    }
  });

  const isInterior = preset === 'interior' || activeHotspot?.category === 'interior';

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={0.9}
      panSpeed={0.8}
      minDistance={isInterior ? 0.05 : 1.4}
      maxDistance={isInterior ? 2.5 : 8.8}
      maxPolarAngle={isInterior ? Math.PI : Math.PI / 2 - 0.02} // Prevent dropping below studio floor
      minPolarAngle={0.05}
      onStart={() => {
        // If user manually drags/interacts, stop automatic preset transition
        isTransitioningRef.current = false;
      }}
    />
  );
};
