export interface Profile {
  id: string
  full_name: string | null
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  created_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface DiaryEntry {
  id: string
  user_id: string
  date: string
  meal_type: MealType
  food_name: string
  food_id: string | null
  quantity_g: number
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  created_at: string
}

export interface FoodNutrients {
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  source?: 'openfoodfacts' | 'custom'
  nutrients: FoodNutrients
}

export interface DayTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
  snack: 'Spuntino',
}

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '☀️',
  lunch: '🍽️',
  dinner: '🌙',
  snack: '🍎',
}
