'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { FoodSearchDialog } from './food-search-dialog'
import type { DiaryEntry, MealType } from '@/types'
import { MEAL_LABELS, MEAL_ICONS } from '@/types'

interface MealSectionProps {
  mealType: MealType
  entries: DiaryEntry[]
  date: string
  onUpdate: () => void
}

export function MealSection({ mealType, entries, date, onUpdate }: MealSectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startDelete] = useTransition()

  const total = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)

  function handleDelete(id: string) {
    setDeletingId(id)
    startDelete(async () => {
      await fetch(`/api/diary/${id}`, { method: 'DELETE' })
      setDeletingId(null)
      onUpdate()
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-neutral-100 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">{MEAL_ICONS[mealType]}</span>
          <div>
            <p className="font-semibold text-neutral-800 dark:text-gray-100 text-sm">{MEAL_LABELS[mealType]}</p>
            <p className="text-xs text-neutral-400 dark:text-gray-500">{Math.round(total)} kcal</p>
          </div>
        </div>
        <FoodSearchDialog mealType={mealType} date={date} onAdded={onUpdate} />
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-3 text-sm text-neutral-400 dark:text-gray-500 italic">Nessun alimento registrato</div>
      ) : (
        <div className="divide-y divide-neutral-50 dark:divide-gray-700">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 dark:text-gray-200 truncate">{entry.food_name}</p>
                <p className="text-xs text-neutral-400 dark:text-gray-500">
                  {entry.quantity_g}g
                  {entry.carbs_g != null && ` · C: ${Math.round(entry.carbs_g)}g`}
                  {entry.protein_g != null && ` · P: ${Math.round(entry.protein_g)}g`}
                  {entry.fat_g != null && ` · G: ${Math.round(entry.fat_g)}g`}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm font-semibold text-neutral-700 dark:text-gray-200">{Math.round(entry.calories)} kcal</span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="p-2 rounded-lg text-neutral-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === entry.id
                    ? <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
