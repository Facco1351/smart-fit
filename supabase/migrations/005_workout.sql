create table if not exists exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  muscle_group text not null,
  created_at timestamptz not null default now()
);

create table if not exists workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists workout_plan_exercises (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references workout_plans(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete restrict not null,
  sets integer not null default 3,
  reps integer not null default 10,
  weight_kg numeric(6,2),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique(plan_id, exercise_id)
);

create table if not exists exercise_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  weight_kg numeric(6,2) not null,
  sets integer,
  reps integer,
  logged_at date not null,
  created_at timestamptz not null default now(),
  unique(user_id, exercise_id, logged_at)
);

alter table exercises enable row level security;
alter table workout_plans enable row level security;
alter table workout_plan_exercises enable row level security;
alter table exercise_logs enable row level security;

create policy "Exercises readable by authenticated"
  on exercises for select using (auth.uid() is not null);

create policy "Users manage own workout plans"
  on workout_plans for all using (auth.uid() = user_id);

create policy "Users manage own plan exercises"
  on workout_plan_exercises for all
  using (exists (
    select 1 from workout_plans
    where id = workout_plan_exercises.plan_id and user_id = auth.uid()
  ));

create policy "Users manage own exercise logs"
  on exercise_logs for all using (auth.uid() = user_id);

create index on workout_plans (user_id, created_at);
create index on workout_plan_exercises (plan_id, position);
create index on exercise_logs (user_id, exercise_id, logged_at);

insert into exercises (name, muscle_group) values
  ('Panca Piana', 'Petto'),
  ('Panca Inclinata', 'Petto'),
  ('Panca Declinata', 'Petto'),
  ('Croci ai Cavi', 'Petto'),
  ('Dip (Parallele)', 'Petto'),
  ('Push-up', 'Petto'),
  ('Lat Machine Presa Larga', 'Schiena'),
  ('Rematore con Bilanciere', 'Schiena'),
  ('Rematore con Manubri', 'Schiena'),
  ('Stacco da Terra', 'Schiena'),
  ('Trazioni (Pull-up)', 'Schiena'),
  ('Pulley Basso', 'Schiena'),
  ('T-Bar Row', 'Schiena'),
  ('Lento Avanti con Bilanciere', 'Spalle'),
  ('Lento Avanti con Manubri', 'Spalle'),
  ('Alzate Laterali', 'Spalle'),
  ('Alzate Frontali', 'Spalle'),
  ('Arnold Press', 'Spalle'),
  ('Alzate Posteriori', 'Spalle'),
  ('Upright Row', 'Spalle'),
  ('Curl con Bilanciere', 'Braccia'),
  ('Curl con Manubri', 'Braccia'),
  ('Curl a Martello', 'Braccia'),
  ('French Press', 'Braccia'),
  ('Push-down al Cavo', 'Braccia'),
  ('Dip per Tricipiti', 'Braccia'),
  ('Preacher Curl', 'Braccia'),
  ('Squat', 'Gambe'),
  ('Leg Press', 'Gambe'),
  ('Affondi', 'Gambe'),
  ('Leg Curl (Femorali)', 'Gambe'),
  ('Leg Extension (Quadricipiti)', 'Gambe'),
  ('Calf Raise (Polpacci)', 'Gambe'),
  ('Hack Squat', 'Gambe'),
  ('Stacco Rumeno', 'Gambe'),
  ('Plank', 'Core'),
  ('Crunch', 'Core'),
  ('Russian Twist', 'Core'),
  ('Leg Raise', 'Core'),
  ('Ab Wheel', 'Core'),
  ('Crunch alla Macchina', 'Core'),
  ('Tapis Roulant', 'Cardio'),
  ('Cyclette', 'Cardio'),
  ('Ellittica', 'Cardio'),
  ('Vogatore', 'Cardio'),
  ('Salto con la Corda', 'Cardio')
on conflict do nothing;
