'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MealSection } from '@/components/meal-section'
import { CalorieSummary } from '@/components/calorie-summary'
import { calcDayTotals, formatDate } from '@/lib/utils'
import type { DiaryEntry, MealType, Profile } from '@/types'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

interface DiaryClientProps {
  initialEntries: DiaryEntry[]
  profile: Profile
  today: string
}

export function DiaryClient({ initialEntries, profile, today }: DiaryClientProps) {
  const [currentDate, setCurrentDate] = useState(today)
  const [entries, setEntries] = useState(initialEntries)
  const [loading, setLoading] = useState(false)

  const loadEntries = useCallback(async (date: string) => {
    setLoading(true)
    const res = await fetch(`/api/diary?date=${date}`)
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  function goDay(offset: number) {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() + offset)
    const newDate = formatDate(d)
    setCurrentDate(newDate)
    loadEntries(newDate)
  }

  const isToday = currentDate === today

  const displayDate = new Date(currentDate + 'T12:00:00').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const totals = calcDayTotals(entries)
  const entriesByMeal = (meal: MealType) => entries.filter((e) => e.meal_type === meal)

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => goDay(-1)}
          disabled={loading}
          className="p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-gray-400" />
        </button>

        <div className="text-center">
          <h1 className="text-base font-semibold text-neutral-800 dark:text-gray-100 capitalize">{displayDate}</h1>
          {isToday && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              Oggi
            </span>
          )}
        </div>

        <button
          onClick={() => goDay(1)}
          disabled={isToday || loading}
          className="p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-gray-400" />
        </button>
      </div>

      <CalorieSummary totals={totals} profile={profile} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {MEALS.map((meal) => (
            <MealSection
              key={meal}
              mealType={meal}
              entries={entriesByMeal(meal)}
              date={currentDate}
              onUpdate={() => loadEntries(currentDate)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
