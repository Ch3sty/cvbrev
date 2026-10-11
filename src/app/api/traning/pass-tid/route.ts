// /api/traning/pass-tid
//
// POST {pass_tid: 'morgon' | 'lunch' | 'kvall' | null}
//   Sparar tidpunkten för passet (riktlinjer-tester-v2 4.2, skiss 5): ett
//   tryck på en av tre klockor efter Nivåkollen eller ett pass. Valet styr
//   påminnelsemejlet pass_dag2. Skapar planraden om den saknas.
//   200 {pass_tid}. 400 ogiltig tid. 503 när kolumnen saknas (migreringen
//   20261012090000_test_planer_pass_tid.sql inte körd): valet sparas inte och
//   klienten säger det.

import { NextResponse } from 'next/server';
import { validerPassTid } from '@/lib/traning/testplan';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

function saknasKolumn(e: unknown): boolean {
  const m = (e as { message?: string; code?: string } | null) ?? {};
  return m.code === '42703' || m.code === 'PGRST204' || /pass_tid/.test(m.message ?? '');
}

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const v = validerPassTid(await lasKropp(request));
  if (!v.ok) return fel(400, v.fel);
  try {
    const andring = { pass_tid: v.data, uppdaterad_at: new Date().toISOString() };
    const { data: fore, error: lasFel } = await a.admin.from('test_planer').select('user_id').eq('user_id', a.userId).maybeSingle();
    if (lasFel) throw lasFel;
    const { error } = fore
      ? await a.admin.from('test_planer').update(andring).eq('user_id', a.userId)
      : await a.admin.from('test_planer').insert({ user_id: a.userId, ...andring });
    if (error) {
      if (saknasKolumn(error)) return fel(503, 'kolumnen_saknas');
      throw error;
    }
    return NextResponse.json({ pass_tid: v.data });
  } catch (e) {
    if (saknasKolumn(e)) return fel(503, 'kolumnen_saknas');
    return internt(e, 'pass-tid POST');
  }
}
