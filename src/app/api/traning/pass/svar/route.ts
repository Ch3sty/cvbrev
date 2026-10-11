// /api/traning/pass/svar
//
// POST {sessionId, questionId, selectedIndex, timeSpent, vetInte?, tidenUte?}
//   selectedIndex är positionen hon tryckte på (visat index). Servern räknar
//   om till originalindex med sessionens blandning och dömer mot facit.
//   "Vet inte, visa regeln" (vetInte: true, bara i pass och riktat pass)
//   räknas som fel och sparar tiden.
//   tidenUte: true (bara generalrepetition i ett format med tid per uppgift,
//   Alva): uppgiftens tid tog slut, sparas som fel med tiden (spec 14.4).
//
//   200 {aterkoppling, nasta, besvarade, antal, klar}
//     aterkoppling: pass och riktat pass, efter svaret: rätt, var rätt svar
//       står (visat index), regeln och misstaget för det valda alternativet.
//       Null i mätning och generalrepetition (inga förklaringar under tiden).
//     nasta: adaptiva sessioner, nästa fråga (servern väljer bandet).
//   400 fel fråga eller ogiltigt svar, 404 sessionen finns inte, 409 redan
//   besvarad eller avslutad, 410 generalrepetitionens tid är ute.

import { NextResponse } from 'next/server';
import { svaraTraning } from '@/lib/traning/motor.server';
import { fel, inloggad, internt, lasKropp } from '@/lib/traning/rutt.server';

export async function POST(request: Request) {
  const a = await inloggad();
  if (!a.ok) return a.svar;
  const k = ((await lasKropp(request)) ?? {}) as Record<string, unknown>;
  if (typeof k.sessionId !== 'string' || typeof k.questionId !== 'string') return fel(400, 'falt_saknas');
  if (k.vetInte !== true && k.tidenUte !== true && k.selectedIndex === undefined) return fel(400, 'falt_saknas');
  try {
    const r = await svaraTraning({
      admin: a.admin,
      userId: a.userId,
      sessionId: k.sessionId,
      questionId: k.questionId,
      selectedIndex: k.selectedIndex,
      vetInte: k.vetInte === true,
      tidenUte: k.tidenUte === true,
      timeSpent: k.timeSpent,
    });
    if (!r.ok) return fel(r.status, r.fel);
    const { ok: _ok, ...svar } = r;
    void _ok;
    return NextResponse.json(svar);
  } catch (e) {
    return internt(e, 'pass/svar POST');
  }
}
