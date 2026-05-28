import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Exercise, WorkoutPlan } from '@/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([], { status: 401 })

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

  const plans: WorkoutPlan[] = (data ?? []).map((plan) => ({
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

  return Response.json(plans)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return Response.json({ error: 'Nome richiesto' }, { status: 400 })

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({ user_id: user.id, name: name.trim() })
    .select('id, name')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ...data, exercises: [] } as WorkoutPlan)
}
