import { Expense, CategoryBreakdown, MonthlyBreakdown } from "@/types";

export interface ExpenseApiAdapter {
  getExpensesByDate: (date: string) => Promise<Expense[]>;
  saveExpensesForDate: (date: string, expenses: Omit<Expense, "id">[]) => Promise<{ message: string }>;
  getCategoryAnalytics: (startDate: string, endDate: string) => Promise<Record<string, { total: number; percentage: number }>>;
  getMonthlyAnalytics: (year: number) => Promise<Record<string, { total: number; percentage: number }>>;
  healthCheck: () => Promise<boolean>;
}

class BackendApiAdapter implements ExpenseApiAdapter {
  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("expense-vault-storage");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state?.backendUrl) {
            return parsed.state.backendUrl.replace(/\/$/, "");
          }
        } catch {
          // fallback
        }
      }
    }
    return (process.env.NEXT_PUBLIC_API_URL || "https://expense-management-0ik6.onrender.com").replace(/\/$/, "");
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/health`, { signal: AbortSignal.timeout(4000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getExpensesByDate(date: string): Promise<Expense[]> {
    const res = await fetch(`${this.getBaseUrl()}/expenses/${date}`);
    if (!res.ok) throw new Error(`Failed to fetch expenses: ${res.statusText}`);
    const data = await res.json();
    return data.map((item: any, idx: number) => ({
      id: item.id ? String(item.id) : `remote-${date}-${idx}`,
      expense_date: date,
      amount: item.amount,
      category: item.category,
      notes: item.notes || "",
    }));
  }

  async saveExpensesForDate(date: string, expenses: Omit<Expense, "id">[]): Promise<{ message: string }> {
    const payload = expenses.map(e => ({
      amount: Number(e.amount),
      category: e.category,
      notes: e.notes || "",
    }));
    const res = await fetch(`${this.getBaseUrl()}/expenses/${date}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to save expenses: ${res.statusText}`);
    return res.json();
  }

  async getCategoryAnalytics(startDate: string, endDate: string): Promise<Record<string, { total: number; percentage: number }>> {
    const res = await fetch(`${this.getBaseUrl()}/analytics/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_date: startDate, end_date: endDate }),
    });
    if (!res.ok) throw new Error(`Analytics request failed: ${res.statusText}`);
    return res.json();
  }

  async getMonthlyAnalytics(year: number): Promise<Record<string, { total: number; percentage: number }>> {
    const res = await fetch(`${this.getBaseUrl()}/analytics/monthly/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year }),
    });
    if (!res.ok) throw new Error(`Monthly analytics request failed: ${res.statusText}`);
    return res.json();
  }
}

export const api = new BackendApiAdapter();
