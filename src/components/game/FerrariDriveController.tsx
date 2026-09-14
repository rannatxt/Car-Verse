import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { audioEngine } from './AudioEngine';

export interface CarTelemetry {
  speedKmh: number;
  rpm: number;
  gear: number | string;
  driftScore: number;
  driftMultiplier: number;
  isDrifting: boolean;
  position: THREE.Vector3;
  heading: number;
  slipRatio: number;
  headlightsOn: boolean;
  carVelocity: THREE.Vector3;
  leftTirePos: THREE.Vector3;
  rightTirePos: THREE.Vector3;
  boostBar?: number;
  lateralG?: number;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
  horn: boolean;
  reset: boolean;
  toggleCamera: boolean;
  toggleLights: boolean;
}

interface FerrariDriveControllerProps {
  virtualInput?: Partial<InputState>;
  onTelemetryUpdate?: (telemetry: CarTelemetry) => void;
  onCameraToggle?: () => void;
  carRef?: React.MutableRefObject<THREE.Group | null>;
  initialPosition?: [number, number, number];
  cameraMode?: string;
}

// Pre-allocated vectors for zero-garbage physics loops
const _tmpLeftTire = new THREE.Vector3(-0.85, 0, -1.45);
const _tmpRightTire = new THREE.Vector3(0.85, 0, -1.45);
const _upAxis = new THREE.Vector3(0, 1, 0);

// ================= 3D REALISTIC HUMAN DRIVER COMPONENT =================
export const HumanDriver: React.FC<{
  steerAngle: number;
  speedKmh: number;
  isCockpitView?: boolean;
}> = ({
  steerAngle,
  speedKmh,
  isCockpitView = false,
}) => {
  // Driver head subtly turns into corner apex
  const headYaw = steerAngle * 0.45;
  // Dynamic G-force torso pitch: leans back on hard throttle, dives on braking
  const accelInertia = THREE.MathUtils.clamp((speedKmh / 260) * 0.08, -0.06, 0.08);

  return (
    <group position={[0.35, 0.48, 0.15]} rotation={[accelInertia, 0, 0]}>
      {/* Racing Bucket Seat */}
      <group position={[0, 0.0, -0.15]}>
        <mesh position={[0, 0.45, -0.12]} rotation={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.85, 0.14]} />
          <meshStandardMaterial color="#18181b" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.95, -0.22]} rotation={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.28, 0.12]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.8} />
        </mesh>
        <mesh position={[-0.24, 0.38, -0.04]} rotation={[-0.2, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.65, 0.22]} />
          <meshStandardMaterial color="#18181b" roughness={0.85} />
        </mesh>
        <mesh position={[0.24, 0.38, -0.04]} rotation={[-0.2, -0.3, 0]}>
          <boxGeometry args={[0.1, 0.65, 0.22]} />
          <meshStandardMaterial color="#18181b" roughness={0.85} />
        </mesh>
      </group>

      {/* Driver Torso in Ferrari Rosso Corsa Racing Suit */}
      <mesh position={[0, 0.42, -0.02]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.58, 0.24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
      {/* Black Side Panels */}
      <mesh position={[-0.21, 0.42, -0.02]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.04, 0.58, 0.22]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>
      <mesh position={[0.21, 0.42, -0.02]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.04, 0.58, 0.22]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>
      {/* 5-Point Racing Harness Shoulder Straps */}
      <mesh position={[-0.11, 0.44, 0.11]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.07, 0.54, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      <mesh position={[0.11, 0.44, 0.11]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.07, 0.54, 0.02]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Driver Helmet & Head with Dynamic Cornering Apex Tilt (Hidden in Cockpit View) */}
      {!isCockpitView && (
        <group position={[0, 0.82, -0.08]} rotation={[0, headYaw, -headYaw * 0.2]}>
          {/* Aerodynamic Helmet Shell */}
          <mesh castShadow>
            <sphereGeometry args={[0.19, 16, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.4} />
          </mesh>
          {/* Red Ferrari Racing Livery Stripe */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.192, 0.192, 0.08, 16]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {/* Tinted Black Aerodynamic Visor */}
          <mesh position={[0, 0.02, 0.14]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.24, 0.11, 0.1]} />
            <meshPhysicalMaterial
              color="#09090b"
              roughness={0.05}
              metalness={0.95}
              reflectivity={1.0}
            />
          </mesh>
        </group>
      )}

      {/* Driver Arms & Hands Gripping Steering Wheel */}
      {/* Left Arm & Hand */}
      <group position={[-0.2, 0.5, 0.02]}>
        <mesh position={[-0.04, -0.12, 0.14]} rotation={[0.8, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.07, 0.32, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh position={[-0.02, -0.22, 0.38]} rotation={[1.3, steerAngle * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh position={[0.0, -0.25, 0.52]} rotation={[0, steerAngle, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Arm & Hand */}
      <group position={[0.2, 0.5, 0.02]}>
        <mesh position={[0.04, -0.12, 0.14]} rotation={[0.8, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.07, 0.32, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh position={[0.02, -0.22, 0.38]} rotation={[1.3, steerAngle * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#dc2626" roughness={0.7} />
        </mesh>
        <mesh position={[0.0, -0.25, 0.52]} rotation={[0, steerAngle, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.1]} />
          <meshStandardMaterial color="#18181b" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export const FerrariDriveController: React.FC<FerrariDriveControllerProps> = ({
  virtualInput,
  onTelemetryUpdate,
  onCameraToggle,
  carRef: externalCarRef,
  initialPosition = [-7.5, 0, -60],
  cameraMode = 'chase',
}) => {
  const { scene } = useGLTF('/models/ferrari.glb');
  const localCarRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);

  // Wheel node references
  const wheelFL = useRef<THREE.Object3D | null>(null);
  const wheelFR = useRef<THREE.Object3D | null>(null);
  const wheelRL = useRef<THREE.Object3D | null>(null);
  const wheelRR = useRef<THREE.Object3D | null>(null);
  const steeringWheel = useRef<THREE.Object3D | null>(null);
  const brakeLightsMat = useRef<THREE.MeshStandardMaterial | null>(null);

  // --- Physics Variables ---
  const pos = useRef<THREE.Vector3>(new THREE.Vector3(...initialPosition));
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3());
  const heading = useRef<number>(0); // Radians (0 = facing North along +Z)
  const speed = useRef<number>(0); // Forward speed in m/s (+ = forward along nose, - = reverse)
  const steerAngle = useRef<number>(0); // Current wheel turn angle in radians
  const lateralSlip = useRef<number>(0); // Sideways slip velocity
  const suspensionPitch = useRef<number>(0); // Chassis diving / squatting
  const suspensionRoll = useRef<number>(0); // Chassis body roll in corners
  const verticalVel = useRef<number>(0); // Vertical bounce / suspension oscillation
  const altitude = useRef<number>(0); // Y position

  // Gameplay state
  const driftScore = useRef<number>(0);
  const driftMultiplier = useRef<number>(1.0);
  const driftTimer = useRef<number>(0);
  const headlightsOn = useRef<boolean>(true);
  const hornWasPressed = useRef<boolean>(false);
  const bumpCooldown = useRef<number>(0);
  const telemetryThrottle = useRef<number>(0);

  // Keyboard Inputs
  const keys = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    horn: false,
    reset: false,
    toggleCamera: false,
    toggleLights: false,
  });

  // Deep clone Ferrari model and extract nodes
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (!clonedScene) return;

    // Premium Rosso Corsa Ferrari paint
    const carPaint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c51b1b'),
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
    });

    const brakeRedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#7f1d1d'),
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    brakeLightsMat.current = brakeRedMat;

    const rimMetal = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'),
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.8,
    });

    const caliperRed = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#dc2626'),
      metalness: 0.4,
      roughness: 0.2,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      transmission: 0.92,
      transparent: true,
      opacity: 0.88,
      roughness: 0.04,
      ior: 1.5,
    });

    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();

      // Find specific nodes
      if (name === 'wheel_fl') wheelFL.current = child;
      if (name === 'wheel_fr') wheelFR.current = child;
      if (name === 'wheel_rl') wheelRL.current = child;
      if (name === 'wheel_rr') wheelRR.current = child;
      if (name === 'steering_wheel') steeringWheel.current = child;

      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (
          name.includes('body') ||
          name.includes('chassis') ||
          name.includes('hood') ||
          name.includes('door') ||
          name.includes('bumper')
        ) {
          mesh.material = carPaint;
        } else if (name.includes('rim')) {
          mesh.material = rimMetal;
        } else if (name.includes('brake') && !name.includes('lights')) {
          mesh.material = caliperRed;
        } else if (name.includes('lights_red') || name.includes('tail_light')) {
          mesh.material = brakeRedMat;
        } else if (name.includes('glass') || name.includes('windscreen') || name.includes('windshield')) {
          mesh.material = glassMat;
        }
      }
    });

    // Normalize scale to length ~4.7 meters
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const length = Math.max(size.x, size.z);
    const scale = 4.7 / length;
    clonedScene.scale.set(scale, scale, scale);

    box.setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min;
    clonedScene.position.set(-center.x, -min.y, -center.z);
  }, [clonedScene]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          keys.current.handbrake = true;
          break;
        case 'KeyR':
          // Reset car facing forward
          pos.current.set(-7.5, 0, pos.current.z);
          speed.current = 0;
          lateralSlip.current = 0;
          heading.current = 0;
          velocity.current.set(0, 0, 0);
          break;
        case 'KeyC':
          onCameraToggle?.();
          break;
        case 'KeyH':
          keys.current.horn = true;
          audioEngine.startHorn();
          break;
        case 'KeyL':
          headlightsOn.current = !headlightsOn.current;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.handbrake = false;
          break;
        case 'KeyH':
          keys.current.horn = false;
          audioEngine.stopHorn();
          break;
      }
    };

    const handleTrafficCollision = (e: Event) => {
      const customEvent = e as CustomEvent<{ recoilX: number; recoilZ: number; intensity: number }>;
      const { recoilX = 0, recoilZ = 0, intensity = 1.0 } = customEvent.detail || {};
      velocity.current.x += recoilX;
      velocity.current.z += recoilZ;
      speed.current *= 0.55;
      verticalVel.current = 1.6 * intensity;
      audioEngine.playCrash(intensity);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('car-traffic-collision', handleTrafficCollision);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('car-traffic-collision', handleTrafficCollision);
      audioEngine.stopHorn();
    };
  }, [onCameraToggle]);

  // Main Vehicle Physics Loop (useFrame)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.04);

    // Merge keyboard and virtual/mobile touch inputs
    const inputForward = keys.current.forward || !!virtualInput?.forward;
    const inputBackward = keys.current.backward || !!virtualInput?.backward;
    const inputLeft = keys.current.left || !!virtualInput?.left;
    const inputRight = keys.current.right || !!virtualInput?.right;
    const inputHandbrake = keys.current.handbrake || !!virtualInput?.handbrake;
    const inputHorn = keys.current.horn || !!virtualInput?.horn;

    // Handle Horn from virtual or keyboard
    if (inputHorn && !hornWasPressed.current) {
      audioEngine.startHorn();
      hornWasPressed.current = true;
    } else if (!inputHorn && hornWasPressed.current) {
      audioEngine.stopHorn();
      hornWasPressed.current = false;
    }

    // --- 1. Speed-Sensitive Steering Dynamics ---
    // Left input -> targetSteer > 0 -> heading turns left
    // Right input -> targetSteer < 0 -> heading turns right
    const targetSteer = (inputLeft ? 1 : 0) - (inputRight ? 1 : 0);
    const maxSteerAngle = 0.56 / (1 + Math.abs(speed.current) * 0.035);
    steerAngle.current = THREE.MathUtils.lerp(
      steerAngle.current,
      targetSteer * maxSteerAngle,
      dt * 12
    );

    // --- 2. Smooth Supercar Acceleration, Braking & Reverse ---
    const maxSpeedForward = 82; // ~295 km/h
    const maxSpeedReverse = -16; // ~58 km/h
    const accelRate = 24.0;
    const brakeRate = 38.0;
    const coastFriction = 2.8;

    let throttle = 0;
    if (inputForward) {
      throttle = 1.0;
      if (speed.current < maxSpeedForward) {
        const torqueFactor = Math.max(0.35, 1.0 - (speed.current / maxSpeedForward) * 0.55);
        speed.current += accelRate * torqueFactor * dt;
      }
    } else if (inputBackward) {
      if (speed.current > 0.4) {
        // Braking while moving forward
        throttle = 0;
        speed.current = Math.max(0, speed.current - brakeRate * dt);
      } else {
        // Smooth Reverse gear when stopped
        throttle = 0.65;
        if (speed.current > maxSpeedReverse) {
          speed.current -= accelRate * 0.55 * dt;
        }
      }
    } else {
      // Coasting & aerodynamic drag
      if (Math.abs(speed.current) > 0.1) {
        const aeroDrag = 0.0018 * speed.current * speed.current;
        const totalDecel = (coastFriction + aeroDrag) * dt;
        if (Math.abs(speed.current) <= totalDecel) {
          speed.current = 0;
        } else {
          speed.current -= Math.sign(speed.current) * totalDecel;
        }
      } else {
        speed.current = 0;
      }
    }

    // Handbrake deceleration
    if (inputHandbrake) {
      speed.current -= Math.sign(speed.current) * 22.0 * dt;
      if (Math.abs(speed.current) < 0.2) speed.current = 0;
    }

    // --- 3. Heading & Drifting (Yaw & Lateral Slip) ---
    const turnSpeedFactor = THREE.MathUtils.clamp(Math.abs(speed.current) / 5.5, 0, 1);
    const yawRate = steerAngle.current * (speed.current >= 0 ? 1 : -1) * 3.0 * turnSpeedFactor;

    // Drifting slip calculation
    const baseGrip = inputHandbrake ? 0.32 : 0.88;
    const lateralForce = Math.sin(steerAngle.current) * speed.current * 1.5;

    if (Math.abs(speed.current) > 7 && (Math.abs(lateralForce) > 3.8 || inputHandbrake)) {
      lateralSlip.current = THREE.MathUtils.lerp(lateralSlip.current, lateralForce * 1.4, dt * 6);
      heading.current += (yawRate + lateralSlip.current * 0.07) * dt;
    } else {
      lateralSlip.current = THREE.MathUtils.lerp(lateralSlip.current, 0, dt * baseGrip * 9);
      heading.current += yawRate * dt;
    }

    // Velocity Vector in world space
    const forwardX = Math.sin(heading.current);
    const forwardZ = Math.cos(heading.current);
    const rightX = Math.cos(heading.current);
    const rightZ = -Math.sin(heading.current);

    velocity.current.x = forwardX * speed.current + rightX * lateralSlip.current;
    velocity.current.z = forwardZ * speed.current + rightZ * lateralSlip.current;

    // --- 4. INFINITE ROAD POSITION UPDATE ---
    pos.current.x += velocity.current.x * dt;
    pos.current.z += velocity.current.z * dt;
    // expose car Z for InfiniteRoad component
    (window as any).carPositionZ = pos.current.z;

    // Lateral boundary (keeps car on 6-lane boulevard between kerbs)
    if (pos.current.x < -15.5) {
      pos.current.x = -15.5;
      velocity.current.x = Math.abs(velocity.current.x) * 0.4;
      speed.current *= 0.85;
      audioEngine.playCrash(0.65);
    } else if (pos.current.x > 15.5) {
      pos.current.x = 15.5;
      velocity.current.x = -Math.abs(velocity.current.x) * 0.4;
      speed.current *= 0.85;
      audioEngine.playCrash(0.65);
    }

    // Central Jersey Barrier Concrete Median Collision (Between X = -1.2 and X = 1.2)
    if (pos.current.x > -1.25 && pos.current.x < 0) {
      pos.current.x = -1.28;
      velocity.current.x = -Math.abs(velocity.current.x) * 0.45;
      speed.current *= 0.8;
      audioEngine.playCrash(0.8);
    } else if (pos.current.x < 1.25 && pos.current.x >= 0) {
      pos.current.x = 1.28;
      velocity.current.x = Math.abs(velocity.current.x) * 0.45;
      speed.current *= 0.8;
      audioEngine.playCrash(0.8);
    }

    // Speed Breaker Bump (Synchronized with 3D speedbreaker at Z = 150 of every 300m chunk)
    bumpCooldown.current = Math.max(0, bumpCooldown.current - dt);
    const modZ = ((pos.current.z % 300) + 300) % 300;
    const isOverSpeedBreaker =
      Math.abs(pos.current.x) < 15.2 && Math.abs(pos.current.x) > 1.3 && Math.abs(modZ - 150) < 1.8;

    if (isOverSpeedBreaker && bumpCooldown.current <= 0 && Math.abs(speed.current) > 2.5) {
      verticalVel.current = Math.min(2.8, Math.abs(speed.current) * 0.14);
      audioEngine.playBump();
      bumpCooldown.current = 0.35;
    }

    // Suspension spring & damping
    verticalVel.current -= 28.0 * dt;
    altitude.current += verticalVel.current * dt;
    if (altitude.current < 0) {
      altitude.current = 0;
      verticalVel.current = 0;
    }
    pos.current.y = altitude.current;

    // Chassis Pitch & Roll
    const targetPitch =
      (inputForward ? -0.04 : 0) +
      (inputBackward && speed.current > 1 ? 0.07 : 0) +
      (verticalVel.current > 0 ? -0.05 : 0);
    suspensionPitch.current = THREE.MathUtils.lerp(suspensionPitch.current, targetPitch, dt * 9);

    const targetRoll = -yawRate * 0.08 - lateralSlip.current * 0.03;
    suspensionRoll.current = THREE.MathUtils.lerp(suspensionRoll.current, targetRoll, dt * 9);

    // Wheels & Steering Transforms
    const rollAngle = (speed.current * dt) / 0.35;
    const frontSteer = steerAngle.current;

    if (wheelFL.current) {
      wheelFL.current.rotation.y = -frontSteer;
      wheelFL.current.rotation.x -= rollAngle;
    }
    if (wheelFR.current) {
      wheelFR.current.rotation.y = -frontSteer;
      wheelFR.current.rotation.x -= rollAngle;
    }
    if (wheelRL.current) {
      wheelRL.current.rotation.x -= rollAngle;
    }
    if (wheelRR.current) {
      wheelRR.current.rotation.x -= rollAngle;
    }
    if (steeringWheel.current) {
      steeringWheel.current.rotation.z = frontSteer * 2.2;
    }

    // Brake Lights Emissive
    if (brakeLightsMat.current) {
      const isBraking = (inputBackward && speed.current > 0.4) || inputHandbrake;
      brakeLightsMat.current.emissiveIntensity = isBraking ? 5.5 : 0.8;
      brakeLightsMat.current.color.set(isBraking ? '#ff1e1e' : '#991b1b');
    }

    // Master Group Update
    if (localCarRef.current) {
      localCarRef.current.position.copy(pos.current);
      localCarRef.current.rotation.set(0, heading.current, 0);

      if (chassisRef.current) {
        chassisRef.current.rotation.x = suspensionPitch.current;
        chassisRef.current.rotation.z = suspensionRoll.current;
      }
    }

    // Render EngineSound component (placeholder) at top level
    // It will be added to the scene hierarchy elsewhere

    if (externalCarRef) {
      externalCarRef.current = localCarRef.current;
    }

    // Drift Score & Multiplier
    const speedKmh = Math.abs(speed.current) * 3.6;
    const slipRatio = Math.abs(lateralSlip.current) / (Math.abs(speed.current) + 0.1);
    const isDrifting = slipRatio > 0.22 && speedKmh > 18;

    if (isDrifting) {
      driftTimer.current += dt;
      driftMultiplier.current = Math.min(5.0, 1.0 + driftTimer.current * 0.6);
      driftScore.current += Math.round(slipRatio * speedKmh * 8 * driftMultiplier.current * dt);
    } else {
      driftTimer.current = Math.max(0, driftTimer.current - dt * 0.8);
      if (driftTimer.current <= 0) {
        driftMultiplier.current = 1.0;
      }
    }

    // Simulated Engine Gear & RPM
    let gear: number | string = 1;
    let gearRatio = 1;
    if (speed.current < -0.1) {
      gear = 'R';
      gearRatio = 35;
    } else if (speedKmh < 45) {
      gear = 1;
      gearRatio = 45;
    } else if (speedKmh < 85) {
      gear = 2;
      gearRatio = 85;
    } else if (speedKmh < 130) {
      gear = 3;
      gearRatio = 130;
    } else if (speedKmh < 180) {
      gear = 4;
      gearRatio = 180;
    } else if (speedKmh < 230) {
      gear = 5;
      gearRatio = 230;
    } else if (speedKmh < 275) {
      gear = 6;
      gearRatio = 275;
    } else {
      gear = 7;
      gearRatio = 320;
    }

    const prevGearMax = gear === 1 ? 0 : gearRatio * 0.65;
    const gearProgress = Math.max(0, Math.min(1, (speedKmh - prevGearMax) / (gearRatio - prevGearMax)));
    const rpm = Math.round(1100 + gearProgress * 7200 + (throttle > 0 ? 300 : 0));

    // Update V8 Engine Audio
    audioEngine.update(rpm, throttle, speedKmh, slipRatio, typeof gear === 'number' ? gear : 1);
      // Engine sound component receives rpm and throttle via context or props (stubbed here)
      // <EngineSound rpm={rpm} throttle={throttle} /> // will be rendered at root

    // Tire world positions for skid marks
    const leftTireWorld = _tmpLeftTire
      .clone()
      .applyAxisAngle(_upAxis, heading.current)
      .add(pos.current);
    const rightTireWorld = _tmpRightTire
      .clone()
      .applyAxisAngle(_upAxis, heading.current)
      .add(pos.current);

    // Turbo boost simulation
    const boostBar = throttle * (0.2 + (rpm / 8500) * 1.8);
    // Lateral G-force calculation
    const lateralG = (yawRate * speed.current) / 9.81;

    // Throttled Telemetry update (~22Hz)
    telemetryThrottle.current += dt;
    if (telemetryThrottle.current >= 0.045) {
      telemetryThrottle.current = 0;
      onTelemetryUpdate?.({
        speedKmh: Math.round(speedKmh),
        rpm,
        gear,
        driftScore: driftScore.current,
        driftMultiplier: Number(driftMultiplier.current.toFixed(1)),
        isDrifting,
        position: pos.current.clone(),
        heading: heading.current,
        slipRatio,
        headlightsOn: headlightsOn.current,
        carVelocity: velocity.current.clone(),
        leftTirePos: leftTireWorld,
        rightTirePos: rightTireWorld,
        boostBar: Number(boostBar.toFixed(2)),
        lateralG: Number(lateralG.toFixed(2)),
      });
    }
  });

  return (
    <group ref={localCarRef} position={initialPosition}>
      <group ref={chassisRef}>
        {/* Rotate Ferrari model by Math.PI around Y so front points +Z */}
        <primitive object={clonedScene} rotation={[0, Math.PI, 0]} />

        {/* 3D REALISTIC HUMAN RACING DRIVER INSIDE COCKPIT */}
        <HumanDriver
          steerAngle={steerAngle.current}
          speedKmh={Math.abs(speed.current) * 3.6}
          isCockpitView={cameraMode === 'cockpit'}
        />

        {/* Headlight Beams */}
        {headlightsOn.current && (
          <group position={[0, 0.68, 2.25]}>
            <spotLight
              position={[-0.72, 0, 0]}
              target-position={[-0.72, -0.6, 32]}
              color="#e0f2fe"
              intensity={5.5}
              angle={0.65}
              penumbra={0.4}
              distance={55}
              castShadow
            />
            <spotLight
              position={[0.72, 0, 0]}
              target-position={[0.72, -0.6, 32]}
              color="#e0f2fe"
              intensity={5.5}
              angle={0.65}
              penumbra={0.4}
              distance={55}
              castShadow
            />
          </group>
        )}

        {/* Taillight Glow */}
        <group position={[0, 0.65, -2.25]}>
          <pointLight
            position={[-0.65, 0, 0]}
            color="#ef4444"
            intensity={brakeLightsMat.current?.emissiveIntensity ? 2.5 : 0.4}
            distance={5}
            decay={2}
          />
          <pointLight
            position={[0.65, 0, 0]}
            color="#ef4444"
            intensity={brakeLightsMat.current?.emissiveIntensity ? 2.5 : 0.4}
            distance={5}
            decay={2}
          />
        </group>
      </group>
    </group>
  );
};
