import Icon from './Icon';
import { Item, PRIO, PRIO_BG, catIcon, catName, rp, toUrl, toWa } from '@/lib/utils';

type Props = { it: Item; onToggle: () => void; onEdit: () => void; onDelete: () => void };

export default function ItemCard({ it, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className={`card ${it.done ? 'opacity-75' : ''}`}>
      <div className="flex items-center gap-3">
        <button aria-label="Tandai selesai" aria-pressed={it.done} onClick={onToggle}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-[2.5px] p-0 ${it.done ? 'border-lo bg-lo text-white' : 'border-dashed border-acc text-acc2'}`}>
          <Icon name={it.done ? 'check' : 'heart'} />
        </button>
        <div className="min-w-0 flex-1">
          <b className="break-words text-base">{it.name}</b>
          <div className="text-[13px] text-mute">
            <span className="inline-flex items-center gap-1"><Icon name={catIcon(it.cat)} cls="h-3.5 w-3.5" />{catName(it.cat)}</span>
            <span className={`ml-1 rounded-full px-2 py-px text-[11px] font-bold text-white ${PRIO_BG[it.prio]}`}>{PRIO[it.prio]}</span>
            {it.done && <span className="ml-1 rounded-full bg-lo px-2 py-px text-[11px] font-bold text-white">Dibeli</span>}
          </div>
        </div>
        <div className={`text-right text-[15px] font-bold ${it.done ? 'text-lo' : ''}`}>{it.done ? '−' : ''}{rp(it.price)}</div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {it.link ? (
          <a className="btn" href={toUrl(it.link)} target="_blank" rel="noopener noreferrer"><Icon name="link" />Buka toko</a>
        ) : (
          <span className="inline-flex min-h-[42px] max-w-full items-center gap-1.5 rounded-full bg-soft px-3 text-xs font-bold text-mute">
            <Icon name="store" />{it.store || 'Tanpa link toko'}
          </span>
        )}
        {it.wa && (
          <a className="btn btn-wa" href={`https://wa.me/${toWa(it.wa)}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Chat vendor</a>
        )}
        <span className="flex-1" />
        <button className="mini" aria-label="Ubah" onClick={onEdit}><Icon name="edit" /></button>
        <button className="mini" aria-label="Hapus" onClick={onDelete}><Icon name="trash" /></button>
      </div>
      {it.note && <p className="mt-2.5 break-words rounded-xl bg-soft px-3 py-2 text-[13px] text-mute">{it.note}</p>}
    </div>
  );
}
