-- Wedding I & F : jalankan di Supabase > SQL Editor

create table if not exists public.wedding_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cat text not null,
  price numeric default 0,
  wa text default '',
  link text default '',
  store text default '',
  note text default '',
  prio smallint default 2,
  done boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.wedding_budget (
  id int primary key default 1 check (id = 1),
  total numeric default 0,
  cats jsonb default '{}'::jsonb
);

insert into public.wedding_budget (id) values (1) on conflict do nothing;

alter table public.wedding_items  enable row level security;
alter table public.wedding_budget enable row level security;

-- Data dipakai bersama: semua akun yang sudah login (I dan F) bisa baca dan ubah.
create policy "auth all items"  on public.wedding_items  for all to authenticated using (true) with check (true);
create policy "auth all budget" on public.wedding_budget for all to authenticated using (true) with check (true);

-- Setelah 2 akun dibuat: Authentication > Providers > Email > matikan "Allow new users to sign up".
