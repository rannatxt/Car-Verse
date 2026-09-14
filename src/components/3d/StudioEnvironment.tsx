import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { EnvironmentMode } from '../../types/car';

interface StudioEnvironmentProps {
  environment: EnvironmentMode;
  isDriving: boolean;
}

export const StudioEnvironment: React.FC<StudioEnvironmentProps> = ({ environment, isDriving }) => {
  const gridLinesRef = useRef<THREE.Group>(null);

  // Animate studio floor grid lines during driving mode
  useFrame((_, delta) => {
    if (isDriving && gridLinesRef.current) {
      gridLinesRef.current.position.z += delta * 8;
      if (gridLinesRef.current.position.z > 2) {
        gridLinesRef.current.position.z -= 4;
      }
    }
  });

  return (
    <>
      {/* ==================== LIGHTING RIG ==================== */}
      {environment === 'day' && (
        <>
          <ambientLight intensity={0.8} color="#ffffff" />
          {/* Main Key Light */}
          <directionalLight
            position={[6, 8, 5]}
            intensity={2.2}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          {/* Fill Light (Soft cool automotive fill) */}
          <directionalLight position={[-6, 5, -4]} intensity={1.1} color="#cbd5e1" />
          {/* High Top Studio Diffuser */}
          <directionalLight position={[0, 10, 0]} intensity={1.4} color="#f8fafc" />
          {/* Rim / Edge Light */}
          <directionalLight position={[0, 4, -8]} intensity={2.8} color="#ffffff" />
        </>
      )}

      {environment === 'sunset' && (
        <>
          <ambientLight intensity={0.45} color="#431407" />
          {/* Warm Golden Key Light */}
          <directionalLight
            position={[8, 5, 4]}
            intensity={3.2}
            color="#f97316"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          {/* Complementary Cool Fill */}
          <directionalLight position={[-6, 4, -3]} intensity={0.8} color="#1e1b4b" />
          {/* Golden Rim Highlight */}
          <directionalLight position={[-2, 6, -7]} intensity={4.2} color="#fbbf24" />
          <directionalLight position={[0, 9, 2]} intensity={0.9} color="#fdba74" />
        </>
      )}

      {environment === 'night' && (
        <>
          <ambientLight intensity={0.15} color="#090d16" />
          {/* Overhead Dramatic Narrow Key */}
          <directionalLight
            position={[2, 9, 3]}
            intensity={1.2}
            color="#e0f2fe"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          {/* High-Contrast Crisp Rim Light */}
          <directionalLight position={[0, 4, -7]} intensity={4.5} color="#ffffff" />
          {/* Subtle Side Accent Light */}
          <directionalLight position={[-7, 2, 0]} intensity={1.6} color="#38bdf8" />
          <directionalLight position={[7, 2, 0]} intensity={1.4} color="#60a5fa" />
        </>
      )}

      {/* ==================== REALISTIC CONTACT SHADOWS ==================== */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={environment === 'night' ? 0.9 : 0.75}
        scale={12}
        blur={2.0}
        far={4.5}
        resolution={1024}
        color="#000000"
      />

      {/* ==================== STUDIO FLOOR PLATFORM ==================== */}
      {/* Main Studio Turntable / Circular Pedestal */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9.5, 64]} />
        <meshStandardMaterial
          color={environment === 'sunset' ? '#140c10' : '#08090d'}
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>

      {/* Outer Studio Floor Boundary Ring */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.45, 9.55, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={environment === 'night' ? 0.2 : 0.08}
          transparent
        />
      </mesh>

      {/* Subtle Concentric Rings on Studio Floor */}
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.2, 4.22, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={0.04}
          transparent
        />
      </mesh>
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.8, 6.82, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={0.03}
          transparent
        />
      </mesh>

      {/* Dynamic Floor Grid / Motion Speed Lines during Drive Mode */}
      {isDriving && (
        <group ref={gridLinesRef} position={[0, 0.002, 0]}>
          {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((z, idx) => (
            <mesh key={idx} position={[0, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[14, 0.04]} />
              <meshBasicMaterial color="#ffffff" opacity={0.12} transparent />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
};
