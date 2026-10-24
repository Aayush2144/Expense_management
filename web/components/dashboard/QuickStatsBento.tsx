"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  CreditCard,
  PieChart,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Vault3DHero } from "@/components/3d/SceneWrapper";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

export const QuickStatsBento: React.FC<{ onOpenAddModal: () => void }> = ({
  onOpenAddModal,
}) => {
  const expenses = useExpenseStore((s) => s.expenses);

  const stats = useMemo(() => {
    if (expenses.length === 0) {
      return {
        total: 0,
        count: 0,
        max: 0,
        averagePerDay: 0,
        topCategory: "None",
        topCategoryTotal: 0,
        topCategoryPercent: 0,
      };
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const max = Math.max(...expenses.map((e) => e.amount));

    // Unique days
    const uniqueDays = new Set(expenses.map((e) => e.expense_date)).size || 1;
    const averagePerDay = total / uniqueDays;

    // Category sums
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });

    let topCat = "None";
    let topVal = 0;
    Object.entries(catMap).forEach(([cat, val]) => {
      if (val > topVal) {
        topVal = val;
        topCat = cat;
      }
    });

    return {
      total,
      count: expenses.length,
      max,
      averagePerDay,
      topCategory: topCat,
      topCategoryTotal: topVal,
      topCategoryPercent: total > 0 ? (topVal / total) * 100 : 0,
    };
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
      {/* 3D Interactive Hero Card (Spans 8 columns on desktop) */}
      <TiltCard
        className="md:col-span-8 p-6 flex flex-col justify-between min-h-[320px] bg-gradient-to-br from-card/80 via-card/50 to-primary/5 border-primary/20"
        maxTilt={5}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center h-full">
          {/* Left Text / Info */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> 3D Spatial Financial Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Expense Overview
              </h1>
              <p className="text-sm text-muted-foreground">
                Track expenditure, inspect 3D category pillars, and export tax-ready statements.
              </p>
            </div>

            {/* Total Display */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Total Tracked Spend
              </span>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-baseline gap-2">
                <AnimatedCounter value={stats.total} />
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {stats.count} items
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                + Record Expense
              </button>
            </div>
          </div>

          {/* Right 3D R3F Canvas */}
          <div className="lg:col-span-5 h-56 sm:h-64 w-full">
            <Vault3DHero />
          </div>
        </div>
      </TiltCard>

      {/* Top Category Card (Spans 4 columns) */}
      <TiltCard className="md:col-span-4 p-6 flex flex-col justify-between" maxTilt={6}>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Expense Driver
            </span>
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: getCategoryColor(stats.topCategory) }}
              />
              {stats.topCategory}
            </h2>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              <AnimatedCounter value={stats.topCategoryTotal} />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Portfolio Share</span>
            <span className="font-semibold text-foreground">
              {stats.topCategoryPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{
                width: `${stats.topCategoryPercent}%`,
                backgroundColor: getCategoryColor(stats.topCategory),
              }}
            />
          </div>
        </div>
      </TiltCard>

      {/* Single Max Expense (Spans 4 columns) */}
      <TiltCard className="md:col-span-4 p-6" maxTilt={6}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Peak Single Outflow
          </span>
          <ArrowUpRight className="h-4 w-4 text-destructive" />
        </div>
        <div className="text-2xl font-bold text-foreground mt-2">
          <AnimatedCounter value={stats.max} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Largest single recorded purchase
        </p>
      </TiltCard>

      {/* Daily Average (Spans 4 columns) */}
      <TiltCard className="md:col-span-4 p-6" maxTilt={6}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daily Burn Rate
          </span>
          <CalendarDays className="h-4 w-4 text-primary" />
        </div>
        <div className="text-2xl font-bold text-foreground mt-2">
          <AnimatedCounter value={stats.averagePerDay} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Average spending across logged days
        </p>
      </TiltCard>

      {/* Total Active Categories (Spans 4 columns) */}
      <TiltCard className="md:col-span-4 p-6" maxTilt={6}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Categories
          </span>
          <PieChart className="h-4 w-4 text-violet-400" />
        </div>
        <div className="text-2xl font-bold text-foreground mt-2">
          {new Set(expenses.map((e) => e.category)).size} Categories
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Distributing capital across life areas
        </p>
      </TiltCard>
    </div>
  );
};
