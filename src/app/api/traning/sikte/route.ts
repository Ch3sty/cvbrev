// /api/traning/sikte: POST {niva} sätter siktet på nivåskalan (M1, "Sikte
// 6,5, ändra"). 1 till taket (7,5 tills banken är kalibrerad), en decimal.
// Finns ingen plan skapas den med bara siktet.

import { NextResponse } from 'next/server';
import { validerSikte } from '@/lib/traning/testplan';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const v = validerSikte(await lasKropp(request));
  if (!v.ok) return fel(400, v.fel);
  try {
    const { data, error } = await a.admin
      .from('test_planer')
      .upsert(
        { user_id: a.userId, sikte: v.data, uppdaterad_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .select('sikte')
      .single();
    if (error) throw error;
    return NextResponse.json({ sikte: Number(data.sikte) });
  } catch (e) {
    return internt(e, 'sikte POST');
  }
}
