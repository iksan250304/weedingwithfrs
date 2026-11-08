import Planner from '@/components/Planner';
import { createClient } from '@/lib/supabase/server';
import { norm, type Budget } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sb = createClient();
  const [{ data: { user } }, items, bud] = await Promise.all([
    sb.auth.getUser(),
    sb.from('wedding_items').select('*').order('created_at'),
    sb.from('wedding_budget').select('*').eq('id', 1).maybeSingle(),
  ]);
  const budget: Budget = { total: Number(bud.data?.total) || 0, cats: (bud.data?.cats as Record<string, number>) ?? {} };
  return <Planner email={user?.email ?? ''} initialItems={(items.data ?? []).map(norm)} initialBudget={budget} />;
}
