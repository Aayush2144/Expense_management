"use client";

import React, { useState } from "react";
import { Target, AlertTriangle, CheckCircle, Edit3, Sparkles } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useExpenseStore } from "@/lib/store";
import { formatCurrency, getCategoryColor } from "@/lib/utils";

export default function BudgetPage() {
  const expenses = useExpenseStore((s) => s.expenses);
  const categories = useExpenseStore((s) => s.categories);
  const budgets = useExpenseStore((s) => s.budgets);
  const setBudget = useExpenseStore((s) => s.setBudget);

  const [editingBudget, setEditingBudget] = useState<{ category: string; limit: number } | null>(null);
  const [newLimit, setNewLimit] = useState<string>("");

  // Calculate current month's expenses
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expense_date);
    const now = new Date("2024-09-01"); // Sample current month
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const categorySpendMap = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = currentMonthExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {});

  const handleEditBudget = (cat: string) => {
    const existing = budgets.find((b) => b.category === cat)?.monthly_limit || 500;
    setEditingBudget({ category: cat, limit: existing });
    setNewLimit(existing.toString());
  };

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      toast.error("Please enter a valid positive budget limit");
      return;
    }
    setBudget(editingBudget.category, limitNum);
    toast.success(`Updated budget limit for ${editingBudget.category}`);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Target className="h-6 w-6 sm:h-7 sm:w-7 text-primary" /> Monthly Budgets & Guardrails
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Set monthly targets per category. Real-time visual meters warn you before overspending.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {categories.map((category) => {
          const spent = categorySpendMap[category] || 0;
          const limit = budgets.find((b) => b.category === category)?.monthly_limit || 1000;
          const pct = Math.min(150, Math.round((spent / limit) * 100));
          const isOver = spent > limit;
          const isNear = !isOver && pct >= 80;

          return (
            <TiltCard key={category} className="p-4 sm:p-5 flex flex-col justify-between" maxTilt={6}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{category}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEditBudget(category)}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground">Current Spend</span>
                    <p className="text-lg sm:text-xl font-extrabold text-foreground">{formatCurrency(spent)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground">Budget Limit</span>
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                      {formatCurrency(limit)}
                    </p>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="mt-3 sm:mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        isOver
                          ? "text-destructive"
                          : isNear
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {pct}% Used
                    </span>
                    <span className="text-muted-foreground text-[10px] sm:text-[11px]">
                      {isOver
                        ? `Over by ${formatCurrency(spent - limit)}`
                        : `${formatCurrency(limit - spent)} remaining`}
                    </span>
                  </div>

                  <Progress
                    value={spent}
                    max={limit}
                    indicatorClassName={
                      isOver
                        ? "bg-destructive shadow-[0_0_12px_hsl(var(--destructive)/0.6)]"
                        : isNear
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                        : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    }
                  />
                </div>
              </div>

              {/* Status footer pill */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                {isOver ? (
                  <span className="inline-flex items-center gap-1 text-destructive font-medium text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Over budget
                  </span>
                ) : isNear ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Approaching limit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Safe zone
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">Target: 30 days</span>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Edit Budget Dialog */}
      {editingBudget && (
        <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="h-5 w-5 text-primary" /> Adjust {editingBudget.category} Budget
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <label className="text-xs font-medium text-foreground">
                Monthly Target Amount (₹)
              </label>
              <Input
                type="number"
                step="50"
                min="0"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="e.g. 1500"
              />
              <p className="text-[11px] text-muted-foreground">
                Sets maximum allowable spending for {editingBudget.category} each calendar month.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingBudget(null)}>
                Cancel
              </Button>
              <Button variant="glow" onClick={handleSaveBudget}>
                Save Target
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
