"use client";

import React, { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { ExpenseTable } from "@/components/dashboard/ExpenseTable";
import { AddExpenseModal } from "@/components/dashboard/AddExpenseModal";
import { Button } from "@/components/ui/button";

export default function ExpensesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-7 w-7 text-primary" /> Transactions Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter by date, search descriptions, export to CSV or record new batch entries.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} variant="glow" className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      <ExpenseTable />

      <AddExpenseModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
