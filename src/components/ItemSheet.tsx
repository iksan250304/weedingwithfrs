'use client';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CATS, Item, PRIO, norm } from '@/lib/utils';

type Props = { item: Item | null; defaultCat: string; onClose: () => void; onSaved: (i: Item, isNew: boolean) => void };

export default function ItemSheet({ item, defaultCat, onClose, onSaved }: Props) {
  const sb = useMemo(() => createClient(), []);
  const [f, setF] = useState({
    name: item?.name ?? '', cat: item?.cat ?? defaultCat, price: item?.price ? String(item.price) : '',
    wa: item?.wa ?? '', link: item?.link ?? '', store: item?.store ?? '', note: item?.note ?? '', prio: item?.prio ?? 2,
  });
  const [hasLink, setHasLink] = useState(item ? Boolean(item.link) || !item.store : true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: string, v: string | number) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const row = {
      name: f.name.trim(), cat: f.cat, price: Number(f.price) || 0, wa: f.wa.trim(),
      link: hasLink ? f.link.trim() : '', store: hasLink ? '' : f.store.trim(), note: f.note.trim(), prio: f.prio,
    };
    const { data, error } = item
      ? await sb.from('wedding_items').update(row).eq('id', item.id).select().single()
      : await sb.from('wedding_items').insert({ ...row, done: false }).select().single();
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved(norm(data), !item);
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto overscroll-contain rounded-t-[28px] bg-bg px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <h2 className="text-[28px]">{item ? 'Ubah catatan' : 'Catatan baru'}</h2>
        <label className="lbl" htmlFor="n">Nama barang atau urusan</label>
        <input id="n" className="field" required placeholder="Contoh: Mukena set bordir" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <label className="lbl" htmlFor="c">Kategori</label>
        <select id="c" className="field" value={f.cat} onChange={(e) => set('cat', e.target.value)}>
          {CATS.map((c) => <option key={c.k} value={c.k}>{c.n}</option>)}
        </select>
        <div className="grid gap-x-2.5 min-[381px]:grid-cols-2">
          <div><label className="lbl" htmlFor="p">Perkiraan harga (Rp)</label>
            <input id="p" className="field" type="number" inputMode="numeric" min={0} placeholder="0" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
          <div><label className="lbl" htmlFor="w">No. WA vendor</label>
            <input id="w" className="field" type="tel" inputMode="tel" placeholder="08123456789" value={f.wa} onChange={(e) => set('wa', e.target.value)} /></div>
        </div>
        <span className="lbl">Prioritas</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((p) => (
            <button type="button" key={p} onClick={() => set('prio', p)}
              className={`min-h-[46px] flex-1 rounded-2xl border-2 text-[13px] font-bold ${f.prio === p ? 'border-acc bg-acc text-on' : 'border-line bg-card text-ink'}`}>{PRIO[p]}</button>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm font-bold">
          <input type="checkbox" className="h-6 w-6 accent-[var(--acc)]" checked={hasLink} onChange={(e) => setHasLink(e.target.checked)} />
          Ada link toko online
        </label>
        {hasLink ? (
          <><label className="lbl" htmlFor="l">Link pembelian</label>
            <input id="l" className="field" type="url" inputMode="url" placeholder="https://shopee.co.id/..." value={f.link} onChange={(e) => set('link', e.target.value)} /></>
        ) : (
          <><label className="lbl" htmlFor="s">Nama atau alamat toko (tanpa link)</label>
            <input id="s" className="field" placeholder="Contoh: Toko Mas Barokah, Pasar Baru" value={f.store} onChange={(e) => set('store', e.target.value)} /></>
        )}
        <label className="lbl" htmlFor="o">Catatan</label>
        <textarea id="o" className="field" rows={2} placeholder="Ukuran, warna, jadwal ambil" value={f.note} onChange={(e) => set('note', e.target.value)} />
        <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{err}</p>
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <span className="flex-1" />
          <button className="btn" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan catatan'}</button>
        </div>
      </form>
    </div>
  );
}
