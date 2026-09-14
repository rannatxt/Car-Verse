import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ProceduralRoad – generates an infinite straight road using repeated segments.
 * Each segment includes asphalt and curb geometry created via Shape extrusion.
 * The road moves with the car's Z position (window.carPositionZ) to give the illusion
 * of an endless highway.
 */
interface ProceduralRoadProps {
  segmentLength?: number;
  segmentCount?: number;
  roadWidth?: number;
}

export const ProceduralRoad: React.FC<ProceduralRoadProps> = ({
  segmentLength = 200,
  segmentCount = 12,
  roadWidth = 30,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Build a single road segment geometry (asphalt + curbs)
  const segmentGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Asphalt rectangle
    shape.moveTo(-roadWidth / 2, 0);
    shape.lineTo(roadWidth / 2, 0);
    shape.lineTo(roadWidth / 2, segmentLength);
    shape.lineTo(-roadWidth / 2, segmentLength);
    shape.lineTo(-roadWidth / 2, 0);
    // Add curbs on left and right (simple extensions)
    const curbWidth = 1.2;
    // Left curb
    shape.moveTo(-roadWidth / 2 - curbWidth, 0);
    shape.lineTo(-roadWidth / 2, 0);
    shape.lineTo(-roadWidth / 2, segmentLength);
    shape.lineTo(-roadWidth / 2 - curbWidth, segmentLength);
    shape.lineTo(-roadWidth / 2 - curbWidth, 0);
    // Right curb
    shape.moveTo(roadWidth / 2, 0);
    shape.lineTo(roadWidth / 2 + curbWidth, 0);
    shape.lineTo(roadWidth / 2 + curbWidth, segmentLength);
    shape.lineTo(roadWidth / 2, segmentLength);
    shape.lineTo(roadWidth / 2, 0);

    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  }, [roadWidth, segmentLength]);

  const asphaltMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2f2f2f',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const segments = useMemo(() => {
    return Array.from({ length: segmentCount }, (_, i) => i);
  }, [segmentCount]);

  useFrame(() => {
    const carZ = (window as any).carPositionZ ?? 0;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, idx) => {
      const segIdx = idx;
      const targetZ = segIdx * segmentLength + Math.floor(carZ / segmentLength) * segmentLength;
      child.position.set(0, 0, targetZ);
    });
  });

  return (
    <group ref={groupRef}>
      {segments.map((i) => (
        <mesh key={i} geometry={segmentGeometry} material={asphaltMaterial} receiveShadow castShadow />
      ))}
    </group>
  );
};
