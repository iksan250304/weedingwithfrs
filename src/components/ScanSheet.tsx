'use client';
import { ChangeEvent, ClipboardEvent, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from './Icon';
import { CATS, GROUPS, Guest, Item, SIDES, norm, normGuest } from '@/lib/utils';

type Kind = 'items' | 'guests';
type Row = { on: boolean; name: string; cat: string; price: string; note: string; side: string; grp: string; pax: string; batik: number; kebaya: number };
type Props = { kind: Kind; defaultSide: string; onClose: () => void; onItems: (r: Item[]) => void; onGuests: (r: Guest[]) => void };

async function toJpeg(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('Gambar tidak bisa dibuka.'));
      i.src = url;
    });
    const sc = Math.min(1, 1800 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * sc);
    c.height = Math.round(img.height * sc);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85).split(',')[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

const mini = '!min-h-[42px] !py-2';

export default function ScanSheet({ kind, defaultSide, onClose, onItems, onGuests }: Props) {
  const sb = useMemo(() => createClient(), []);
  const [step, setStep] = useState<'input' | 'busy' | 'review'>('input');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [side, setSide] = useState(defaultSide);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function setImage(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  }
  const onPick = (e: ChangeEvent<HTMLInputElement>) => { setImage(e.target.files?.[0] ?? null); e.target.value = ''; };
  function onPaste(e: ClipboardEvent) {
    const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith('image/'));
    if (f) { e.preventDefault(); setImage(f); }
  }

  async function run() {
    setErr(''); setStep('busy');
    try {
      const image = file ? await toJpeg(file) : '';
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, image, text: text.trim() }) });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j) throw new Error(j?.error || 'Gagal membaca. Coba login ulang lalu ulangi.');
      const list = (j.rows ?? []) as Record<string, unknown>[];
      if (!list.length) throw new Error('Tidak ada daftar yang terbaca. Coba gambar yang lebih jelas.');
      setRows(list.map((r) => ({
        on: true, name: String(r.name ?? ''), cat: String(r.cat ?? 'seserahan'), price: r.price ? String(r.price) : '',
        note: String(r.note ?? ''), side, grp: String(r.grp ?? 'lainnya'), pax: String(r.pax ?? 1),
        batik: Number(r.batik) || 0, kebaya: Number(r.kebaya) || 0,
      })));
      setStep('review');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal membaca.');
      setStep('input');
    }
  }

  const upd = (i: number, p: Partial<Row>) => setRows((l) => l.map((r, n) => (n === i ? { ...r, ...p } : r)));
  const picked = rows.filter((r) => r.on && r.name.trim());

  async function save() {
    if (!picked.length) return setErr('Tidak ada baris yang dicentang.');
    setSaving(true); setErr('');
    if (kind === 'items') {
      const payload = picked.map((r) => ({ name: r.name.trim(), cat: r.cat, price: Math.max(0, Number(r.price) || 0), wa: '', link: '', store: '', note: r.note.trim(), prio: 2, done: false }));
      const { data, error } = await sb.from('wedding_items').insert(payload).select();
      setSaving(false);
      if (error) return setErr(error.message);
      onItems((data ?? []).map(norm));
    } else {
      const payload = picked.map((r) => {
        const dress = r.grp === 'keluarga_dekat';
        return {
          name: r.name.trim(), side: r.side, grp: r.grp, pax: Math.max(1, Math.floor(Number(r.pax)) || 1), phone: '',
          dresscode: dress, batik: dress ? r.batik : 0, kebaya: dress ? r.kebaya : 0, size_batik: '', size_kebaya: '',
          given: false, note: r.note.trim(),
        };
      });
      const { data, error } = await sb.from('wedding_guests').insert(payload).select();
      setSaving(false);
      if (error) return setErr(error.message);
      onGuests((data ?? []).map(normGuest));
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-[rgba(40,22,12,.4)] backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && step !== 'busy' && onClose()} onPaste={onPaste}>
      <div className="glass-sheet max-h-[92dvh] w-full max-w-[560px] overflow-y-auto overscroll-contain rounded-t-[28px] px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <h2 className="text-[32px]">Scan {kind === 'items' ? 'daftar kebutuhan' : 'daftar tamu'}</h2>

        {step === 'input' && (
          <>
            <p className="text-sm text-mute">Unggah screenshot atau foto daftar (misalnya dari Notepad), atau tempel teksnya. AI membaca dan mengisi otomatis. Hasilnya bisa kamu periksa dulu sebelum disimpan.</p>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
            {preview ? (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Pratinjau screenshot" className="h-20 w-20 rounded-xl object-cover" />
                <button className="btn btn-ghost" onClick={() => setImage(null)}>Hapus gambar</button>
              </div>
            ) : (
              <button className="btn mt-3 min-h-[48px] w-full" onClick={() => fileRef.current?.click()}><Icon name="scan" />Pilih screenshot atau foto</button>
            )}
            <p className="mt-2 text-xs text-mute">Di komputer, tekan Ctrl+V untuk menempel screenshot langsung.</p>
            <label className="lbl" htmlFor="sc-t">Atau tempel teks daftar</label>
            <textarea id="sc-t" className="field" rows={4} placeholder={kind === 'items' ? 'Contoh:\nMukena set bordir 350rb\nCincin kawin' : 'Contoh:\nBapak Ahmad\nIbu Siti + 2 anak'} value={text} onChange={(e) => setText(e.target.value)} />
            {kind === 'guests' && (
              <>
                <span className="lbl">Daftar ini untuk</span>
                <div className="flex gap-2">
                  {SIDES.map((s) => (
                    <button type="button" key={s.k} onClick={() => setSide(s.k)}
                      className={`min-h-[46px] flex-1 rounded-2xl border-2 text-[13px] font-bold ${side === s.k ? 'border-acc bg-acc text-on' : 'border-line bg-card text-ink'}`}>{s.n}</button>
                  ))}
                </div>
              </>
            )}
            <p className="mt-3 text-xs text-mute">Gambar atau teks dikirim ke Google Gemini hanya untuk dibaca, dan tidak disimpan di aplikasi ini.</p>
            <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{err}</p>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-ghost" onClick={onClose}>Batal</button>
              <span className="flex-1" />
              <button className="btn" onClick={run} disabled={!file && !text.trim()}>Baca dengan AI</button>
            </div>
          </>
        )}

        {step === 'busy' && (
          <div className="py-12 text-center text-mute" role="status" aria-live="polite">
            <Icon name="scan" cls="mx-auto mb-3 h-12 w-12 animate-pulse text-acc2" />
            <p>Membaca daftar, tunggu sebentar...</p>
          </div>
        )}

        {step === 'review' && (
          <>
            <p className="mb-2 text-sm text-mute">{rows.length} baris terbaca. Periksa dan ubah bila perlu, hilangkan centang untuk yang tidak dipakai.</p>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className={`glass rounded-2xl p-3 ${r.on ? '' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-6 w-6 shrink-0 accent-[var(--acc)]" checked={r.on} onChange={(e) => upd(i, { on: e.target.checked })} aria-label="Sertakan baris ini" />
                    <input className={`field ${mini}`} value={r.name} onChange={(e) => upd(i, { name: e.target.value })} aria-label="Nama" />
                  </div>
                  {kind === 'items' ? (
                    <div className="mt-2 grid grid-cols-[1fr_120px] gap-2">
                      <select className={`field ${mini}`} value={r.cat} onChange={(e) => upd(i, { cat: e.target.value })} aria-label="Kategori">
                        {CATS.map((c) => <option key={c.k} value={c.k}>{c.n}</option>)}
                      </select>
                      <input className={`field ${mini}`} type="number" inputMode="numeric" min={0} placeholder="Harga" value={r.price} onChange={(e) => upd(i, { price: e.target.value })} aria-label="Harga" />
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <select className={`field ${mini}`} value={r.side} onChange={(e) => upd(i, { side: e.target.value })} aria-label="Pihak">
                        {SIDES.map((s) => <option key={s.k} value={s.k}>{s.n}</option>)}
                      </select>
                      <input className={`field ${mini}`} type="number" inputMode="numeric" min={1} placeholder="Orang" value={r.pax} onChange={(e) => upd(i, { pax: e.target.value })} aria-label="Jumlah orang" />
                      <select className={`field col-span-2 ${mini}`} value={r.grp} onChange={(e) => upd(i, { grp: e.target.value })} aria-label="Kelompok">
                        {GROUPS.map((g) => <option key={g.k} value={g.k}>{g.n}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p role="alert" className="mt-2 min-h-[20px] text-[13px] font-bold text-hi">{err}</p>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-ghost" onClick={() => { setStep('input'); setErr(''); }} disabled={saving}>Kembali</button>
              <span className="flex-1" />
              <button className="btn" onClick={save} disabled={saving || !picked.length}>{saving ? 'Menyimpan...' : `Simpan ${picked.length} baris`}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
