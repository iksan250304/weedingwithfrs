'use client';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Budget, CATS, Item, budgetTotal, catName, norm, rp, sumOf } from '@/lib/utils';
import Icon from './Icon';
import ItemCard from './ItemCard';
import ItemSheet from './ItemSheet';
import BudgetSheet from './BudgetSheet';
import PrintReport from './PrintReport';

type Props = { email: string; initialItems: Item[]; initialBudget: Budget };
type Toast = { msg: string; undo?: Item } | null;

export default function Planner({ email, initialItems, initialBudget }: Props) {
  const router = useRouter();
  const sb = useMemo(() => createClient(), []);
  const [items, setItems] = useState(initialItems);
  const [budget, setBudget] = useState(initialBudget);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [searchOn, setSearchOn] = useState(false);
  const [sheet, setSheet] = useState<Item | 'new' | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function say(msg: string, undo?: Item) {
    setToast({ msg, undo });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4000);
  }

  async function toggle(it: Item) {
    const set = (done: boolean) => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, done } : x)));
    set(!it.done);
    const { error } = await sb.from('wedding_items').update({ done: !it.done }).eq('id', it.id);
    if (error) { set(it.done); say('Gagal menyimpan: ' + error.message); }
  }
  async function remove(it: Item) {
    const { error } = await sb.from('wedding_items').delete().eq('id', it.id);
    if (error) return say('Gagal menghapus: ' + error.message);
    setItems((l) => l.filter((x) => x.id !== it.id));
    say('Catatan dihapus', it);
  }
  async function undo(it: Item) {
    setToast(null);
    const { data, error } = await sb.from('wedding_items').insert(it).select().single();
    if (error) return say('Gagal mengembalikan: ' + error.message);
    setItems((l) => [...l, norm(data)]);
  }
  async function logout() {
    await sb.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  const bt = budgetTotal(budget);
  const planned = sumOf(items);
  const pct = bt ? Math.min(100, (planned / bt) * 100) : 0;
  const key = q.trim().toLowerCase();
  const list = items
    .filter((i) => (filter === 'all' || i.cat === filter) &&
      (!key || [i.name, i.store, i.note, i.wa, i.link, catName(i.cat)].join(' ').toLowerCase().includes(key)))
    .sort((a, b) => Number(a.done) - Number(b.done) || a.prio - b.prio || a.created_at.localeCompare(b.created_at));
  const catBudget = filter !== 'all' ? Number(budget.cats[filter]) || 0 : 0;
  const catSpent = sumOf(items.filter((i) => i.cat === filter));

  return (
    <>
      <div className="print:hidden">
        <main className="mx-auto max-w-[560px] px-3.5 pb-[104px] pt-3.5">
          <header className="flex items-center gap-2">
            <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-acc text-on min-[400px]:grid"><Icon name="rings" cls="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(26px,8vw,34px)] leading-[1.05]">Wedding I &amp; F</h1>
              <small className="block truncate text-xs font-semibold text-mute">{email}</small>
            </div>
            <button className={`ib ${searchOn ? '!border-acc !bg-acc !text-on' : ''}`} aria-label="Cari" onClick={() => { setSearchOn(!searchOn); setQ(''); }}><Icon name="search" /></button>
            <button className="ib" aria-label="Atur budget" onClick={() => setBudgetOpen(true)}><Icon name="wallet" /></button>
            <button className="ib" aria-label="Cetak laporan" onClick={() => window.print()}><Icon name="print" /></button>
            <button className="ib" aria-label="Keluar" onClick={logout}><Icon name="logout" /></button>
          </header>

          {searchOn && <input autoFocus type="search" className="field mt-3" placeholder="Cari barang, vendor, atau toko" value={q} onChange={(e) => setQ(e.target.value)} />}

          <section className="relative mt-3.5 overflow-hidden rounded-[26px] bg-acc p-[18px] text-on">
            <Icon name="heart" fill cls="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rotate-12 opacity-[.13]" />
            <div className="text-[13px] opacity-90">Rencana pengeluaran</div>
            <div className="font-serif text-[clamp(28px,9vw,36px)] font-bold leading-[1.1]">{rp(planned)}</div>
            <div className="my-3 h-3 overflow-hidden rounded-full bg-on/30"><i className="block h-full rounded-full bg-on transition-[width]" style={{ width: pct + '%' }} /></div>
            <p className="text-[13px]">{bt ? (bt - planned >= 0 ? `Sisa budget ${rp(bt - planned)} dari ${rp(bt)}` : `Lewat budget ${rp(planned - bt)} dari ${rp(bt)}`) : 'Budget belum diatur. Buka menu dompet di atas.'}</p>
            <p className="text-[13px]">Selesai {items.filter((i) => i.done).length} dari {items.length} catatan, dibayar {rp(sumOf(items.filter((i) => i.done)))}</p>
          </section>

          <nav className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1.5 pt-3.5 [scrollbar-width:none]">
            <button className={`chip ${filter === 'all' ? 'chip-on' : ''}`} onClick={() => setFilter('all')}>Semua ({items.length})</button>
            {CATS.map((c) => (
              <button key={c.k} className={`chip ${filter === c.k ? 'chip-on' : ''}`} onClick={() => setFilter(c.k)}><Icon name={c.icon} cls="h-4 w-4" />{c.n} ({items.filter((i) => i.cat === c.k).length})</button>
            ))}
          </nav>

          {catBudget > 0 && (
            <div className="my-2 rounded-2xl bg-soft px-3.5 py-2.5 text-[13px]">
              <b>Budget {catName(filter)}</b>: {rp(catSpent)} dari {rp(catBudget)}{catSpent > catBudget ? ' (lewat)' : ''}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><i className="block h-full bg-acc" style={{ width: Math.min(100, (catSpent / catBudget) * 100) + '%' }} /></div>
            </div>
          )}

          {list.length ? list.map((it) => (
            <ItemCard key={it.id} it={it} onToggle={() => toggle(it)} onEdit={() => setSheet(it)} onDelete={() => remove(it)} />
          )) : (
            <div className="px-2.5 py-11 text-center text-mute">
              <Icon name="letter" cls="mx-auto mb-2 h-14 w-14 text-acc2" />
              <h2 className="text-[26px] text-ink">{key ? 'Tidak ada hasil' : 'Belum ada catatan'}</h2>
              <p>{key ? 'Coba kata kunci lain.' : 'Tekan Tambah untuk mulai mencatat.'}</p>
            </div>
          )}
        </main>

        <button onClick={() => setSheet('new')}
          className="fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] right-[max(16px,calc(50%-264px))] z-10 flex min-h-[52px] items-center gap-2 rounded-full bg-acc px-[22px] text-base font-bold text-on shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]">
          <Icon name="plus" />Tambah
        </button>

        {sheet && (
          <ItemSheet item={sheet === 'new' ? null : sheet} defaultCat={filter !== 'all' ? filter : 'seserahan'} onClose={() => setSheet(null)}
            onSaved={(row, isNew) => { setItems((l) => (isNew ? [...l, row] : l.map((x) => (x.id === row.id ? row : x)))); setSheet(null); say(isNew ? 'Catatan disimpan' : 'Catatan diperbarui'); }} />
        )}
        {budgetOpen && <BudgetSheet budget={budget} onClose={() => setBudgetOpen(false)} onSaved={(b) => { setBudget(b); setBudgetOpen(false); say('Budget disimpan'); }} />}

        {toast && (
          <div role="status" className="fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-1/2 z-30 max-w-[92vw] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-center text-[13px] font-bold text-bg">
            {toast.msg}
            {toast.undo && <button className="ml-2.5 min-h-8 font-bold text-acc2" onClick={() => undo(toast.undo!)}>Urungkan</button>}
          </div>
        )}
      </div>
      <PrintReport items={items} budget={budget} />
    </>
  );
}
