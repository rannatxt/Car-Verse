import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ================= PROCEDURAL CANVAS TEXTURE GENERATORS (GTA 5 QUALITY) =================

// 1. Ultra-Realistic PBR Asphalt Texture with Tire Wear Tracks & Tar Cracks
function createAsphaltPBRTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base dark bitumen tarmac
    ctx.fillStyle = '#1c1d22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fine mineral aggregates & micro-stone noise
    for (let i = 0; i < 45000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const gray = Math.floor(35 + Math.random() * 45);
      ctx.fillStyle = `rgb(${gray},${gray},${gray + 4})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Light stone flecks
    ctx.fillStyle = 'rgba(180, 185, 195, 0.18)';
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // GTA 5 Signature: Parallel Darkened Rubber Tire Wear Grooves down the lanes
    const tireLanes = [160, 360, 660, 860];
    tireLanes.forEach((centerX) => {
      const gradient = ctx.createLinearGradient(centerX - 60, 0, centerX + 60, 0);
      gradient.addColorStop(0, 'rgba(12, 12, 15, 0)');
      gradient.addColorStop(0.5, 'rgba(10, 10, 14, 0.42)');
      gradient.addColorStop(1, 'rgba(12, 12, 15, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - 60, 0, 120, canvas.height);
    });

    // Dark tar repair sealant cracks
    ctx.strokeStyle = 'rgba(15, 15, 18, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 100);
    ctx.bezierCurveTo(240, 320, 180, 540, 290, 820);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(720, 150);
    ctx.bezierCurveTo(800, 420, 750, 680, 840, 950);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  texture.needsUpdate = true;
  return texture;
}

// 2. High-Contrast Red & White Hazard Kerbstone Texture
function createKerbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(128, 0, 128, 64);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 52, 256, 12);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 1);
  texture.needsUpdate = true;
  return texture;
}

// 3. Iron Sewer Manhole Cover Texture
function createManholeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 6;
    ctx.stroke();

    for (let r = 25; r < 110; r += 20) {
      ctx.beginPath();
      ctx.arc(128, 128, r, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BWSSB', 128, 134);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 4. Bilingual Kannada & English Highway Signboard
function createSignTexture(
  titleKannada: string,
  titleEnglish: string,
  subtext: string,
  bgColor = '#0f5132',
  textColor = '#ffffff'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titleKannada, canvas.width / 2, 95);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 64px "Segoe UI", Inter, sans-serif';
    ctx.fillText(titleEnglish, canvas.width / 2, 190);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '500 36px monospace';
    ctx.fillText(subtext, canvas.width / 2, 275);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 5. Commercial Shop Banners
function createShopBannerTexture(name: string, tagline: string, bg = '#b91c1c'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width / 2, 65);

    ctx.fillStyle = '#fef08a';
    ctx.font = '600 24px monospace';
    ctx.fillText(tagline, canvas.width / 2, 108);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 6. Speed Breaker Texture
function createSpeedBreakerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#eab308';
    const stripeWidth = 32;
    for (let x = -64; x < canvas.width + 64; x += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth + 24, canvas.height);
      ctx.lineTo(x + 24, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  texture.needsUpdate = true;
  return texture;
}

// ================= GTA 5 STYLE VEGETATION COMPONENTS =================

// GTA 5 Iconic California/Bengaluru Royal Fan Palm Tree
export const GTAPalmTree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1.0,
}) => {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Cast Iron Tree Grate at Sidewalk Base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial color="#262626" roughness={0.9} metalness={0.6} />
      </mesh>

      {/* Multi-segmented naturally curved Palm Trunk */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.48, 5, 10]} />
          <meshStandardMaterial color="#4a3728" roughness={0.92} />
        </mesh>
        <mesh position={[0.15, 7.2, 0.1]} rotation={[0.04, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.24, 0.3, 5, 10]} />
          <meshStandardMaterial color="#5c4533" roughness={0.92} />
        </mesh>
        <mesh position={[0.35, 11.5, 0.22]} rotation={[0.08, 0, -0.09]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 4, 10]} />
          <meshStandardMaterial color="#6e543e" roughness={0.9} />
        </mesh>

        {/* Brown Dried Frond Skirt directly beneath crown */}
        <mesh position={[0.42, 13.4, 0.28]} castShadow>
          <coneGeometry args={[1.1, 1.4, 8]} />
          <meshStandardMaterial color="#453224" roughness={0.95} />
        </mesh>

        {/* 12 Radial Arching Palm Fronds */}
        <group position={[0.42, 13.9, 0.28]}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const droop = 0.45 + (i % 3) * 0.12;
            return (
              <group key={`frond-${i}`} rotation={[0, angle, 0]}>
                <mesh position={[1.8, -0.4, 0]} rotation={[0, 0, -droop]} castShadow>
                  <boxGeometry args={[3.6, 0.08, 0.7]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? '#15803d' : '#16a34a'}
                    roughness={0.7}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
};

// GTA 5 Style Volumetric Multi-Limb Gulmohar / Jacaranda Tree
export const GTAGulmoharTree: React.FC<{
  position: [number, number, number];
  scale?: number;
  isJacaranda?: boolean;
}> = ({ position, scale = 1.0, isJacaranda = false }) => {
  const primaryColor = isJacaranda ? '#7e22ce' : '#dc2626';
  const secondaryColor = isJacaranda ? '#9333ea' : '#ea580c';
  const highlightColor = isJacaranda ? '#a855f7' : '#f97316';

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Fallen Flower Petal Scatter on Sidewalk */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 16]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.35} />
      </mesh>

      {/* Organic Forked Trunk Base */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.55, 4.4, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main Limb 1 (Left) */}
      <mesh position={[-0.8, 4.6, 0.4]} rotation={[0.2, 0, 0.45]} castShadow>
        <cylinderGeometry args={[0.24, 0.35, 3.2, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main Limb 2 (Right) */}
      <mesh position={[0.9, 4.8, -0.3]} rotation={[-0.15, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.22, 0.33, 3.4, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* 7 Overlapping Volumetric Canopy Clumps */}
      <group position={[0, 6.2, 0]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[2.6, 9, 9]} />
          <meshStandardMaterial color={primaryColor} roughness={0.88} />
        </mesh>
        <mesh position={[-2.2, 0.1, 0.8]} castShadow>
          <sphereGeometry args={[2.2, 8, 8]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.88} />
        </mesh>
        <mesh position={[2.3, 0.3, -0.6]} castShadow>
          <sphereGeometry args={[2.3, 8, 8]} />
          <meshStandardMaterial color={highlightColor} roughness={0.88} />
        </mesh>
        <mesh position={[-0.4, -0.4, 2.0]} castShadow>
          <sphereGeometry args={[1.9, 8, 8]} />
          <meshStandardMaterial color={primaryColor} roughness={0.88} />
        </mesh>
        <mesh position={[0.5, -0.2, -2.1]} castShadow>
          <sphereGeometry args={[2.0, 8, 8]} />
          <meshStandardMaterial color={secondaryColor} roughness={0.88} />
        </mesh>
        <mesh position={[0.2, 1.8, 0.3]} castShadow>
          <sphereGeometry args={[1.7, 7, 7]} />
          <meshStandardMaterial color={highlightColor} roughness={0.88} />
        </mesh>
      </group>
    </group>
  );
};

// GTA 5 Style Street Fire Hydrant
export const FireHydrant: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.7, 10]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.16, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.18, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.16, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ================= MODULAR 300m INFINITE ROAD CHUNK COMPONENT =================
// ================= OVERHEAD HIGHWAY SIGN GANTRY =================
const OverheadGantry: React.FC<{
  position: [number, number, number];
  texture: THREE.CanvasTexture;
}> = ({ position, texture }) => {
  return (
    <group position={position}>
      {/* Left Pillar Truss */}
      <mesh position={[-16.4, 4.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 8.4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right Pillar Truss */}
      <mesh position={[16.4, 4.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 8.4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Horizontal Crossbeam Truss */}
      <mesh position={[0, 8.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 33, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Northbound Highway Signboard (Approaching +Z) */}
      <mesh position={[-7.5, 7.2, 0]}>
        <boxGeometry args={[11, 3.6, 0.22]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>
      {/* Southbound Highway Signboard (Approaching -Z) */}
      <mesh position={[7.5, 7.2, 0]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[11, 3.6, 0.22]} />
        <meshStandardMaterial map={texture} roughness={0.4} />
      </mesh>
    </group>
  );
};

// ================= ROADSIDE TEA & TIFFIN STALL =================
const RoadsideStall: React.FC<{
  position: [number, number, number];
  bannerTexture: THREE.CanvasTexture;
  canopyColor?: string;
  rotY?: number;
}> = ({ position, bannerTexture, canopyColor = '#dc2626', rotY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Wooden Kiosk Base */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 2.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.85} />
      </mesh>
      {/* Service Counter */}
      <mesh position={[0, 1.25, 1.45]} castShadow>
        <boxGeometry args={[4.4, 0.15, 0.6]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>
      {/* Striped Overhead Canopy Awning */}
      <mesh position={[0, 2.5, 0.4]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[4.6, 0.1, 3.2]} />
        <meshStandardMaterial color={canopyColor} roughness={0.6} />
      </mesh>
      {/* Shop Banner Board */}
      <mesh position={[0, 2.8, 1.85]}>
        <boxGeometry args={[4.2, 1.1, 0.15]} />
        <meshStandardMaterial map={bannerTexture} roughness={0.5} />
      </mesh>
    </group>
  );
};

// ================= MODULAR 300m INFINITE ROAD CHUNK COMPONENT =================
const InfiniteRoadChunk: React.FC<{
  chunkZ: number;
  textures: ReturnType<typeof useMemo<any>>;
  lightPolesOn: boolean;
  streetlightIntensity: number;
}> = ({ chunkZ, textures, lightPolesOn, streetlightIntensity }) => {
  const signIndex = Math.abs(Math.floor(chunkZ / 300)) % 5;
  const gantryTexture = [
    textures.welcome,
    textures.silkBoard,
    textures.eCityFlyover,
    textures.indiranagar,
    textures.mgRoad,
  ][signIndex];

  return (
    <group position={[0, 0, chunkZ]}>
      {/* 1. Asphalt Road Surface (Length 300m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 300]} />
        <meshStandardMaterial
          map={textures.asphalt}
          color="#22242a"
          roughness={0.72}
          metalness={0.28}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* Drainage Gutters */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15.6, 0.005, 0]}>
        <planeGeometry args={[0.8, 300]} />
        <meshStandardMaterial color="#111215" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15.6, 0.005, 0]}>
        <planeGeometry args={[0.8, 300]} />
        <meshStandardMaterial color="#111215" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Painted Hazard Red & White Kerbstones */}
      <mesh position={[-16.1, 0.16, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.32, 300]} />
        <meshStandardMaterial map={textures.kerb} roughness={0.8} />
      </mesh>
      <mesh position={[16.1, 0.16, 0]} receiveShadow>
        <boxGeometry args={[0.35, 0.32, 300]} />
        <meshStandardMaterial map={textures.kerb} roughness={0.8} />
      </mesh>

      {/* Sidewalk Pedestrian Pavements */}
      <mesh position={[-17.6, 0.15, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.3, 300]} />
        <meshStandardMaterial color="#78716c" roughness={0.92} />
      </mesh>
      <mesh position={[17.6, 0.15, 0]} receiveShadow>
        <boxGeometry args={[2.6, 0.3, 300]} />
        <meshStandardMaterial color="#78716c" roughness={0.92} />
      </mesh>

      {/* W-Beam Metal Guardrails along Outer Sidewalk Edges */}
      <group position={[-18.8, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.55, 300]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.25} />
        </mesh>
      </group>
      <group position={[18.8, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.55, 300]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.25} />
        </mesh>
      </group>

      {/* Central Raised Concrete Median with Jersey Barriers */}
      <group position={[0, 0.25, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.2, 0.5, 300]} />
          <meshStandardMaterial color="#57534e" roughness={0.95} />
        </mesh>
        <mesh position={[-1.15, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 300]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <mesh position={[1.15, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 300]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        {/* Flowering Bougainvillea Median Shrubs */}
        {Array.from({ length: 28 }).map((_, i) => (
          <group key={`bush-${i}`} position={[0, 0.42, -140 + i * 10.5]}>
            <mesh castShadow>
              <sphereGeometry args={[0.72, 8, 8]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#e11d48' : '#15803d'}
                roughness={0.85}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* White Dashed Lane Dividers & Retroreflective Cat's Eyes */}
      {Array.from({ length: 26 }).map((_, i) => (
        <group key={`lane-${i}`}>
          <mesh position={[-5, 0.02, -135 + i * 11]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.22, 5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-10, 0.02, -135 + i * 11]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.22, 5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[5, 0.02, -135 + i * 11]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.22, 5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[10, 0.02, -135 + i * 11]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.22, 5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Cat's Eye Road Studs */}
          <mesh position={[-5, 0.035, -135 + i * 11 + 3]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.03]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={lightPolesOn ? 2.2 : 0.4}
            />
          </mesh>
          <mesh position={[-10, 0.035, -135 + i * 11 + 3]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.03]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={lightPolesOn ? 2.2 : 0.4}
            />
          </mesh>
        </group>
      ))}

      {/* 2. Overhead Highway Sign Gantry (Kannada & English Landmark Signs) */}
      <OverheadGantry position={[0, 0, -120]} texture={gantryTexture} />

      {/* 3. 3D Speed Breakers across Carriageways at Z = 150 (Synchronized with physics) */}
      <group position={[0, 0.04, 0]}>
        {/* Left Carriageway Hump (Northbound) */}
        <mesh position={[-8.5, 0, 0]} receiveShadow>
          <boxGeometry args={[13.5, 0.1, 1.8]} />
          <meshStandardMaterial map={textures.speedBreaker} roughness={0.7} />
        </mesh>
        {/* Right Carriageway Hump (Southbound) */}
        <mesh position={[8.5, 0, 0]} receiveShadow>
          <boxGeometry args={[13.5, 0.1, 1.8]} />
          <meshStandardMaterial map={textures.speedBreaker} roughness={0.7} />
        </mesh>
      </group>

      {/* 4. Optimized Streetlight Poles with Emissive Bulbs (Zero-Lag 60fps) */}
      {[-120, -60, 0, 60, 120].map((zPos, idx) => (
        <group key={`light-${idx}`}>
          <group position={[-16.5, 0, zPos]}>
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 8, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[1.2, 7.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[2.3, 8.8, 0]}>
              <boxGeometry args={[0.8, 0.25, 0.45]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[2.3, 8.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.28, 12]} />
              <meshBasicMaterial color={lightPolesOn ? '#fef08a' : '#475569'} />
            </mesh>
          </group>

          <group position={[16.5, 0, zPos]}>
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 8, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[-1.2, 7.8, 0]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.08, 0.08, 3.2, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[-2.3, 8.8, 0]}>
              <boxGeometry args={[0.8, 0.25, 0.45]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[-2.3, 8.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.28, 12]} />
              <meshBasicMaterial color={lightPolesOn ? '#fef08a' : '#475569'} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Single Soft Road Illumination Point Light per chunk for night ambiance */}
      {lightPolesOn && (
        <pointLight
          position={[0, 7.5, 0]}
          color="#fef08a"
          intensity={streetlightIntensity * 0.45}
          distance={75}
          decay={2}
        />
      )}

      {/* 5. Roadside Bengaluru Stalls (Darshini, Bakery & Chai Tapri) */}
      <RoadsideStall
        position={[-21.5, 0, -45]}
        bannerTexture={textures.darshini}
        canopyColor="#b45309"
        rotY={0}
      />
      <RoadsideStall
        position={[-21.5, 0, 65]}
        bannerTexture={textures.chai}
        canopyColor="#854d0e"
        rotY={0}
      />
      <RoadsideStall
        position={[21.5, 0, 40]}
        bannerTexture={textures.bakery}
        canopyColor="#be123c"
        rotY={Math.PI}
      />

      {/* GTA 5 Style Trees & Palms along Chunk */}
      {[-130, -80, -30, 20, 70, 120].map((zPos, idx) => (
        <group key={`trees-${idx}`}>
          <GTAPalmTree position={[-24.5, 0, zPos]} scale={1.05} />
          <GTAPalmTree position={[24.5, 0, zPos + 10]} scale={1.05} />
          <GTAGulmoharTree
            position={[-21.5, 0, zPos + 25]}
            scale={1.1}
            isJacaranda={idx % 2 === 1}
          />
          <GTAGulmoharTree
            position={[21.5, 0, zPos + 25]}
            scale={1.1}
            isJacaranda={idx % 2 === 0}
          />
        </group>
      ))}

      {/* Fire Hydrants & Manholes */}
      {[-110, 40].map((zPos, idx) => (
        <group key={`props-${idx}`}>
          <FireHydrant position={[-17.2, 0.3, zPos]} />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[idx % 2 === 0 ? -12.5 : 12.5, 0.015, zPos + 15]}
            receiveShadow
          >
            <circleGeometry args={[0.65, 20]} />
            <meshStandardMaterial map={textures.manhole} roughness={0.7} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Tech Park Skyscraper along Chunk */}
      <group position={[-85, 0, -40]}>
        <mesh position={[0, 36, 0]} castShadow receiveShadow>
          <boxGeometry args={[42, 72, 38]} />
          <meshPhysicalMaterial
            color="#1e3a8a"
            metalness={0.92}
            roughness={0.06}
            reflectivity={1.0}
            envMapIntensity={1.8}
          />
        </mesh>
        <mesh position={[0, 68, 19.2]}>
          <boxGeometry args={[18, 5, 0.4]} />
          <meshStandardMaterial map={textures.itPark1} emissive="#1e40af" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <group position={[85, 0, 40]}>
        <mesh position={[0, 48, 0]} castShadow receiveShadow>
          <boxGeometry args={[36, 96, 40]} />
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2.0}
          />
        </mesh>
        <mesh position={[0, 90, 20.2]}>
          <boxGeometry args={[18, 5, 0.4]} />
          <meshStandardMaterial map={textures.itPark2} emissive="#4c1d95" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ================= MAIN BENGALURU CITY COMPONENT =================

interface BengaluruCityProps {
  timeOfDay?: 'day' | 'sunset' | 'night' | 'cyber';
  playerZ?: number;
}

export const BengaluruCity: React.FC<BengaluruCityProps> = ({
  timeOfDay = 'sunset',
  playerZ = 0,
}) => {
  const envConfig = useMemo(() => {
    switch (timeOfDay) {
      case 'sunset':
        return {
          fogColor: '#431407',
          ambientColor: '#fed7aa',
          ambientIntensity: 0.9,
          sunColor: '#ffedd5',
          sunIntensity: 3.0,
          sunPos: [-130, 32, -160] as [number, number, number],
          rayleigh: 4.5,
          turbidity: 8.5,
          mieCoefficient: 0.045,
          mieDirectionalG: 0.82,
          envPreset: 'sunset' as const,
          envIntensity: 1.15,
          streetlightIntensity: 5.0,
          lightPolesOn: true,
        };
      case 'night':
        return {
          fogColor: '#050816',
          ambientColor: '#1e293b',
          ambientIntensity: 0.4,
          sunColor: '#38bdf8',
          sunIntensity: 0.7,
          sunPos: [-100, -25, 100] as [number, number, number],
          rayleigh: 0.3,
          turbidity: 10.0,
          mieCoefficient: 0.08,
          mieDirectionalG: 0.7,
          envPreset: 'night' as const,
          envIntensity: 0.65,
          streetlightIntensity: 6.8,
          lightPolesOn: true,
        };
      case 'cyber':
        return {
          fogColor: '#150826',
          ambientColor: '#a855f7',
          ambientIntensity: 0.6,
          sunColor: '#ec4899',
          sunIntensity: 1.8,
          sunPos: [-80, 45, -80] as [number, number, number],
          rayleigh: 6.0,
          turbidity: 12.0,
          mieCoefficient: 0.1,
          mieDirectionalG: 0.85,
          envPreset: 'city' as const,
          envIntensity: 0.95,
          streetlightIntensity: 7.5,
          lightPolesOn: true,
        };
      case 'day':
      default:
        return {
          fogColor: '#dbeafe',
          ambientColor: '#ffffff',
          ambientIntensity: 1.15,
          sunColor: '#fffbeb',
          sunIntensity: 3.4,
          sunPos: [-80, 120, -100] as [number, number, number],
          rayleigh: 1.2,
          turbidity: 2.2,
          mieCoefficient: 0.005,
          mieDirectionalG: 0.8,
          envPreset: 'city' as const,
          envIntensity: 1.25,
          streetlightIntensity: 0.2,
          lightPolesOn: false,
        };
    }
  }, [timeOfDay]);

  // High-Resolution PBR Textures
  const textures = useMemo(() => {
    return {
      asphalt: createAsphaltPBRTexture(),
      kerb: createKerbTexture(),
      manhole: createManholeTexture(),
      welcome: createSignTexture('ನಮ್ಮ ಬೆಂಗಳೂರಿಗೆ ಸುಸ್ವಾಗತ', 'WELCOME TO NAMMA BENGALURU', 'SILK BOARD • INDIRANAGAR • E-CITY'),
      silkBoard: createSignTexture('ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್', 'SILK BOARD JUNCTION 500m', 'LEFT: HOSUR RD • RIGHT: BTM LAYOUT', '#166534'),
      eCityFlyover: createSignTexture('ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಎಲಿವೇಟೆಡ್ ಟೋಲ್‌ವೇ', 'E-CITY ELEVATED EXPRESSWAY', 'KEEP LEFT • SPEED LIMIT 80 KM/H', '#1e3a8a'),
      indiranagar: createSignTexture('ಇಂದಿರಾನಗರ 100 ಅಡಿ ರಸ್ತೆ', 'INDIRANAGAR 100 FT ROAD', 'CAFE STREET • METRO STATION', '#0f766e'),
      mgRoad: createSignTexture('ಎಂ.ಜಿ. ರಸ್ತೆ / ಬ್ರಿಗೇಡ್ ರಸ್ತೆ', 'M.G. ROAD / BRIGADE ROAD', 'CITY CENTRE • SHOPPING DISTRICT', '#991b1b'),
      speedBreaker: createSpeedBreakerTexture(),
      darshini: createShopBannerTexture('NAMMA DARSHINI', 'FILTER COFFEE & DOSA CORNER', '#b45309'),
      bakery: createShopBannerTexture('BENGALURU BAKERY', 'SINCE 1952 • FRESH PUFFS & CAKES', '#be123c'),
      chai: createShopBannerTexture('CHAI TAPRI', 'IRANI CHAI • GINGER TEA • BUN MASKA', '#854d0e'),
      itPark1: createShopBannerTexture('NEXUS TECH PARK', 'CAMPUS 1 • BLOCK A-D', '#1e40af'),
      itPark2: createShopBannerTexture('GLOBAL INFOTECH TOWER', 'AI INNOVATION HUB', '#4c1d95'),
    };
  }, []);

  // Calculate dynamic infinite chunks centered around player's current Z position
  const CHUNK_SIZE = 300;
  const baseChunkZ = Math.floor((playerZ || 0) / CHUNK_SIZE) * CHUNK_SIZE;
  const chunkOffsets = [
    baseChunkZ - CHUNK_SIZE,
    baseChunkZ,
    baseChunkZ + CHUNK_SIZE,
    baseChunkZ + CHUNK_SIZE * 2,
  ];

  return (
    <group>
      {/* ================= PHOTOREALISTIC SKY & IBL ENVIRONMENT ================= */}
      <Sky
        distance={450000}
        sunPosition={envConfig.sunPos}
        mieCoefficient={envConfig.mieCoefficient}
        mieDirectionalG={envConfig.mieDirectionalG}
        rayleigh={envConfig.rayleigh}
        turbidity={envConfig.turbidity}
      />

      {(timeOfDay === 'night' || timeOfDay === 'cyber') && (
        <Stars radius={180} depth={60} count={6000} factor={4} saturation={0.5} fade speed={1.2} />
      )}

      <Environment preset={envConfig.envPreset} environmentIntensity={envConfig.envIntensity} />

      <fog attach="fog" args={[envConfig.fogColor, 70, 500]} />

      <ambientLight color={envConfig.ambientColor} intensity={envConfig.ambientIntensity} />
      <directionalLight
        position={envConfig.sunPos}
        color={envConfig.sunColor}
        intensity={envConfig.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={480}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0003}
      />

      {/* Ground Terrain Follows Player */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, baseChunkZ + CHUNK_SIZE * 0.5]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1600]} />
        <meshStandardMaterial color="#13151b" roughness={0.94} metalness={0.06} />
      </mesh>

      {/* ================= SEAMLESS INFINITE ROAD CHUNKS ================= */}
      {chunkOffsets.map((chunkZ) => (
        <InfiniteRoadChunk
          key={`chunk-${chunkZ}`}
          chunkZ={chunkZ}
          textures={textures}
          lightPolesOn={envConfig.lightPolesOn}
          streetlightIntensity={envConfig.streetlightIntensity}
        />
      ))}
    </group>
  );
};
