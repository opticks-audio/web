"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

/**
 * Rotating triangular prism. White ray enters, spectrum exits.
 * Pure procedural geometry — no assets needed.
 */
function Prism() {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  // Triangular prism geometry (3-sided)
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.5, 1.5, 2.6, 3, 1, false);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.18;
      meshRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.y = t * 0.18;
      edgesRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }
  });

  return (
    <group>
      {/* Glass-like prism body */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={2.4}
          roughness={0.05}
          ior={1.6}
          clearcoat={1}
          clearcoatRoughness={0.05}
          color="#ffffff"
          attenuationColor="#a4c4ff"
          attenuationDistance={2}
        />
      </mesh>

      {/* Bright spectral edges */}
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

function IncomingRay() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 1.8) * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={[-3.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, 3.2, 16]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </mesh>
  );
}

function SpectrumRays() {
  const colors = [
    "#7c3aed",
    "#4f46e5",
    "#2563eb",
    "#06b6d4",
    "#10b981",
    "#eab308",
    "#f97316",
    "#ef4444",
  ];
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.45 + Math.sin(t * 1.2 + i * 0.4) * 0.2;
      });
    }
  });

  return (
    <group ref={ref} position={[1.6, 0, 0]}>
      {colors.map((color, i) => {
        const spread = (i - (colors.length - 1) / 2) * 0.18;
        return (
          <mesh
            key={color}
            position={[2.2, spread * 1.4, 0]}
            rotation={[0, 0, Math.PI / 2 + spread * 0.18]}
          >
            <cylinderGeometry args={[0.014, 0.014, 4.4, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export function PrismScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        {/* Ambient + key lights */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 4, 5]} intensity={1.2} />
        <directionalLight position={[-5, -3, -2]} intensity={0.5} color="#a4c4ff" />

        <IncomingRay />
        <Prism />
        <SpectrumRays />
      </Suspense>
    </Canvas>
  );
}
