import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SchedaClient } from './scheda-client'
import type { Exercise, WorkoutPlan } from '@/types'

export default async function SchedaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('workout_plans')
    .select(`
      id, name, created_at,
      workout_plan_exercises(
        id, sets, reps, weight_kg, position, exercise_id,
        exercises(id, name, muscle_group)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const initialPlans: WorkoutPlan[] = (data ?? []).map((plan) => ({
    id: plan.id,
    name: plan.name,
    exercises: ((plan.workout_plan_exercises as unknown[]) ?? [])
      .map((pe: unknown) => {
        const p = pe as {
          id: string; sets: number; reps: number; weight_kg: number | null
          position: number; exercise_id: string; exercises: Exercise
        }
        return {
          id: p.id,
          plan_id: plan.id,
          exercise_id: p.exercise_id,
          exercise: p.exercises,
          sets: p.sets,
          reps: p.reps,
          weight_kg: p.weight_kg,
          position: p.position,
        }
      })
      .sort((a, b) => a.position - b.position),
  }))

  return <SchedaClient initialPlans={initialPlans} />
}
