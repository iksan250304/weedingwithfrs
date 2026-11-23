'use client';
import { useState } from 'react';

type Props = { count: number; noun: string; onConfirm: () => Promise<void>; onCancel: () => void };

export default function ConfirmDelete({ count, noun, onConfirm, onCancel }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [txt, setTxt] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = txt.trim().toUpperCase() === 'HAPUS';

  async function go() {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(40,22,12,.5)] p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="cd-title">
      <div className="glass-sheet w-full max-w-[420px] rounded-[28px] border-b p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-mute">Langkah {step} dari 2</p>
        {step === 1 ? (
          <>
            <h2 id="cd-title" className="mt-1 text-[32px] leading-tight">Hapus {count} {noun}?</h2>
            <p className="mt-2 text-sm text-mute">Semua yang dipilih akan dihapus permanen dari database dan tidak bisa dikembalikan.</p>
            <div className="mt-5 flex gap-2">
              <button className="btn btn-ghost" onClick={onCancel}>Batal</button>
              <span className="flex-1" />
              <button className="btn btn-danger" onClick={() => setStep(2)}>Lanjutkan</button>
            </div>
          </>
        ) : (
          <>
            <h2 id="cd-title" className="mt-1 text-[32px] leading-tight">Konfirmasi terakhir</h2>
            <p className="mt-2 text-sm text-mute">Ketik <b className="text-ink">HAPUS</b> untuk menghapus {count} {noun} secara permanen.</p>
            <input className="field mt-3" autoFocus autoComplete="off" autoCapitalize="characters" placeholder="HAPUS" value={txt} onChange={(e) => setTxt(e.target.value)} aria-label="Ketik HAPUS" />
            <div className="mt-5 flex gap-2">
              <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={busy}>Kembali</button>
              <span className="flex-1" />
              <button className="btn btn-danger" onClick={go} disabled={!ok || busy}>{busy ? 'Menghapus...' : 'Hapus permanen'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
