-- Jalankan HANYA jika tabel wedding_guests sudah dibuat dari guests.sql versi sebelumnya.
alter table public.wedding_guests
  add column if not exists batik int not null default 0,
  add column if not exists kebaya int not null default 0,
  add column if not exists size_batik text default '',
  add column if not exists size_kebaya text default '';

-- Data lama: semua penerima dresscode dianggap batik, ukuran lama dipindah ke size_batik.
update public.wedding_guests
   set batik = pax, size_batik = coalesce(size, '')
 where dresscode and batik = 0 and kebaya = 0;
