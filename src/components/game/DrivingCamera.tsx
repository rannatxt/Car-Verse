import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type CameraMode = 'chase' | 'close' | 'hood' | 'cockpit' | 'cinematic';

export const CAMERA_MODES: { id: CameraMode; label: string; desc: string }[] = [
  { id: 'chase', label: 'Third-Person Chase', desc: 'Dynamic following camera with drift lag' },
  { id: 'close', label: 'Close Chase', desc: 'Low-slung aggressive rear view' },
  { id: 'hood', label: 'Hood Camera', desc: 'Bonnet perspective rushing over asphalt' },
  { id: 'cockpit', label: 'Cockpit Camera', desc: "Driver's cockpit POV behind the wheel" },
  { id: 'cinematic', label: 'Cinematic Camera', desc: 'Wide dramatic dynamic driving view' },
];

interface DrivingCameraProps {
  carPosition: THREE.Vector3;
  carHeading: number;
  carSpeedKmh: number;
  mode: CameraMode;
}

export const DrivingCamera: React.FC<DrivingCameraProps> = ({
  carPosition,
  carHeading,
  carSpeedKmh,
  mode,
}) => {
  const { camera } = useThree();
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, -15));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const shakeTimer = useRef<number>(0);

  // Pre-allocated reusable vectors for zero-garbage 60-120fps camera loop
  const localOffset = useRef(new THREE.Vector3());
  const localLookAt = useRef(new THREE.Vector3());
  const targetCameraPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);

    // Forward and Right direction vectors from car heading
    const sinH = Math.sin(carHeading);
    const cosH = Math.cos(carHeading);

    let lerpSpeed = 8.5;

    switch (mode) {
      case 'close':
        // Close athletic rear chase
        localOffset.current.set(0, 1.65, -4.6);
        localLookAt.current.set(0, 1.1, 5.0);
        lerpSpeed = 11.0;
        break;

      case 'hood':
        // Bonnet camera
        localOffset.current.set(0, 1.05, 1.45);
        localLookAt.current.set(0, 0.95, 20.0);
        lerpSpeed = 22.0;
        break;

      case 'cockpit':
        // Driver's Cockpit POV (Eye level, seated inside Ferrari steering wheel)
        localOffset.current.set(0.35, 1.18, 0.28);
        localLookAt.current.set(0.35, 1.10, 22.0);
        lerpSpeed = 16.0;
        break;

      case 'cinematic':
        // Wide dramatic dynamic angle
        localOffset.current.set(4.5, 2.2, -6.8);
        localLookAt.current.set(0, 1.0, 2.5);
        lerpSpeed = 5.0;
        break;

      case 'chase':
      default:
        // Third-Person Chase (default with dynamic distance lag)
        const speedBackPush = Math.min(2.2, (carSpeedKmh / 260) * 2.2);
        localOffset.current.set(0, 2.35 + speedBackPush * 0.12, -6.5 - speedBackPush);
        localLookAt.current.set(0, 1.15, 5.5);
        lerpSpeed = 9.0;
        break;
    }

    // Transform local offset to world position using heading
    const worldOffX = localOffset.current.x * cosH + localOffset.current.z * sinH;
    const worldOffZ = -localOffset.current.x * sinH + localOffset.current.z * cosH;

    const lookOffX = localLookAt.current.x * cosH + localLookAt.current.z * sinH;
    const lookOffZ = -localLookAt.current.x * sinH + localLookAt.current.z * cosH;

    targetCameraPos.current.set(
      carPosition.x + worldOffX,
      carPosition.y + localOffset.current.y,
      carPosition.z + worldOffZ
    );

    targetLookAt.current.set(
      carPosition.x + lookOffX,
      carPosition.y + localLookAt.current.y,
      carPosition.z + lookOffZ
    );

    // Subtle High-Speed Camera Shake (Speed > 90 km/h)
    if (carSpeedKmh > 90) {
      shakeTimer.current += dt * 35;
      const shakeIntensity = Math.min(0.04, ((carSpeedKmh - 90) / 220) * 0.04);
      const shakeX = Math.sin(shakeTimer.current) * shakeIntensity;
      const shakeY = Math.cos(shakeTimer.current * 1.3) * (shakeIntensity * 0.7);
      targetCameraPos.current.x += shakeX;
      targetCameraPos.current.y += shakeY;
    }

    // Smooth exponential damping eliminates jitter across variable delta times
    const posAlpha = 1.0 - Math.exp(-lerpSpeed * dt);
    const lookAlpha = 1.0 - Math.exp(-(lerpSpeed + 2.5) * dt);

    currentPos.current.lerp(targetCameraPos.current, posAlpha);
    currentLookAt.current.lerp(targetLookAt.current, lookAlpha);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic High-Speed FOV widening for exhilaration
    if ('fov' in camera) {
      const perspCam = camera as THREE.PerspectiveCamera;
      const targetFov = 60 + Math.min(12, (carSpeedKmh / 280) * 12);
      perspCam.fov = THREE.MathUtils.lerp(perspCam.fov, targetFov, dt * 4);
      perspCam.updateProjectionMatrix();
    }
  });

  return null;
};
