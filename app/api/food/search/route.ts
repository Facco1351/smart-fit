import { NextRequest } from 'next/server'
import { searchFoods } from '@/lib/openfoodfacts'
import { createClient } from '@/lib/supabase/server'
import type { FoodItem } from '@/types'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return Response.json([])

  const supabase = await createClient()

  const [offResults, customResult] = await Promise.all([
    searchFoods(q),
    supabase
      .from('custom_foods')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(10),
  ])

  const customFoods: FoodItem[] = (customResult.data ?? []).map((row) => ({
    id: `custom_${row.id}`,
    name: row.name,
    brand: row.brand ?? undefined,
    source: 'custom' as const,
    nutrients: {
      calories_per_100g: row.calories_per_100g,
      protein_per_100g: row.protein_per_100g,
      carbs_per_100g: row.carbs_per_100g,
      fat_per_100g: row.fat_per_100g,
      fiber_per_100g: row.fiber_per_100g,
    },
  }))

  const offWithSource: FoodItem[] = offResults.map((f) => ({ ...f, source: 'openfoodfacts' as const }))

  return Response.json([...customFoods, ...offWithSource])
}
