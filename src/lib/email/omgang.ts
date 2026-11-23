// src/lib/email/omgang.ts
// En omgång till Resends batch-anrop, för kampanjmejlen och mejlet om
// Jobbsöket.
//
// Resend underkänner hela omgången om en enda adress har fel form. Det hände
// i Black Week-utskicket 2026-11-23: en adress utan toppdomän i profiles tog
// med sig 99 giltiga mottagare, som aldrig fick mejlet. Därför två skydd:
// urvalen släpper bara igenom adresser med riktig form (giltigMejladress),
// och en omgång som Resend ändå underkänner delas i två och prövas igen
// tills den felande adressen står ensam.

/**
 * Har adressen en form som Resend godtar? Medvetet strängare än "innehåller
 * @": lokal del, domän med minst en punkt och en toppdomän på två tecken.
 */
export function giltigMejladress(v: unknown): v is string {
  return typeof v === 'string' && /^[^\s@<>,;:"]+@[^\s@<>,;:".]+(\.[^\s@<>,;:".]+)*\.[^\s@<>,;:".]{2,}$/.test(v);
}

export interface OmgangSvar {
  /** Tog Resend emot mejlet? */
  ok: boolean;
  /** Resends id, om svaret hade ett. */
  id: string | null;
}

interface BatchKlient {
  batch: { send: (mejl: any[]) => Promise<{ data: any; error: any }> };
}

/** Felet "den här omgången har fel form", till skillnad från driftfel och hastighetsgräns. */
function arFormfel(error: any): boolean {
  return error?.statusCode === 422 || error?.name === 'validation_error' || error?.name === 'invalid_parameter';
}

const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Skickar en omgång och svarar med ett besked per mejl, i samma ordning.
 * Ett formfel delar omgången i två och prövar halvorna var för sig. Andra
 * fel (driftstörning, hastighetsgräns) fäller hela omgången utan nya försök,
 * så att körningen inte äter upp funktionens tid.
 */
export async function skickaOmgang(
  resend: BatchKlient,
  mejl: any[],
  pausMs: number,
  etikett: string
): Promise<OmgangSvar[]> {
  if (mejl.length === 0) return [];
  const { data, error } = await resend.batch.send(mejl);
  if (!error) {
    const ids = data?.data ?? [];
    return mejl.map((_, j) => ({ ok: true, id: ids[j]?.id ?? null }));
  }
  if (!arFormfel(error) || mejl.length === 1) {
    console.error(`[${etikett}] ${mejl.length === 1 ? 'ett mejl' : `omgången (${mejl.length})`} misslyckades:`, error);
    return mejl.map(() => ({ ok: false, id: null }));
  }
  const mitt = Math.ceil(mejl.length / 2);
  await vanta(pausMs);
  const forsta = await skickaOmgang(resend, mejl.slice(0, mitt), pausMs, etikett);
  await vanta(pausMs);
  const andra = await skickaOmgang(resend, mejl.slice(mitt), pausMs, etikett);
  return [...forsta, ...andra];
}
