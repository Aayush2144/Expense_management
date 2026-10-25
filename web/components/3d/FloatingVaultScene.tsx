"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Individual Floating Gold Coin
const GoldCoin = ({
  position,
  rotationSpeed = 1,
  scale = 1,
}: {
  position: [number, number, number];
  rotationSpeed?: number;
  scale?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8 * rotationSpeed;
      meshRef.current.rotation.z += delta * 0.2 * rotationSpeed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 32]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.9}
          roughness={0.2}
          emissive="#78350F"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
};

// 3D Glass Card / Translucent Vault Slab
const GlassVaultCard = () => {
  const cardRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (cardRef.current) {
      // Parallax mouse reaction
      cardRef.current.rotation.y = THREE.MathUtils.lerp(
        cardRef.current.rotation.y,
        pointer.x * 0.35,
        0.05
      );
      cardRef.current.rotation.x = THREE.MathUtils.lerp(
        cardRef.current.rotation.x,
        -pointer.y * 0.25,
        0.05
      );
    }
  });

  return (
    <group ref={cardRef}>
      {/* Front Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.7, 1.7, 0.12]} />
        <meshPhysicalMaterial
          color="#3B82F6"
          metalness={0.1}
          roughness={0.15}
          transmission={0.8}
          thickness={0.6}
          transparent
          opacity={0.85}
          reflectivity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Gold Chip */}
      <mesh position={[-0.75, 0.28, 0.08]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Glowing Energy Ring / Hologram Node */}
      <mesh position={[0.65, -0.28, 0.08]}>
        <ringGeometry args={[0.18, 0.28, 32]} />
        <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Outer Torus Ring
const OrbitalRing = () => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.3;
      ringRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0, -0.2]}>
      <torusGeometry args={[2.1, 0.035, 16, 100]} />
      <meshStandardMaterial
        color="#8B5CF6"
        emissive="#4C1D95"
        emissiveIntensity={0.6}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
};

export const FloatingVaultScene: React.FC = () => {
  return (
    <div className="w-full h-44 sm:h-56 lg:h-64 relative select-none touch-pan-y">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 46 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-4, -3, 3]} intensity={2} color="#10B981" />
        <pointLight position={[4, 3, 2]} intensity={2} color="#3B82F6" />

        <GlassVaultCard />
        <OrbitalRing />

        {/* Floating coins in 3D orbit */}
        <GoldCoin position={[-1.6, 1.0, 0.5]} rotationSpeed={1.2} scale={0.65} />
        <GoldCoin position={[1.7, -0.8, 0.7]} rotationSpeed={0.9} scale={0.75} />
        <GoldCoin position={[1.5, 1.1, -0.4]} rotationSpeed={1.4} scale={0.55} />
      </Canvas>
    </div>
  );
};
