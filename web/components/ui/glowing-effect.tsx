"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface GlowingEffectProps {
  blur?: number;
  spread?: number;
  variant?: "default" | "rainbow" | "cyan" | "white";
  glow?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  disabled?: boolean;
  className?: string;
}

export const GlowingEffect: React.FC<GlowingEffectProps> = ({
  blur = 10,
  variant = "rainbow",
  glow = true,
  movementDuration = 4,
  borderWidth = 1.5,
  disabled = false,
  className,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  if (disabled || prefersReducedMotion) return null;

  // Vibrant neon gradient spectrum matching user's design reference
  const gradientSpectrum =
    variant === "white"
      ? "conic-gradient(from 0deg, transparent 0deg 180deg, rgba(255,255,255,0.9) 270deg, transparent 360deg)"
      : variant === "cyan"
      ? "conic-gradient(from 0deg, transparent 0deg 140deg, #00F0FF 220deg, #3B82F6 280deg, #10B981 330deg, #00F0FF 360deg)"
      : variant === "default"
      ? "conic-gradient(from 0deg, transparent 0deg 140deg, hsl(var(--primary)) 220deg, #00F0FF 270deg, hsl(var(--ring)) 320deg, hsl(var(--primary)) 360deg)"
      : "conic-gradient(from 0deg, transparent 0deg 140deg, #00F0FF 200deg, #3B82F6 235deg, #8B5CF6 270deg, #EC4899 300deg, #F59E0B 330deg, #10B981 350deg, #00F0FF 360deg)";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -inset-[1.5px] rounded-[inherit] overflow-hidden z-0",
        className
      )}
    >
      {/* Rotating continuous moving light beam */}
      <div
        className="absolute inset-[-200%] animate-[spin_linear_infinite]"
        style={{
          background: gradientSpectrum,
          animationDuration: `${movementDuration}s`,
        }}
      />

      {/* Luminous ambient bloom glow */}
      {glow && (
        <div
          className="absolute inset-[-200%] animate-[spin_linear_infinite] blur-md opacity-70"
          style={{
            background: gradientSpectrum,
            animationDuration: `${movementDuration}s`,
          }}
        />
      )}
    </div>
  );
};
