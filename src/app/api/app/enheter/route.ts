// /api/app/enheter
//
// Appens telefoner och påminnelsen om dagens pass (docs/plan-app.md, 2.7).
//
// POST {token, plattform?, paminnelse_tid?, aktiv?}
//   Sparar telefonens push-token efter notisfrågan, och uppdaterar
//   senast_sedd när appen startar igen. Samma token tas över av den som är
//   inloggad (en telefon, ett konto åt gången). Utan tid och aktiv behåller en
//   befintlig rad sina värden.
// PATCH {paminnelse_tid?, aktiv?}
//   Kontots inställning: gäller alla den inloggades telefoner.
// 200 {enheter: antal}. 400 ogiltig kropp. 401 utloggad. 503 tabellen saknas.

import { NextResponse } from 'next/server';
import { validerEnhet } from '@/lib/mobilapp/notis';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

function saknasTabell(e: unknown): boolean {
  const m = (e as { message?: string; code?: string } | null) ?? {};
  return m.code === '42P01' || m.code === 'PGRST205' || /app_enheter/.test(m.message ?? '');
}

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const v = validerEnhet(await lasKropp(request), true);
  if (!v.ok) return fel(400, v.fel);
  const { token, plattform, paminnelse_tid, aktiv } = v.data;
  try {
    const nu = new Date().toISOString();
    const { data: fore, error: lasFel } = await a.admin.from('app_enheter').select('id').eq('token', token!).maybeSingle();
    if (lasFel) throw lasFel;
    const andring: Record<string, unknown> = { user_id: a.userId, senast_sedd: nu };
    if (plattform) andring.plattform = plattform;
    if (paminnelse_tid) andring.paminnelse_tid = paminnelse_tid;
    if (aktiv !== undefined) andring.aktiv = aktiv;
    const { error } = fore
      ? await a.admin.from('app_enheter').update(andring).eq('id', (fore as { id: string }).id)
      : await a.admin.from('app_enheter').insert({ token, plattform: plattform ?? 'android', ...andring });
    if (error) throw error;
    return NextResponse.json({ enheter: 1 });
  } catch (e) {
    if (saknasTabell(e)) return fel(503, 'tabellen_saknas');
    return internt(e, 'app/enheter POST');
  }
}

export async function PATCH(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const v = validerEnhet(await lasKropp(request), false);
  if (!v.ok) return fel(400, v.fel);
  const { paminnelse_tid, aktiv } = v.data;
  const andring: Record<string, unknown> = {};
  if (paminnelse_tid) andring.paminnelse_tid = paminnelse_tid;
  if (aktiv !== undefined) andring.aktiv = aktiv;
  if (!Object.keys(andring).length) return fel(400, 'inget_att_andra');
  try {
    const { data, error } = await a.admin.from('app_enheter').update(andring).eq('user_id', a.userId).select('id');
    if (error) throw error;
    return NextResponse.json({ enheter: (data ?? []).length });
  } catch (e) {
    if (saknasTabell(e)) return fel(503, 'tabellen_saknas');
    return internt(e, 'app/enheter PATCH');
  }
}
