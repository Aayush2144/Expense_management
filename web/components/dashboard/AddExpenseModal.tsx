"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Plus, Calendar, DollarSign, Tag, FileText, Sparkles, Layers } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useExpenseStore } from "@/lib/store";
import { api } from "@/lib/api";

const expenseSchema = z.object({
  expense_date: z.string().min(1, "Date is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Please choose a category"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [tab, setTab] = useState<"single" | "batch">("single");
  const categories = useExpenseStore((s) => s.categories);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const addExpensesBatch = useExpenseStore((s) => s.addExpensesBatch);

  // Single form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: new Date().toISOString().split("T")[0],
      amount: "" as unknown as number,
      category: categories[0] || "Food",
      notes: "",
    },
  });

  // Batch 5-row form (Matches Streamlit 5-row feature!)
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [batchRows, setBatchRows] = useState(
    Array.from({ length: 5 }, (_, i) => ({
      amount: "",
      category: categories[i % categories.length] || "Food",
      notes: "",
    }))
  );

  const onSingleSubmit = async (values: ExpenseFormValues) => {
    try {
      addExpense({
        expense_date: values.expense_date,
        amount: values.amount,
        category: values.category,
        notes: values.notes || "",
      });

      // Best effort backend sync
      api.saveExpensesForDate(values.expense_date, [
        {
          expense_date: values.expense_date,
          amount: values.amount,
          category: values.category,
          notes: values.notes || "",
        },
      ]).catch(() => {});

      // Celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      toast.success("Expense recorded successfully!", {
        description: `${values.category} • ₹${values.amount.toFixed(2)} on ${values.expense_date}`,
      });

      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add expense");
    }
  };

  const onBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = batchRows.filter((r) => Number(r.amount) > 0);

    if (validRows.length === 0) {
      toast.error("Please enter at least one valid amount > 0");
      return;
    }

    const payload = validRows.map((r) => ({
      expense_date: batchDate,
      amount: Number(r.amount),
      category: r.category,
      notes: r.notes || "",
    }));

    addExpensesBatch(payload);

    api.saveExpensesForDate(batchDate, payload).catch(() => {});

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(`Successfully saved ${payload.length} expenses for ${batchDate}!`);
    onOpenChange(false);
  };

  const updateBatchRow = (index: number, field: string, val: string) => {
    const updated = [...batchRows];
    updated[index] = { ...updated[index], [field]: val };
    setBatchRows(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Record New Expenses
            </DialogTitle>
          </div>
          <DialogDescription>
            Add a single transaction or use the 5-row batch entry grid (Streamlit parity).
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-muted/40 p-1 mb-5">
          <button
            type="button"
            onClick={() => setTab("single")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === "single"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Single Expense
          </button>
          <button
            type="button"
            onClick={() => setTab("batch")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              tab === "batch"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> 5-Row Batch Grid
          </button>
        </div>

        {tab === "single" ? (
          /* Single Entry Form */
          <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date
                </label>
                <Input type="date" {...register("expense_date")} />
                {errors.expense_date && (
                  <p className="text-[11px] text-destructive">{errors.expense_date.message}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Amount (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-[11px] text-destructive">{errors.amount.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Category
              </label>
              <Select {...register("category")}>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-popover text-foreground">
                    {c}
                  </option>
                ))}
              </Select>
              {errors.category && (
                <p className="text-[11px] text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Notes / Description
              </label>
              <Input
                placeholder="e.g. Weekly Whole Foods groceries haul"
                {...register("notes")}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="glow" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-1.5" /> Save Expense
              </Button>
            </div>
          </form>
        ) : (
          /* Streamlit 5-Row Batch Form */
          <form onSubmit={onBatchSubmit} className="space-y-4">
            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date for All 5 Rows
              </label>
              <Input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {batchRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-2.5 rounded-xl border border-border/40 bg-muted/20 items-center"
                >
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Amount ₹"
                      value={row.amount}
                      onChange={(e) => updateBatchRow(idx, "amount", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="col-span-4">
                    <Select
                      value={row.category}
                      onChange={(e) => updateBatchRow(idx, "category", e.target.value)}
                      className="h-8 text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-popover text-foreground">
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Notes (optional)"
                      value={row.notes}
                      onChange={(e) => updateBatchRow(idx, "notes", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Rows with amount = 0 will be skipped.
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="glow">
                  Save All Valid Rows
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
