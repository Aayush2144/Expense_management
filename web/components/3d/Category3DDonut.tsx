"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { CategoryBreakdown } from "@/types";
import { formatCurrency, getCategoryColor } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";

interface Category3DDonutProps {
  data: CategoryBreakdown[];
}

const CategoryPillar = ({
  item,
  index,
  totalItems,
  onSelect,
  isSelected,
}: {
  item: CategoryBreakdown;
  index: number;
  totalItems: number;
  onSelect: (cat: string) => void;
  isSelected: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Height proportional to percentage (capped between 0.6 and 3.2)
  const height = Math.max(0.6, (item.percentage / 100) * 3.5);

  // Arrange in radial ring
  const angle = (index / totalItems) * Math.PI * 2;
  const radius = 1.9;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetScaleY = hovered || isSelected ? 1.15 : 1.0;
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.1);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh
        ref={meshRef}
        position={[0, height / 2 - 1, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.category);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[0.32, 0.35, height, 32]} />
        <meshStandardMaterial
          color={getCategoryColor(item.category)}
          metalness={0.7}
          roughness={0.2}
          emissive={getCategoryColor(item.category)}
          emissiveIntensity={hovered || isSelected ? 0.7 : 0.15}
        />

        {/* 3D Tooltip on Hover */}
        {hovered && (
          <Html position={[0, height / 2 + 0.4, 0]} center distanceFactor={7}>
            <div className="bg-popover/95 border border-border px-3 py-1.5 rounded-lg shadow-xl text-center pointer-events-none whitespace-nowrap backdrop-blur-md">
              <p className="text-xs font-semibold text-foreground">{item.category}</p>
              <p className="text-xs font-bold text-primary">{formatCurrency(item.total)}</p>
              <p className="text-[10px] text-muted-foreground">{item.percentage.toFixed(1)}%</p>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

const RotatingRing = ({
  data,
  selectedCategory,
  onSelectCategory,
}: {
  data: CategoryBreakdown[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.2 + 0.25, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {data.map((item, idx) => (
        <CategoryPillar
          key={item.category}
          item={item}
          index={idx}
          totalItems={data.length}
          onSelect={onSelectCategory}
          isSelected={selectedCategory === item.category}
        />
      ))}
      {/* Ground Glass Base */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.5, 64]} />
        <meshStandardMaterial
          color="#334155"
          transparent
          opacity={0.3}
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

export const Category3DDonut: React.FC<Category3DDonutProps> = ({ data }) => {
  const selectedCategory = useExpenseStore((s) => s.selectedCategory);
  const setSelectedCategory = useExpenseStore((s) => s.setSelectedCategory);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No category data to display
      </div>
    );
  }

  return (
    <div className="w-full h-80 relative select-none">
      <Canvas
        camera={{ position: [0, 2.8, 5.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 9, 6]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-4, 3, 2]} intensity={1.5} color="#3B82F6" />
        <pointLight position={[4, -2, -2]} intensity={1.5} color="#10B981" />

        <RotatingRing
          data={data}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) =>
            setSelectedCategory(selectedCategory === cat ? null : cat)
          }
        />
      </Canvas>

      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
        <span className="text-[11px] text-muted-foreground/80 bg-background/60 backdrop-blur-md px-3 py-1 rounded-full border border-border/40">
          💡 Click a pillar to filter expenses by that category
        </span>
      </div>
    </div>
  );
};
