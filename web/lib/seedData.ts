import { Expense, CategoryBudget } from "@/types";

export const INITIAL_CATEGORIES = [
  "Rent",
  "Food",
  "Shopping",
  "Transport",
  "Entertainment",
  "Other",
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: "Rent", monthly_limit: 1500 },
  { category: "Food", monthly_limit: 800 },
  { category: "Shopping", monthly_limit: 500 },
  { category: "Transport", monthly_limit: 250 },
  { category: "Entertainment", monthly_limit: 350 },
  { category: "Other", monthly_limit: 200 },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: "exp-1", expense_date: "2024-08-01", amount: 1200, category: "Rent", notes: "Monthly apartment rent" },
  { id: "exp-2", expense_date: "2024-08-01", amount: 300, category: "Food", notes: "Whole Foods monthly grocery haul" },
  { id: "exp-3", expense_date: "2024-08-02", amount: 150, category: "Shopping", notes: "Nike running shoes" },
  { id: "exp-4", expense_date: "2024-08-02", amount: 80, category: "Entertainment", notes: "IMAX movie tickets & snacks" },
  { id: "exp-5", expense_date: "2024-08-03", amount: 110, category: "Food", notes: "Fine dining sushi evening" },
  { id: "exp-6", expense_date: "2024-08-04", amount: 45, category: "Transport", notes: "Airport ride & toll charges" },
  { id: "exp-7", expense_date: "2024-08-04", amount: 200, category: "Shopping", notes: "Minimalist workspace desk accessories" },
  { id: "exp-8", expense_date: "2024-08-05", amount: 75, category: "Entertainment", notes: "Symphony hall admission" },
  { id: "exp-9", expense_date: "2024-08-05", amount: 35, category: "Other", notes: "Secure cloud backup renewal" },
  { id: "exp-10", expense_date: "2024-09-01", amount: 1200, category: "Rent", notes: "Monthly apartment rent" },
  { id: "exp-11", expense_date: "2024-09-01", amount: 320, category: "Food", notes: "Organic market weekly groceries" },
  { id: "exp-12", expense_date: "2024-09-02", amount: 100, category: "Shopping", notes: "Autumn sweater & scarves" },
  { id: "exp-13", expense_date: "2024-09-02", amount: 65, category: "Transport", notes: "Metro monthly transit pass" },
  { id: "exp-14", expense_date: "2024-09-03", amount: 60, category: "Food", notes: "Artisan bistro lunch with team" },
  { id: "exp-15", expense_date: "2024-09-04", amount: 95, category: "Entertainment", notes: "Live jazz club tickets" },
  { id: "exp-16", expense_date: "2024-09-15", amount: 40, category: "Other", notes: "Bookstore architecture journals" },
  { id: "exp-17", expense_date: "2024-10-01", amount: 1200, category: "Rent", notes: "Monthly apartment rent" },
  { id: "exp-18", expense_date: "2024-10-02", amount: 280, category: "Food", notes: "Grocery store essentials" },
  { id: "exp-19", expense_date: "2024-10-04", amount: 140, category: "Shopping", notes: "Ergonomic keyboard" },
  { id: "exp-20", expense_date: "2024-10-10", amount: 50, category: "Transport", notes: "EV fast charge station fee" }
];
