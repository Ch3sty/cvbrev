// src/lib/interests/avslutadKontakt.ts
//
// "Avsluta kontakten" (ägarbeslut 2026-11-22): en kandidat som har tackat ja
// till en rekryterare kan ta tillbaka sitt ja. Samtycket ska vara lika lätt
// att ta tillbaka som att ge.
//
// Utan migrering: intresset får det befintliga statusvärdet 'declined'. Det
// räcker för att rekryterarens vy blir anonym igen (accessFor läser bara
// 'accepted') och för att tråden stängs för nya meddelanden (POST kräver
// 'accepted'). För att skilja ett avslutat samtal från en förfrågan som
// avböjdes direkt sparar servern en markör med tidpunkt i kandidatens egen
// rad i user_ui_preferences, en rad per intresse:
//   key   = 'kontakt_avslutad:<interestId>'
//   value = { avslutad_at: ISO-tid }
// Markören skrivs bara av servern (rutten POST /api/candidate/interests/end).
// Kandidaten kan i teorin radera sin egen rad under RLS; då visas samtalet
// som avböjt i stället för avslutat, men kontakten är fortfarande stängd och
// profilen anonym. Markören läses alltid tillsammans med intressets status
// och kandidatens id, så en rad för någon annans intresse gör ingenting.

const PREFIX = 'kontakt_avslutad:';

export function avslutadNyckel(interestId: string): string {
  return `${PREFIX}${interestId}`;
}

export const KANDIDATEN_AVSLUTADE = 'Kandidaten har avslutat kontakten.';

/**
 * Tidpunkten då kontakten avslutades, per intresse. Bara intressen med
 * status 'declined' kan vara avslutade; övriga hoppas över.
 */
export async function hamtaAvslutade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  intressen: Array<{ id: string; candidate_user_id: string; status: string }>
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const avbojda = intressen.filter((i) => i.status === 'declined');
  if (avbojda.length === 0) return result;

  const { data, error } = await admin
    .from('user_ui_preferences')
    .select('user_id, key, value')
    .in('user_id', Array.from(new Set(avbojda.map((i) => i.candidate_user_id))))
    .in('key', avbojda.map((i) => avslutadNyckel(i.id)));
  if (error) {
    console.error('Avslutad kontakt: kunde inte läsa markörerna', error);
    return result;
  }

  const agare = new Map(avbojda.map((i) => [avslutadNyckel(i.id), i]));
  for (const row of (data ?? []) as Array<{ user_id: string; key: string; value: { avslutad_at?: unknown } | null }>) {
    const intresse = agare.get(row.key);
    if (!intresse || intresse.candidate_user_id !== row.user_id) continue;
    const at = typeof row.value?.avslutad_at === 'string' ? row.value.avslutad_at : null;
    if (at) result.set(intresse.id, at);
  }
  return result;
}
