import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency utilities ───

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  EUR: "€",
  GBP: "£",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || "";
}

// ─── Verdict utilities ───

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case "KILL": return "bg-red-500 text-white hover:bg-red-600";
    case "FIX": return "bg-amber-500 text-white hover:bg-amber-600";
    case "SCALE": return "bg-emerald-500 text-white hover:bg-emerald-600";
    case "WATCH": return "bg-yellow-500 text-black hover:bg-yellow-600";
    case "NO_ACTION": return "bg-gray-500 text-white hover:bg-gray-600";
    case "INSUFFICIENT_DATA": return "bg-gray-300 text-gray-700 hover:bg-gray-400";
    default: return "bg-gray-500 text-white";
  }
}

export function verdictLabel(verdict: string): string {
  switch (verdict) {
    case "KILL": return "Kill";
    case "FIX": return "Fix";
    case "SCALE": return "Scale";
    case "WATCH": return "Watch";
    case "NO_ACTION": return "No Action";
    case "INSUFFICIENT_DATA": return "Insufficient Data";
    default: return verdict;
  }
}

export function verdictPdfColor(verdict: string): string {
  switch (verdict) {
    case "KILL": return "#EF4444";
    case "FIX": return "#F59E0B";
    case "SCALE": return "#10B981";
    case "WATCH": return "#EAB308";
    case "NO_ACTION": return "#64748B";
    case "INSUFFICIENT_DATA": return "#9CA3AF";
    default: return "#64748B";
  }
}

export function verdictPdfLabel(verdict: string): string {
  switch (verdict) {
    case "KILL": return "Kill";
    case "FIX": return "Fix";
    case "SCALE": return "Scale";
    case "WATCH": return "Watch";
    case "NO_ACTION": return "No Action";
    case "INSUFFICIENT_DATA": return "Insufficient";
    default: return verdict;
  }
}
