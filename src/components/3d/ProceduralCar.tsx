import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vehicle, CustomizationState } from '../../types/car';
import { CALIPER_OPTIONS } from '../../data/cars';

interface ProceduralCarProps {
  vehicle: Vehicle;
  customization: CustomizationState;
}

export const ProceduralCar: React.FC<ProceduralCarProps> = ({ vehicle, customization }) => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);

  const { shapeConfig, colors, wheels } = vehicle;
  const { selectedColorId, selectedWheelId, selectedCaliperId, headlightsOn, isDriving } = customization;

  const currentColor = useMemo(() => {
    return colors.find((c) => c.id === selectedColorId) || colors[0];
  }, [colors, selectedColorId]);

  const currentWheel = useMemo(() => {
    return wheels.find((w) => w.id === selectedWheelId) || wheels[0];
  }, [wheels, selectedWheelId]);

  const currentCaliperHex = useMemo(() => {
    const found = CALIPER_OPTIONS.find((c) => c.id === selectedCaliperId);
    return found ? found.hex : '#dc2626';
  }, [selectedCaliperId]);

  // High-End Automotive Materials
  const materials = useMemo(() => {
    const carPaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentColor.hex),
      metalness: currentColor.metallic,
      roughness: currentColor.roughness,
      clearcoat: currentColor.clearcoat,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      envMapIntensity: 1.8,
    });

    const carbon = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#16161a'),
      roughness: 0.35,
      metalness: 0.3,
    });

    const glossBlack = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#08080a'),
      roughness: 0.08,
      metalness: 0.8,
    });

    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      metalness: 0.98,
      roughness: 0.05,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0f172a'),
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.92,
      transparent: true,
      opacity: 0.92,
      ior: 1.54,
    });

    const headlightEmissive = new THREE.MeshStandardMaterial({
      color: new THREE.Color(headlightsOn ? '#ffffff' : '#94a3b8'),
      emissive: new THREE.Color(headlightsOn ? '#e0f2fe' : '#1e293b'),
      emissiveIntensity: headlightsOn ? 4.5 : 0.2,
      roughness: 0.2,
    });

    const taillightEmissive = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#dc2626'),
      emissiveIntensity: headlightsOn ? 4.0 : 0.6,
      roughness: 0.2,
    });

    const tireRubber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#141416'),
      roughness: 0.9,
      metalness: 0.05,
    });

    const rimMetal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentWheel.rimColor || '#cbd5e1'),
      metalness: 0.95,
      roughness: 0.12,
    });

    const brakeDisc = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      metalness: 0.9,
      roughness: 0.2,
    });

    const brakeCaliper = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentCaliperHex),
      metalness: 0.35,
      roughness: 0.2,
    });

    const interiorLeather = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e1e24'),
      roughness: 0.75,
      metalness: 0.1,
    });

    return {
      carPaint,
      carbon,
      glossBlack,
      chrome,
      glass,
      headlightEmissive,
      taillightEmissive,
      tireRubber,
      rimMetal,
      brakeDisc,
      brakeCaliper,
      interiorLeather,
    };
  }, [currentColor, currentWheel, currentCaliperHex, headlightsOn]);

  const { bodyLength, bodyWidth, bodyHeight, wheelRadius, wheelWidth, hasSpoiler } = shapeConfig;
  const frontAxleZ = bodyLength * 0.33;
  const rearAxleZ = -bodyLength * 0.33;
  const wheelX = bodyWidth * 0.52;
  const wheelY = wheelRadius;

  // Sculpted aerodynamic body curve using ExtrudeGeometry
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const l = bodyLength * 0.5;
    const h = bodyHeight * 0.85;

    // Start at bottom front nose
    shape.moveTo(l * 0.98, 0.05);
    // Front aerodynamic splitter curve
    shape.quadraticCurveTo(l * 0.95, h * 0.25, l * 0.7, h * 0.38);
    // Smooth hood slope upwards to windshield base
    shape.quadraticCurveTo(l * 0.45, h * 0.48, l * 0.25, h * 0.55);
    // Low-slung sloped windshield to roof peak
    shape.quadraticCurveTo(l * 0.05, h * 0.98, -l * 0.15, h * 0.96);
    // Fastback rear roofline curve down to trunk
    shape.quadraticCurveTo(-l * 0.55, h * 0.75, -l * 0.82, h * 0.45);
    // Rear tail & decklid drop
    shape.quadraticCurveTo(-l * 0.95, h * 0.38, -l * 0.98, 0.08);
    // Flat undertray back to front
    shape.lineTo(l * 0.98, 0.05);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 3,
      depth: bodyWidth * 0.84,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.14,
      bevelOffset: 0,
      bevelSegments: 8,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [bodyLength, bodyWidth, bodyHeight]);

  // Curved Glass Canopy Geometry
  const glassCanopyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const l = bodyLength * 0.5;
    const h = bodyHeight * 0.85;

    shape.moveTo(l * 0.24, h * 0.54);
    shape.quadraticCurveTo(l * 0.06, h * 0.99, -l * 0.15, h * 0.97);
    shape.quadraticCurveTo(-l * 0.52, h * 0.78, -l * 0.76, h * 0.48);
    shape.lineTo(-l * 0.72, h * 0.46);
    shape.quadraticCurveTo(-l * 0.48, h * 0.72, -l * 0.15, h * 0.9);
    shape.quadraticCurveTo(l * 0.06, h * 0.92, l * 0.22, h * 0.52);
    shape.closePath();

    const settings: THREE.ExtrudeGeometryOptions = {
      steps: 2,
      depth: bodyWidth * 0.74,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
    };

    const geom = new THREE.ExtrudeGeometry(shape, settings);
    geom.center();
    return geom;
  }, [bodyLength, bodyWidth, bodyHeight]);

  // Wheel rotation in drive mode
  useFrame((state, delta) => {
    if (isDriving) {
      wheelsRef.current.forEach((wheel) => {
        if (wheel) wheel.rotation.x += delta * 14;
      });
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 12) * 0.003;
      }
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
    }
  });

  // Wheel Builder with detailed rims, rotor, caliper
  const renderWheel = (x: number, y: number, z: number, isRightSide: boolean, idx: number) => {
    return (
      <group position={[x, y, z]} key={`wheel-${idx}`}>
        {/* Upright Hub & Caliper */}
        <group rotation={[0, isRightSide ? Math.PI : 0, 0]}>
          <mesh material={materials.brakeDisc} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelRadius * 0.65, wheelRadius * 0.65, 0.03, 32]} />
          </mesh>
          <mesh
            material={materials.brakeCaliper}
            position={[0, wheelRadius * 0.42, 0.03]}
            rotation={[0, 0, 0.25]}
          >
            <boxGeometry args={[0.08, 0.18, 0.08]} />
          </mesh>
        </group>

        {/* Rotating Wheel Group */}
        <group
          ref={(el) => {
            if (el) wheelsRef.current[idx] = el;
          }}
          rotation={[0, isRightSide ? Math.PI : 0, 0]}
        >
          {/* Tire with rounded profile */}
          <mesh material={materials.tireRubber} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[wheelRadius * 0.78, wheelRadius * 0.24, 16, 36]} />
          </mesh>
          <mesh material={materials.tireRubber} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelRadius * 0.98, wheelRadius * 0.98, wheelWidth * 0.85, 36]} />
          </mesh>

          {/* Rim Barrel */}
          <mesh material={materials.rimMetal} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[wheelRadius * 0.8, wheelRadius * 0.8, wheelWidth * 0.9, 32]} />
          </mesh>

          {/* Spokes (Forged turbine blades) */}
          <group position={[0, 0, wheelWidth * 0.35]}>
            {Array.from({ length: 10 }).map((_, i) => (
              <mesh
                key={i}
                rotation={[0, 0, (i * Math.PI * 2) / 10]}
                material={materials.rimMetal}
              >
                <boxGeometry args={[0.03, wheelRadius * 1.55, wheelWidth * 0.3]} />
              </mesh>
            ))}
            {/* Center Cap */}
            <mesh material={materials.glossBlack}>
              <cylinderGeometry args={[0.07, 0.07, wheelWidth * 0.35, 24]} />
            </mesh>
            <mesh material={materials.chrome}>
              <ringGeometry args={[0.065, 0.075, 24]} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group ref={groupRef} position={[0, wheelRadius * 0.9, 0]}>
      {/* ================= SCULPTED MAIN MONOCOQUE ================= */}
      <mesh
        geometry={bodyGeometry}
        material={materials.carPaint}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, bodyHeight * 0.36, 0]}
        castShadow
        receiveShadow
      />

      {/* ================= PANORAMIC GLASS CANOPY ================= */}
      <mesh
        geometry={glassCanopyGeometry}
        material={materials.glass}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, bodyHeight * 0.36, 0]}
      />

      {/* ================= FRONT NOSE, SPLITTER & MATRIX LEDS ================= */}
      <group position={[0, bodyHeight * 0.15, frontAxleZ + bodyLength * 0.16]}>
        {/* Carbon Splitter with side dive planes */}
        <mesh material={materials.carbon} position={[0, -0.05, 0]}>
          <boxGeometry args={[bodyWidth * 0.95, 0.04, 0.4]} />
        </mesh>

        {/* Aggressive Front Air Inlets */}
        <mesh position={[-bodyWidth * 0.28, 0.08, 0.1]} material={materials.glossBlack}>
          <boxGeometry args={[0.35, 0.15, 0.1]} />
        </mesh>
        <mesh position={[bodyWidth * 0.28, 0.08, 0.1]} material={materials.glossBlack}>
          <boxGeometry args={[0.35, 0.15, 0.1]} />
        </mesh>

        {/* Sleek Horizontal LED Matrix Headlights */}
        <mesh
          position={[-bodyWidth * 0.36, 0.18, 0.14]}
          rotation={[0, 0.25, 0]}
          material={materials.headlightEmissive}
        >
          <boxGeometry args={[0.26, 0.04, 0.06]} />
        </mesh>
        <mesh
          position={[bodyWidth * 0.36, 0.18, 0.14]}
          rotation={[0, -0.25, 0]}
          material={materials.headlightEmissive}
        >
          <boxGeometry args={[0.26, 0.04, 0.06]} />
        </mesh>

        {/* Horizon Lightblade */}
        <mesh position={[0, 0.19, 0.16]} material={materials.headlightEmissive}>
          <boxGeometry args={[bodyWidth * 0.65, 0.015, 0.04]} />
        </mesh>
      </group>

      {/* ================= REAR TAILLIGHT HORIZON & DIFFUSER ================= */}
      <group position={[0, bodyHeight * 0.25, rearAxleZ - bodyLength * 0.16]}>
        {/* Continuous OLED Light Strip */}
        <mesh material={materials.taillightEmissive} position={[0, 0.18, 0]}>
          <boxGeometry args={[bodyWidth * 0.88, 0.035, 0.05]} />
        </mesh>

        {/* Sculpted Rear Diffuser with vertical aerodynamic fins */}
        <mesh position={[0, -0.08, 0]} material={materials.carbon}>
          <boxGeometry args={[bodyWidth * 0.92, 0.16, 0.42]} />
        </mesh>
        {[-0.4, -0.15, 0.15, 0.4].map((xOff, i) => (
          <mesh key={i} position={[xOff, -0.12, 0]} material={materials.carbon}>
            <boxGeometry args={[0.02, 0.18, 0.38]} />
          </mesh>
        ))}

        {/* Dual Titanium Exhaust Pipes */}
        <mesh position={[-bodyWidth * 0.25, -0.04, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 24]} />
        </mesh>
        <mesh position={[bodyWidth * 0.25, -0.04, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={materials.chrome}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 24]} />
        </mesh>
      </group>

      {/* ================= ACTIVE CARBON REAR WING ================= */}
      {hasSpoiler && (
        <group position={[0, bodyHeight * 0.72, rearAxleZ - bodyLength * 0.12]}>
          <mesh material={materials.carbon} castShadow>
            <boxGeometry args={[bodyWidth * 0.86, 0.03, 0.32]} />
          </mesh>
          <mesh position={[-bodyWidth * 0.43, 0.05, 0]} material={materials.carbon}>
            <boxGeometry args={[0.02, 0.14, 0.35]} />
          </mesh>
          <mesh position={[bodyWidth * 0.43, 0.05, 0]} material={materials.carbon}>
            <boxGeometry args={[0.02, 0.14, 0.35]} />
          </mesh>
          {/* Stanchions */}
          <mesh position={[-bodyWidth * 0.26, -0.12, 0]} material={materials.carbon}>
            <boxGeometry args={[0.03, 0.24, 0.12]} />
          </mesh>
          <mesh position={[bodyWidth * 0.26, -0.12, 0]} material={materials.carbon}>
            <boxGeometry args={[0.03, 0.24, 0.12]} />
          </mesh>
        </group>
      )}

      {/* ================= REFINED INTERIOR COCKPIT ================= */}
      <group position={[0, bodyHeight * 0.28, 0]}>
        {/* Alcantara Dashboard */}
        <mesh position={[0, bodyHeight * 0.14, bodyLength * 0.12]} material={materials.interiorLeather}>
          <boxGeometry args={[bodyWidth * 0.7, 0.12, 0.24]} />
        </mesh>
        {/* Sports Steering Wheel */}
        <group position={[-bodyWidth * 0.18, bodyHeight * 0.16, bodyLength * 0.04]} rotation={[0.45, 0, 0]}>
          <mesh material={materials.glossBlack}>
            <torusGeometry args={[0.13, 0.018, 12, 24]} />
          </mesh>
        </group>
        {/* Bucket Seats */}
        <mesh position={[-bodyWidth * 0.18, 0.05, -bodyLength * 0.06]} material={materials.interiorLeather}>
          <boxGeometry args={[0.32, 0.08, 0.34]} />
        </mesh>
        <mesh position={[-bodyWidth * 0.18, 0.24, -bodyLength * 0.14]} rotation={[-0.22, 0, 0]} material={materials.interiorLeather}>
          <boxGeometry args={[0.3, 0.38, 0.08]} />
        </mesh>
        <mesh position={[bodyWidth * 0.18, 0.05, -bodyLength * 0.06]} material={materials.interiorLeather}>
          <boxGeometry args={[0.32, 0.08, 0.34]} />
        </mesh>
        <mesh position={[bodyWidth * 0.18, 0.24, -bodyLength * 0.14]} rotation={[-0.22, 0, 0]} material={materials.interiorLeather}>
          <boxGeometry args={[0.3, 0.38, 0.08]} />
        </mesh>
      </group>

      {/* ================= 4 WHEEL ASSEMBLIES ================= */}
      {renderWheel(-wheelX, 0, frontAxleZ, false, 0)}
      {renderWheel(wheelX, 0, frontAxleZ, true, 1)}
      {renderWheel(-wheelX * 1.02, 0, rearAxleZ, false, 2)}
      {renderWheel(wheelX * 1.02, 0, rearAxleZ, true, 3)}
    </group>
  );
};
