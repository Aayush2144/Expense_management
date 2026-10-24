export type ExpenseCategory =
  | "Rent"
  | "Food"
  | "Shopping"
  | "Transport"
  | "Entertainment"
  | "Other"
  | string;

export interface Expense {
  id: string;
  expense_date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  notes?: string;
  created_at?: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  monthly_limit: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface MonthlyBreakdown {
  month: string;
  year?: number;
  total: number;
  percentage: number;
  count: number;
}

export interface AnalyticsSummary {
  totalExpense: number;
  maxExpense: number;
  averagePerDay: number;
  topCategory: string;
  topCategoryTotal: number;
  monthlyTrend: MonthlyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
}
