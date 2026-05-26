import { NextRequest } from 'next/server'
import { searchFoods } from '@/lib/openfoodfacts'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return Response.json([])

  const results = await searchFoods(q)
  return Response.json(results)
}
