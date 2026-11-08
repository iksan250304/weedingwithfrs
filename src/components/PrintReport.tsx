import { Budget, CATS, Item, PRIO, budgetTotal, rp, sumOf } from '@/lib/utils';

const th = 'border border-neutral-400 bg-[#f0e2cc] px-2 py-1 text-left';
const td = 'break-words border border-neutral-400 px-2 py-1 align-top';

export default function PrintReport({ items, budget }: { items: Item[]; budget: Budget }) {
  const bt = budgetTotal(budget);
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <section className="hidden bg-white p-0 font-serif text-xs text-black print:block">
      <h1 className="text-2xl">Laporan Kebutuhan Pernikahan: Wedding I &amp; F</h1>
      <p className="mb-2">Dicetak {today}</p>
      <table className="w-full border-collapse"><tbody>
        <tr><th className={th}>Total budget</th><th className={th}>Rencana pengeluaran</th><th className={th}>Sudah dibayar</th><th className={th}>Sisa budget</th></tr>
        <tr><td className={td}>{rp(bt)}</td><td className={td}>{rp(sumOf(items))}</td><td className={td}>{rp(sumOf(items.filter((i) => i.done)))}</td><td className={td}>{rp(bt - sumOf(items))}</td></tr>
      </tbody></table>
      {CATS.map((c) => {
        const l = items.filter((i) => i.cat === c.k).sort((a, b) => a.prio - b.prio);
        if (!l.length) return null;
        return (
          <div key={c.k} className="break-inside-avoid">
            <h2 className="mb-1.5 mt-5 border-b border-[#8b5a3c] pb-0.5 text-[17px] text-[#5a3a24]">{c.n}{budget.cats[c.k] ? ` (budget ${rp(budget.cats[c.k])})` : ''}</h2>
            <table className="w-full border-collapse"><tbody>
              <tr>{['Barang', 'Prioritas', 'Harga', 'Link atau toko', 'WA vendor', 'Status'].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
              {l.map((i) => (
                <tr key={i.id}>
                  <td className={td}>{i.name}{i.note && <><br /><i>{i.note}</i></>}</td>
                  <td className={td}>{PRIO[i.prio]}</td><td className={td}>{rp(i.price)}</td>
                  <td className={td}>{i.link || i.store || '-'}</td><td className={td}>{i.wa || '-'}</td><td className={td}>{i.done ? 'Selesai' : 'Belum'}</td>
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
