import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([], { status: 401 })

  const { data } = await supabase
    .from('exercises')
    .select('id, name, muscle_group')
    .order('muscle_group')
    .order('name')

  return Response.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, muscle_group } = await request.json()
  if (!name?.trim() || !muscle_group?.trim()) {
    return Response.json({ error: 'Nome e gruppo muscolare richiesti' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({ name: name.trim(), muscle_group: muscle_group.trim() })
    .select('id, name, muscle_group')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
