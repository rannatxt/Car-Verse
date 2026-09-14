import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SegmentProps {
  length?: number;
  width?: number;
  index: number;
}

const RoadSegment: React.FC<SegmentProps> = ({ length = 100, width = 30, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#222" roughness={0.8} metalness={0.2} />
    </mesh>
  );
};

interface InfiniteRoadProps {
  segmentLength?: number;
  segmentCount?: number;
  roadWidth?: number;
}

export const InfiniteRoad: React.FC<InfiniteRoadProps> = ({
  segmentLength = 200,
  segmentCount = 5,
  roadWidth = 30,
}) => {
  const segments = useMemo(() => Array.from({ length: segmentCount }, (_, i) => i), [segmentCount]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Access car Z position from global telemetry (window.carPositionZ) if set by controller
    const carZ = (window as any).carPositionZ ?? 0;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, idx) => {
      const mesh = child as THREE.Mesh;
      const segIdx = idx;
      const targetZ = segIdx * segmentLength + Math.floor(carZ / segmentLength) * segmentLength;
      mesh.position.set(0, 0, targetZ);
    });
  });

  return (
    <group ref={groupRef}>
      {segments.map((i) => (
        <RoadSegment key={i} index={i} length={segmentLength} width={roadWidth} />
      ))}
    </group>
  );
};
