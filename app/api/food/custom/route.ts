import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FoodItem } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, brand, calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g, fiber_per_100g, is_public } = body

  if (!name?.trim() || calories_per_100g == null) {
    return Response.json({ error: 'name e calorie obbligatori' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('custom_foods')
    .insert({
      created_by: user.id,
      name: name.trim(),
      brand: brand?.trim() || null,
      calories_per_100g: parseFloat(calories_per_100g) || 0,
      carbs_per_100g: parseFloat(carbs_per_100g) || 0,
      protein_per_100g: parseFloat(protein_per_100g) || 0,
      fat_per_100g: parseFloat(fat_per_100g) || 0,
      fiber_per_100g: parseFloat(fiber_per_100g) || 0,
      is_public: is_public ?? true,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const food: FoodItem = {
    id: `custom_${data.id}`,
    name: data.name,
    brand: data.brand ?? undefined,
    source: 'custom',
    nutrients: {
      calories_per_100g: data.calories_per_100g,
      protein_per_100g: data.protein_per_100g,
      carbs_per_100g: data.carbs_per_100g,
      fat_per_100g: data.fat_per_100g,
      fiber_per_100g: data.fiber_per_100g,
    },
  }

  return Response.json(food)
}
