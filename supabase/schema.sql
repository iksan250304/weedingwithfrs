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

-- Tamu undangan (setup baru)
create table if not exists public.wedding_guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  side text not null check (side in ('i','f')),
  grp text not null default 'lainnya',
  pax int not null default 1 check (pax >= 1),
  phone text default '',
  dresscode boolean default false,
  batik int not null default 0,
  kebaya int not null default 0,
  size_batik text default '',
  size_kebaya text default '',
  given boolean default false,
  note text default '',
  created_at timestamptz default now()
);
alter table public.wedding_guests enable row level security;
create policy "auth all guests" on public.wedding_guests for all to authenticated using (true) with check (true);
