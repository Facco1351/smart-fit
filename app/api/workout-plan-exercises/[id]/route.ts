import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { sets, reps, weight_kg, position } = body

  const patch: Record<string, unknown> = {}
  if (sets !== undefined) patch.sets = sets
  if (reps !== undefined) patch.reps = reps
  if (weight_kg !== undefined) patch.weight_kg = weight_kg
  if (position !== undefined) patch.position = position

  // RLS policy ensures only exercises in user-owned plans are updated
  const { error } = await supabase
    .from('workout_plan_exercises')
    .update(patch)
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // RLS policy ensures only exercises in user-owned plans are deleted
  const { error } = await supabase
    .from('workout_plan_exercises')
    .delete()
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
