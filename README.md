# Wedding I & F

Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Auth + Postgres + RLS).

1. Supabase: jalankan `supabase/schema.sql` di SQL Editor.
2. `cp .env.example .env.local`, isi URL dan anon key.
3. `npm install && npm run dev` (buka http://localhost:3000).
4. Daftar akun I dan F di /login, lalu matikan sign-up: Authentication > Providers > Email > Allow new users to sign up.
5. Deploy: push ke GitHub, import ke Vercel, isi dua env var yang sama.
