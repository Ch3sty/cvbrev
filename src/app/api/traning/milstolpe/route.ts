// /api/traning/milstolpe: POST {nyckel} markerar att kvittot (K1) visats.
// Ett kvitto per märke, en gång (spec-rummen bilaga, Milstolparna).

import { NextResponse } from 'next/server';
import { arMilstolpe } from '@/lib/traning/milstolpar';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const nyckel = ((await lasKropp(request)) as Record<string, unknown> | null)?.nyckel;
  if (!arMilstolpe(nyckel)) return fel(400, 'ogiltig_nyckel');
  try {
    const { data, error } = await a.admin
      .from('test_milstolpar')
      .update({ visad_at: new Date().toISOString() })
      .eq('user_id', a.userId)
      .eq('nyckel', nyckel)
      .is('visad_at', null)
      .select('nyckel, visad_at')
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ visad: true, ny: !!data });
  } catch (e) {
    return internt(e, 'milstolpe POST');
  }
}
