"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Analytics", href: "/analytics", icon: PieChart },
  { label: "Budgets", href: "/budget", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const expenseCount = useExpenseStore((s) => s.expenses.length);
  const isMobileMenuOpen = useExpenseStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useExpenseStore((s) => s.setMobileMenuOpen);

  return (
    <>
      {/* ──────────────── Desktop Sidebar (Hidden on Mobile < md) ──────────────── */}
      <aside
        className={cn(
          "relative z-40 hidden md:flex flex-col border-r border-border/40 bg-card/40 backdrop-blur-2xl transition-all duration-300 select-none shrink-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
          <Link href="/" className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-600 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <Layers className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                  ExpenseVault <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  3D Financial Hub
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.35)]"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.href === "/expenses" && expenseCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {expenseCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info badge */}
        {!collapsed && (
          <div className="p-4 border-t border-border/40">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Next-Gen Streamlit
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                100% feature-parity + 3D visuals & local storage
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ──────────────── Mobile Slide-Over Drawer (< md only) ──────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-50 w-72 max-w-[80vw] h-full bg-[#0A0D14] border-r border-border/60 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-violet-600 text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1">
                    ExpenseVault <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                    Spatial Finance
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "group relative flex items-center rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.35)]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 mr-3" />
                    <span>{item.label}</span>
                    {item.href === "/expenses" && expenseCount > 0 && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {expenseCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Badge */}
            <div className="p-4 border-t border-border/40">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Active Session
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  {expenseCount} recorded transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
