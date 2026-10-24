import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export const CATEGORY_COLORS: Record<string, string> = {
  Rent: "hsl(217, 91%, 60%)",       // Vivid Blue
  Food: "hsl(142, 71%, 45%)",       // Emerald Green
  Shopping: "hsl(280, 80%, 65%)",   // Radiant Purple
  Transport: "hsl(38, 92%, 50%)",   // Amber Gold
  Entertainment: "hsl(340, 82%, 52%)", // Ruby Pink
  Other: "hsl(215, 20%, 65%)",      // Slate Grey
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "hsl(262, 83%, 58%)";
}
