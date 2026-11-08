const P: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12M16.5 13.5h.01',
  print: 'M7 9V3h10v6M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4zM7 14h10v7H7z',
  logout: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  plus: 'M12 5v14M5 12h14',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  chat: 'M4 5h16v11H9l-5 4z',
  edit: 'M4 20h4L19 9l-4-4L4 16z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  check: 'm5 12 5 5L19 7',
  store: 'M4 10l1-5h14l1 5M5 10v10h14V10M9 20v-6h6v6',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  rings: 'M4 13a5 5 0 1 0 10 0 5 5 0 0 0-10 0zM10 13a5 5 0 1 0 10 0 5 5 0 0 0-10 0z',
  ring: 'M12 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM9.5 6 11 3h2l1.5 3-2.5 2.5z',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1-3-5-3-5-1s3 1 5 1zM12 7c1-3 5-3 5-1s-3 1-5 1z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2M12 17s-2.6-1.6-2.6-3.3a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1.7-2.6 3.3-2.6 3.3z',
  crown: 'M4 18h16M5 18l-1-9 5 4 3-6 3 6 5-4-1 9',
  scroll: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h5',
  letter: 'M3 6h18v12H3zM3 7l9 5 9-5M12 17.5s-2.6-1.6-2.6-3.3a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1.7-2.6 3.3-2.6 3.3z',
};
type Props = { name: string; fill?: boolean; cls?: string };
export default function Icon({ name, fill = false, cls = 'h-5 w-5' }: Props) {
  return (
    <svg className={`${cls} shrink-0`} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}
