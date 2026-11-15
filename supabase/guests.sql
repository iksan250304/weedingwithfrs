-- Tabel tamu undangan. Jalankan di Supabase > SQL Editor (khusus jika schema.sql sudah pernah dijalankan).
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
