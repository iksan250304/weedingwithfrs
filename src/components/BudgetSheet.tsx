'use client';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Budget, CATS } from '@/lib/utils';

type Props = { budget: Budget; onClose: () => void; onSaved: (b: Budget) => void };

export default function BudgetSheet({ budget, onClose, onSaved }: Props) {
  const sb = useMemo(() => createClient(), []);
  const [total, setTotal] = useState(budget.total ? String(budget.total) : '');
  const [cats, setCats] = useState<Record<string, string>>(
    Object.fromEntries(CATS.map((c) => [c.k, budget.cats[c.k] ? String(budget.cats[c.k]) : ''])),
  );
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const next: Budget = { total: Number(total) || 0, cats: Object.fromEntries(CATS.map((c) => [c.k, Number(cats[c.k]) || 0])) };
    const { error } = await sb.from('wedding_budget').upsert({ id: 1, ...next });
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved(next);
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto overscroll-contain rounded-t-[28px] bg-bg px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <h2 className="text-[28px]">Atur budget</h2>
        <label className="lbl" htmlFor="bt">Total budget pernikahan (Rp)</label>
        <input id="bt" className="field" type="number" inputMode="numeric" min={0} placeholder="0" value={total} onChange={(e) => setTotal(e.target.value)} />
        {CATS.map((c) => (
          <div key={c.k}>
            <label className="lbl" htmlFor={'b' + c.k}>{c.n} (Rp)</label>
            <input id={'b' + c.k} className="field" type="number" inputMode="numeric" min={0} placeholder="0" value={cats[c.k]} onChange={(e) => setCats({ ...cats, [c.k]: e.target.value })} />
          </div>
        ))}
        <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{err}</p>
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <span className="flex-1" />
          <button className="btn" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan budget'}</button>
        </div>
      </form>
    </div>
  );
}
