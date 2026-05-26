import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { DiaryEntry, DayTotals } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcDayTotals(entries: DiaryEntry[]): DayTotals {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories ?? 0),
      protein: acc.protein + (e.protein_g ?? 0),
      carbs: acc.carbs + (e.carbs_g ?? 0),
      fat: acc.fat + (e.fat_g ?? 0),
      fiber: acc.fiber + (e.fiber_g ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  )
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function todayISO(): string {
  return formatDate(new Date())
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}
