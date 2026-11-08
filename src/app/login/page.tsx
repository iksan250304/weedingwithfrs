'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const sb = createClient();
    const { data, error } = mode === 'in'
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (data.session) { router.replace('/'); router.refresh(); }
    else setMsg('Akun dibuat. Cek email untuk konfirmasi, lalu masuk.');
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-[400px] rounded-[28px] border-2 border-line bg-card p-6 shadow-[0_5px_0_var(--line)]">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-acc text-on"><Icon name="rings" cls="h-8 w-8" /></span>
        <h1 className="text-center text-4xl leading-none">Wedding I &amp; F</h1>
        <p className="mb-2 mt-2 text-center text-sm text-mute">{mode === 'in' ? 'Masuk untuk membuka catatan pernikahan' : 'Buat akun baru'}</p>
        <label className="lbl" htmlFor="email">Email</label>
        <input id="email" className="field" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="lbl" htmlFor="pw">Kata sandi</label>
        <input id="pw" className="field" type="password" minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{msg}</p>
        <button className="btn mt-2 min-h-[48px] w-full text-[15px]" disabled={busy}>{mode === 'in' ? 'Masuk' : 'Daftar'}</button>
        <button type="button" className="mx-auto mt-3 block min-h-[40px] text-sm font-bold text-acc" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); }}>
          {mode === 'in' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
        </button>
      </form>
    </main>
  );
}
