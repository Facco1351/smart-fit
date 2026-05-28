'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Exercise } from '@/types'

const MUSCLE_GROUPS = ['Petto', 'Schiena', 'Spalle', 'Braccia', 'Gambe', 'Core', 'Cardio']

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
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState(MUSCLE_GROUPS[0])
  const [creating, startCreate] = useTransition()

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

  function handleCreate() {
    if (!newName.trim()) return
    startCreate(async () => {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), muscle_group: newGroup }),
      })
      if (res.ok) {
        const created: Exercise = await res.json()
        setExercises((prev) => [...prev, created].sort((a, b) =>
          a.muscle_group.localeCompare(b.muscle_group) || a.name.localeCompare(b.name)
        ))
        setNewName('')
        setNewGroup(MUSCLE_GROUPS[0])
        setShowCreate(false)
        // auto-add to plan
        handleAdd(created.id)
      }
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

        {/* Crea nuovo esercizio */}
        <div className="border-t border-neutral-100 dark:border-gray-700 pt-3">
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium w-full"
          >
            {showCreate ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Crea nuovo esercizio
            {showCreate && <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>

          {showCreate && (
            <div className="mt-3 space-y-3">
              <div>
                <Label className="dark:text-gray-300 text-xs">Nome esercizio</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="es. Panca con Manubri"
                  autoFocus
                  className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label className="dark:text-gray-300 text-xs">Gruppo muscolare</Label>
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="w-full"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Crea e aggiungi
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
