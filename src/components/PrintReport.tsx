import { Budget, CATS, GROUPS, Guest, Item, PRIO, SIDES, bajuOf, batikOf, budgetTotal, dressText, groupName, kebayaOf, paxOf, rp, sideName, sumOf } from '@/lib/utils';

const th = 'border border-neutral-400 bg-[#DDD9CE] px-2 py-1 text-left';
const td = 'break-words border border-neutral-400 px-2 py-1 align-top';

export default function PrintReport({ items, budget, guests, view, mode }: { items: Item[]; budget: Budget; guests: Guest[]; view: 'needs' | 'guests'; mode: PrintMode }) {
  if (view === 'guests') return <GuestPrint guests={guests} mode={mode} />;
  const bt = budgetTotal(budget);
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section className="hidden bg-white p-0 font-sans text-xs text-black print:block">
      <h1 className="text-2xl">Laporan Kebutuhan Pernikahan: Wedding Planner</h1>
      <p className="mb-2">Dicetak {today}</p>
      <table className="w-full border-collapse"><tbody>
        <tr><th className={th}>Total budget</th><th className={th}>Sudah dibeli (terpakai)</th><th className={th}>Belum dibeli (rencana)</th><th className={th}>Saldo</th></tr>
        <tr><td className={td}>{rp(bt)}</td><td className={td}>{rp(sumOf(items.filter((i) => i.done)))}</td><td className={td}>{rp(sumOf(items.filter((i) => !i.done)))}</td><td className={td}>{rp(bt - sumOf(items.filter((i) => i.done)))}</td></tr>
      </tbody></table>
      {CATS.map((c) => {
        const l = items.filter((i) => i.cat === c.k).sort((a, b) => a.prio - b.prio);
        if (!l.length) return null;
        return (
          <div key={c.k} className="break-inside-avoid">
            <h2 className="mb-1.5 mt-5 border-b border-[#3C2415] pb-0.5 text-[17px] text-[#3C2415]">{c.n}{budget.cats[c.k] ? ` (budget ${rp(budget.cats[c.k])})` : ''}</h2>
            <table className="w-full border-collapse"><tbody>
              <tr>{['Barang', 'Prioritas', 'Harga', 'Link atau toko', 'WA vendor', 'Status'].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
              {l.map((i) => (
                <tr key={i.id}>
                  <td className={td}>{i.name}{i.note && <><br /><i>{i.note}</i></>}</td>
                  <td className={td}>{PRIO[i.prio]}</td><td className={td}>{rp(i.price)}</td>
                  <td className={td}>{i.link || i.store || '-'}</td><td className={td}>{i.wa || '-'}</td><td className={td}>{i.done ? 'Dibeli' : 'Belum dibeli'}</td>
                </tr>
              ))}
              <tr className="font-bold"><td className={td} colSpan={2}>Subtotal</td><td className={td} colSpan={4}>{rp(sumOf(l))}</td></tr>
            </tbody></table>
          </div>
        );
      })}
      {!items.length && <p>Belum ada catatan.</p>}
    </section>
  );
}

export type PrintMode = 'dress' | 'regular' | 'all';
const sideTitle = 'mb-1.5 mt-5 border-b border-[#3C2415] pb-0.5 text-[17px] text-[#3C2415]';
const byName = (a: Guest, b: Guest) => a.name.localeCompare(b.name);
const byGroup = (a: Guest, b: Guest) => GROUPS.findIndex((x) => x.k === a.grp) - GROUPS.findIndex((x) => x.k === b.grp) || byName(a, b);
const head = (cols: string[]) => <tr>{cols.map((h) => <th key={h} className={th}>{h}</th>)}</tr>;
const today = () => new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function GuestPrint({ guests, mode }: { guests: Guest[]; mode: PrintMode }) {
  return (
    <section className="hidden bg-white p-0 font-sans text-xs text-black print:block">
      {mode !== 'regular' && <DressDoc list={guests.filter((g) => g.dresscode)} />}
      {mode === 'all' && <div className="break-before-page" />}
      {mode !== 'dress' && <RegularDoc list={guests.filter((g) => !g.dresscode)} />}
    </section>
  );
}

function DressDoc({ list }: { list: Guest[] }) {
  const given = list.filter((g) => g.given);
  const showPhone = list.some((g) => g.phone);
  return (
    <div>
      <h1 className="text-2xl">Daftar Penerima Baju Dresscode: Wedding Planner</h1>
      <p className="mb-2">Dicetak {today()}</p>
      <table className="w-full border-collapse"><tbody>
        {head(['Total baju', 'Batik', 'Kebaya', 'Sudah diberikan', 'Belum diberikan'])}
        <tr>
          <td className={td}>{bajuOf(list)}</td><td className={td}>{batikOf(list)}</td><td className={td}>{kebayaOf(list)}</td>
          <td className={td}>{bajuOf(given)}</td><td className={td}>{bajuOf(list) - bajuOf(given)}</td>
        </tr>
      </tbody></table>
      {SIDES.map((s) => {
        const l = list.filter((g) => g.side === s.k).sort(byName);
        if (!l.length) return null;
        return (
          <div key={s.k}>
            <h2 className={sideTitle}>{s.n} ({bajuOf(l)} baju, {l.length} undangan)</h2>
            <table className="w-full border-collapse"><tbody>
              {head(['No', 'Nama', 'Kelompok', 'Batik', 'Ukuran batik', 'Kebaya', 'Ukuran kebaya', ...(showPhone ? ['Kontak'] : []), 'Status'])}
              {l.map((g, n) => (
                <tr key={g.id} className="break-inside-avoid">
                  <td className={td}>{n + 1}</td><td className={td}>{g.name}</td><td className={td}>{groupName(g.grp)}</td>
                  <td className={td}>{g.batik}</td><td className={td}>{g.size_batik || '-'}</td>
                  <td className={td}>{g.kebaya}</td><td className={td}>{g.size_kebaya || '-'}</td>
                  {showPhone && <td className={td}>{g.phone || '-'}</td>}<td className={td}>{g.given ? 'Sudah diberikan' : 'Belum diberikan'}</td>
                </tr>
              ))}
              <tr className="font-bold"><td className={td} colSpan={3}>Total {s.n}</td><td className={td}>{batikOf(l)}</td><td className={td} /><td className={td}>{kebayaOf(l)}</td><td className={td} colSpan={showPhone ? 3 : 2} /></tr>
            </tbody></table>
          </div>
        );
      })}
      {!list.length && <p className="mt-4">Belum ada penerima dresscode.</p>}
    </div>
  );
}

function RegularDoc({ list }: { list: Guest[] }) {
  const showPhone = list.some((g) => g.phone);
  return (
    <div>
      <h1 className="text-2xl">Daftar Tamu Undangan (Tanpa Dresscode): Wedding Planner</h1>
      <p className="mb-2">Dicetak {today()}</p>
      <table className="w-full border-collapse"><tbody>
        {head(['Total tamu', ...SIDES.map((s) => s.n)])}
        <tr>
          <td className={td}>{paxOf(list)} orang ({list.length} undangan)</td>
          {SIDES.map((s) => { const l = list.filter((g) => g.side === s.k); return <td key={s.k} className={td}>{paxOf(l)} orang ({l.length} undangan)</td>; })}
        </tr>
      </tbody></table>
      {SIDES.map((s) => {
        const l = list.filter((g) => g.side === s.k).sort(byGroup);
        if (!l.length) return null;
        return (
          <div key={s.k}>
            <h2 className={sideTitle}>{s.n} ({paxOf(l)} orang, {l.length} undangan)</h2>
            <table className="w-full border-collapse"><tbody>
              {head(['No', 'Nama', 'Kelompok', 'Orang', ...(showPhone ? ['Kontak'] : []), 'Catatan'])}
              {l.map((g, n) => (
                <tr key={g.id} className="break-inside-avoid">
                  <td className={td}>{n + 1}</td><td className={td}>{g.name}</td><td className={td}>{groupName(g.grp)}</td>
                  <td className={td}>{g.pax}</td>{showPhone && <td className={td}>{g.phone || '-'}</td>}<td className={td}>{g.note || '-'}</td>
                </tr>
              ))}
              <tr className="font-bold"><td className={td} colSpan={3}>Total {s.n}</td><td className={td}>{paxOf(l)}</td><td className={td} colSpan={showPhone ? 2 : 1} /></tr>
            </tbody></table>
          </div>
        );
      })}
      {!list.length && <p className="mt-4">Belum ada tamu biasa.</p>}
    </div>
  );
}
