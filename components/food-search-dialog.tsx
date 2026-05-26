'use client'

import { useState, useTransition } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import type { FoodItem, MealType } from '@/types'
import { MEAL_LABELS } from '@/types'

interface FoodSearchDialogProps {
  mealType: MealType
  date: string
  onAdded: () => void
  trigger?: React.ReactNode
}

export function FoodSearchDialog({ mealType, date, onAdded, trigger }: FoodSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [searching, startSearch] = useTransition()
  const [adding, startAdd] = useTransition()

  function handleSearch() {
    if (!query.trim()) return
    startSearch(async () => {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setSelected(null)
    })
  }

  function calcNutrients(food: FoodItem, qty: number) {
    const factor = qty / 100
    return {
      calories: food.nutrients.calories_per_100g * factor,
      protein: food.nutrients.protein_per_100g * factor,
      carbs: food.nutrients.carbs_per_100g * factor,
      fat: food.nutrients.fat_per_100g * factor,
      fiber: food.nutrients.fiber_per_100g * factor,
    }
  }

  function handleAdd() {
    if (!selected) return
    const qty = parseFloat(quantity) || 100
    const n = calcNutrients(selected, qty)

    startAdd(async () => {
      await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          meal_type: mealType,
          food_name: selected.name,
          food_id: selected.id,
          quantity_g: qty,
          calories: n.calories,
          protein_g: n.protein,
          carbs_g: n.carbs,
          fat_g: n.fat,
          fiber_g: n.fiber,
        }),
      })
      setOpen(false)
      setQuery('')
      setResults([])
      setSelected(null)
      setQuantity('100')
      onAdded()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost" className="text-emerald-600">
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi a {MEAL_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Cerca alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} size="icon" variant="outline">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {results.length > 0 && !selected && (
            <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-neutral-100 p-1">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelected(food)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <p className="text-sm font-medium text-neutral-800 line-clamp-1">{food.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {food.brand && (
                      <span className="text-xs text-neutral-400">{food.brand}</span>
                    )}
                    <Badge variant="default" className="text-xs">
                      {Math.round(food.nutrients.calories_per_100g)} kcal/100g
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="space-y-4 rounded-xl bg-emerald-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-800">{selected.name}</p>
                  {selected.brand && (
                    <p className="text-xs text-neutral-500 mt-0.5">{selected.brand}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Cambia
                </button>
              </div>

              <div>
                <Label>Quantità (g)</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="mt-1.5"
                />
              </div>

              {parseFloat(quantity) > 0 && (() => {
                const n = calcNutrients(selected, parseFloat(quantity))
                return (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Kcal', val: n.calories, color: 'text-emerald-700' },
                      { label: 'Prot', val: n.protein, color: 'text-blue-700' },
                      { label: 'Carb', val: n.carbs, color: 'text-amber-700' },
                      { label: 'Grassi', val: n.fat, color: 'text-red-700' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-white rounded-lg p-2">
                        <p className={`text-sm font-bold ${color}`}>{Math.round(val)}</p>
                        <p className="text-xs text-neutral-400">{label}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              <Button onClick={handleAdd} disabled={adding} className="w-full">
                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Aggiungi al diario
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
