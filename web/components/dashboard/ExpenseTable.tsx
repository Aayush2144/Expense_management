"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  Download,
  Upload,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useExpenseStore } from "@/lib/store";
import { Expense } from "@/types";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";

type SortField = "date" | "amount" | "category";
type SortOrder = "asc" | "desc";

export const ExpenseTable: React.FC = () => {
  const expenses = useExpenseStore((s) => s.expenses);
  const categories = useExpenseStore((s) => s.categories);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const importExpenses = useExpenseStore((s) => s.importExpenses);

  const selectedCategory = useExpenseStore((s) => s.selectedCategory);
  const setSelectedCategory = useExpenseStore((s) => s.setSelectedCategory);
  const searchQuery = useExpenseStore((s) => s.searchQuery);
  const setSearchQuery = useExpenseStore((s) => s.setSearchQuery);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Editing state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  // Filtering & Sorting
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Category filter
        if (selectedCategory && e.category !== selectedCategory) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNote = e.notes?.toLowerCase().includes(q);
          const matchCat = e.category.toLowerCase().includes(q);
          const matchDate = e.expense_date.includes(q);
          if (!matchNote && !matchCat && !matchDate) return false;
        }
        // Date range
        if (startDate && e.expense_date < startDate) return false;
        if (endDate && e.expense_date > endDate) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortOrder === "asc"
            ? a.expense_date.localeCompare(b.expense_date)
            : b.expense_date.localeCompare(a.expense_date);
        }
        if (sortField === "amount") {
          return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortField === "category") {
          return sortOrder === "asc"
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
  }, [expenses, selectedCategory, searchQuery, startDate, endDate, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDate(expense.expense_date);
    setEditNotes(expense.notes || "");
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    updateExpense(editingExpense.id, {
      amount: amountNum,
      category: editCategory,
      expense_date: editDate,
      notes: editNotes,
    });

    toast.success("Expense updated successfully");
    setEditingExpense(null);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No expenses to export");
      return;
    }

    const headers = ["ID", "Date", "Category", "Amount", "Notes"];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.expense_date,
      `"${e.category}"`,
      e.amount,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredExpenses.length} records to CSV!`);
  };

  // CSV Import
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          toast.error("CSV file is empty or missing headers");
          return;
        }

        const newItems: Expense[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
          if (parts.length >= 3) {
            const date = parts[1] || parts[0];
            const cat = parts[2] || "Other";
            const amt = parseFloat(parts[3] || parts[1]);
            const notes = parts[4] || parts[3] || "";

            if (!isNaN(amt) && amt > 0) {
              newItems.push({
                id: `import-${Date.now()}-${i}`,
                expense_date: date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date().toISOString().split("T")[0],
                amount: amt,
                category: cat,
                notes: notes,
              });
            }
          }
        }

        if (newItems.length > 0) {
          importExpenses(newItems);
          toast.success(`Imported ${newItems.length} expenses from CSV!`);
        } else {
          toast.error("No valid expense rows could be parsed");
        }
      } catch {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Expense Records
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {filteredExpenses.length} of {expenses.length} tracked expenditures
            </p>
          </div>

          {/* Action buttons: Export / Import */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border/60 bg-background/50 hover:bg-accent text-xs font-medium transition-colors gap-1.5 backdrop-blur-sm">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Import CSV</span>
                <span className="xs:hidden">Import</span>
              </span>
            </label>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search notes / date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="h-9 text-xs"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="h-9 text-xs"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(selectedCategory || startDate || endDate || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] text-muted-foreground">Filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-foreground">
                  ✕
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-foreground">
                  ✕
                </button>
              </Badge>
            )}
            {startDate && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                From {startDate}
                <button onClick={() => setStartDate("")} className="ml-1 hover:text-foreground">
                  ✕
                </button>
              </Badge>
            )}
            {endDate && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                To {endDate}
                <button onClick={() => setEndDate("")} className="ml-1 hover:text-foreground">
                  ✕
                </button>
              </Badge>
            )}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
              }}
              className="text-[10px] text-primary hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* ──────────────── Mobile Touch Cards View (< md) ──────────────── */}
        <div className="block md:hidden px-3.5 pb-4 space-y-2.5">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No matching expenses found.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-2 transition-colors active:bg-muted/40"
              >
                {/* Header row: Date & Category Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(expense.expense_date)}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${getCategoryColor(expense.category)}20`,
                      color: getCategoryColor(expense.category),
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    />
                    {expense.category}
                  </span>
                </div>

                {/* Amount & Notes */}
                <div className="flex items-baseline justify-between pt-0.5">
                  <div className="text-lg font-black text-foreground tracking-tight">
                    {formatCurrency(expense.amount)}
                  </div>
                  {expense.notes && (
                    <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                      {expense.notes}
                    </span>
                  )}
                </div>

                {/* Actions row: Edit and Delete buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => handleEditClick(expense)}
                    className="h-8 px-3 rounded-lg border border-border/50 bg-background/60 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      deleteExpense(expense.id);
                      toast.success("Expense removed");
                    }}
                    className="h-8 px-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs font-medium text-destructive hover:bg-destructive/20 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ──────────────── Desktop Table View (>= md) ──────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggleSort("date")} className="cursor-pointer select-none">
                  <span className="inline-flex items-center gap-1">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
                <TableHead onClick={() => toggleSort("category")} className="cursor-pointer select-none">
                  <span className="inline-flex items-center gap-1">
                    Category <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
                <TableHead onClick={() => toggleSort("amount")} className="cursor-pointer select-none">
                  <span className="inline-flex items-center gap-1">
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                    No matching expenses found. Try clearing filters or recording a new expense!
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="group">
                    <TableCell className="font-medium text-xs whitespace-nowrap">
                      {formatDate(expense.expense_date)}
                    </TableCell>

                    <TableCell>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getCategoryColor(expense.category)}20`,
                          color: getCategoryColor(expense.category),
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        />
                        {expense.category}
                      </span>
                    </TableCell>

                    <TableCell className="font-bold text-foreground text-sm whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                      {expense.notes || "—"}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditClick(expense)}
                          title="Edit expense"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            deleteExpense(expense.id);
                            toast.success("Expense removed");
                          }}
                          title="Delete expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Expense Dialog Modal */}
      {editingExpense && (
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-primary" /> Modify Expense Record
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Date</label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Notes</label>
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingExpense(null)}>
                Cancel
              </Button>
              <Button variant="glow" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
