type Props = { total: number; count: number; onToggleAll: () => void; onDelete: () => void; onCancel: () => void };

export default function SelectBar({ total, count, onToggleAll, onDelete, onCancel }: Props) {
  const all = total > 0 && count === total;
  return (
    <div className="glass sticky top-2 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-2xl p-2">
      <button className="btn btn-ghost" onClick={onToggleAll} disabled={total === 0}>{all ? 'Batal pilih semua' : `Pilih semua (${total})`}</button>
      <span className="px-1 text-[13px] font-bold text-mute" aria-live="polite">{count} dipilih</span>
      <span className="flex-1" />
      <button className="btn btn-danger" onClick={onDelete} disabled={count === 0}>Hapus</button>
      <button className="btn btn-ghost" onClick={onCancel}>Selesai</button>
    </div>
  );
}
