import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: planId } = await params
  const { exercise_id } = await request.json()
  if (!exercise_id) return Response.json({ error: 'exercise_id richiesto' }, { status: 400 })

  const { data: plan } = await supabase
    .from('workout_plans')
    .select('id')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 })

  const { count } = await supabase
    .from('workout_plan_exercises')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', planId)

  const { data, error } = await supabase
    .from('workout_plan_exercises')
    .insert({ plan_id: planId, exercise_id, position: count ?? 0 })
    .select(`id, sets, reps, weight_kg, position, exercise_id, exercises(id, name, muscle_group)`)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
