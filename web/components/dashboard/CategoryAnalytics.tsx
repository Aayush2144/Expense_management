"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Box, BarChart3, PieChart as PieIcon, Sparkles } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Category3DChart } from "@/components/3d/SceneWrapper";
import { useExpenseStore } from "@/lib/store";
import { CategoryBreakdown } from "@/types";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

export const CategoryAnalytics: React.FC = () => {
  const expenses = useExpenseStore((s) => s.expenses);
  const is3DEnabled = useExpenseStore((s) => s.is3DEnabled);
  const toggle3D = useExpenseStore((s) => s.toggle3D);
  const selectedCategory = useExpenseStore((s) => s.selectedCategory);
  const setSelectedCategory = useExpenseStore((s) => s.setSelectedCategory);

  const [chartMode2D, setChartMode2D] = React.useState<"bar" | "pie">("bar");

  // Aggregate category data
  const categoryData: CategoryBreakdown[] = useMemo(() => {
    const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
    const map: Record<string, { total: number; count: number }> = {};

    expenses.forEach((e) => {
      if (!map[e.category]) {
        map[e.category] = { total: 0, count: 0 };
      }
      map[e.category].total += e.amount;
      map[e.category].count += 1;
    });

    return Object.entries(map)
      .map(([cat, val]) => ({
        category: cat,
        total: val.total,
        percentage: totalAll > 0 ? (val.total / totalAll) * 100 : 0,
        count: val.count,
        color: getCategoryColor(cat),
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Category Outflow Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspect where capital goes with 3D spatial pillars or 2D charts
            </p>
          </div>

          {/* 3D vs 2D Toggle Switch */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted/30 p-1 border border-border/40">
              <button
                onClick={() => is3DEnabled || toggle3D()}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  is3DEnabled
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Box className="h-3.5 w-3.5" /> 3D Spatial
              </button>
              <button
                onClick={() => !is3DEnabled || toggle3D()}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  !is3DEnabled
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> 2D Charts
              </button>
            </div>

            {!is3DEnabled && (
              <div className="flex rounded-lg bg-muted/30 p-1 border border-border/40">
                <button
                  onClick={() => setChartMode2D("bar")}
                  className={`p-1 rounded-md ${
                    chartMode2D === "bar" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                  title="Bar chart view"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setChartMode2D("pie")}
                  className={`p-1 rounded-md ${
                    chartMode2D === "pie" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                  title="Pie chart view"
                >
                  <PieIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
        {/* Visual Chart Area */}
        {is3DEnabled ? (
          <div className="w-full">
            <Category3DChart data={categoryData} />
          </div>
        ) : (
          <div className="w-full h-64 sm:h-72 pt-2">
            {chartMode2D === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="category"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as CategoryBreakdown;
                      return (
                        <div className="rounded-xl border border-border bg-popover/95 p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
                          <p className="text-xs font-semibold text-foreground">{d.category}</p>
                          <p className="text-sm font-bold text-primary">{formatCurrency(d.total)}</p>
                          <p className="text-[11px] text-muted-foreground">{d.percentage.toFixed(1)}%</p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[6, 6, 0, 0]}
                    onClick={(data) => {
                      if (data?.category) {
                        setSelectedCategory(selectedCategory === data.category ? null : data.category);
                      }
                    }}
                    cursor="pointer"
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={entry.color}
                        opacity={selectedCategory && selectedCategory !== entry.category ? 0.35 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as CategoryBreakdown;
                      return (
                        <div className="rounded-xl border border-border bg-popover/95 p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
                          <p className="text-xs font-semibold text-foreground">{d.category}</p>
                          <p className="text-sm font-bold text-primary">{formatCurrency(d.total)}</p>
                          <p className="text-[11px] text-muted-foreground">{d.percentage.toFixed(1)}%</p>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    onClick={(data) => {
                      if (data?.category) {
                        setSelectedCategory(selectedCategory === data.category ? null : data.category);
                      }
                    }}
                    cursor="pointer"
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={`pie-${entry.category}`}
                        fill={entry.color}
                        opacity={selectedCategory && selectedCategory !== entry.category ? 0.35 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Category Pill Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4 pt-4 border-t border-border/40">
          {categoryData.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(isSelected ? null : cat.category)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                    : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium truncate text-foreground">{cat.category}</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
                <div className="mt-1">
                  <p className="text-xs font-bold text-foreground">{formatCurrency(cat.total)}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.percentage.toFixed(1)}%</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
