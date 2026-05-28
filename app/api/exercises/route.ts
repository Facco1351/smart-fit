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
