// /api/traning/plan: provdatum, leverantör, testtyper (test_planer).
// GET läser, PUT sätter och ändrar (bara fälten som skickas, null tar bort),
// DELETE tar bort hela planen. Skrivningar med service role efter
// inloggningskontrollen (20261011100000_test_planer.sql).

import { NextResponse } from 'next/server';
import { dagSthlm } from '@/lib/traning/datum';
import { fragaEfterProvet, validerPlan } from '@/lib/traning/testplan';
import { formatForPlan } from '@/lib/traning/tempo';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

const KOLUMNER =
  'user_id, testtyper, leverantor, variant, provdatum, sikte, utfall, utfall_svarat_at, utfall_fraga_igen_at, skapad_at, uppdaterad_at';

export async function GET() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const { data, error } = await a.admin.from('test_planer').select(KOLUMNER).eq('user_id', a.userId).maybeSingle();
    if (error) throw error;
    const idag = dagSthlm();
    const f = formatForPlan(data?.leverantor, data?.variant);
    return NextResponse.json({
      plan: data ?? null,
      fragaEfterProvet: fragaEfterProvet(data ?? null, idag),
      format: { nyckel: f.nyckel, namn: f.namn, antal: f.antal, minuter: f.minuter, budget_s: f.budget_s, cirka: f.cirka },
    });
  } catch (e) {
    return internt(e, 'plan GET');
  }
}

export async function PUT(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const idag = dagSthlm();
  const v = validerPlan(await lasKropp(request), idag);
  if (!v.ok) return fel(400, v.fel);

  try {
    const { data: fore, error: lasFel } = await a.admin
      .from('test_planer')
      .select('provdatum')
      .eq('user_id', a.userId)
      .maybeSingle();
    if (lasFel) throw lasFel;

    const andring: Record<string, unknown> = { ...v.data, uppdaterad_at: new Date().toISOString() };
    // Nytt provdatum = nytt prov: svaret på "Hur gick det?" hörde till det gamla.
    if (v.data.provdatum !== undefined && fore && fore.provdatum !== v.data.provdatum) {
      andring.utfall = null;
      andring.utfall_svarat_at = null;
      andring.utfall_fraga_igen_at = null;
    }

    const { data, error } = fore
      ? await a.admin.from('test_planer').update(andring).eq('user_id', a.userId).select(KOLUMNER).single()
      : await a.admin
          .from('test_planer')
          .insert({ user_id: a.userId, ...andring })
          .select(KOLUMNER)
          .single();
    if (error) throw error;
    return NextResponse.json({ plan: data });
  } catch (e) {
    return internt(e, 'plan PUT');
  }
}

export async function DELETE() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    const { error } = await a.admin.from('test_planer').delete().eq('user_id', a.userId);
    if (error) throw error;
    return NextResponse.json({ plan: null });
  } catch (e) {
    return internt(e, 'plan DELETE');
  }
}
