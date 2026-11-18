'use client';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Budget, CATS, Guest, Item, bajuOf, budgetTotal, catName, norm, normGuest, paxOf, rp, sumOf } from '@/lib/utils';
import Icon from './Icon';
import Logo from './Logo';
import BirdLove from './BirdLove';
import ItemCard from './ItemCard';
import ItemSheet from './ItemSheet';
import BudgetSheet from './BudgetSheet';
import PrintReport, { type PrintMode } from './PrintReport';
import GuestsPanel from './GuestsPanel';
import GuestSheet from './GuestSheet';

type Props = { email: string; initialItems: Item[]; initialBudget: Budget; initialGuests: Guest[] };
type Toast = { msg: string; undo?: Item; undoG?: Guest } | null;

export default function Planner({ email, initialItems, initialBudget, initialGuests }: Props) {
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
  const [view, setView] = useState<'needs' | 'guests'>('needs');
  const [guests, setGuests] = useState(initialGuests);
  const [gFilter, setGFilter] = useState('all');
  const [gSheet, setGSheet] = useState<Guest | 'new' | null>(null);
  const [printMenu, setPrintMenu] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>('all');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function say(msg: string, undo?: Item, undoG?: Guest) {
    setToast({ msg, undo, undoG });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 4000);
  }

  async function toggle(it: Item) {
    const set = (done: boolean) => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, done } : x)));
    set(!it.done);
    const { error } = await sb.from('wedding_items').update({ done: !it.done }).eq('id', it.id);
    if (error) { set(it.done); return say('Gagal menyimpan: ' + error.message); }
    say(it.done ? `Pembelian dibatalkan, saldo kembali ${rp(it.price)}` : `Dibeli. Saldo berkurang ${rp(it.price)}`);
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
  async function toggleGiven(g: Guest) {
    const set = (given: boolean) => setGuests((l) => l.map((x) => (x.id === g.id ? { ...x, given } : x)));
    set(!g.given);
    const { error } = await sb.from('wedding_guests').update({ given: !g.given }).eq('id', g.id);
    if (error) { set(g.given); return say('Gagal menyimpan: ' + error.message); }
    say(g.given ? 'Status baju dibatalkan' : `Baju dresscode diberikan ke ${g.name}`);
  }
  async function removeGuest(g: Guest) {
    const { error } = await sb.from('wedding_guests').delete().eq('id', g.id);
    if (error) return say('Gagal menghapus: ' + error.message);
    setGuests((l) => l.filter((x) => x.id !== g.id));
    say('Tamu dihapus', undefined, g);
  }
  async function undoGuest(g: Guest) {
    setToast(null);
    const { data, error } = await sb.from('wedding_guests').insert(g).select().single();
    if (error) return say('Gagal mengembalikan: ' + error.message);
    setGuests((l) => [...l, normGuest(data)]);
  }
  async function logout() {
    await sb.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  const bt = budgetTotal(budget);
  const bought = items.filter((i) => i.done);
  const spent = sumOf(bought);
  const pending = sumOf(items.filter((i) => !i.done));
  const saldo = bt - spent;
  const pct = bt ? Math.min(100, (spent / bt) * 100) : 0;
  const key = q.trim().toLowerCase();
  const list = items
    .filter((i) => (filter === 'all' || i.cat === filter) &&
      (!key || [i.name, i.store, i.note, i.wa, i.link, catName(i.cat)].join(' ').toLowerCase().includes(key)))
    .sort((a, b) => Number(a.done) - Number(b.done) || a.prio - b.prio || a.created_at.localeCompare(b.created_at));
  const catBudget = filter !== 'all' ? Number(budget.cats[filter]) || 0 : 0;
  const catSpent = sumOf(items.filter((i) => i.cat === filter && i.done));

  return (
    <>
      <div className="print:hidden">
        <main className="mx-auto max-w-[560px] px-3.5 pb-[104px] pt-3.5">
          <header className="flex items-center gap-2">
            <Logo cls="hidden h-14 w-auto shrink-0 text-acc min-[400px]:block" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[clamp(30px,9vw,38px)] leading-[.95]">Wedding Planner</h1>
              <small className="block truncate text-xs font-semibold text-mute">{email}</small>
            </div>
            <button className={`ib ${searchOn ? 'ib-on' : ''}`} aria-label="Cari" onClick={() => { setSearchOn(!searchOn); setQ(''); }}><Icon name="search" /></button>
            {view === 'needs' && <button className="ib" aria-label="Atur budget" onClick={() => setBudgetOpen(true)}><Icon name="wallet" /></button>}
            <button className="ib" aria-label="Cetak laporan" onClick={() => (view === 'guests' ? setPrintMenu(true) : window.print())}><Icon name="print" /></button>
            <button className="ib" aria-label="Keluar" onClick={logout}><Icon name="logout" /></button>
          </header>

          <div className="mt-3 glass grid grid-cols-2 gap-1 rounded-full p-1" role="tablist">
            {([['needs', 'Kebutuhan', 'gift'], ['guests', 'Tamu', 'users']] as const).map(([k, n, ic]) => (
              <button key={k} role="tab" aria-selected={view === k} onClick={() => { setView(k); setQ(''); }}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-full text-sm font-bold ${view === k ? 'glass-dark' : 'text-mute'}`}>
                <Icon name={ic} cls="h-4 w-4" />{n}{k === 'guests' ? ` (${guests.length})` : ''}
              </button>
            ))}
          </div>

          {searchOn && <input autoFocus type="search" className="field mt-3" placeholder={view === 'needs' ? 'Cari barang, vendor, atau toko' : 'Cari nama tamu atau catatan'} value={q} onChange={(e) => setQ(e.target.value)} />}

          {view === 'guests' ? (
            <GuestsPanel guests={guests} q={q} filter={gFilter} setFilter={setGFilter} onGiven={toggleGiven} onEdit={setGSheet} onDelete={removeGuest} />
          ) : (<>
          <section className="glass-dark relative mt-3.5 overflow-hidden rounded-[26px] p-[18px]">
            <Icon name="heart" fill cls="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rotate-12 opacity-[.13]" />
            <div className="text-[13px] opacity-90">Saldo budget</div>
            <div className="font-serif text-[clamp(34px,10vw,44px)] leading-[1.05]">{bt ? rp(saldo) : 'Belum diatur'}</div>
            <div className="my-3 h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--on)_30%,transparent)]"><i className="block h-full rounded-full bg-on transition-[width]" style={{ width: pct + '%' }} /></div>
            <p className="text-[13px]">{bt ? `Terpakai ${rp(spent)} dari ${rp(bt)}${saldo < 0 ? ' (saldo minus)' : ''}` : 'Atur budget lewat menu dompet di atas.'}</p>
            <p className="text-[13px]">Dibeli {bought.length} dari {items.length} catatan. Belum dibeli {rp(pending)}{bt && pending > Math.max(saldo, 0) ? `, melebihi saldo ${rp(pending - Math.max(saldo, 0))}` : ''}</p>
          </section>

          <nav className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1.5 pt-3.5 [scrollbar-width:none]">
            <button className={`chip ${filter === 'all' ? 'chip-on' : ''}`} onClick={() => setFilter('all')}>Semua ({items.length})</button>
            {CATS.map((c) => (
              <button key={c.k} className={`chip ${filter === c.k ? 'chip-on' : ''}`} onClick={() => setFilter(c.k)}><Icon name={c.icon} cls="h-4 w-4" />{c.n} ({items.filter((i) => i.cat === c.k).length})</button>
            ))}
          </nav>

          {catBudget > 0 && (
            <div className="my-2 rounded-2xl bg-soft px-3.5 py-2.5 text-[13px]">
              <b>Budget {catName(filter)}</b>: terpakai {rp(catSpent)} dari {rp(catBudget)}, saldo {rp(catBudget - catSpent)}{catSpent > catBudget ? ' (lewat)' : ''}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><i className="block h-full bg-acc" style={{ width: Math.min(100, (catSpent / catBudget) * 100) + '%' }} /></div>
            </div>
          )}

          {list.length ? list.map((it) => (
            <ItemCard key={it.id} it={it} onToggle={() => toggle(it)} onEdit={() => setSheet(it)} onDelete={() => remove(it)} />
          )) : (
            <div className="px-2.5 py-11 text-center text-mute">
              <BirdLove cls="mx-auto -mb-1 w-52" />
              <h2 className="text-[30px] text-ink">{key ? 'Tidak ada hasil' : 'Belum ada catatan'}</h2>
              <p>{key ? 'Coba kata kunci lain.' : 'Tekan Tambah untuk mulai mencatat.'}</p>
            </div>
          )}
          </>)}
        </main>

        <button onClick={() => (view === 'needs' ? setSheet('new') : setGSheet('new'))}
          className="fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] right-[max(16px,calc(50%-264px))] z-10 flex min-h-[52px] items-center gap-2 glass-dark rounded-full px-[22px] text-base font-bold active:scale-95">
          <Icon name="plus" />Tambah
        </button>

        {sheet && (
          <ItemSheet item={sheet === 'new' ? null : sheet} defaultCat={filter !== 'all' ? filter : 'seserahan'} onClose={() => setSheet(null)}
            onSaved={(row, isNew) => { setItems((l) => (isNew ? [...l, row] : l.map((x) => (x.id === row.id ? row : x)))); setSheet(null); say(isNew ? 'Catatan disimpan' : 'Catatan diperbarui'); }} />
        )}
        {printMenu && (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-[rgba(40,22,12,.4)] backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setPrintMenu(false)}>
            <div className="w-full max-w-[560px] glass-sheet rounded-t-[28px] px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
              <h2 className="text-[32px]">Cetak daftar tamu</h2>
              <p className="mb-3 text-sm text-mute">Pilih dokumen yang mau dicetak.</p>
              {([
                ['dress', 'Penerima dresscode', `${guests.filter((g) => g.dresscode).length} undangan, ${bajuOf(guests.filter((g) => g.dresscode))} baju`],
                ['regular', 'Tamu biasa (tanpa dresscode)', `${guests.filter((g) => !g.dresscode).length} undangan, ${paxOf(guests.filter((g) => !g.dresscode))} orang`],
                ['all', 'Keduanya, halaman terpisah', 'Dresscode dulu, lalu tamu biasa'],
              ] as const).map(([m, n, sub]) => (
                <button key={m} className="mb-2 flex min-h-[58px] w-full flex-col items-start justify-center glass rounded-2xl px-4 text-left active:scale-[.99]"
                  onClick={() => { setPrintMode(m); setPrintMenu(false); setTimeout(() => window.print(), 150); }}>
                  <b>{n}</b><span className="text-[13px] text-mute">{sub}</span>
                </button>
              ))}
              <button className="btn btn-ghost mt-1" onClick={() => setPrintMenu(false)}>Batal</button>
            </div>
          </div>
        )}
        {gSheet && (
          <GuestSheet guest={gSheet === 'new' ? null : gSheet} defaultSide={gFilter === 'f' ? 'f' : 'i'} onClose={() => setGSheet(null)}
            onSaved={(row, isNew) => { setGuests((l) => (isNew ? [...l, row] : l.map((x) => (x.id === row.id ? row : x)))); setGSheet(null); say(isNew ? 'Tamu disimpan' : 'Tamu diperbarui'); }} />
        )}
        {budgetOpen && <BudgetSheet budget={budget} onClose={() => setBudgetOpen(false)} onSaved={(b) => { setBudget(b); setBudgetOpen(false); say('Budget disimpan'); }} />}

        {toast && (
          <div role="status" className="fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-1/2 z-30 max-w-[92vw] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-center text-[13px] font-bold text-bg">
            {toast.msg}
            {toast.undo && <button className="ml-2.5 min-h-8 font-bold text-acc2" onClick={() => undo(toast.undo!)}>Urungkan</button>}
            {toast.undoG && <button className="ml-2.5 min-h-8 font-bold text-acc2" onClick={() => undoGuest(toast.undoG!)}>Urungkan</button>}
          </div>
        )}
      </div>
      <PrintReport items={items} budget={budget} guests={guests} view={view} mode={printMode} />
    </>
  );
}
