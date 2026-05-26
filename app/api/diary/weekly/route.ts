import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const endDate = request.nextUrl.searchParams.get('end') ?? new Date().toISOString().split('T')[0]
  const start = new Date(endDate)
  start.setDate(start.getDate() - 6)
  const startDate = start.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('diary_entries')
    .select('date, calories')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const dayMap: Record<string, number> = {}
  for (const row of data ?? []) {
    dayMap[row.date] = (dayMap[row.date] ?? 0) + row.calories
  }

  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    result.push({ day: days[d.getDay()], calories: Math.round(dayMap[iso] ?? 0) })
  }

  return Response.json(result)
}
