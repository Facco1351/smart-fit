'use client'

import { useState, useTransition, lazy, Suspense } from 'react'
import { Search, Plus, Loader2, ScanBarcode } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import type { FoodItem, MealType } from '@/types'
import { MEAL_LABELS } from '@/types'

const BarcodeScanner = lazy(() =>
  import('./barcode-scanner').then((m) => ({ default: m.BarcodeScanner }))
)

interface FoodSearchDialogProps {
  mealType: MealType
  date: string
  onAdded: () => void
  trigger?: React.ReactNode
}

export function FoodSearchDialog({ mealType, date, onAdded, trigger }: FoodSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [barcodeError, setBarcodeError] = useState<string | null>(null)
  const [searching, startSearch] = useTransition()
  const [adding, startAdd] = useTransition()
  const [barcodeLoading, startBarcodeLoad] = useTransition()

  function handleSearch() {
    if (!query.trim()) return
    startSearch(async () => {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setSelected(null)
    })
  }

  function handleBarcodeResult(barcode: string) {
    setScanning(false)
    setBarcodeError(null)
    startBarcodeLoad(async () => {
      const res = await fetch(`/api/food/barcode?code=${encodeURIComponent(barcode)}`)
      if (!res.ok) {
        setBarcodeError(`Prodotto non trovato per il codice ${barcode}`)
        return
      }
      const food: FoodItem = await res.json()
      setSelected(food)
      setResults([])
      setQuery('')
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
      setBarcodeError(null)
      onAdded()
    })
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) {
      setScanning(false)
      setBarcodeError(null)
    }
  }

  if (scanning) {
    return (
      <Suspense fallback={null}>
        <BarcodeScanner
          onResult={handleBarcodeResult}
          onClose={() => setScanning(false)}
        />
      </Suspense>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost" className="text-emerald-600 dark:text-emerald-400 h-10 px-3">
            <Plus className="h-4 w-4 mr-1" />
            Aggiungi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Aggiungi a {MEAL_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Cerca alimento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <Button onClick={handleSearch} disabled={searching} size="icon" variant="outline" className="dark:border-gray-600 dark:text-gray-300 shrink-0">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setScanning(true)}
              size="icon"
              variant="outline"
              className="dark:border-gray-600 dark:text-gray-300 shrink-0"
              title="Scansiona codice a barre"
            >
              {barcodeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanBarcode className="h-4 w-4" />}
            </Button>
          </div>

          {barcodeError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{barcodeError}</p>
          )}

          {results.length > 0 && !selected && (
            <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-neutral-100 dark:border-gray-700 p-1">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelected(food)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <p className="text-sm font-medium text-neutral-800 dark:text-gray-100 line-clamp-1">{food.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {food.brand && (
                      <span className="text-xs text-neutral-400 dark:text-gray-500">{food.brand}</span>
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
            <div className="space-y-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-gray-100">{selected.name}</p>
                  {selected.brand && (
                    <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">{selected.brand}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 px-2 py-1"
                >
                  Cambia
                </button>
              </div>

              <div>
                <Label className="dark:text-gray-300">Quantità (g)</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  inputMode="decimal"
                  className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              {parseFloat(quantity) > 0 && (() => {
                const n = calcNutrients(selected, parseFloat(quantity))
                return (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Kcal', val: n.calories, color: 'text-emerald-700 dark:text-emerald-400' },
                      { label: 'Carb', val: n.carbs, color: 'text-amber-700 dark:text-amber-400' },
                      { label: 'Prot', val: n.protein, color: 'text-blue-700 dark:text-blue-400' },
                      { label: 'Grassi', val: n.fat, color: 'text-red-700 dark:text-red-400' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-white dark:bg-gray-700 rounded-lg p-2">
                        <p className={`text-sm font-bold ${color}`}>{Math.round(val)}</p>
                        <p className="text-xs text-neutral-400 dark:text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              <Button onClick={handleAdd} disabled={adding} className="w-full h-12">
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
