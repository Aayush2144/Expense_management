"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  disabled?: boolean;
  className?: string;
}

export const GlowingEffect: React.FC<GlowingEffectProps> = ({
  blur = 16,
  inactiveZone = 0.6,
  proximity = 60,
  spread = 40,
  variant = "default",
  glow = true,
  movementDuration = 2,
  borderWidth = 1.5,
  disabled = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
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

  useEffect(() => {
    if (disabled || prefersReducedMotion) return;

    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Distance check for proximity
      const isNear =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      if (!isNear) {
        setOpacity(0);
        return;
      }

      setPosition({ x, y });
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, proximity, prefersReducedMotion]);

  if (disabled) return null;

  // Use CSS theme variables for colors
  const gradientColors =
    variant === "white"
      ? "rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1), transparent"
      : "hsl(var(--primary) / 0.8), hsl(var(--ring) / 0.6), transparent";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={
        {
          "--blur": `${blur}px`,
          "--spread": `${spread}px`,
          "--border-width": `${borderWidth}px`,
          "--movement-duration": prefersReducedMotion ? "0s" : `${movementDuration}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute -inset-[1px] rounded-[inherit] overflow-hidden transition-opacity duration-300",
        className
      )}
    >
      {/* Dynamic tracking radial/conic glow */}
      {position && !prefersReducedMotion && (
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            opacity: glow ? opacity : 0,
            background: `radial-gradient(var(--spread) circle at ${position.x}px ${position.y}px, ${gradientColors})`,
            filter: `blur(var(--blur))`,
          }}
        />
      )}

      {/* Subtle border outline ring */}
      <div
        className="absolute inset-0 rounded-[inherit] border border-border/40 pointer-events-none"
        style={{ borderWidth: "var(--border-width)" }}
      />
    </div>
  );
};
