"use client";

import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  currency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  currency = true,
  prefix = "",
  suffix = "",
  className,
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 75,
    damping: 18,
  });

  const display = useTransform(springVal, (current) => {
    if (currency) {
      return formatCurrency(current);
    }
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
};
