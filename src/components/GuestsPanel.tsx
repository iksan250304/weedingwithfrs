import Icon from './Icon';
import { Guest, SIDES, bajuOf, batikOf, dressText, groupName, kebayaOf, paxOf, sideName, toWa } from '@/lib/utils';

type Props = {
  guests: Guest[]; q: string; filter: string; setFilter: (f: string) => void;
  onGiven: (g: Guest) => void; onEdit: (g: Guest) => void; onDelete: (g: Guest) => void;
};

export default function GuestsPanel({ guests, q, filter, setFilter, onGiven, onEdit, onDelete }: Props) {
  const dress = guests.filter((g) => g.dresscode);
  const given = dress.filter((g) => g.given);
  const key = q.trim().toLowerCase();
  const list = guests
    .filter((g) => (filter === 'all' || (filter === 'dress' ? g.dresscode : g.side === filter)) &&
      (!key || [g.name, g.note, g.phone, g.size_batik, g.size_kebaya, groupName(g.grp)].join(' ').toLowerCase().includes(key)))
    .sort((a, b) => a.side.localeCompare(b.side) || a.name.localeCompare(b.name));
  const chips = [
    { k: 'all', n: 'Semua', c: guests.length },
    ...SIDES.map((s) => ({ k: s.k, n: s.n, c: guests.filter((g) => g.side === s.k).length })),
    { k: 'dress', n: 'Dresscode', c: dress.length },
  ];

  return (
    <>
      <section className="glass-dark relative mt-3.5 overflow-hidden rounded-[26px] p-[18px]">
        <Icon name="users" cls="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rotate-12 opacity-[.13]" />
        <div className="text-[13px] opacity-90">Total tamu</div>
        <div className="font-serif text-[clamp(34px,10vw,44px)] leading-[1.05]">{paxOf(guests)} orang</div>
        <p className="mt-2 text-[13px]">{SIDES.map((s) => { const l = guests.filter((g) => g.side === s.k); return `${s.n}: ${paxOf(l)} orang (${l.length} undangan)`; }).join(' · ')}</p>
        <p className="text-[13px]">Dresscode: {bajuOf(dress)} baju (Batik {batikOf(dress)} · Kebaya {kebayaOf(dress)})</p>
        <p className="text-[13px]">Sudah diberikan {bajuOf(given)}, belum {bajuOf(dress) - bajuOf(given)}</p>
      </section>

      <nav className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1.5 pt-3.5 [scrollbar-width:none]">
        {chips.map((c) => (
          <button key={c.k} className={`chip ${filter === c.k ? 'chip-on' : ''}`} onClick={() => setFilter(c.k)}>
            {c.k === 'dress' && <Icon name="shirt" cls="h-4 w-4" />}{c.n} ({c.c})
          </button>
        ))}
      </nav>

      {list.length ? list.map((g) => (
        <div key={g.id} className="card">
          <div className="flex items-center gap-3">
            {g.dresscode ? (
              <button aria-label="Tandai baju sudah diberikan" aria-pressed={g.given} onClick={() => onGiven(g)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-[2.5px] p-0 ${g.given ? 'border-lo bg-lo text-on' : 'border-dashed border-acc text-acc2'}`}>
                <Icon name={g.given ? 'check' : 'shirt'} />
              </button>
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft text-mute"><Icon name="users" /></span>
            )}
            <div className="min-w-0 flex-1">
              <b className="break-words text-base">{g.name}</b>
              <div className="text-[13px] text-mute">
                {groupName(g.grp)} · {g.pax} orang
                <span className={`ml-1 rounded-full px-2 py-px text-[11px] font-bold ${g.side === 'i' ? 'bg-acc text-on' : 'border border-acc text-acc'}`}>{sideName(g.side)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {g.dresscode && (
              <span className="inline-flex min-h-[42px] max-w-full items-center gap-1.5 rounded-2xl bg-soft px-3 py-1.5 text-xs font-bold text-mute">
                <Icon name="shirt" cls="h-4 w-4" />{dressText(g)} · {g.given ? 'sudah diberikan' : 'belum diberikan'}
              </span>
            )}
            {g.phone && <a className="btn btn-wa" href={`https://wa.me/${toWa(g.phone)}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Chat</a>}
            <span className="flex-1" />
            <button className="mini" aria-label="Ubah" onClick={() => onEdit(g)}><Icon name="edit" /></button>
            <button className="mini" aria-label="Hapus" onClick={() => onDelete(g)}><Icon name="trash" /></button>
          </div>
          {g.note && <p className="mt-2.5 break-words rounded-xl bg-soft px-3 py-2 text-[13px] text-mute">{g.note}</p>}
        </div>
      )) : (
        <div className="px-2.5 py-11 text-center text-mute">
          <Icon name="users" cls="mx-auto mb-2 h-14 w-14 text-acc2" />
          <h2 className="text-[30px] text-ink">{key || filter !== 'all' ? 'Tidak ada hasil' : 'Belum ada tamu'}</h2>
          <p>{key || filter !== 'all' ? 'Coba filter atau kata kunci lain.' : 'Tekan Tambah untuk mencatat tamu pertama.'}</p>
        </div>
      )}
    </>
  );
}
