"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { PieChart, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { Select } from "@/components/ui/select";
import { CategoryAnalytics } from "@/components/dashboard/CategoryAnalytics";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AnalyticsPage() {
  const expenses = useExpenseStore((s) => s.expenses);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Available years in dataset
  const availableYears = useMemo(() => {
    const years = new Set(expenses.map((e) => new Date(e.expense_date).getFullYear()));
    if (!years.has(2024)) years.add(2024);
    if (!years.has(2025)) years.add(2025);
    return Array.from(years).sort((a, b) => b - a);
  }, [expenses]);

  // Monthly breakdown for selected year (100% parity with analytics_months.py!)
  const monthlyData = useMemo(() => {
    const yearExpenses = expenses.filter(
      (e) => new Date(e.expense_date).getFullYear() === selectedYear
    );
    const totalYear = yearExpenses.reduce((sum, e) => sum + e.amount, 0);

    const monthTotals = Array(12).fill(0);
    const monthCounts = Array(12).fill(0);

    yearExpenses.forEach((e) => {
      const monthIdx = new Date(e.expense_date).getMonth();
      monthTotals[monthIdx] += e.amount;
      monthCounts[monthIdx] += 1;
    });

    return MONTH_NAMES.map((month, idx) => ({
      month,
      monthShort: month.slice(0, 3),
      total: monthTotals[idx],
      percentage: totalYear > 0 ? (monthTotals[idx] / totalYear) * 100 : 0,
      count: monthCounts[idx],
    }));
  }, [expenses, selectedYear]);

  // Quick stats for selected year
  const yearStats = useMemo(() => {
    const activeMonths = monthlyData.filter((m) => m.total > 0);
    const total = monthlyData.reduce((sum, m) => sum + m.total, 0);
    const max = Math.max(0, ...monthlyData.map((m) => m.total));
    const avg = activeMonths.length > 0 ? total / activeMonths.length : 0;

    return { total, max, avg };
  }, [monthlyData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <PieChart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" /> Financial Analytics & Trends
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Multi-dimensional analytics with category distributions and month-by-month trajectory.
        </p>
      </div>

      {/* Category Analytics Section */}
      <CategoryAnalytics />

      {/* Monthly Analytics Section (Streamlit parity: analytics_months.py) */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> Monthly Trajectory ({selectedYear})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution of expenses across the calendar year
              </p>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Select Year:</span>
              <Select
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-28 h-8 text-xs font-semibold"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Quick Metrics Cards Row (Matching Streamlit metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3 sm:pt-4">
            <TiltCard className="p-3.5 sm:p-4 bg-muted/20" maxTilt={4}>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Total Year Spend
              </span>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                {formatCurrency(yearStats.total)}
              </p>
            </TiltCard>

            <TiltCard className="p-3.5 sm:p-4 bg-muted/20" maxTilt={4}>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Peak Month Outflow
              </span>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 text-primary">
                {formatCurrency(yearStats.max)}
              </p>
            </TiltCard>

            <TiltCard className="p-3.5 sm:p-4 bg-muted/20" maxTilt={4}>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Monthly Average
              </span>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 text-emerald-400">
                {formatCurrency(yearStats.avg)}
              </p>
            </TiltCard>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2 space-y-6">
          {/* Monthly Area Chart */}
          <div className="w-full h-64 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="monthShort"
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
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-popover/95 p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
                        <p className="text-xs font-semibold text-foreground">{d.month}</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(d.total)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {d.percentage.toFixed(1)}% of annual spend ({d.count} txns)
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#monthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
