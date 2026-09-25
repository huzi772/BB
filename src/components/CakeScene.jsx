import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, Component } from 'react';
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

// --- Procedural Texture & Geometry Helpers ---

function createCakeBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const val = 128 + (Math.random() - 0.5) * 36;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 3);
  return texture;
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function createRoundedCylinderGeometry(radius, height, bevelRadius, segments = 64) {
  const path = new THREE.Path();
  const r = Math.min(bevelRadius, radius, height / 2);

  path.moveTo(0, 0);
  path.lineTo(radius - r, 0);
  path.absarc(radius - r, r, r, -Math.PI / 2, 0, false);
  path.lineTo(radius, height - r);
  path.absarc(radius - r, height - r, r, 0, Math.PI / 2, false);
  path.lineTo(0, height);

  const points = path.getPoints(16);
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

function createCreamTopGeometry(radius, thickness, segments = 64) {
  const path = new THREE.Path();
  const crownExtra = 0.035;
  const overhangR = radius + 0.028;
  const dropY = -0.025;

  path.moveTo(0, 0);
  path.lineTo(radius - 0.08, 0);
  path.quadraticCurveTo(radius - 0.02, dropY, overhangR - 0.01, dropY / 2);
  path.quadraticCurveTo(overhangR, thickness * 0.4, overhangR - 0.015, thickness - 0.01);
  path.quadraticCurveTo(radius - 0.05, thickness + 0.025, radius - 0.2, thickness + crownExtra * 0.8);
  path.quadraticCurveTo(radius * 0.4, thickness + crownExtra, 0, thickness + crownExtra);

  const points = path.getPoints(24);
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

function createCreamRosetteGeometry(size = 0.045, segments = 24) {
  const path = new THREE.Path();

  path.moveTo(0, 0);
  path.lineTo(size * 0.85, 0);
  path.quadraticCurveTo(size * 0.95, size * 0.35, size * 0.65, size * 0.65);
  path.quadraticCurveTo(size * 0.75, size * 0.9, 0, size * 1.15);

  const points = path.getPoints(16);
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

function createFlameGeometry(radius = 0.025, height = 0.09, segments = 24) {
  const path = new THREE.Path();
  path.moveTo(0, 0);
  path.quadraticCurveTo(radius * 1.2, height * 0.25, radius, height * 0.45);
  path.quadraticCurveTo(radius * 0.5, height * 0.8, 0, height);

  const points = path.getPoints(16);
  const geo = new THREE.LatheGeometry(points, segments);
  geo.computeVertexNormals();
  return geo;
}

function createWaxGeometry(waxRadius = 0.035, waxHeight = 0.32, segments = 24) {
  const path = new THREE.Path();
  const r = 0.005;
  path.moveTo(0, 0);
  path.lineTo(waxRadius - r, 0);
  path.absarc(waxRadius - r, r, r, -Math.PI / 2, 0, false);
  path.lineTo(waxRadius, waxHeight - r);
  path.absarc(waxRadius - r, waxHeight - r, r, 0, Math.PI / 2, false);
  path.lineTo(0, waxHeight);

  const points = path.getPoints(12);
  const waxGeo = new THREE.LatheGeometry(points, segments);
  waxGeo.computeVertexNormals();
  return waxGeo;
}

// --- Procedural Sub-components ---

function GoldPearls({ count = 36 }) {
  const meshRef = useRef();

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const radius = 1.32; // Tier 1 edge radius
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      dummy.position.set(x, 0.82, z);
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

function CreamRosettes({ radius, yPos, count, size, material, isMobile }) {
  const meshRef = useRef();
  const adjustedCount = isMobile ? Math.round(count * 0.6) : count;
  const geometry = useMemo(() => createCreamRosetteGeometry(size, isMobile ? 16 : 24), [size, isMobile]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < adjustedCount; i++) {
      const angle = (i / adjustedCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      dummy.position.set(x, yPos, z);
      dummy.rotation.y = -angle;
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [radius, yPos, adjustedCount]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, adjustedCount]} castShadow receiveShadow />
  );
}

function ChocolateCurls({ radius, yPos, count = 4, material }) {
  const geometry = useMemo(() => new THREE.TorusGeometry(0.065, 0.012, 12, 24, Math.PI * 1.3), []);

  const curls = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      items.push({
        position: [x, yPos, z],
        rotation: [Math.PI / 2.3, -angle + Math.PI / 4, 0]
      });
    }
    return items;
  }, [radius, yPos, count]);

  return (
    <group>
      {curls.map((curl, i) => (
        <mesh key={i} geometry={geometry} material={material} position={curl.position} rotation={curl.rotation} castShadow receiveShadow />
      ))}
    </group>
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

function ProceduralCake({ isBlowing, pointLightRef, isMobile }) {
  const groupRef = useRef();
  const flameDataListRef = useRef([]);
  const blowStartTimeRef = useRef(-1);

  // Bump map texture for baked cake sponge texture
  const cakeBumpMap = useMemo(() => createCakeBumpTexture(), []);

  // Shared Materials
  const cakeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x5C0F24, // Preserved deep wine color
    roughness: 0.88,
    metalness: 0.0,
    bumpMap: cakeBumpMap,
    bumpScale: 0.003,
  }), [cakeBumpMap]);

  const creamMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xfffbf5,
    roughness: 0.38,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
    sheen: 0.3,
    sheenColor: 0xfff0e0,
  }), []);

  const chocolateMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x3d2314,
    roughness: 0.22,
    metalness: 0.02,
    clearcoat: 0.3,
    clearcoatRoughness: 0.15,
  }), []);

  const goldBandMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xD4AF7A,
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  const waxMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xfffcf5,
    roughness: 0.28,
    metalness: 0.0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.2,
    sheen: 0.2,
    sheenColor: 0xfff5e6,
  }), []);

  const wickMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x1f1b18,
    roughness: 0.85,
    metalness: 0.0,
  }), []);

  // Flame Basic Materials (with Additive blending & depthWrite: false)
  const outerFlameMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xff7b1a,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  const innerFlameMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xfff7c2,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  const glowFlameMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xff9900,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  // Geometries
  const segments = isMobile ? 36 : 64;
  const tier1CakeGeo = useMemo(() => createRoundedCylinderGeometry(1.3, 0.8, 0.08, segments), [segments]);
  const tier2CakeGeo = useMemo(() => createRoundedCylinderGeometry(0.95, 0.6, 0.07, segments), [segments]);
  const tier3CakeGeo = useMemo(() => createRoundedCylinderGeometry(0.6, 0.6, 0.06, segments), [segments]);

  const tier1CreamGeo = useMemo(() => createCreamTopGeometry(1.3, 0.08, segments), [segments]);
  const tier2CreamGeo = useMemo(() => createCreamTopGeometry(0.95, 0.07, segments), [segments]);
  const tier3CreamGeo = useMemo(() => createCreamTopGeometry(0.6, 0.06, segments), [segments]);

  const waxGeo = useMemo(() => createWaxGeometry(0.035, 0.32, 24), []);
  const wickGeo = useMemo(() => new THREE.CylinderGeometry(0.005, 0.005, 0.04, 8), []);

  const outerFlameGeo = useMemo(() => createFlameGeometry(0.024, 0.085, 24), []);
  const innerFlameGeo = useMemo(() => createFlameGeometry(0.013, 0.052, 24), []);
  const glowFlameGeo = useMemo(() => createFlameGeometry(0.042, 0.11, 24), []);

  // Keep 1 center + 4 around layout for candles
  const candlePositions = useMemo(() => [
    [0, 2.05, 0],
    [-0.32, 2.05, 0.2],
    [0.32, 2.05, 0.2],
    [-0.22, 2.05, -0.28],
    [0.22, 2.05, -0.28]
  ], []);

  // Handle blow state change
  useEffect(() => {
    if (isBlowing) {
      blowStartTimeRef.current = -1; // reset so useFrame sets it on first blow frame
    } else {
      blowStartTimeRef.current = -1;
    }
  }, [isBlowing]);

  // Gentle rotation, multi-sine organic flicker, and eased staggered extinguishment
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    const time = state.clock.elapsedTime;

    if (isBlowing && blowStartTimeRef.current < 0) {
      blowStartTimeRef.current = time;
    }

    let allExtinguished = true;

    flameDataListRef.current.forEach((flame) => {
      if (!flame || !flame.group) return;

      const idx = flame.index;
      const t = time * 7.5 + flame.offset;

      // Multi-sine wave organic noise
      const noise1 = Math.sin(t) * 0.07;
      const noise2 = Math.cos(t * 1.7) * 0.04;
      const noise3 = Math.sin(t * 2.9) * 0.02;

      let extinguishProgress = 0;

      if (isBlowing && blowStartTimeRef.current >= 0) {
        const extinguishDelay = idx * 0.12; // 0.12s stagger per candle
        const extinguishDuration = 1.4; // 1.4s smooth fade
        const extinguishElapsed = time - blowStartTimeRef.current - extinguishDelay;

        if (extinguishElapsed > 0) {
          const rawExtinguishProgress = Math.min(Math.max(extinguishElapsed / extinguishDuration, 0), 1);
          extinguishProgress = easeInOutCubic(rawExtinguishProgress);
        }
      }

      const flameFactor = 1 - extinguishProgress;

      if (flameFactor <= 0.001) {
        flame.group.visible = false;
        if (flame.lightRef.current) flame.lightRef.current.intensity = 0;
      } else {
        allExtinguished = false;
        flame.group.visible = true;

        const scaleY = (1 + noise1 + noise2) * flameFactor;
        const scaleXZ = (1 + (noise1 + noise3) * 0.7) * flameFactor;

        flame.group.scale.set(scaleXZ, scaleY, scaleXZ);
        flame.group.rotation.z = Math.sin(t * 0.8) * 0.05;
        flame.group.rotation.x = Math.cos(t * 0.6) * 0.04;

        // Glow mesh scaling and opacity
        if (flame.glowRef.current && flame.glowMatRef.current) {
          flame.glowRef.current.scale.set(flameFactor, flameFactor, flameFactor);
          flame.glowMatRef.current.opacity = 0.22 * flameFactor;
        }

        // Per-flame point light wobble & fade
        if (flame.lightRef.current) {
          const baseLight = 0.5;
          const flickerAmp = 0.2;
          flame.lightRef.current.intensity = (baseLight + (noise1 + noise2) * flickerAmp) * flameFactor;
        }
      }
    });

    // Dim central shared point light when blowing if present
    if (pointLightRef && pointLightRef.current && isBlowing) {
      pointLightRef.current.intensity = THREE.MathUtils.lerp(
        pointLightRef.current.intensity,
        0,
        delta * 2
      );
    }
  });

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

      {/* --- Tier 1 (Bottom) --- */}
      {/* Cake Tier Body */}
      <mesh geometry={tier1CakeGeo} material={cakeMaterial} position={[0, 0, 0]} castShadow receiveShadow />
      {/* Cream Frosting Top */}
      <mesh geometry={tier1CreamGeo} material={creamMaterial} position={[0, 0.795, 0]} castShadow receiveShadow />
      {/* Tier 1 Gold Band */}
      <mesh position={[0, 0.81, 0]} material={goldBandMaterial}>
        <cylinderGeometry args={[1.31, 1.31, 0.04, 36]} />
      </mesh>
      {/* Tier 1 Cream Rosettes */}
      <CreamRosettes radius={1.31} yPos={0.88} count={24} size={0.045} material={creamMaterial} isMobile={isMobile} />

      {/* --- Tier 2 (Middle) --- */}
      {/* Cake Tier Body */}
      <mesh geometry={tier2CakeGeo} material={cakeMaterial} position={[0, 0.8, 0]} castShadow receiveShadow />
      {/* Cream Frosting Top */}
      <mesh geometry={tier2CreamGeo} material={creamMaterial} position={[0, 1.395, 0]} castShadow receiveShadow />
      {/* Tier 2 Gold Band */}
      <mesh position={[0, 1.41, 0]} material={goldBandMaterial}>
        <cylinderGeometry args={[0.96, 0.96, 0.035, 32]} />
      </mesh>
      {/* Tier 2 Cream Rosettes */}
      <CreamRosettes radius={0.96} yPos={1.47} count={18} size={0.040} material={creamMaterial} isMobile={isMobile} />

      {/* --- Tier 3 (Top) --- */}
      {/* Cake Tier Body */}
      <mesh geometry={tier3CakeGeo} material={cakeMaterial} position={[0, 1.4, 0]} castShadow receiveShadow />
      {/* Cream Frosting Top */}
      <mesh geometry={tier3CreamGeo} material={creamMaterial} position={[0, 1.995, 0]} castShadow receiveShadow />
      {/* Tier 3 Gold Band */}
      <mesh position={[0, 2.01, 0]} material={goldBandMaterial}>
        <cylinderGeometry args={[0.61, 0.61, 0.03, 28]} />
      </mesh>
      {/* Tier 3 Cream Rosettes */}
      <CreamRosettes radius={0.61} yPos={2.06} count={12} size={0.035} material={creamMaterial} isMobile={isMobile} />

      {/* Instanced Gold Pearls */}
      <GoldPearls count={36} />

      {/* Chocolate Curls on Top Tier Cream */}
      <ChocolateCurls radius={0.28} yPos={2.08} count={4} material={chocolateMaterial} />

      {/* 5 Candles & Teardrop Flames */}
      {candlePositions.map((pos, i) => (
        <CandleItem
          key={i}
          index={i}
          position={pos}
          waxGeo={waxGeo}
          waxMaterial={waxMaterial}
          wickGeo={wickGeo}
          wickMaterial={wickMaterial}
          outerFlameGeo={outerFlameGeo}
          outerFlameMaterial={outerFlameMaterial}
          innerFlameGeo={innerFlameGeo}
          innerFlameMaterial={innerFlameMaterial}
          glowFlameGeo={glowFlameGeo}
          glowFlameMaterial={glowFlameMaterial}
          flameDataListRef={flameDataListRef}
        />
      ))}
    </group>
  );
}

function CandleItem({
  index,
  position,
  waxGeo,
  waxMaterial,
  wickGeo,
  wickMaterial,
  outerFlameGeo,
  outerFlameMaterial,
  innerFlameGeo,
  innerFlameMaterial,
  glowFlameGeo,
  glowFlameMaterial,
  flameDataListRef
}) {
  const flameGroupRef = useRef();
  const glowRef = useRef();
  const glowMatRef = useRef();
  const lightRef = useRef();

  useEffect(() => {
    // Clone glow material so opacity can be animated independently per flame
    if (glowRef.current && !glowMatRef.current) {
      glowMatRef.current = glowFlameMaterial.clone();
      glowRef.current.material = glowMatRef.current;
    }

    flameDataListRef.current[index] = {
      index,
      group: flameGroupRef.current,
      glowRef,
      glowMatRef,
      lightRef,
      offset: index * 2.3,
    };
  }, [index, glowFlameMaterial, flameDataListRef]);

  return (
    <group position={position}>
      {/* Wax Body */}
      <mesh geometry={waxGeo} material={waxMaterial} position={[0, 0, 0]} castShadow receiveShadow />

      {/* Wick */}
      <mesh geometry={wickGeo} material={wickMaterial} position={[0, 0.34, 0]} castShadow receiveShadow />

      {/* 3-Layer Teardrop Flame */}
      <group ref={flameGroupRef} position={[0, 0.36, 0]}>
        {/* Outer Flame (Warm Amber / Orange) */}
        <mesh geometry={outerFlameGeo} material={outerFlameMaterial} position={[0, 0, 0]} />

        {/* Inner Flame (Hot Pale Yellow / White) */}
        <mesh geometry={innerFlameGeo} material={innerFlameMaterial} position={[0, 0.002, 0]} />

        {/* Soft Outer Glow */}
        <mesh ref={glowRef} geometry={glowFlameGeo} material={glowFlameMaterial} position={[0, -0.008, 0]} />

        {/* Individual Flame Point Light */}
        <pointLight ref={lightRef} color="#FF9900" intensity={0.5} distance={1.4} decay={2.0} position={[0, 0.04, 0]} />
      </group>
    </group>
  );
}

function CameraController({ onIntroComplete }) {
  const { camera } = useThree();
  const cbRef = useRef(onIntroComplete);
  cbRef.current = onIntroComplete;

  useEffect(() => {
    // Initial camera state
    camera.position.set(0, 0.5, 7);
    camera.lookAt(0, 0.8, 0);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReduced ? 1.5 : 4.0;

    const tl = gsap.timeline({
      onComplete: () => {
        cbRef.current?.();
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
  }, [camera]);

  return null;
}

function CanvasDisposer() {
  const { gl } = useThree();
  useEffect(() => {
    return () => {
      // Force cleanup of WebGL context and render loop when CakeScene unmounts
      gl.dispose();
      gl.forceContextLoss();
    };
  }, [gl]);
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
      dpr={[1, isMobile ? 1.25 : 1.5]}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.5, 7], fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <CanvasDisposer />
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
      <ProceduralCake isBlowing={isBlowing} pointLightRef={pointLightRef} isMobile={isMobile} />

      {/* Floating Gold Particles */}
      <FloatingGoldDust isMobile={isMobile} />
    </Canvas>
  );
}

// --- Main CakeScene Export Component ---

export default function CakeScene({ onComplete }) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const introFinishedRef = useRef(false);
  const webGLSupported = hasWebGLSupport();

  const handleIntroComplete = React.useCallback(() => {
    if (!introFinishedRef.current) {
      introFinishedRef.current = true;
      setShowInteraction(true);
    }
  }, []);

  const handleBlow = React.useCallback(() => {
    setIsBlowing(true);
  }, []);

  if (!webGLSupported) {
    return <FallbackCakeScene onComplete={onComplete} />;
  }

  return (
    <WebGLErrorBoundary fallback={<FallbackCakeScene onComplete={onComplete} />}>
      <div className="scene" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <ThreeCakeCanvas
          isBlowing={isBlowing}
          onIntroComplete={handleIntroComplete}
        />

        <CandleInteraction
          visible={showInteraction}
          onBlow={handleBlow}
          onComplete={onComplete}
        />
      </div>
    </WebGLErrorBoundary>
  );
}
