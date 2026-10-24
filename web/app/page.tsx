"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Receipt, Plus, Sparkles } from "lucide-react";
import { QuickStatsBento } from "@/components/dashboard/QuickStatsBento";
import { CategoryAnalytics } from "@/components/dashboard/CategoryAnalytics";
import { ExpenseTable } from "@/components/dashboard/ExpenseTable";
import { AddExpenseModal } from "@/components/dashboard/AddExpenseModal";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Bento Grid Top Section */}
      <QuickStatsBento onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* 3D / 2D Spatial Category Breakdown */}
      <CategoryAnalytics />

      {/* Full Interactive Expense Table */}
      <div className="space-y-4">
        <ExpenseTable />
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
