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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" /> Monthly Budgets & Guardrails
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set monthly targets per category. Real-time visual meters warn you before overspending.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => {
          const spent = categorySpendMap[category] || 0;
          const limit = budgets.find((b) => b.category === category)?.monthly_limit || 1000;
          const pct = Math.min(150, Math.round((spent / limit) * 100));
          const isOver = spent > limit;
          const isNear = !isOver && pct >= 80;

          return (
            <TiltCard key={category} className="p-5 flex flex-col justify-between" maxTilt={6}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <h3 className="font-bold text-base text-foreground">{category}</h3>
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

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Current Spend</span>
                    <p className="text-xl font-extrabold text-foreground">{formatCurrency(spent)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Budget Limit</span>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {formatCurrency(limit)}
                    </p>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="mt-4 space-y-1.5">
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
                    <span className="text-muted-foreground text-[11px]">
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
                        ? "bg-destructive shadow-[0_0_12px_hsl(var(--destructive)/0.7)]"
                        : isNear
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                        : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                    }
                  />
                </div>
              </div>

              {/* Status footer pill */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs">
                {isOver ? (
                  <span className="text-destructive flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Budget exceeded
                  </span>
                ) : isNear ? (
                  <span className="text-amber-400 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" /> Approaching monthly limit
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> Well within healthy budget
                  </span>
                )}
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Edit Budget Dialog */}
      {editingBudget && (
        <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Budget for {editingBudget.category}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-medium text-foreground">Monthly Limit (₹)</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBudget(null)}>
                Cancel
              </Button>
              <Button variant="glow" onClick={handleSaveBudget}>
                Save Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
