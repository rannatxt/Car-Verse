import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type CameraMode = 'chase' | 'close' | 'cockpit' | 'cinematic';

export const CAMERA_MODES: { id: CameraMode; label: string; desc: string }[] = [
  { id: 'chase', label: 'Third-Person Chase', desc: 'Dynamic following camera with drift lag' },
  { id: 'close', label: 'Close Chase', desc: 'Low-slung aggressive rear view' },
  { id: 'cockpit', label: 'Cockpit Camera', desc: "Driver's cockpit POV with clear view of the road" },
  { id: 'cinematic', label: 'Cinematic Camera', desc: 'Wide dramatic dynamic driving view' },
];

interface DrivingCameraProps {
  carRef?: React.MutableRefObject<THREE.Group | null>;
  carPosition: THREE.Vector3;
  carHeading: number;
  carSpeedKmh: number;
  mode: CameraMode;
}

export const DrivingCamera: React.FC<DrivingCameraProps> = ({
  carRef,
  carPosition,
  carHeading,
  carSpeedKmh,
  mode,
}) => {
  const { camera } = useThree();
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, -15));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const shakeTimer = useRef<number>(0);
  const isInitialized = useRef<boolean>(false);

  // Pre-allocated reusable vectors for zero-garbage 60-120fps camera loop
  const localOffset = useRef(new THREE.Vector3());
  const localLookAt = useRef(new THREE.Vector3());
  const targetCameraPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);

    // Prefer direct live 60fps matrix position/heading from carRef to bypass React state throttling
    const livePos = carRef?.current ? carRef.current.position : carPosition;
    const liveHeading = carRef?.current ? carRef.current.rotation.y : carHeading;

    // Forward and Right direction vectors from car heading
    const sinH = Math.sin(liveHeading);
    const cosH = Math.cos(liveHeading);

    let lerpSpeed = 12.0;

    switch (mode) {
      case 'close':
        // Close athletic rear chase
        localOffset.current.set(0, 1.45, -4.2);
        localLookAt.current.set(0, 0.75, 1.0);
        lerpSpeed = 16.0;
        break;

      case 'cockpit':
        // Driver's Cockpit POV — eye level inside the cabin looking through the windshield
        // X=0.22 (driver-side offset), Y=1.08 (eye height above car base), Z=0.75 (forward in cabin)
        // LookAt Y=1.0 keeps gaze level with road horizon far ahead
        localOffset.current.set(0.22, 1.08, 0.75);
        localLookAt.current.set(0.22, 1.0, 80.0);
        lerpSpeed = 100.0;
        break;

      case 'cinematic':
        // Wide dramatic dynamic angle
        localOffset.current.set(3.6, 1.5, -5.2);
        localLookAt.current.set(0, 0.75, 0.8);
        lerpSpeed = 10.0;
        break;

      case 'chase':
      default:
        // Third-Person Chase (default with dynamic distance lag)
        const speedBackPush = Math.min(2.0, (carSpeedKmh / 260) * 1.8);
        localOffset.current.set(0, 1.85 + speedBackPush * 0.1, -5.8 - speedBackPush);
        localLookAt.current.set(0, 0.75, 1.0);
        lerpSpeed = 12.0;
        break;
    }

    // Transform local offset to world position using heading
    const worldOffX = localOffset.current.x * cosH + localOffset.current.z * sinH;
    const worldOffZ = -localOffset.current.x * sinH + localOffset.current.z * cosH;

    const lookOffX = localLookAt.current.x * cosH + localLookAt.current.z * sinH;
    const lookOffZ = -localLookAt.current.x * sinH + localLookAt.current.z * cosH;

    targetCameraPos.current.set(
      livePos.x + worldOffX,
      livePos.y + localOffset.current.y,
      livePos.z + worldOffZ
    );

    targetLookAt.current.set(
      livePos.x + lookOffX,
      livePos.y + localLookAt.current.y,
      livePos.z + lookOffZ
    );

    // Instantly sync camera on first frame to eliminate startup lag
    if (!isInitialized.current) {
      currentPos.current.copy(targetCameraPos.current);
      currentLookAt.current.copy(targetLookAt.current);
      isInitialized.current = true;
    }

    // Subtle High-Speed Camera Shake (Speed > 90 km/h) - Chase modes only
    if (carSpeedKmh > 90 && mode !== 'cockpit') {
      shakeTimer.current += dt * 35;
      const shakeIntensity = Math.min(0.04, ((carSpeedKmh - 90) / 220) * 0.04);
      const shakeX = Math.sin(shakeTimer.current) * shakeIntensity;
      const shakeY = Math.cos(shakeTimer.current * 1.3) * (shakeIntensity * 0.7);
      targetCameraPos.current.x += shakeX;
      targetCameraPos.current.y += shakeY;
    }

    if (mode === 'cockpit') {
      // Cockpit mode is 100% rigidly attached inside windshield with zero lag
      currentPos.current.copy(targetCameraPos.current);
      currentLookAt.current.copy(targetLookAt.current);
    } else {
      // Smooth exponential damping for chase & cinematic cameras
      const posAlpha = 1.0 - Math.exp(-lerpSpeed * dt);
      const lookAlpha = 1.0 - Math.exp(-(lerpSpeed + 2.5) * dt);

      currentPos.current.lerp(targetCameraPos.current, posAlpha);
      currentLookAt.current.lerp(targetLookAt.current, lookAlpha);
    }

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
