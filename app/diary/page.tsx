import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DiaryClient } from './diary-client'

export default async function DiaryPage() {
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
    .order('created_at')

  return (
    <DiaryClient
      initialEntries={entries ?? []}
      profile={profile ?? {
        id: user.id,
        full_name: null,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 250,
        daily_fat_goal: 65,
        created_at: new Date().toISOString(),
      }}
      today={today}
    />
  )
}
