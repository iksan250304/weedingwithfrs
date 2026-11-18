'use client';
import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GROUPS, Guest, SIDES, normGuest } from '@/lib/utils';

type Props = { guest: Guest | null; defaultSide: string; onClose: () => void; onSaved: (g: Guest, isNew: boolean) => void };

export default function GuestSheet({ guest, defaultSide, onClose, onSaved }: Props) {
  const sb = useMemo(() => createClient(), []);
  const [f, setF] = useState({
    name: guest?.name ?? '', side: guest?.side ?? defaultSide, grp: guest?.grp ?? 'keluarga_dekat',
    pax: String(guest?.pax ?? 1), phone: guest?.phone ?? '', note: guest?.note ?? '',
    batik: String(guest ? guest.batik : 1), kebaya: String(guest?.kebaya ?? 0),
    size_batik: guest?.size_batik ?? '', size_kebaya: guest?.size_kebaya ?? '',
  });
  const [dress, setDress] = useState(guest ? guest.dresscode : true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: string, v: string) => { setF((s) => ({ ...s, [k]: v })); if (k === 'grp') setDress(v === 'keluarga_dekat'); };
  const nB = Math.max(0, Math.floor(Number(f.batik)) || 0);
  const nK = Math.max(0, Math.floor(Number(f.kebaya)) || 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (dress && nB + nK < 1) return setErr('Isi minimal 1 baju (batik atau kebaya).');
    setBusy(true); setErr('');
    const row = {
      name: f.name.trim(), side: f.side, grp: f.grp, pax: Math.max(1, Math.floor(Number(f.pax)) || 1), phone: f.phone.trim(),
      dresscode: dress, batik: dress ? nB : 0, kebaya: dress ? nK : 0,
      size_batik: dress && nB ? f.size_batik.trim() : '', size_kebaya: dress && nK ? f.size_kebaya.trim() : '',
      given: dress ? (guest?.given ?? false) : false, note: f.note.trim(),
    };
    const { data, error } = guest
      ? await sb.from('wedding_guests').update(row).eq('id', guest.id).select().single()
      : await sb.from('wedding_guests').insert(row).select().single();
    setBusy(false);
    if (error) return setErr(error.message);
    onSaved(normGuest(data), !guest);
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-[rgba(40,22,12,.4)] backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto overscroll-contain glass-sheet rounded-t-[28px] px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <h2 className="text-[32px]">{guest ? 'Ubah tamu' : 'Tamu baru'}</h2>
        <label className="lbl" htmlFor="gn">Nama tamu atau keluarga</label>
        <input id="gn" className="field" required placeholder="Contoh: Keluarga Bpk. Ahmad" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <span className="lbl">Dari pihak</span>
        <div className="flex gap-2">
          {SIDES.map((s) => (
            <button type="button" key={s.k} onClick={() => set('side', s.k)}
              className={`min-h-[46px] flex-1 rounded-2xl border-2 text-[13px] font-bold ${f.side === s.k ? 'border-acc bg-acc text-on' : 'border-line bg-card text-ink'}`}>{s.n}</button>
          ))}
        </div>
        <label className="lbl" htmlFor="gg">Kelompok</label>
        <select id="gg" className="field" value={f.grp} onChange={(e) => set('grp', e.target.value)}>
          {GROUPS.map((g) => <option key={g.k} value={g.k}>{g.n}</option>)}
        </select>
        <div className="grid gap-x-2.5 min-[381px]:grid-cols-2">
          <div><label className="lbl" htmlFor="gp">Jumlah orang hadir</label>
            <input id="gp" className="field" type="number" inputMode="numeric" min={1} value={f.pax} onChange={(e) => set('pax', e.target.value)} /></div>
          <div><label className="lbl" htmlFor="gw">No. WA</label>
            <input id="gw" className="field" type="tel" inputMode="tel" placeholder="08123456789" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm font-bold">
          <input type="checkbox" className="h-6 w-6 accent-[var(--acc)]" checked={dress} onChange={(e) => setDress(e.target.checked)} />
          Dapat baju dresscode
        </label>
        {dress && (
          <div className="mt-1 rounded-2xl bg-soft p-3">
            <div className="grid gap-x-2.5 min-[381px]:grid-cols-2">
              <div><label className="lbl !mt-1" htmlFor="gb">Batik (laki-laki)</label>
                <input id="gb" className="field" type="number" inputMode="numeric" min={0} value={f.batik} onChange={(e) => set('batik', e.target.value)} /></div>
              <div><label className="lbl !mt-1" htmlFor="gk">Kebaya (perempuan)</label>
                <input id="gk" className="field" type="number" inputMode="numeric" min={0} value={f.kebaya} onChange={(e) => set('kebaya', e.target.value)} /></div>
            </div>
            {nB > 0 && (<><label className="lbl" htmlFor="gsb">Ukuran batik</label>
              <input id="gsb" className="field" placeholder="Contoh: L atau L, XL" value={f.size_batik} onChange={(e) => set('size_batik', e.target.value)} /></>)}
            {nK > 0 && (<><label className="lbl" htmlFor="gsk">Ukuran kebaya</label>
              <input id="gsk" className="field" placeholder="Contoh: M atau S, M" value={f.size_kebaya} onChange={(e) => set('size_kebaya', e.target.value)} /></>)}
            <p className="mt-2 text-xs text-mute">Total {nB + nK} baju untuk {Math.max(1, Number(f.pax) || 1)} orang hadir.</p>
          </div>
        )}
        <label className="lbl" htmlFor="gx">Catatan</label>
        <textarea id="gx" className="field" rows={2} placeholder="Alamat kirim baju, hubungan keluarga" value={f.note} onChange={(e) => set('note', e.target.value)} />
        <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{err}</p>
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
          <span className="flex-1" />
          <button className="btn" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan tamu'}</button>
        </div>
      </form>
    </div>
  );
}
