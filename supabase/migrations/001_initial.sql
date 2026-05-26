-- Enable RLS
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  daily_calorie_goal integer not null default 2000,
  daily_protein_goal integer not null default 150,
  daily_carbs_goal integer not null default 250,
  daily_fat_goal integer not null default 65,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Diary entries
create table if not exists diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  food_id text,
  quantity_g numeric(10,2) not null default 100,
  calories numeric(10,2) not null,
  protein_g numeric(10,2),
  carbs_g numeric(10,2),
  fat_g numeric(10,2),
  fiber_g numeric(10,2),
  created_at timestamptz not null default now()
);

alter table diary_entries enable row level security;

create policy "Users can manage own diary entries"
  on diary_entries for all using (auth.uid() = user_id);

create index on diary_entries (user_id, date);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
