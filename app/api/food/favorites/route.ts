import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FoodItem } from '@/types'

function rowToFoodItem(row: Record<string, unknown>): FoodItem {
  return {
    id: `fav_${row.id}`,
    name: row.food_name as string,
    brand: (row.food_brand as string | null) ?? undefined,
    source: 'favorite',
    nutrients: {
      calories_per_100g: row.calories_per_100g as number,
      protein_per_100g: row.protein_per_100g as number,
      carbs_per_100g: row.carbs_per_100g as number,
      fat_per_100g: row.fat_per_100g as number,
      fiber_per_100g: row.fiber_per_100g as number,
    },
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json([], { status: 401 })

  const { data } = await supabase
    .from('favorite_foods')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return Response.json((data ?? []).map(rowToFoodItem))
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const food: FoodItem = await request.json()

  const { data, error } = await supabase
    .from('favorite_foods')
    .upsert({
      user_id: user.id,
      food_name: food.name,
      food_brand: food.brand ?? null,
      calories_per_100g: food.nutrients.calories_per_100g,
      carbs_per_100g: food.nutrients.carbs_per_100g,
      protein_per_100g: food.nutrients.protein_per_100g,
      fat_per_100g: food.nutrients.fat_per_100g,
      fiber_per_100g: food.nutrients.fiber_per_100g,
    }, { onConflict: 'user_id,food_name,food_brand' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(rowToFoodItem(data))
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { food_name, food_brand } = await request.json()

  const base = supabase
    .from('favorite_foods')
    .delete()
    .eq('user_id', user.id)
    .eq('food_name', food_name)

  await (food_brand ? base.eq('food_brand', food_brand) : base.is('food_brand', null))

  return Response.json({ ok: true })
}
