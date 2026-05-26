'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
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
  const [, startDelete] = useTransition()

  const total = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)

  function handleDelete(id: string) {
    startDelete(async () => {
      await fetch(`/api/diary/${id}`, { method: 'DELETE' })
      onUpdate()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{MEAL_ICONS[mealType]}</span>
          <div>
            <p className="font-semibold text-neutral-800 text-sm">{MEAL_LABELS[mealType]}</p>
            <p className="text-xs text-neutral-400">{Math.round(total)} kcal</p>
          </div>
        </div>
        <FoodSearchDialog mealType={mealType} date={date} onAdded={onUpdate} />
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-3 text-sm text-neutral-400 italic">Nessun alimento registrato</div>
      ) : (
        <div className="divide-y divide-neutral-50">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-700 truncate">{entry.food_name}</p>
                <p className="text-xs text-neutral-400">
                  {entry.quantity_g}g
                  {entry.protein_g != null && ` · P: ${Math.round(entry.protein_g)}g`}
                  {entry.carbs_g != null && ` · C: ${Math.round(entry.carbs_g)}g`}
                  {entry.fat_g != null && ` · G: ${Math.round(entry.fat_g)}g`}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm font-semibold text-neutral-700">{Math.round(entry.calories)} kcal</span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
