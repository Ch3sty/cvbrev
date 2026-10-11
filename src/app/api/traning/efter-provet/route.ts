// /api/traning/efter-provet: svaret på "Hur gick det?" (1e).
// POST {utfall: 'vidare' | 'vet_inte' | 'inte_vidare'} sparar svaret; vid
// "vet inte än" ställs frågan igen efter sju dagar. DELETE tar bort svaret
// (frivilligt och raderbart, briefen 10.4). Kräver en plan med provdatum.

import { NextResponse } from 'next/server';
import { dagSthlm } from '@/lib/traning/datum';
import { validerUtfall } from '@/lib/traning/testplan';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const v = validerUtfall(await lasKropp(request), dagSthlm());
  if (!v.ok) return fel(400, v.fel);
  try {
    const { data, error } = await a.admin
      .from('test_planer')
      .update({ ...v.data, uppdaterad_at: new Date().toISOString() })
      .eq('user_id', a.userId)
      .not('provdatum', 'is', null)
      .select('utfall, utfall_svarat_at, utfall_fraga_igen_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) return fel(409, 'provdatum_saknas');
    return NextResponse.json({ sparat: true, ...data });
  } catch (e) {
    return internt(e, 'efter-provet POST');
  }
}

export async function DELETE() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const { error } = await a.admin
      .from('test_planer')
      .update({ utfall: null, utfall_svarat_at: null, utfall_fraga_igen_at: null, uppdaterad_at: new Date().toISOString() })
      .eq('user_id', a.userId);
    if (error) throw error;
    return NextResponse.json({ borttaget: true });
  } catch (e) {
    return internt(e, 'efter-provet DELETE');
  }
}
