create table if not exists weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  weight_kg numeric(5,2) not null,
  logged_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, logged_at)
);

alter table weight_logs enable row level security;

create policy "Users manage own weight logs"
  on weight_logs for all
  using (auth.uid() = user_id);

create index on weight_logs (user_id, logged_at desc);
