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
  'user_id, testtyper, leverantor, variant, provdatum, sikte, utfall, utfall_svarat_at, utfall_fraga_igen_at, skapad_at, uppdaterad_at, mitt_test, mitt_test_variant, extra_typer, plan_start, dagsmal, kalla';
/** Utan migreringen 20261120090000 (plan_start, dagsmal): samma läsning som förut. */
const KOLUMNER_FORE_V4 = KOLUMNER.replace(', plan_start, dagsmal, kalla', '');
/** Kolumnen saknas (Postgres 42703, PostgREST PGRST204). */
const saknarKolumn = (e: unknown) => {
  const k = (e as { code?: string } | null)?.code;
  return k === '42703' || k === 'PGRST204';
};

export async function GET() {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  try {
    let { data, error } = await a.admin.from('test_planer').select(KOLUMNER).eq('user_id', a.userId).maybeSingle();
    if (error && saknarKolumn(error)) ({ data, error } = await a.admin.from('test_planer').select(KOLUMNER_FORE_V4).eq('user_id', a.userId).maybeSingle());
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
      .select('provdatum, mitt_test')
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

    // Plan inför provet startar om när testet eller datumet byts (tester v4):
    // banan och "dag N av M" räknas från plan_start, aldrig från första nivåkollen.
    const nyttTest = v.data.mitt_test !== undefined && (!fore || fore.mitt_test !== v.data.mitt_test);
    const nyttDatum = v.data.provdatum !== undefined && (!fore || fore.provdatum !== v.data.provdatum);
    if (nyttTest || nyttDatum) andring.plan_start = idag;
    // Valt själv i Plan inför provet: inte längre artikelns plan.
    if (nyttTest) andring.kalla = 'installningar';

    const skriv = (rad: Record<string, unknown>, kol: string) =>
      fore
        ? a.admin.from('test_planer').update(rad).eq('user_id', a.userId).select(kol).single()
        : a.admin.from('test_planer').insert({ user_id: a.userId, ...rad }).select(kol).single();
    let { data, error } = await skriv(andring, KOLUMNER);
    if (error && saknarKolumn(error)) {
      // Före migreringen: skriv utan de nya fälten.
      const { plan_start: _p, dagsmal: _d, kalla: _k, ...utan } = andring;
      void _p;
      void _d;
      void _k;
      ({ data, error } = await skriv(utan, KOLUMNER_FORE_V4));
    }
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
