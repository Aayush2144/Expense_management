"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  PieChart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";

interface MobileBottomNavProps {
  onOpenAddModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddModal,
}) => {
  const pathname = usePathname();
  const expenseCount = useExpenseStore((s) => s.expenses.length);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0A0D14]/90 backdrop-blur-2xl border-t border-border/50 px-2 py-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-[10px] font-medium min-w-[54px]",
            pathname === "/"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-lg transition-colors",
              pathname === "/" && "bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="mt-0.5">Home</span>
        </Link>

        {/* Expenses List */}
        <Link
          href="/expenses"
          className={cn(
            "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-[10px] font-medium min-w-[54px]",
            pathname === "/expenses"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-lg transition-colors relative",
              pathname === "/expenses" && "bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            )}
          >
            <Receipt className="h-4 w-4" />
            {expenseCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-bold px-0.5">
                {expenseCount > 99 ? "99+" : expenseCount}
              </span>
            )}
          </div>
          <span className="mt-0.5">Expenses</span>
        </Link>

        {/* Center Illuminated Add Expense Button */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-4 group focus:outline-none"
          title="Add Expense"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.6)] group-hover:scale-105 active:scale-95 transition-transform border-2 border-background">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-primary mt-0.5">Add</span>
        </button>

        {/* Analytics */}
        <Link
          href="/analytics"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-[10px] font-medium min-w-[54px]",
            pathname === "/analytics"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-lg transition-colors",
              pathname === "/analytics" && "bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            )}
          >
            <PieChart className="h-4 w-4" />
          </div>
          <span className="mt-0.5">Analytics</span>
        </Link>

        {/* Budgets */}
        <Link
          href="/budget"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-[10px] font-medium min-w-[54px]",
            pathname === "/budget"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-lg transition-colors",
              pathname === "/budget" && "bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
            )}
          >
            <Target className="h-4 w-4" />
          </div>
          <span className="mt-0.5">Budgets</span>
        </Link>
      </div>
    </nav>
  );
};
