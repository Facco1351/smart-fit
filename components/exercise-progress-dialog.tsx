'use client'

import { useState, useEffect, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WorkoutPlanExercise, ExerciseLog } from '@/types'

interface ExerciseProgressDialogProps {
  planExercise: WorkoutPlanExercise | null
  onClose: () => void
  onSaved: () => void
}

export function ExerciseProgressDialog({ planExercise, onClose, onSaved }: ExerciseProgressDialogProps) {
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [saving, startSave] = useTransition()

  useEffect(() => {
    if (!planExercise) return
    setSets(String(planExercise.sets))
    setReps(String(planExercise.reps))
    setWeight(planExercise.weight_kg != null ? String(planExercise.weight_kg) : '')
    fetch(`/api/exercise-logs?exercise_id=${planExercise.exercise_id}`)
      .then((r) => r.json())
      .then((data: ExerciseLog[]) => setLogs(data))
      .catch(() => {})
  }, [planExercise])

  function handleSave() {
    if (!planExercise) return
    const weightVal = parseFloat(weight)
    const setsVal = parseInt(sets)
    const repsVal = parseInt(reps)

    startSave(async () => {
      const today = new Date()
      const logged_at = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      await Promise.all([
        fetch(`/api/workout-plan-exercises/${planExercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sets: setsVal, reps: repsVal, weight_kg: weightVal || null }),
        }),
        ...(weightVal > 0
          ? [fetch('/api/exercise-logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                exercise_id: planExercise.exercise_id,
                weight_kg: weightVal,
                sets: setsVal,
                reps: repsVal,
                logged_at,
              }),
            })]
          : []),
      ])

      onSaved()
      onClose()
    })
  }

  const chartData = logs.map((l) => ({
    day: new Date(l.logged_at + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
    peso: l.weight_kg,
  }))

  const allWeights = logs.map((l) => l.weight_kg)
  const minW = allWeights.length ? Math.floor(Math.min(...allWeights)) - 2 : 0
  const maxW = allWeights.length ? Math.ceil(Math.max(...allWeights)) + 2 : 100

  return (
    <Dialog open={!!planExercise} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{planExercise?.exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="dark:text-gray-300 text-xs">Serie</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min="1"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300 text-xs">Ripetizioni</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div>
              <Label className="dark:text-gray-300 text-xs">Peso (kg)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.5"
                placeholder="—"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-11">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salva e registra
          </Button>

          {chartData.length > 1 && (
            <div>
              <p className="text-xs font-medium text-neutral-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Progressione peso
              </p>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[minW, maxW]}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 12 }}
                    formatter={(v) => [`${v} kg`, 'Peso']}
                  />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={<Dot r={3} fill="#10b981" />}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length === 1 && (
            <p className="text-xs text-neutral-400 dark:text-gray-500 text-center">
              Registra almeno 2 allenamenti per vedere la progressione
            </p>
          )}

          {chartData.length === 0 && (
            <p className="text-xs text-neutral-400 dark:text-gray-500 text-center">
              Nessuna progressione registrata. Salva il peso per iniziare!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
