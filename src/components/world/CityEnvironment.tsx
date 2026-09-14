import React from 'react';
import { Sky } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

/**
 * CityEnvironment – provides a dynamic sky, sunlight, ambient lighting, and a simple ground plane.
 * This replaces the previous flat HDRI background and adds realistic lighting for the open world.
 */
const CityEnvironment: React.FC = () => {
  const { scene } = useThree();

  // Ensure the scene background is transparent so the Sky renders correctly.
  scene.background = null;

  return (
    <>
      {/* Dynamic sky – sun position can be animated later for day/night cycles */}
      <Sky
        distance={4500}
        sunPosition={[100, 100, 100]}
        inclination={0.49} // midday
        azimuth={0.25}
      />

      {/* Sunlight – bright directional light with shadows */}
      <directionalLight
        castShadow
        intensity={1.5}
        position={[100, 200, 100]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />

      {/* Ambient fill light */}
      <ambientLight intensity={0.4} />

      {/* Simple ground plane for the road network – uses a gray asphalt material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="#555555" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
};

export default CityEnvironment;
