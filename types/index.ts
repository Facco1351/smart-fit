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
  source?: 'openfoodfacts' | 'custom' | 'favorite'
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

export interface Exercise {
  id: string
  name: string
  muscle_group: string
}

export interface WorkoutPlanExercise {
  id: string
  plan_id: string
  exercise_id: string
  exercise: Exercise
  sets: number
  reps: number
  weight_kg: number | null
  position: number
}

export interface WorkoutPlan {
  id: string
  name: string
  exercises: WorkoutPlanExercise[]
}

export interface ExerciseLog {
  id: string
  exercise_id: string
  weight_kg: number
  sets: number | null
  reps: number | null
  logged_at: string
}
