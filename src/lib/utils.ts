export type Item = { id: string; name: string; cat: string; price: number; wa: string; link: string; store: string; note: string; prio: number; done: boolean; created_at: string };
export type Budget = { total: number; cats: Record<string, number> };
export const CATS = [
  { k: 'seserahan', n: 'Seserahan', icon: 'gift' }, { k: 'souvenir & undangan', n: 'Souvenir & Undangan', icon: 'bag' }, { k: 'mahar', n: 'Mas Kawin', icon: 'crown' },
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

export type Guest = { id: string; name: string; side: string; grp: string; pax: number; phone: string; dresscode: boolean; batik: number; kebaya: number; size_batik: string; size_kebaya: string; given: boolean; note: string; created_at: string };
export const SIDES = [{ k: 'i', n: 'Pihak I' }, { k: 'f', n: 'Pihak F' }];
export const GROUPS = [
  { k: 'keluarga_dekat', n: 'Keluarga dekat' }, { k: 'keluarga_besar', n: 'Keluarga besar' },
  { k: 'teman', n: 'Teman' }, { k: 'kerja', n: 'Rekan kerja' }, { k: 'lainnya', n: 'Lainnya' },
];
export const sideName = (k: string) => (SIDES.find((s) => s.k === k) ?? SIDES[0]).n;
export const groupName = (k: string) => (GROUPS.find((g) => g.k === k) ?? GROUPS[4]).n;
export const paxOf = (l: Guest[]) => l.reduce((a, g) => a + g.pax, 0);
export const batikOf = (l: Guest[]) => l.reduce((a, g) => a + g.batik, 0);
export const kebayaOf = (l: Guest[]) => l.reduce((a, g) => a + g.kebaya, 0);
export const bajuOf = (l: Guest[]) => batikOf(l) + kebayaOf(l);
export const dressText = (g: Guest) => [
  g.batik ? `Batik ${g.batik}${g.size_batik ? ` (${g.size_batik})` : ''}` : '',
  g.kebaya ? `Kebaya ${g.kebaya}${g.size_kebaya ? ` (${g.size_kebaya})` : ''}` : '',
].filter(Boolean).join(' · ') || 'Dresscode';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const normGuest = (r: any): Guest => ({ id: r.id, name: r.name, side: r.side, grp: r.grp ?? 'lainnya', pax: Number(r.pax) || 1, phone: r.phone ?? '', dresscode: !!r.dresscode, batik: Number(r.batik) || 0, kebaya: Number(r.kebaya) || 0, size_batik: r.size_batik ?? '', size_kebaya: r.size_kebaya ?? '', given: !!r.given, note: r.note ?? '', created_at: r.created_at });
