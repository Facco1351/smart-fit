import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from './profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient
      profile={profile ?? {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 250,
        daily_fat_goal: 65,
        created_at: new Date().toISOString(),
      }}
      email={user.email ?? ''}
    />
  )
}
