import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Model: Iconic Bengaluru Auto-Rickshaw (Bajaj RE Green & Yellow)
export const AutoRickshawMesh: React.FC<{ hasHeadlights?: boolean }> = ({ hasHeadlights = true }) => {
  return (
    <group>
      {/* Lower Body (Signature Indian Auto Green) */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2.6]} />
        <meshStandardMaterial color="#15803d" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Upper Cabin (Signature Indian Auto Yellow) */}
      <mesh position={[0, 1.05, 0.1]} castShadow>
        <boxGeometry args={[1.48, 0.55, 2.2]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Black Canvas Hood / Roof Canopy */}
      <mesh position={[0, 1.5, -0.05]} castShadow>
        <boxGeometry args={[1.44, 0.35, 2.45]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>

      {/* Front Windshield */}
      <mesh position={[0, 1.15, 1.15]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[1.3, 0.65]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          transparent
          opacity={0.85}
          roughness={0.1}
        />
      </mesh>

      {/* Front Wheel (Single centered wheel) */}
      <mesh position={[0, 0.28, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.2, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Rear Left Wheel */}
      <mesh position={[-0.72, 0.28, -0.75]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Rear Right Wheel */}
      <mesh position={[0.72, 0.28, -0.75]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Front Round Headlight */}
      <mesh position={[0, 0.8, 1.32]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fef08a"
          emissiveIntensity={hasHeadlights ? 3.0 : 0.4}
        />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[-0.6, 0.65, -1.31]}>
        <boxGeometry args={[0.18, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0.6, 0.65, -1.31]}>
        <boxGeometry args={[0.18, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>

      {/* Yellow Registration Plate */}
      <mesh position={[0, 0.45, -1.32]}>
        <boxGeometry args={[0.6, 0.18, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
    </group>
  );
};

// 3D Model: BMTC City Bus (Bangalore Metropolitan Transport Corporation)
export const BMTCBusMesh: React.FC = () => {
  return (
    <group>
      {/* Main Bus Body */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[2.7, 2.7, 10.8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* White Roof / Upper Half */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[2.72, 1.15, 10.82]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Windows Strip (Side Glass) */}
      <mesh position={[-1.37, 2.2, 0]}>
        <planeGeometry args={[0.02, 1.0, 9.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>
      <mesh position={[1.37, 2.2, 0]}>
        <planeGeometry args={[0.02, 1.0, 9.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>

      {/* Front Windshield */}
      <mesh position={[0, 2.2, 5.42]} rotation={[0.08, 0, 0]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.8} transparent opacity={0.8} />
      </mesh>

      {/* Route Destination LED Board */}
      <mesh position={[0, 3.0, 5.43]}>
        <boxGeometry args={[1.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={2.5} />
      </mesh>

      {/* Wheels */}
      {/* Front Wheels */}
      <mesh position={[-1.35, 0.5, 3.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[1.35, 0.5, 3.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Rear Dual Wheels */}
      <mesh position={[-1.35, 0.5, -3.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[1.35, 0.5, -3.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Headlights */}
      <mesh position={[-1.0, 0.9, 5.43]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3.0} />
      </mesh>
      <mesh position={[1.0, 0.9, 5.43]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3.0} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.1, 1.2, -5.43]}>
        <boxGeometry args={[0.25, 0.4, 0.05]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[1.1, 1.2, -5.43]}>
        <boxGeometry args={[0.25, 0.4, 0.05]} />
        <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
};

// 3D Model: Indian White Sedan / Taxi
export const IndianCarMesh: React.FC<{ color?: string }> = ({ color = '#f8fafc' }) => {
  return (
    <group>
      {/* Lower Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.85, 0.5, 4.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cabin Roof */}
      <mesh position={[0, 1.05, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.65, 2.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.95, 1.1]} rotation={[0.4, 0, 0]}>
        <planeGeometry args={[1.5, 0.7]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent opacity={0.8} />
      </mesh>
      {/* Rear Window */}
      <mesh position={[0, 0.95, -1.5]} rotation={[-0.4, Math.PI, 0]}>
        <planeGeometry args={[1.5, 0.7]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent opacity={0.8} />
      </mesh>

      {/* 4 Wheels */}
      {[-0.92, 0.92].map((x, xi) =>
        [-1.3, 1.3].map((z, zi) => (
          <mesh key={`carw-${xi}-${zi}`} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 14]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))
      )}

      {/* Headlights */}
      <mesh position={[-0.7, 0.55, 2.22]}>
        <boxGeometry args={[0.3, 0.18, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3.0} />
      </mesh>
      <mesh position={[0.7, 0.55, 2.22]}>
        <boxGeometry args={[0.3, 0.18, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3.0} />
      </mesh>

      {/* Yellow Taxi Plate */}
      <mesh position={[0, 0.35, -2.22]}>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
    </group>
  );
};

// Traffic simulation agent state
interface TrafficAgent {
  id: string;
  type: 'auto' | 'bus' | 'car';
  pos: THREE.Vector3;
  rotY: number;
  speed: number;
  targetSpeed: number;
  laneX: number;
  direction: 1 | -1; // 1: moving +Z (North), -1: moving -Z (South)
  isFlyover: boolean;
  color?: string;
}

interface AITrafficProps {
  playerPos: THREE.Vector3;
}

export const AITraffic: React.FC<AITrafficProps> = ({ playerPos }) => {
  // Initialize AI traffic agents in left-hand drive lanes
  const agents = useMemo<TrafficAgent[]>(() => {
    return [
      // --- Northbound Traffic (Left Side: X < 0, direction +1) ---
      // 1. Auto-Rickshaw on outer left lane
      {
        id: 'auto-1',
        type: 'auto',
        pos: new THREE.Vector3(-10, 0, -220),
        rotY: 0,
        speed: 10,
        targetSpeed: 10,
        laneX: -10,
        direction: 1,
        isFlyover: false,
      },
      // 2. BMTC Bus on middle left lane
      {
        id: 'bus-1',
        type: 'bus',
        pos: new THREE.Vector3(-5, 0, -140),
        rotY: 0,
        speed: 12,
        targetSpeed: 12,
        laneX: -5,
        direction: 1,
        isFlyover: false,
      },
      // 3. Indian Taxi car on outer left lane
      {
        id: 'car-1',
        type: 'car',
        pos: new THREE.Vector3(-10, 0, -40),
        rotY: 0,
        speed: 16,
        targetSpeed: 16,
        laneX: -10,
        direction: 1,
        isFlyover: false,
        color: '#ffffff',
      },
      // 4. Another Auto-rickshaw on left lane
      {
        id: 'auto-2',
        type: 'auto',
        pos: new THREE.Vector3(-5, 0, 80),
        rotY: 0,
        speed: 11,
        targetSpeed: 11,
        laneX: -5,
        direction: 1,
        isFlyover: false,
      },

      // --- Southbound Traffic (Left Side from South perspective: X > 0, direction -1) ---
      // 5. Auto-Rickshaw cruising south
      {
        id: 'auto-3',
        type: 'auto',
        pos: new THREE.Vector3(10, 0, 240),
        rotY: Math.PI,
        speed: 10,
        targetSpeed: 10,
        laneX: 10,
        direction: -1,
        isFlyover: false,
      },
      // 6. BMTC Bus cruising south
      {
        id: 'bus-2',
        type: 'bus',
        pos: new THREE.Vector3(5, 0, 160),
        rotY: Math.PI,
        speed: 13,
        targetSpeed: 13,
        laneX: 5,
        direction: -1,
        isFlyover: false,
      },
      // 7. Indian Sedan car cruising south
      {
        id: 'car-2',
        type: 'car',
        pos: new THREE.Vector3(10, 0, -60),
        rotY: Math.PI,
        speed: 17,
        targetSpeed: 17,
        laneX: 10,
        direction: -1,
        isFlyover: false,
        color: '#94a3b8',
      },

      // 8. Red Sports Taxi on middle left lane heading North
      {
        id: 'car-3',
        type: 'car',
        pos: new THREE.Vector3(-5, 0, -90),
        rotY: 0,
        speed: 20,
        targetSpeed: 20,
        laneX: -5,
        direction: 1,
        isFlyover: false,
        color: '#dc2626',
      },
      // 9. Auto-Rickshaw on outer right lane heading South
      {
        id: 'auto-4',
        type: 'auto',
        pos: new THREE.Vector3(10, 0, 90),
        rotY: Math.PI,
        speed: 14,
        targetSpeed: 14,
        laneX: 10,
        direction: -1,
        isFlyover: false,
      },
      // 10. Blue SUV on inner right lane heading South
      {
        id: 'car-4',
        type: 'car',
        pos: new THREE.Vector3(5, 0, -180),
        rotY: Math.PI,
        speed: 18,
        targetSpeed: 18,
        laneX: 5,
        direction: -1,
        isFlyover: false,
        color: '#0284c7',
      },
    ];
  }, []);

  const agentGroups = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    agents.forEach((agent, i) => {
      const grp = agentGroups.current[i];
      if (!grp) return;

      // Distance to player
      const distToPlayer = agent.pos.distanceTo(playerPos);
      const isAheadOfAgent =
        agent.direction === 1
          ? playerPos.z > agent.pos.z && playerPos.z < agent.pos.z + 18
          : playerPos.z < agent.pos.z && playerPos.z > agent.pos.z - 18;
      const isSameLane = Math.abs(playerPos.x - agent.pos.x) < 3.5;

      // Slow down / brake if player is directly ahead
      if (distToPlayer < 18 && isAheadOfAgent && isSameLane) {
        agent.speed = THREE.MathUtils.lerp(agent.speed, 0, delta * 3.5);
      } else {
        agent.speed = THREE.MathUtils.lerp(agent.speed, agent.targetSpeed, delta * 1.5);
      }

      // Move along Z axis
      agent.pos.z += agent.speed * agent.direction * delta;

      // Collision detection with player Ferrari
      const dx = Math.abs(playerPos.x - agent.pos.x);
      const dz = Math.abs(playerPos.z - agent.pos.z);
      const carW = agent.type === 'bus' ? 2.8 : agent.type === 'auto' ? 1.8 : 2.0;
      const carL = agent.type === 'bus' ? 10.5 : agent.type === 'auto' ? 2.8 : 4.4;
      const playerW = 2.1;
      const playerL = 4.6;

      if (
        dx < (carW + playerW) * 0.48 &&
        dz < (carL + playerL) * 0.48 &&
        Math.abs(playerPos.y - agent.pos.y) < 2.2
      ) {
        // Displace agent slightly and dispatch collision event
        const pushX = playerPos.x > agent.pos.x ? 5.5 : -5.5;
        const pushZ = agent.direction === 1 ? -4.0 : 4.0;
        window.dispatchEvent(
          new CustomEvent('car-traffic-collision', {
            detail: {
              recoilX: pushX,
              recoilZ: pushZ,
              intensity: agent.type === 'bus' ? 1.5 : 1.0,
            },
          })
        );
        agent.speed = THREE.MathUtils.lerp(agent.speed, 0, delta * 8);
      }

      // Handle Flyover ramp elevations
      if (agent.isFlyover) {
        // Loop flyover relative to player
        if (agent.direction === 1) {
          if (agent.pos.z < playerPos.z - 200) {
            agent.pos.z = playerPos.z + 240;
          } else if (agent.pos.z > playerPos.z + 300) {
            agent.pos.z = playerPos.z - 160;
          }
        } else {
          if (agent.pos.z > playerPos.z + 240) {
            agent.pos.z = playerPos.z - 180;
          } else if (agent.pos.z < playerPos.z - 200) {
            agent.pos.z = playerPos.z + 240;
          }
        }
      } else {
        // Dynamic Infinite Ground Loop around player position
        if (agent.direction === 1) {
          // Northbound traffic (moving +Z)
          if (agent.pos.z < playerPos.z - 160) {
            agent.pos.z = playerPos.z + 200 + ((i * 37) % 110);
          } else if (agent.pos.z > playerPos.z + 340) {
            agent.pos.z = playerPos.z - 120 - ((i * 23) % 70);
          }
        } else {
          // Southbound traffic (moving -Z)
          if (agent.pos.z < playerPos.z - 160) {
            agent.pos.z = playerPos.z + 240 + ((i * 43) % 120);
          } else if (agent.pos.z > playerPos.z + 340) {
            agent.pos.z = playerPos.z - 120 - ((i * 29) % 70);
          }
        }
      }

      // Update transform
      grp.position.copy(agent.pos);
      grp.rotation.y = agent.rotY;
    });
  });

  return (
    <group>
      {agents.map((agent, i) => (
        <group
          key={agent.id}
          ref={(el) => (agentGroups.current[i] = el)}
          position={agent.pos}
          rotation={[0, agent.rotY, 0]}
        >
          {agent.type === 'auto' && <AutoRickshawMesh />}
          {agent.type === 'bus' && <BMTCBusMesh />}
          {agent.type === 'car' && <IndianCarMesh color={agent.color} />}
        </group>
      ))}
    </group>
  );
};
