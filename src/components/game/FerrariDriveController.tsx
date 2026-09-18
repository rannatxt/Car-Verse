import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
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
  distanceMeters: number;
  carHp: number;
  isSlowedDown: boolean;
  slowdownRemainingSec: number;
  isGameOver: boolean;
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
    <group position={[0.22, 0.28, 0.05]} scale={0.58} rotation={[accelInertia, 0, 0]}>
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
  const modelOffset = useRef<THREE.Vector3>(new THREE.Vector3());
  const modelScale = useRef<number>(1.0);
  const modelHeight = useRef<number>(1.2); // car body height for driver Y placement

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
  const distanceDriven = useRef<number>(0);
  const carHp = useRef<number>(100);
  const damageCooldown = useRef<number>(0);
  const slowdownTimer = useRef<number>(0);
  const invulnerableTimer = useRef<number>(0);

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

  // Deep clone Ferrari model, normalize rotation+scale, and compute centering offset — all synchronously
  const { clonedScene, sceneOffset, sceneHeight } = useMemo(() => {
    const cloned = scene.clone(true);

    // Apply 180° Y rotation so car front faces +Z (forward, away from chase camera)
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, Math.PI, 0);
    cloned.scale.set(1, 1, 1);
    cloned.updateMatrixWorld(true);

    // Scale car to ~4.7m length
    const box1 = new THREE.Box3().setFromObject(cloned);
    const size1 = box1.getSize(new THREE.Vector3());
    const len = Math.max(size1.x, size1.z);
    const s = 4.7 / (len || 1);
    cloned.scale.set(s, s, s);
    cloned.updateMatrixWorld(true);

    // Compute final bounds to get the centering offset
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    const min2 = box2.min;
    const size2 = box2.getSize(new THREE.Vector3());

    // The offset to apply on the JSX wrapper group so model bottom sits at Y=0 and is centered in X/Z
    const offset = new THREE.Vector3(-center.x, -min2.y, -center.z);
    // cloned.position stays (0,0,0) — JSX wrapper moves it

    return { clonedScene: cloned, sceneOffset: offset, sceneHeight: size2.y };
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

    // Wheel node extraction and material assignment only — scale/rotation/offset handled in useMemo
  }, [clonedScene]);

  const applyDamage = (amount: number) => {
    if (invulnerableTimer.current > 0 || carHp.current <= 0) return;

    const oldHp = carHp.current;
    let newHp = Math.max(0, oldHp - amount);

    // Check if crossing 75%, 50%, or 25% thresholds
    if (oldHp > 75 && newHp <= 75) {
      newHp = 75;
      invulnerableTimer.current = 3.5; // 3.5s damage shield
      slowdownTimer.current = 3.0; // 3s engine slowdown
      speed.current = Math.min(speed.current, 9.0);
    } else if (oldHp > 50 && newHp <= 50) {
      newHp = 50;
      invulnerableTimer.current = 3.5;
      slowdownTimer.current = 3.0;
      speed.current = Math.min(speed.current, 9.0);
    } else if (oldHp > 25 && newHp <= 25) {
      newHp = 25;
      invulnerableTimer.current = 3.5;
      slowdownTimer.current = 3.0;
      speed.current = Math.min(speed.current, 9.0);
    }

    carHp.current = newHp;
  };

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
          // Reset car facing forward, starting position, score & repair HP
          pos.current.set(initialPosition[0], initialPosition[1], initialPosition[2]);
          speed.current = 0;
          lateralSlip.current = 0;
          heading.current = 0;
          velocity.current.set(0, 0, 0);
          carHp.current = 100;
          distanceDriven.current = 0;
          driftScore.current = 0;
          slowdownTimer.current = 0;
          invulnerableTimer.current = 0;
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
      verticalVel.current = 0.4 * intensity;
      applyDamage(Math.round(15 * intensity));
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
    // High-speed steering lock tightens progressively at speed for real supercar stability
    const targetSteer = (inputLeft ? 1 : 0) - (inputRight ? 1 : 0);
    const speedRatio = Math.min(1.0, Math.abs(speed.current) / 75.0);
    const maxSteerAngle = THREE.MathUtils.lerp(0.32, 0.08, speedRatio);

    steerAngle.current = THREE.MathUtils.lerp(
      steerAngle.current,
      targetSteer * maxSteerAngle,
      dt * 8.0
    );

    // --- 2. Smooth Supercar Acceleration, Braking & Reverse ---
    if (slowdownTimer.current > 0) {
      slowdownTimer.current = Math.max(0, slowdownTimer.current - dt);
    }
    if (invulnerableTimer.current > 0) {
      invulnerableTimer.current = Math.max(0, invulnerableTimer.current - dt);
    }

    const maxSpeedForward = slowdownTimer.current > 0 ? 11.5 : 82; // ~41 km/h when engine stunned, ~295 km/h normal
    const maxSpeedReverse = -16; // ~58 km/h
    const accelRate = 16.5; // Progressive V8 acceleration
    const brakeRate = 34.0;
    const coastFriction = 2.2;

    let throttle = 0;
    if (inputForward) {
      throttle = 1.0;
      if (speed.current < maxSpeedForward) {
        const torqueFactor = Math.max(0.4, 1.0 - (speed.current / maxSpeedForward) * 0.5);
        speed.current += accelRate * torqueFactor * dt;
      } else if (slowdownTimer.current > 0) {
        // Cap speed immediately during slowdown penalty
        speed.current = THREE.MathUtils.lerp(speed.current, maxSpeedForward, dt * 6.0);
      }
    } else if (inputBackward) {
      if (speed.current > 0.4) {
        throttle = 0;
        speed.current = Math.max(0, speed.current - brakeRate * dt);
      } else {
        throttle = 0.65;
        if (speed.current > maxSpeedReverse) {
          speed.current -= accelRate * 0.5 * dt;
        }
      }
    } else {
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

    // --- 3. Responsive 360-Degree Supercar Steering & Turning Kinematics ---
    // Smooth speed-sensitive steering yaw rate (optimal, smooth, realistic 360° turning)
    const speedMag = Math.abs(speed.current);
    const turnRatio = Math.min(1.0, speedMag / 3.5);
    // Tighten steering sensitivity at high speeds so high-speed turns stay smooth and non-twitchy
    const highSpeedDamp = THREE.MathUtils.clamp(1.2 - (speedMag / 80) * 0.5, 0.45, 1.2);
    const yawRate = steerAngle.current * (speed.current >= 0 ? 1 : -1) * 1.5 * turnRatio * highSpeedDamp;

    // Drifting & full 360° heading rotation
    const baseGrip = inputHandbrake ? 0.35 : 0.92;
    if (speedMag > 5.0 && (Math.abs(steerAngle.current) > 0.1 || inputHandbrake)) {
      const slip = Math.sin(steerAngle.current) * speed.current * 0.9;
      lateralSlip.current = THREE.MathUtils.lerp(lateralSlip.current, slip, dt * 5.0);
      heading.current += (yawRate + lateralSlip.current * 0.03) * dt;
    } else {
      lateralSlip.current = THREE.MathUtils.lerp(lateralSlip.current, 0, dt * baseGrip * 8.0);
      heading.current += yawRate * dt;
    }

    // Velocity Vector in 360-degree world space
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

    // Distance Score: Forward increases score, Reverse decreases score
    if (speed.current > 0.4) {
      distanceDriven.current += speed.current * dt;
    } else if (speed.current < -0.4) {
      // Driving backwards lowers/penalizes score
      distanceDriven.current = Math.max(0, distanceDriven.current - Math.abs(speed.current) * 0.6 * dt);
    }

    damageCooldown.current = Math.max(0, damageCooldown.current - dt);

    // Lateral boundary (keeps car on 6-lane boulevard between kerbs)
    if (pos.current.x < -15.5) {
      pos.current.x = -15.5;
      velocity.current.x = Math.abs(velocity.current.x) * 0.4;
      speed.current *= 0.85;
      audioEngine.playCrash(0.65);
      if (damageCooldown.current <= 0) {
        applyDamage(10);
        damageCooldown.current = 0.5;
      }
    } else if (pos.current.x > 15.5) {
      pos.current.x = 15.5;
      velocity.current.x = -Math.abs(velocity.current.x) * 0.4;
      speed.current *= 0.85;
      audioEngine.playCrash(0.65);
      if (damageCooldown.current <= 0) {
        applyDamage(10);
        damageCooldown.current = 0.5;
      }
    }

    // Central Jersey Barrier Concrete Median Collision (Between X = -1.2 and X = 1.2)
    if (pos.current.x > -1.25 && pos.current.x < 0) {
      pos.current.x = -1.28;
      velocity.current.x = -Math.abs(velocity.current.x) * 0.45;
      speed.current *= 0.8;
      audioEngine.playCrash(0.8);
      if (damageCooldown.current <= 0) {
        applyDamage(12);
        damageCooldown.current = 0.5;
      }
    } else if (pos.current.x < 1.25 && pos.current.x >= 0) {
      pos.current.x = 1.28;
      velocity.current.x = Math.abs(velocity.current.x) * 0.45;
      speed.current *= 0.8;
      audioEngine.playCrash(0.8);
      if (damageCooldown.current <= 0) {
        applyDamage(12);
        damageCooldown.current = 0.5;
      }
    }

    // Speed Breaker Bump (Micro thud effect - car stays flat on asphalt without flying/bouncing)
    bumpCooldown.current = Math.max(0, bumpCooldown.current - dt);
    const modZ = ((pos.current.z % 300) + 300) % 300;
    const isOverSpeedBreaker =
      Math.abs(pos.current.x) < 15.2 && Math.abs(pos.current.x) > 1.3 && Math.abs(modZ - 150) < 1.8;

    if (isOverSpeedBreaker && bumpCooldown.current <= 0 && Math.abs(speed.current) > 2.5) {
      verticalVel.current = Math.min(0.25, Math.abs(speed.current) * 0.015);
      audioEngine.playBump();
      bumpCooldown.current = 0.35;
    }

    // High damping stiff sports suspension - car stays flat on asphalt
    verticalVel.current -= 45.0 * dt;
    altitude.current += verticalVel.current * dt;
    if (altitude.current < 0) {
      altitude.current = 0;
      verticalVel.current = 0;
    }
    pos.current.y = altitude.current;

    // Subtle sports car chassis pitch & roll (stiff, flat, no boat-like pitching)
    const targetPitch =
      (inputForward ? -0.01 : 0) +
      (inputBackward && speed.current > 1 ? 0.015 : 0);
    suspensionPitch.current = THREE.MathUtils.lerp(suspensionPitch.current, targetPitch, dt * 6);

    const targetRoll = -yawRate * 0.025 - lateralSlip.current * 0.01;
    suspensionRoll.current = THREE.MathUtils.lerp(suspensionRoll.current, targetRoll, dt * 6);

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
        distanceMeters: Math.round(distanceDriven.current),
        carHp: carHp.current,
        isSlowedDown: slowdownTimer.current > 0,
        slowdownRemainingSec: Number(slowdownTimer.current.toFixed(1)),
        isGameOver: carHp.current <= 0,
      });
    }
  });

  return (
    <group ref={localCarRef} position={initialPosition}>
      <group ref={chassisRef}>
        {/* Real Ground Contact Shadow & AO */}
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.85}
          scale={7}
          blur={2.0}
          far={3.5}
          color="#050508"
        />

        {/* All car visuals inside one group aligned to sceneOffset so everything is co-located */}
        <group position={[sceneOffset.x, sceneOffset.y, sceneOffset.z]}>
          <primitive object={clonedScene} />

          {/* Driver sits inside the cockpit:
              X=0.35 = left (driver) side
              Y = 38% of car height ≈ cockpit floor level
              Z = 0.25 = forward of center (dashboard/wheel area) */}
          <HumanDriver
            steerAngle={steerAngle.current}
            speedKmh={Math.abs(speed.current) * 3.6}
            isCockpitView={cameraMode === 'cockpit'}
          />
        </group>

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
