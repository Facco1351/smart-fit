import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)

  return (
    <DashboardClient
      profile={profile ?? {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 250,
        daily_fat_goal: 65,
        created_at: new Date().toISOString(),
      }}
      initialEntries={entries ?? []}
      today={today}
    />
  )
}
