'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { FoodItem } from '@/types'

interface CreateFoodDialogProps {
  onCreated: (food: FoodItem) => void
  trigger?: React.ReactNode
}

const EMPTY = { name: '', brand: '', calories: '', carbs: '', protein: '', fat: '', fiber: '' }

export function CreateFoodDialog({ onCreated, trigger }: CreateFoodDialogProps) {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState(EMPTY)
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  function set(k: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setFields((f) => ({ ...f, [k]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fields.name.trim() || !fields.calories) {
      setError('Nome e calorie obbligatori')
      return
    }
    setError(null)
    startSave(async () => {
      const res = await fetch('/api/food/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name,
          brand: fields.brand || undefined,
          calories_per_100g: parseFloat(fields.calories) || 0,
          carbs_per_100g: parseFloat(fields.carbs) || 0,
          protein_per_100g: parseFloat(fields.protein) || 0,
          fat_per_100g: parseFloat(fields.fat) || 0,
          fiber_per_100g: parseFloat(fields.fiber) || 0,
          is_public: isPublic,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Errore durante il salvataggio')
        return
      }
      const food: FoodItem = await res.json()
      setFields(EMPTY)
      setOpen(false)
      onCreated(food)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300 text-xs h-8">
            <Plus className="h-3 w-3 mr-1" />
            Crea alimento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-800 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Crea alimento personalizzato</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Nome <span className="text-red-400">*</span></Label>
            <Input
              value={fields.name}
              onChange={set('name')}
              placeholder="es. Petto di pollo al forno"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Marca</Label>
            <Input
              value={fields.brand}
              onChange={set('brand')}
              placeholder="opzionale"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <p className="text-xs text-neutral-400 dark:text-gray-500 font-medium uppercase tracking-wide">Valori per 100g</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-emerald-600 dark:text-emerald-400 text-xs">Calorie (kcal) <span className="text-red-400">*</span></Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={fields.calories}
                onChange={set('calories')}
                placeholder="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-amber-600 dark:text-amber-400 text-xs">Carboidrati (g)</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={fields.carbs}
                onChange={set('carbs')}
                placeholder="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-blue-600 dark:text-blue-400 text-xs">Proteine (g)</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={fields.protein}
                onChange={set('protein')}
                placeholder="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-500 dark:text-red-400 text-xs">Grassi (g)</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={fields.fat}
                onChange={set('fat')}
                placeholder="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="dark:text-gray-300 text-xs">Fibre (g)</Label>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              value={fields.fiber}
              onChange={set('fiber')}
              placeholder="0"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center gap-3 bg-neutral-50 dark:bg-gray-700 rounded-xl p-3">
            <input
              id="is-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            <div>
              <label htmlFor="is-public" className="text-sm font-medium dark:text-gray-200 cursor-pointer">
                Condividi con la comunità
              </label>
              <p className="text-xs text-neutral-400 dark:text-gray-500">
                {isPublic ? 'Visibile a tutti gli utenti' : 'Solo tu puoi vederlo'}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" disabled={saving} className="w-full h-12">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Salva alimento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
