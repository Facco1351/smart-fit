create table if not exists favorite_foods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  food_name text not null,
  food_brand text,
  calories_per_100g numeric(10,2) not null,
  carbs_per_100g numeric(10,2) not null default 0,
  protein_per_100g numeric(10,2) not null default 0,
  fat_per_100g numeric(10,2) not null default 0,
  fiber_per_100g numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, food_name, food_brand)
);

alter table favorite_foods enable row level security;

create policy "Users manage own favorites"
  on favorite_foods for all
  using (auth.uid() = user_id);

create index on favorite_foods (user_id);
