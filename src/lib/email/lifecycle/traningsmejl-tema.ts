// src/lib/email/lifecycle/traningsmejl-tema.ts
// Temat för dagens pass i pass_dag2, räknat som hemvyn räknar det
// (hamtaTraningsstatus.dagensTema): samma valjTema på samma underlag. Utan
// hamtaTraningsstatus själv, eftersom den registrerar milstolpar och skickar
// händelser, och ett mejl ska bara läsa.
//
// Egen fil med dynamiska importer: testmotorn och frågebanken laddas bara när
// ett passmejl faktiskt renderas, och mallens tester kan byta ut hela modulen.

import type { AnySupabase } from './types';
import type { Dag } from '@/lib/traning/datum';

/** Familjens id för dagens pass, eller null (då står "Blandade mönster"). Kastar aldrig. */
export async function dagensTemaFor(admin: AnySupabase, userId: string, dag: Dag): Promise<string | null> {
  try {
    const [{ lasLage }, { valjTema }, { seddaFragor, forraPasset, lasSvar }, { varDuTappar }, bank, svar] = await Promise.all([
      import('@/lib/traning/motor.server'),
      import('@/lib/traning/passgenerator'),
      import('@/lib/traning/historik'),
      import('@/lib/traning/familjer'),
      import('@/lib/traning/bank.server'),
      import('@/lib/tests/sparaSvar'),
    ]);
    const lage = await lasLage(admin, userId, dag);

    // Samma underlag som motorns familjeunderlag (motor.server.ts).
    const underlag: { family: string | null; correct: boolean; langsam: boolean }[] = [];
    for (const s of lage.slutforda) {
      const rad = lage.rader.find((r) => r.id === s.id);
      if (!rad) continue;
      for (const a of svar.unikaSvar(lasSvar(rad.answers), svar.SVARSNYCKLAR.matris)) {
        const q = bank.hittaTraningsfraga(a.q_id);
        if (!q) continue;
        underlag.push({ family: bank.familjFor(q), correct: a.correct, langsam: a.correct && a.time_spent > s.meta.budget_s });
      }
    }
    const familjer = varDuTappar(underlag as Parameters<typeof varDuTappar>[0]);
    return valjTema({
      bank: lage.bank,
      sedda: seddaFragor(lage.rader),
      idag: dag,
      forra: forraPasset(lage.slutforda),
      svagaste: familjer.svagaste.map((f) => f.family),
    });
  } catch (e: any) {
    console.warn('[traningsmejl] temat kunde inte räknas:', e?.message ?? e);
    return null;
  }
}
