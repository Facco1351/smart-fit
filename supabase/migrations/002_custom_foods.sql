create table if not exists custom_foods (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  brand text,
  calories_per_100g numeric(10,2) not null,
  carbs_per_100g numeric(10,2) not null default 0,
  protein_per_100g numeric(10,2) not null default 0,
  fat_per_100g numeric(10,2) not null default 0,
  fiber_per_100g numeric(10,2) not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table custom_foods enable row level security;

create policy "Read public or own custom foods"
  on custom_foods for select
  using (is_public = true or auth.uid() = created_by);

create policy "Create custom foods"
  on custom_foods for insert
  with check (auth.uid() = created_by);

create policy "Update own custom foods"
  on custom_foods for update
  using (auth.uid() = created_by);

create policy "Delete own custom foods"
  on custom_foods for delete
  using (auth.uid() = created_by);

create index on custom_foods (name);
create index on custom_foods (created_by);
