// /api/traning/ovningsprov/session
//
// POST {typ: 'verbal' | 'numerisk', fran?: 'hubb' | 'hem' | 'plan'}
//   Startar övningsprovet mot klockan i planens format, eller återupptar ett
//   pågående. 200 {session: Ovningsvy}. 402 med featureRequiredBody
//   (test_exam_mode), 429 när dagens övningsprov i testtypen redan är gjort.
//
// GET ?id=<uuid>
//   Sessionen i klientens form: texterna och underlagen utan facit och de
//   egna svaren; genomgången och resultatet först efter avslutet.

import { NextResponse } from 'next/server';
import { featureRequiredBody } from '@/lib/quota/quotaService';
import { suggestPlan } from '@/lib/access/features';
import { hamtaOvningsprov, ovningsvy, skapaOvningsprov } from '@/lib/ovningsprov/motor.server';
import { OVNINGSPROV_TEST_TYPE, type OvningsTyp } from '@/lib/ovningsprov/typer';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

const FRAN = ['hubb', 'hem', 'plan'] as const;

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  const typ = k.typ as OvningsTyp;
  if (typ !== 'verbal' && typ !== 'numerisk' && typ !== 'figurer') return fel(400, 'ogiltig_typ');
  const fran = (FRAN as readonly unknown[]).includes(k.fran) ? (k.fran as (typeof FRAN)[number]) : null;
  try {
    const r = await skapaOvningsprov({ supabase: a.supabase, admin: a.admin, userId: a.userId, typ, fran });
    if (r.ok) return NextResponse.json({ session: r.vy });
    if (r.status === 402) {
      return NextResponse.json(
        featureRequiredBody('test_exam_mode', suggestPlan('test_exam_mode', null), { testType: OVNINGSPROV_TEST_TYPE[typ] }),
        { status: 402 }
      );
    }
    return fel(r.status, r.fel);
  } catch (e) {
    return internt(e, 'ovningsprov/session POST');
  }
}

export async function GET(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return fel(400, 'id_saknas');
  try {
    const rad = await hamtaOvningsprov(a.admin, a.userId, id);
    const vy = rad ? ovningsvy(rad) : null;
    if (!vy) return fel(404, 'session_saknas');
    return NextResponse.json({ session: vy });
  } catch (e) {
    return internt(e, 'ovningsprov/session GET');
  }
}
