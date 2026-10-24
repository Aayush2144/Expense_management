import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Expense, CategoryBudget } from "@/types";
import { INITIAL_EXPENSES, INITIAL_CATEGORIES, INITIAL_BUDGETS } from "./seedData";

interface ExpenseStore {
  expenses: Expense[];
  categories: string[];
  budgets: CategoryBudget[];
  selectedCategory: string | null;
  dateRange: { start: string; end: string };
  searchQuery: string;
  is3DEnabled: boolean;
  backendUrl: string;

  // Actions
  addExpense: (expense: Omit<Expense, "id">) => void;
  addExpensesBatch: (expenses: Omit<Expense, "id">[]) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  addCategory: (category: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (category: string) => void;

  setBudget: (category: string, monthly_limit: number) => void;
  
  setSelectedCategory: (cat: string | null) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  setSearchQuery: (query: string) => void;
  toggle3D: () => void;
  setBackendUrl: (url: string) => void;
  
  importExpenses: (imported: Expense[]) => void;
  resetToDemoData: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: INITIAL_EXPENSES,
      categories: INITIAL_CATEGORIES,
      budgets: INITIAL_BUDGETS,
      selectedCategory: null,
      dateRange: { start: "2024-08-01", end: "2024-10-31" },
      searchQuery: "",
      is3DEnabled: true,
      backendUrl: process.env.NEXT_PUBLIC_API_URL || "https://expense-management-0ik6.onrender.com",

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            {
              ...expense,
              id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              created_at: new Date().toISOString(),
            },
            ...state.expenses,
          ],
        })),

      addExpensesBatch: (newExpenses) =>
        set((state) => ({
          expenses: [
            ...newExpenses.map((exp, idx) => ({
              ...exp,
              id: `exp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
              created_at: new Date().toISOString(),
            })),
            ...state.expenses,
          ],
        })),

      updateExpense: (id, updated) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updated } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addCategory: (category) =>
        set((state) => {
          const trimmed = category.trim();
          if (!trimmed || state.categories.includes(trimmed)) return state;
          return { categories: [...state.categories, trimmed] };
        }),

      renameCategory: (oldName, newName) =>
        set((state) => {
          const trimmed = newName.trim();
          if (!trimmed) return state;
          return {
            categories: state.categories.map((c) => (c === oldName ? trimmed : c)),
            expenses: state.expenses.map((e) =>
              e.category === oldName ? { ...e, category: trimmed } : e
            ),
            budgets: state.budgets.map((b) =>
              b.category === oldName ? { ...b, category: trimmed } : b
            ),
          };
        }),

      deleteCategory: (category) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
          expenses: state.expenses.map((e) =>
            e.category === category ? { ...e, category: "Other" } : e
          ),
          budgets: state.budgets.filter((b) => b.category !== category),
        })),

      setBudget: (category, monthly_limit) =>
        set((state) => {
          const exists = state.budgets.some((b) => b.category === category);
          return {
            budgets: exists
              ? state.budgets.map((b) =>
                  b.category === category ? { ...b, monthly_limit } : b
                )
              : [...state.budgets, { category, monthly_limit }],
          };
        }),

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setDateRange: (range) => set({ dateRange: range }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggle3D: () => set((state) => ({ is3DEnabled: !state.is3DEnabled })),
      setBackendUrl: (url) => set({ backendUrl: url }),

      importExpenses: (imported) =>
        set((state) => ({
          expenses: [...imported, ...state.expenses],
        })),

      resetToDemoData: () =>
        set({
          expenses: INITIAL_EXPENSES,
          categories: INITIAL_CATEGORIES,
          budgets: INITIAL_BUDGETS,
          selectedCategory: null,
          searchQuery: "",
        }),
    }),
    {
      name: "expense-vault-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
