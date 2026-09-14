import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TireVFXProps {
  isSkidding: boolean;
  leftTirePos: THREE.Vector3;
  rightTirePos: THREE.Vector3;
  carVelocity: THREE.Vector3;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const MAX_SKID_POINTS = 240;
const MAX_PARTICLES = 50;

export const TireVFX: React.FC<TireVFXProps> = ({
  isSkidding,
  leftTirePos,
  rightTirePos,
  carVelocity,
}) => {
  // --- Skid marks ribbon ---
  const leftPositions = useRef<number[]>([]);
  const rightPositions = useRef<number[]>([]);
  const lastEmitPos = useRef<THREE.Vector3>(new THREE.Vector3());

  const leftGeoRef = useRef<THREE.BufferGeometry>(null);
  const rightGeoRef = useRef<THREE.BufferGeometry>(null);

  // Pre-allocated static buffers for skid lines (avoids per-frame garbage collection)
  const leftBuffer = useMemo(() => new Float32Array(MAX_SKID_POINTS * 6), []);
  const rightBuffer = useMemo(() => new Float32Array(MAX_SKID_POINTS * 6), []);
  const leftCount = useRef<number>(0);
  const rightCount = useRef<number>(0);

  // Initialize geometries once
  useEffect(() => {
    if (leftGeoRef.current) {
      leftGeoRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(leftBuffer, 3)
      );
      leftGeoRef.current.setDrawRange(0, 0);
    }
    if (rightGeoRef.current) {
      rightGeoRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(rightBuffer, 3)
      );
      rightGeoRef.current.setDrawRange(0, 0);
    }
  }, [leftBuffer, rightBuffer]);

  // --- Smoke particles ---
  const particles = useRef<Particle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  useFrame((_, delta) => {
    // 1. Skid marks recording
    const dist = lastEmitPos.current.distanceTo(leftTirePos);
    if (isSkidding && dist > 0.35) {
      lastEmitPos.current.copy(leftTirePos);

      // Left skid line
      if (leftPositions.current.length >= 6) {
        const prevX = leftPositions.current[leftPositions.current.length - 3];
        const prevY = leftPositions.current[leftPositions.current.length - 2];
        const prevZ = leftPositions.current[leftPositions.current.length - 1];
        leftPositions.current.push(prevX, prevY, prevZ, leftTirePos.x, leftTirePos.y + 0.02, leftTirePos.z);
      } else {
        leftPositions.current.push(leftTirePos.x, leftTirePos.y + 0.02, leftTirePos.z, leftTirePos.x, leftTirePos.y + 0.02, leftTirePos.z);
      }

      // Right skid line
      if (rightPositions.current.length >= 6) {
        const prevX = rightPositions.current[rightPositions.current.length - 3];
        const prevY = rightPositions.current[rightPositions.current.length - 2];
        const prevZ = rightPositions.current[rightPositions.current.length - 1];
        rightPositions.current.push(prevX, prevY, prevZ, rightTirePos.x, rightTirePos.y + 0.02, rightTirePos.z);
      } else {
        rightPositions.current.push(rightTirePos.x, rightTirePos.y + 0.02, rightTirePos.z, rightTirePos.x, rightTirePos.y + 0.02, rightTirePos.z);
      }

      // Limit array size
      if (leftPositions.current.length > MAX_SKID_POINTS * 6) {
        leftPositions.current.splice(0, 12);
        rightPositions.current.splice(0, 12);
      }

      // Copy into pre-allocated typed arrays
      const lenL = leftPositions.current.length;
      for (let i = 0; i < lenL; i++) {
        leftBuffer[i] = leftPositions.current[i];
      }
      leftCount.current = lenL / 3;

      const lenR = rightPositions.current.length;
      for (let i = 0; i < lenR; i++) {
        rightBuffer[i] = rightPositions.current[i];
      }
      rightCount.current = lenR / 3;

      if (leftGeoRef.current) {
        const attr = leftGeoRef.current.getAttribute('position') as THREE.BufferAttribute;
        if (attr) attr.needsUpdate = true;
        leftGeoRef.current.setDrawRange(0, leftCount.current);
      }
      if (rightGeoRef.current) {
        const attr = rightGeoRef.current.getAttribute('position') as THREE.BufferAttribute;
        if (attr) attr.needsUpdate = true;
        rightGeoRef.current.setDrawRange(0, rightCount.current);
      }

      // 2. Spawn smoke particles
      if (particles.current.length < MAX_PARTICLES) {
        // Left tire puff
        particles.current.push({
          position: leftTirePos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.1, (Math.random() - 0.5) * 0.2)),
          velocity: new THREE.Vector3(
            carVelocity.x * 0.15 + (Math.random() - 0.5) * 0.5,
            0.5 + Math.random() * 0.8,
            carVelocity.z * 0.15 + (Math.random() - 0.5) * 0.5
          ),
          scale: 0.35 + Math.random() * 0.2,
          opacity: 0.6,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.4,
        });

        // Right tire puff
        particles.current.push({
          position: rightTirePos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.1, (Math.random() - 0.5) * 0.2)),
          velocity: new THREE.Vector3(
            carVelocity.x * 0.15 + (Math.random() - 0.5) * 0.5,
            0.5 + Math.random() * 0.8,
            carVelocity.z * 0.15 + (Math.random() - 0.5) * 0.5
          ),
          scale: 0.35 + Math.random() * 0.2,
          opacity: 0.6,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.4,
        });
      }
    }

    // Update smoke particles
    const activeParticles: Particle[] = [];
    particles.current.forEach((p) => {
      p.life += delta;
      if (p.life < p.maxLife) {
        p.position.addScaledVector(p.velocity, delta);
        p.scale += delta * 1.5;
        p.opacity = Math.max(0, 0.6 * (1 - p.life / p.maxLife));
        activeParticles.push(p);
      }
    });
    particles.current = activeParticles;

    // Update instanced mesh transforms
    if (instancedMeshRef.current) {
      particles.current.forEach((p, i) => {
        dummy.position.copy(p.position);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        instancedMeshRef.current?.setMatrixAt(i, dummy.matrix);
      });

      // Hide unused instances
      for (let i = particles.current.length; i < MAX_PARTICLES; i++) {
        dummy.position.set(0, -9999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        instancedMeshRef.current?.setMatrixAt(i, dummy.matrix);
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Skid marks line segments */}
      <lineSegments>
        <bufferGeometry ref={leftGeoRef} />
        <lineBasicMaterial color="#1a1a1e" linewidth={3} transparent opacity={0.8} />
      </lineSegments>

      <lineSegments>
        <bufferGeometry ref={rightGeoRef} />
        <lineBasicMaterial color="#1a1a1e" linewidth={3} transparent opacity={0.8} />
      </lineSegments>

      {/* Smoke particle instances */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, MAX_PARTICLES]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial
          color="#d1d5db"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
};
