import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([], { status: 401 })

  const { data } = await supabase
    .from('weight_logs')
    .select('weight_kg, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(30)

  return Response.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { weight_kg, logged_at } = await request.json()

  if (!weight_kg || weight_kg <= 0) {
    return Response.json({ error: 'Peso non valido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(
      { user_id: user.id, weight_kg: parseFloat(weight_kg), logged_at: logged_at ?? new Date().toISOString().split('T')[0] },
      { onConflict: 'user_id,logged_at' }
    )
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
