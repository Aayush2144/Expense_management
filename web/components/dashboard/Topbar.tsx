"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Server, CheckCircle2, AlertCircle, Menu, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useExpenseStore } from "@/lib/store";
import { api } from "@/lib/api";

interface TopbarProps {
  onOpenAddModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenAddModal }) => {
  const searchQuery = useExpenseStore((s) => s.searchQuery);
  const setSearchQuery = useExpenseStore((s) => s.setSearchQuery);
  const toggleMobileMenu = useExpenseStore((s) => s.toggleMobileMenu);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    api.healthCheck().then((healthy) => {
      if (mounted) setBackendHealthy(healthy);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-3 sm:px-6 backdrop-blur-2xl">
      {/* Left section: Hamburger (mobile) + Brand or Desktop Search */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="flex md:hidden items-center justify-center h-9 w-9 rounded-xl border border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Identity */}
        <Link href="/" className="flex md:hidden items-center gap-2 select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-violet-600 text-primary-foreground shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1">
            ExpenseVault
          </span>
        </Link>

        {/* Desktop Search Input */}
        <div className="relative w-64 lg:w-72 hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes, category, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-full border-border/50 bg-muted/30 focus-visible:ring-primary/50 text-xs"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
        {/* Backend health indicator badge */}
        <div
          className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs border border-border/50 bg-muted/20"
          title={
            backendHealthy
              ? "FastAPI Backend is Online"
              : "Running in Offline / Client Persistent mode"
          }
        >
          <Server className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground text-[11px] font-medium">API:</span>
          {backendHealthy === null ? (
            <span className="text-[11px] text-muted-foreground">Checking...</span>
          ) : backendHealthy ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
              <AlertCircle className="h-3 w-3" /> LocalStore
            </span>
          )}
        </div>

        {/* Add Expense Button (Responsive label) */}
        <Button
          onClick={onOpenAddModal}
          variant="glow"
          size="sm"
          className="gap-1.5 rounded-full px-3 sm:px-4 font-semibold text-xs h-9 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Expense</span>
          <span className="xs:hidden">Add</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};
