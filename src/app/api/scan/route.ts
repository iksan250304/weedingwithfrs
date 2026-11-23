import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Ganti lewat env GEMINI_MODEL bila perlu
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const CATS = ['seserahan', 'souvenir', 'seragam', 'mahar', 'kua'];
const GRPS = ['keluarga_dekat', 'keluarga_besar', 'teman', 'kerja', 'lainnya'];

const ITEMS_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama barang atau urusan, sesuai tulisan asli' },
          cat: { type: 'string', enum: CATS },
          price: { type: 'integer', description: 'Harga dalam rupiah (angka bulat), 0 jika tidak ada' },
          note: { type: 'string', description: 'Info tambahan: jumlah, ukuran, warna, toko. String kosong jika tidak ada' },
        },
        required: ['name', 'cat', 'price', 'note'],
      },
    },
  },
  required: ['items'],
};

const GUESTS_SCHEMA = {
  type: 'object',
  properties: {
    guests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama tamu atau keluarga, sesuai tulisan asli' },
          grp: { type: 'string', enum: GRPS },
          pax: { type: 'integer', description: 'Jumlah orang yang hadir, minimal 1' },
          batik: { type: 'integer', description: 'Jumlah laki-laki (hanya untuk keluarga_dekat), 0 jika tidak jelas' },
          kebaya: { type: 'integer', description: 'Jumlah perempuan (hanya untuk keluarga_dekat), 0 jika tidak jelas' },
          note: { type: 'string', description: 'Info tambahan. String kosong jika tidak ada' },
        },
        required: ['name', 'grp', 'pax', 'batik', 'kebaya', 'note'],
      },
    },
  },
  required: ['guests'],
};

const SYSTEM_ITEMS = `Kamu membaca daftar kebutuhan pernikahan (bahasa Indonesia) dari screenshot, foto, atau teks, lalu mengembalikan JSON sesuai skema.
Aturan:
- Satu baris daftar = satu item. Abaikan judul, nomor urut, bullet, dan tanda centang. Jangan mengarang item yang tidak ada.
- name: pertahankan tulisan asli.
- cat: seserahan (hantaran: perlengkapan ibadah, tas, sepatu, kosmetik, pakaian, makanan, perhiasan seserahan), souvenir (suvenir, hampers, undangan, kartu, percetakan), seragam (baju seragam keluarga, dresscode, kain, jahit), mahar (mas kawin, cincin, emas), kua (dokumen, surat, administrasi, pendaftaran, buku nikah). Jika ragu pilih seserahan.
- price: rupiah bulat. 150rb atau 150k = 150000, 1,5jt = 1500000. Jika tidak ada harga isi 0.
- note: jumlah, ukuran, warna, merek, atau toko jika tertulis, selain itu string kosong.
Maksimal 300 item.`;

const SYSTEM_GUESTS = `Kamu membaca daftar tamu undangan pernikahan (bahasa Indonesia) dari screenshot, foto, atau teks, lalu mengembalikan JSON sesuai skema.
Aturan:
- Satu baris = satu undangan (orang atau keluarga). Abaikan judul, nomor urut, bullet. Jangan mengarang nama.
- name: pertahankan tulisan asli.
- grp: keluarga_dekat (orang tua, saudara kandung, paman, bibi, bude, pakde, om, tante, kakek, nenek, sepupu dekat), keluarga_besar (keluarga jauh, "keluarga besar"), teman (teman, sahabat, alumni, tetangga), kerja (kantor, rekan kerja, atasan). Jika ragu pilih lainnya.
- pax: jumlah orang bila tertulis ("2 orang", "+1", "keluarga 4"), selain itu 1.
- batik dan kebaya hanya untuk keluarga_dekat: laki-laki (Bapak, Pak, Mas, Om, Pakde, Kakek) dihitung batik; perempuan (Ibu, Bu, Mbak, Tante, Bude, Nenek) dihitung kebaya. Untuk pasangan atau keluarga yang komposisinya tertulis, hitung sesuai tulisan. Jika tidak jelas isi 0 untuk keduanya.
- note: info tambahan jika tertulis, selain itu string kosong.
Maksimal 300 tamu.`;

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const int = (v: unknown, min: number, max: number, d: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};

type Part = { text?: string; thought?: boolean };
type GeminiRes = {
  candidates?: { content?: { parts?: Part[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY belum diisi di environment variable.' }, { status: 500 });

  let body: { kind?: string; image?: string; text?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 }); }

  const kind = body.kind === 'guests' ? 'guests' : 'items';
  const image = typeof body.image === 'string' ? body.image : '';
  const text = typeof body.text === 'string' ? body.text.slice(0, 20000) : '';
  if (!image && !text) return NextResponse.json({ error: 'Kirim gambar atau teks daftar.' }, { status: 400 });
  if (image.length > 5_500_000) return NextResponse.json({ error: 'Gambar terlalu besar.' }, { status: 413 });

  const parts: unknown[] = [];
  if (image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: image } });
  parts.push({ text: text ? `Daftar:\n${text}` : 'Baca daftar pada gambar ini.' });

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: kind === 'guests' ? SYSTEM_GUESTS : SYSTEM_ITEMS }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: kind === 'guests' ? GUESTS_SCHEMA : ITEMS_SCHEMA } },
      },
    }),
  });

  const j = (await r.json().catch(() => null)) as GeminiRes | null;
  if (!r.ok) {
    const msg = j?.error?.message ?? '';
    if (r.status === 429) return NextResponse.json({ error: 'Kuota Gemini habis atau terlalu sering dipakai. Tunggu sebentar lalu coba lagi.' }, { status: 429 });
    if (r.status === 400 && /api key/i.test(msg)) return NextResponse.json({ error: 'GEMINI_API_KEY tidak valid.' }, { status: 502 });
    return NextResponse.json({ error: `AI gagal (${r.status}): ${msg.slice(0, 200)}` }, { status: 502 });
  }

  const raw = (j?.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? '').join('')
    .replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  if (!raw) {
    const why = j?.promptFeedback?.blockReason ? `Diblokir AI (${j.promptFeedback.blockReason}).` : 'AI tidak mengembalikan hasil.';
    return NextResponse.json({ error: why }, { status: 502 });
  }

  let parsed: { items?: unknown[]; guests?: unknown[] };
  try { parsed = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Jawaban AI tidak valid, coba lagi.' }, { status: 502 }); }
  const list = ((kind === 'guests' ? parsed.guests : parsed.items) ?? []) as Record<string, unknown>[];

  const rows = list
    .filter((x) => str(x.name, 200))
    .slice(0, 300)
    .map((x) =>
      kind === 'guests'
        ? {
            name: str(x.name, 120),
            grp: GRPS.includes(String(x.grp)) ? String(x.grp) : 'lainnya',
            pax: int(x.pax, 1, 50, 1),
            batik: int(x.batik, 0, 50, 0),
            kebaya: int(x.kebaya, 0, 50, 0),
            note: str(x.note, 300),
          }
        : {
            name: str(x.name, 120),
            cat: CATS.includes(String(x.cat)) ? String(x.cat) : 'seserahan',
            price: int(x.price, 0, 1_000_000_000_000, 0),
            note: str(x.note, 300),
          },
    );
  return NextResponse.json({ rows });
}
