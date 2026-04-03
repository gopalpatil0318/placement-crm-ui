import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Derive current academic year from passout year.
 * Assumes a 4-year degree programme.
 * Formula: 4 - (passoutYear - calendarYear), clamped to [1, 6].
 */
export function getCurrentYear(passoutYear: number): number {
  const calendarYear = new Date().getFullYear()
  const computed = 4 - (passoutYear - calendarYear)
  return Math.max(1, Math.min(6, computed))
}

/**
 * Format academic year with ordinal suffix.
 * e.g. 1 → "1st Yr", 2 → "2nd Yr", 3 → "3rd Yr", 4 → "4th Yr"
 */
export function formatYearLabel(year: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" }
  return `${year}${suffixes[year] || "th"} Yr`
}
