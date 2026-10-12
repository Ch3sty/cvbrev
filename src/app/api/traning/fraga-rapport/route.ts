// /api/traning/fraga-rapport
//
// POST { q_id, session_id?, test_kind?, bank_version?, orsak, kommentar? }
//   Rapportknappen "Något ser fel ut" (tillagg-variation 3.2). Inloggad,
//   högst tio rapporter per konto och dygn. Sparas i fraga_rapporter
//   (migreringen 20261012110000_fraga_rapporter.sql) och skjuts till PostHog
//   som fraga_rapporterad.
//
//   Rapporten ska aldrig störa passet: finns inte tabellen än, eller går
//   skrivningen fel, loggas rapporten på servern och svaret är detsamma.
//
//   200 { ok: true }, 400 fel fält, 401 inte inloggad, 429 tio i dag.

import { NextResponse } from 'next/server';
import { captureServer } from '@/lib/analytics/server';
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7';
import { lasRapport, RAPPORT_PER_DAG } from '@/lib/traning/fragaRapport';
import { fel, inloggad, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const rapport = lasRapport(await lasKropp(request));
  if (!rapport) return fel(400, 'falt_saknas');
  const rad = { ...rapport, bank_version: rapport.bank_version ?? (rapport.test_kind === 'matris' ? BANK_VERSION : null), user_id: a.userId };

  try {
    const sedan = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error: rakna } = await a.admin
      .from('fraga_rapporter')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', a.userId)
      .gte('created_at', sedan);
    if (!rakna && (count ?? 0) >= RAPPORT_PER_DAG) return fel(429, 'for_manga');
    let { error } = await a.admin.from('fraga_rapporter').insert(rad);
    // Figurserier före migreringen 20261012130000 och deduktiv före
    // 20261012160000: kontrollvillkoret känner inte testtypen. Spara som
    // matris; id:t fs-... eller dd-... skiljer dem åt.
    if (error?.code === '23514' && (rad.test_kind === 'figurserie' || rad.test_kind === 'deduktiv')) {
      ({ error } = await a.admin.from('fraga_rapporter').insert({ ...rad, test_kind: 'matris' }));
    }
    if (error) console.warn('[fraga-rapport] sparades inte, loggas här:', error.code ?? error.message, JSON.stringify(rad));
  } catch (e) {
    console.warn('[fraga-rapport] sparades inte, loggas här:', e, JSON.stringify(rad));
  }
  void captureServer('fraga_rapporterad', a.userId, { fraga_id: rapport.q_id, orsak: rapport.orsak, test_kind: rapport.test_kind });
  return NextResponse.json({ ok: true });
}
