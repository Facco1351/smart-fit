import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([], { status: 401 })

  const exerciseId = request.nextUrl.searchParams.get('exercise_id')
  if (!exerciseId) return Response.json([], { status: 400 })

  const { data } = await supabase
    .from('exercise_logs')
    .select('id, exercise_id, weight_kg, sets, reps, logged_at')
    .eq('user_id', user.id)
    .eq('exercise_id', exerciseId)
    .order('logged_at', { ascending: true })
    .limit(60)

  return Response.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { exercise_id, weight_kg, sets, reps, logged_at } = await request.json()

  if (!exercise_id || !weight_kg || weight_kg <= 0) {
    return Response.json({ error: 'Dati non validi' }, { status: 400 })
  }

  const today = new Date()
  const localDate = logged_at ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('exercise_logs')
    .upsert(
      { user_id: user.id, exercise_id, weight_kg, sets, reps, logged_at: localDate },
      { onConflict: 'user_id,exercise_id,logged_at' }
    )
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
