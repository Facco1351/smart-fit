'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Exercise } from '@/types'

interface ExercisePickerDialogProps {
  planId: string
  existingExerciseIds: string[]
  onAdded: () => void
}

export function ExercisePickerDialog({ planId, existingExerciseIds, onAdded }: ExercisePickerDialogProps) {
  const [open, setOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [adding, startAdd] = useTransition()
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data: Exercise[]) => setExercises(data))
      .catch(() => {})
  }, [open])

  const filtered = exercises.filter(
    (e) =>
      !existingExerciseIds.includes(e.id) &&
      (e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.muscle_group.toLowerCase().includes(query.toLowerCase()))
  )

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.muscle_group]) acc[ex.muscle_group] = []
    acc[ex.muscle_group].push(ex)
    return acc
  }, {})

  function handleAdd(exerciseId: string) {
    setAddingId(exerciseId)
    startAdd(async () => {
      await fetch(`/api/workout-plans/${planId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: exerciseId }),
      })
      setOpen(false)
      setQuery('')
      setAddingId(null)
      onAdded()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2 dark:border-gray-600 dark:text-gray-300 gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi esercizio
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-gray-800 dark:border-gray-700 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Aggiungi esercizio</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Cerca esercizio o gruppo muscolare..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {Object.entries(grouped).map(([group, exs]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-neutral-400 dark:text-gray-500 uppercase tracking-wide px-1 mb-1">
                {group}
              </p>
              <div className="space-y-1">
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAdd(ex.id)}
                    disabled={adding}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm text-neutral-800 dark:text-gray-100">{ex.name}</span>
                    {addingId === ex.id
                      ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                      : <Plus className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && exercises.length > 0 && (
            <p className="text-sm text-neutral-400 dark:text-gray-500 text-center py-4">
              Nessun esercizio trovato
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
