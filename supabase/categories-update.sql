-- Opsional (aplikasi sudah menggabungkan 'cincin' ke 'mahar' secara otomatis saat dibaca).
-- Jalankan ini kalau mau data di database ikut dirapikan.
update public.wedding_items set cat = 'mahar' where cat = 'cincin';

update public.wedding_budget
   set cats = (cats - 'cincin') || jsonb_build_object(
         'mahar', coalesce((cats->>'mahar')::numeric, 0) + coalesce((cats->>'cincin')::numeric, 0))
 where id = 1 and cats ? 'cincin';
