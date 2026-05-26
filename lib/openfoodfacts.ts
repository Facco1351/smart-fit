import type { FoodItem } from '@/types'

interface OFFProduct {
  product_name?: string
  brands?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
    fiber_100g?: number
  }
}

interface OFFSearchResponse {
  products: OFFProduct[]
  count: number
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&lc=it`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SmartFit-CalorieTracker/1.0' },
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []

  const data: OFFSearchResponse = await res.json()

  return data.products
    .filter(
      (p) =>
        p.product_name &&
        p.nutriments?.['energy-kcal_100g'] !== undefined
    )
    .map((p, i) => ({
      id: `off_${i}_${Date.now()}`,
      name: p.product_name!,
      brand: p.brands,
      nutrients: {
        calories_per_100g: p.nutriments!['energy-kcal_100g']!,
        protein_per_100g: p.nutriments!.proteins_100g ?? 0,
        carbs_per_100g: p.nutriments!.carbohydrates_100g ?? 0,
        fat_per_100g: p.nutriments!.fat_100g ?? 0,
        fiber_per_100g: p.nutriments!.fiber_100g ?? 0,
      },
    }))
    .slice(0, 15)
}
