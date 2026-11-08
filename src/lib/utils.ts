export type Item = { id: string; name: string; cat: string; price: number; wa: string; link: string; store: string; note: string; prio: number; done: boolean; created_at: string };
export type Budget = { total: number; cats: Record<string, number> };
export const CATS = [
  { k: 'seserahan', n: 'Seserahan', icon: 'gift' }, { k: 'souvenir', n: 'Souvenir', icon: 'bag' }, { k: 'mahar', n: 'Mas Kawin', icon: 'crown' },
  { k: 'cincin', n: 'Cincin', icon: 'ring' }, { k: 'kua', n: 'Administrasi KUA', icon: 'scroll' },
];
export const PRIO: Record<number, string> = { 1: 'Tinggi', 2: 'Sedang', 3: 'Santai' };
export const PRIO_BG: Record<number, string> = { 1: 'bg-hi', 2: 'bg-mid', 3: 'bg-lo' };
export const rp = (n: number) => 'Rp' + (Number(n) || 0).toLocaleString('id-ID');
export const catIcon = (k: string) => (CATS.find((c) => c.k === k) ?? CATS[0]).icon;
export const catName = (k: string) => (CATS.find((c) => c.k === k) ?? CATS[0]).n;
export const toUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : 'https://' + u);
export const toWa = (n: string) => { let d = n.replace(/\D/g, ''); if (d[0] === '0') d = '62' + d.slice(1); else if (d[0] === '8') d = '62' + d; return d; };
export const sumOf = (l: Item[]) => l.reduce((a, i) => a + (Number(i.price) || 0), 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const norm = (r: any): Item => ({ id: r.id, name: r.name, cat: r.cat, price: Number(r.price) || 0, wa: r.wa ?? '', link: r.link ?? '', store: r.store ?? '', note: r.note ?? '', prio: r.prio ?? 2, done: !!r.done, created_at: r.created_at });
export const budgetTotal = (b: Budget) => b.total || Object.values(b.cats).reduce((a, c) => a + (Number(c) || 0), 0);
