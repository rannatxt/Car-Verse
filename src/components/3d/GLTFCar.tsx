import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle, CustomizationState } from '../../types/car';
import { CALIPER_OPTIONS } from '../../data/cars';

interface GLTFCarProps {
  vehicle: Vehicle;
  customization: CustomizationState;
  modelPath: string;
}

export const GLTFCar: React.FC<GLTFCarProps> = ({ vehicle, customization, modelPath }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);

  const { colors, wheels } = vehicle;
  const { selectedColorId, selectedWheelId, selectedCaliperId, headlightsOn, isDriving } = customization;

  // Active custom options
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

  // Deep clone scene so each instance has independent materials
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  // Materials
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

    const rimMetal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentWheel.rimColor || '#c0c5cc'),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });

    const brakeCaliper = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentCaliperHex),
      metalness: 0.4,
      roughness: 0.25,
    });

    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      transparent: true,
      opacity: 0.9,
      ior: 1.52,
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
      emissiveIntensity: headlightsOn ? 4.0 : 0.8,
      roughness: 0.2,
    });

    return {
      carPaint,
      rimMetal,
      brakeCaliper,
      glass,
      headlightEmissive,
      taillightEmissive,
    };
  }, [currentColor, currentWheel, currentCaliperHex, headlightsOn]);

  // Normalize model bounds and apply materials
  useEffect(() => {
    if (!clonedScene) return;

    wheelsRef.current = [];

    // Names for body meshes across different models (Ferrari, Aventador, etc.)
    const bodyKeywords = [
      'body',
      'hood',
      'door',
      'roof',
      'bumper',
      'fender',
      'boot',
      'trunk',
      'chassis',
      'exterior',
    ];

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toLowerCase();

        // 1. Check Body Paint
        const isBody = bodyKeywords.some((kw) => name.includes(kw)) &&
          !name.includes('glass') &&
          !name.includes('plastic') &&
          !name.includes('metal') &&
          !name.includes('knob') &&
          !name.includes('rubber') &&
          !name.includes('interior');

        if (isBody) {
          mesh.material = materials.carPaint;
        }

        // 2. Check Rims
        if (name.includes('rim') || name.includes('wheel_hub')) {
          mesh.material = materials.rimMetal;
        }

        // 3. Check Brake Caliper
        if (name.includes('caliper') || name === 'brake') {
          mesh.material = materials.brakeCaliper;
        }

        // 4. Check Glass / Windshield
        if (name.includes('glass') || name.includes('windscreen') || name.includes('windshield')) {
          mesh.material = materials.glass;
        }

        // 5. Headlights
        if (name.includes('headlight') || name === 'leds' || name === 'lights') {
          mesh.material = materials.headlightEmissive;
        }

        // 6. Taillights
        if (name.includes('tail_light') || name.includes('tail_led') || name === 'lights_red') {
          mesh.material = materials.taillightEmissive;
        }
      }

      // Collect wheels for drive mode rotation
      const objName = child.name.toLowerCase();
      if (
        objName.startsWith('wheel_') ||
        objName.includes('tyre') ||
        objName.includes('rim_t0')
      ) {
        wheelsRef.current.push(child);
      }
    });

    // Compute bounding box and normalize
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Target car length ~ 4.7 meters
    const length = Math.max(size.x, size.z);
    const scaleFactor = 4.7 / length;

    clonedScene.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Recompute box after scaling to ground exactly at y = 0
    box.setFromObject(clonedScene);
    const scaledCenter = box.getCenter(new THREE.Vector3());
    const scaledMin = box.min;

    // Center X & Z, and set bottom Y to 0
    clonedScene.position.x = -scaledCenter.x;
    clonedScene.position.z = -scaledCenter.z;
    clonedScene.position.y = -scaledMin.y;
  }, [clonedScene, materials]);

  // Rotate wheels & chassis heave in drive mode
  useFrame((state, delta) => {
    if (isDriving) {
      wheelsRef.current.forEach((wheel) => {
        wheel.rotation.x -= delta * 12;
      });

      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 12) * 0.003;
      }
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {/* Real Headlight Beams illuminating floor when ON */}
      {headlightsOn && (
        <group position={[0, 0.65, 2.2]}>
          <spotLight
            position={[-0.7, 0, 0]}
            target-position={[-0.7, -0.65, 8]}
            color="#e0f2fe"
            intensity={4.5}
            angle={0.55}
            penumbra={0.4}
            distance={20}
            castShadow
          />
          <spotLight
            position={[0.7, 0, 0]}
            target-position={[0.7, -0.65, 8]}
            color="#e0f2fe"
            intensity={4.5}
            angle={0.55}
            penumbra={0.4}
            distance={20}
            castShadow
          />
        </group>
      )}
    </group>
  );
};
