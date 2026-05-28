create policy "Authenticated users can insert exercises"
  on exercises for insert
  with check (auth.uid() is not null);
