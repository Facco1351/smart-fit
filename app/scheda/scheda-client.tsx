'use client'

import { useState, useTransition, useCallback } from 'react'
import { Plus, Pencil, Trash2, Check, X, TrendingUp, Loader2, Dumbbell, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExercisePickerDialog } from '@/components/exercise-picker-dialog'
import { ExerciseProgressDialog } from '@/components/exercise-progress-dialog'
import type { WorkoutPlan, WorkoutPlanExercise } from '@/types'

interface SchedaClientProps {
  initialPlans: WorkoutPlan[]
}

export function SchedaClient({ initialPlans }: SchedaClientProps) {
  const [plans, setPlans] = useState<WorkoutPlan[]>(initialPlans)
  const [creating, startCreate] = useTransition()
  const [selectedExercise, setSelectedExercise] = useState<WorkoutPlanExercise | null>(null)

  const reload = useCallback(async () => {
    const res = await fetch('/api/workout-plans')
    if (res.ok) setPlans(await res.json())
  }, [])

  function handleCreate() {
    startCreate(async () => {
      const res = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nuova scheda' }),
      })
      if (res.ok) await reload()
    })
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-gray-100">Le mie schede</h1>
          <p className="text-sm text-neutral-500 dark:text-gray-400">Programmi di allenamento</p>
        </div>
        <Button onClick={handleCreate} disabled={creating} size="sm" className="gap-1.5">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nuova
        </Button>
      </div>

      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Dumbbell className="h-12 w-12 text-neutral-300 dark:text-gray-600 mb-3" />
          <p className="text-neutral-500 dark:text-gray-400 text-sm">Nessuna scheda ancora.</p>
          <p className="text-neutral-400 dark:text-gray-500 text-xs mt-1">Crea la tua prima scheda!</p>
        </div>
      )}

      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onUpdate={reload}
          onSelectExercise={setSelectedExercise}
        />
      ))}

      <ExerciseProgressDialog
        planExercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onSaved={reload}
      />
    </div>
  )
}

interface PlanCardProps {
  plan: WorkoutPlan
  onUpdate: () => void
  onSelectExercise: (pe: WorkoutPlanExercise) => void
}

function PlanCard({ plan, onUpdate, onSelectExercise }: PlanCardProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(plan.name)
  const [renaming, startRename] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [, startRemove] = useTransition()
  const [, startMove] = useTransition()

  function handleRename() {
    if (!nameInput.trim() || nameInput === plan.name) {
      setNameInput(plan.name)
      setEditingName(false)
      return
    }
    startRename(async () => {
      await fetch(`/api/workout-plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim() }),
      })
      setEditingName(false)
      onUpdate()
    })
  }

  function handleDelete() {
    startDelete(async () => {
      await fetch(`/api/workout-plans/${plan.id}`, { method: 'DELETE' })
      onUpdate()
    })
  }

  function handleMoveExercise(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= plan.exercises.length) return
    const a = plan.exercises[index]
    const b = plan.exercises[target]
    startMove(async () => {
      await Promise.all([
        fetch(`/api/workout-plan-exercises/${a.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: b.position }),
        }),
        fetch(`/api/workout-plan-exercises/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: a.position }),
        }),
      ])
      onUpdate()
    })
  }

  function handleRemoveExercise(peId: string) {
    setRemovingId(peId)
    startRemove(async () => {
      await fetch(`/api/workout-plan-exercises/${peId}`, { method: 'DELETE' })
      setRemovingId(null)
      onUpdate()
    })
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') { setNameInput(plan.name); setEditingName(false) }
                }}
                autoFocus
                className="h-8 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <button onClick={handleRename} disabled={renaming} className="text-emerald-500 p-1">
                {renaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button onClick={() => { setNameInput(plan.name); setEditingName(false) }} className="text-neutral-400 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <CardTitle className="text-base text-neutral-800 dark:text-gray-100 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-emerald-500 shrink-0" />
                {plan.name}
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1.5 rounded-lg text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-neutral-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-1 pt-0">
        {plan.exercises.length === 0 && (
          <p className="text-xs text-neutral-400 dark:text-gray-500 text-center py-2">
            Nessun esercizio. Aggiungine uno!
          </p>
        )}

        {plan.exercises.map((pe, peIndex) => (
          <div key={pe.id} className="flex items-center gap-1 group">
            <div className="flex flex-col shrink-0">
              <button
                onClick={() => handleMoveExercise(peIndex, 'up')}
                disabled={peIndex === 0}
                className="p-0.5 text-neutral-300 dark:text-gray-600 hover:text-neutral-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleMoveExercise(peIndex, 'down')}
                disabled={peIndex === plan.exercises.length - 1}
                className="p-0.5 text-neutral-300 dark:text-gray-600 hover:text-neutral-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => onSelectExercise(pe)}
              className="flex-1 text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-800 dark:text-gray-100 line-clamp-1">
                  {pe.exercise.name}
                </p>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0 ml-2 opacity-60" />
              </div>
              <p className="text-xs text-neutral-400 dark:text-gray-500 mt-0.5">
                {pe.sets} serie × {pe.reps} rip
                {pe.weight_kg != null ? ` @ ${pe.weight_kg} kg` : ''}
              </p>
            </button>
            <button
              onClick={() => handleRemoveExercise(pe.id)}
              disabled={removingId === pe.id}
              className="p-2 shrink-0 rounded-lg text-neutral-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              {removingId === pe.id
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}

        <ExercisePickerDialog
          planId={plan.id}
          existingExerciseIds={plan.exercises.map((pe) => pe.exercise_id)}
          onAdded={onUpdate}
        />
      </CardContent>
    </Card>
  )
}
