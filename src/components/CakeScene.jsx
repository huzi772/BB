import React, { useState, useRef, useEffect, useLayoutEffect, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import config from '../config';
import audioManager from '../audio/audioManager';
import CandleInteraction from './CandleInteraction';

// --- WebGL Capability & Error Boundary Fallback ---
function hasWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('CakeScene WebGL Error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function FallbackCakeScene({ onComplete }) {
  return (
    <div className="scene" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
      {/* Elegant SVG Silhouette Cake */}
      <svg width="180" height="200" viewBox="0 0 180 200" fill="none" style={{ margin: '0 auto var(--space-6) auto', filter: 'drop-shadow(0 0 15px rgba(212, 175, 122, 0.4))' }}>
        {/* Stand */}
        <path d="M40 180 L140 180 L130 190 L50 190 Z" fill="#D4AF7A" />
        <rect x="75" y="160" width="30" height="20" fill="#D4AF7A" />
        <rect x="20" y="155" width="140" height="8" rx="4" fill="#D4AF7A" />
        {/* Tier 1 (Bottom) */}
        <rect x="30" y="115" width="120" height="40" rx="3" fill="#5C0F24" stroke="#D4AF7A" strokeWidth="1.5" />
        {/* Tier 2 (Middle) */}
        <rect x="45" y="80" width="90" height="35" rx="3" fill="#5C0F24" stroke="#D4AF7A" strokeWidth="1.5" />
        {/* Tier 3 (Top) */}
        <rect x="60" y="50" width="60" height="30" rx="3" fill="#5C0F24" stroke="#D4AF7A" strokeWidth="1.5" />
        {/* Candles */}
        <rect x="68" y="32" width="4" height="18" fill="#F5EBDD" />
        <rect x="78" y="28" width="4" height="22" fill="#F5EBDD" />
        <rect x="88" y="25" width="4" height="25" fill="#F5EBDD" />
        <rect x="98" y="28" width="4" height="22" fill="#F5EBDD" />
        <rect x="108" y="32" width="4" height="18" fill="#F5EBDD" />
        {/* Flames */}
        <ellipse cx="70" cy="27" rx="3" ry="5" fill="#FFD700" />
        <ellipse cx="80" cy="23" rx="3" ry="5" fill="#FFD700" />
        <ellipse cx="90" cy="20" rx="3.5" ry="6" fill="#FFD700" />
        <ellipse cx="100" cy="23" rx="3" ry="5" fill="#FFD700" />
        <ellipse cx="110" cy="27" rx="3" ry="5" fill="#FFD700" />
      </svg>

      <CandleInteraction
        visible={true}
        onBlow={() => {}}
        onComplete={onComplete}
      />
    </div>
  );
}

// --- Procedural 3D Cake Components ---

function GoldPearls({ count = 48 }) {
  const meshRef = useRef();

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const radius = 1.32; // Tier 1 edge radius
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      dummy.position.set(x, 0.42, z);
      dummy.scale.set(0.045, 0.045, 0.045);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial color="#D4AF7A" metalness={0.85} roughness={0.25} />
    </instancedMesh>
  );
}

function FloatingGoldDust({ isMobile }) {
  const pointsRef = useRef();
  const count = isMobile ? 40 : 100;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 8;
      pos[i + 1] = Math.random() * 5;
      pos[i + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array;
    for (let i = 1; i < count * 3; i += 3) {
      posArray[i] += delta * 0.2;
      if (posArray[i] > 5) posArray[i] = 0;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#D4AF7A"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ProceduralCake({ isBlowing, pointLightRef }) {
  const groupRef = useRef();
  const flameRefs = useRef([]);
  const flameScales = useRef([1, 1, 1, 1, 1]);

  // Gentle rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    // Flame flicker animation if not extinguished
    flameRefs.current.forEach((ref, idx) => {
      if (ref && ref.visible) {
        if (isBlowing) {
          // Flame waver & shrink when blowing
          flameScales.current[idx] = Math.max(0, flameScales.current[idx] - delta * 0.8);
          ref.scale.setScalar(flameScales.current[idx] * (0.8 + Math.random() * 0.4));
          ref.rotation.z = Math.sin(state.clock.elapsedTime * 15 + idx) * 0.4;
          if (flameScales.current[idx] <= 0.05) {
            ref.visible = false;
          }
        } else {
          // Normal flame flicker
          const flicker = 1 + Math.sin(state.clock.elapsedTime * 12 + idx * 2) * 0.12;
          ref.scale.set(flicker, flicker * 1.2, flicker);
        }
      }
    });

    // Dim candle point light when blowing
    if (pointLightRef && pointLightRef.current && isBlowing) {
      pointLightRef.current.intensity = THREE.MathUtils.lerp(
        pointLightRef.current.intensity,
        0,
        delta * 2
      );
    }
  });

  // 5 Candles on top tier
  const candlePositions = [
    [0, 2.05, 0],
    [-0.32, 2.05, 0.2],
    [0.32, 2.05, 0.2],
    [-0.22, 2.05, -0.28],
    [0.22, 2.05, -0.28]
  ];

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* Stand Plate */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.7, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#D4AF7A" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.8, 0.6, 24]} />
        <meshStandardMaterial color="#D4AF7A" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Tier 1 (Bottom) */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.8, 36]} />
        <meshStandardMaterial color="#5C0F24" roughness={0.45} />
      </mesh>
      {/* Tier 1 Gold Band */}
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[1.31, 1.31, 0.04, 36]} />
        <meshStandardMaterial color="#D4AF7A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Tier 1 Ivory Frosting Edge */}
      <mesh position={[0, 0.83, 0]}>
        <torusGeometry args={[1.3, 0.035, 12, 36]} />
        <meshStandardMaterial color="#F5EBDD" roughness={0.6} />
      </mesh>

      {/* Tier 2 (Middle) */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.6, 32]} />
        <meshStandardMaterial color="#5C0F24" roughness={0.45} />
      </mesh>
      {/* Tier 2 Gold Band */}
      <mesh position={[0, 1.41, 0]}>
        <cylinderGeometry args={[0.96, 0.96, 0.035, 32]} />
        <meshStandardMaterial color="#D4AF7A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Tier 2 Ivory Frosting Edge */}
      <mesh position={[0, 1.42, 0]}>
        <torusGeometry args={[0.95, 0.03, 12, 32]} />
        <meshStandardMaterial color="#F5EBDD" roughness={0.6} />
      </mesh>

      {/* Tier 3 (Top) */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.6, 28]} />
        <meshStandardMaterial color="#5C0F24" roughness={0.45} />
      </mesh>
      {/* Tier 3 Gold Band */}
      <mesh position={[0, 2.01, 0]}>
        <cylinderGeometry args={[0.61, 0.61, 0.03, 28]} />
        <meshStandardMaterial color="#D4AF7A" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Instanced Gold Pearls */}
      <GoldPearls count={36} />

      {/* 5 Candles & Flames */}
      {candlePositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Base */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.035, 0.04, 0.03, 12]} />
            <meshStandardMaterial color="#D4AF7A" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Body */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.35, 12]} />
            <meshStandardMaterial color="#F5EBDD" roughness={0.5} />
          </mesh>
          {/* Wick */}
          <mesh position={[0, 0.39, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.04, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Flame Teardrop */}
          <mesh
            ref={(el) => (flameRefs.current[i] = el)}
            position={[0, 0.45, 0]}
          >
            <coneGeometry args={[0.04, 0.12, 12]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraController({ onIntroComplete }) {
  const { camera } = useThree();

  useEffect(() => {
    // Initial camera state
    camera.position.set(0, 0.5, 7);
    camera.lookAt(0, 0.8, 0);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReduced ? 1.5 : 4.0;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onIntroComplete) onIntroComplete();
      }
    });

    tl.to(camera.position, {
      y: 1.6,
      z: 4.2,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        camera.lookAt(0, 0.6, 0);
      }
    });

    return () => {
      tl.kill();
    };
  }, [camera, onIntroComplete]);

  return null;
}

function ThreeCakeCanvas({ isBlowing, onIntroComplete }) {
  const pointLightRef = useRef();
  const isMobile = window.innerWidth < 600;

  useEffect(() => {
    // Play magical shimmer sound when cake becomes visible
    audioManager.playSound('magical-shimmer');
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.5, 7], fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <CameraController onIntroComplete={onIntroComplete} />

      {/* Lighting Setup */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={0.8} color="#FFF8E7" />
      <pointLight
        ref={pointLightRef}
        position={[0, 1.8, 0]}
        intensity={2.2}
        color="#FFB74D"
        distance={6}
      />
      <spotLight
        position={[0, 6, 2]}
        intensity={1.2}
        angle={0.6}
        penumbra={0.8}
        color="#F5EBDD"
      />
      <pointLight position={[-4, 2, -3]} intensity={1.5} color="#8C64DC" />

      {/* Procedural Cake */}
      <ProceduralCake isBlowing={isBlowing} pointLightRef={pointLightRef} />

      {/* Floating Gold Particles */}
      <FloatingGoldDust isMobile={isMobile} />
    </Canvas>
  );
}

// --- Main CakeScene Export Component ---

export default function CakeScene({ onComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const webGLSupported = hasWebGLSupport();

  if (!webGLSupported) {
    return <FallbackCakeScene onComplete={onComplete} />;
  }

  return (
    <WebGLErrorBoundary fallback={<FallbackCakeScene onComplete={onComplete} />}>
      <div className="scene" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <ThreeCakeCanvas
          isBlowing={isBlowing}
          onIntroComplete={() => setShowInteraction(true)}
        />

        <CandleInteraction
          visible={showInteraction}
          onBlow={() => setIsBlowing(true)}
          onComplete={onComplete}
        />
      </div>
    </WebGLErrorBoundary>
  );
}
