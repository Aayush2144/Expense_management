"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect, GlowingEffectProps } from "./glowing-effect";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxTilt?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
  glowProps?: GlowingEffectProps;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  containerClassName,
  maxTilt = 6,
  enableTilt = true,
  enableGlow = true,
  glowProps,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width) * 2 - 1;
    const yPct = (mouseY / height) * 2 - 1;

    setTilt({ x: -yPct * maxTilt, y: xPct * maxTilt });
  };

  const handleMouseEnter = () => {
    if (!prefersReducedMotion && enableTilt) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className={cn(
        "relative rounded-2xl group transition-all duration-300 w-full h-full",
        containerClassName
      )}
    >
      {/* Tilt & Moving Glow Border Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            isHovered && !prefersReducedMotion
              ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
              : "rotateX(0deg) rotateY(0deg) translateY(0px)",
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        className="relative w-full h-full rounded-2xl p-[1.5px] overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-shadow duration-300"
      >
        {/* Animated Moving Border Glow */}
        {enableGlow && <GlowingEffect variant="rainbow" movementDuration={5} {...glowProps} />}

        {/* Card Body */}
        <div
          className={cn(
            "relative z-10 w-full h-full rounded-[14px] bg-card/90 backdrop-blur-2xl text-card-foreground overflow-hidden",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
