/**
 * Sessionens tid vid slutförandet, i hela sekunder.
 *
 * Räknas från sessionens started_at, alltså serverns tid. Förut summerades
 * answers[].time_spent, tiden per uppgift som klienten mätte från när
 * uppgiften visades. Den mätningen börjar om vid varje omladdning och
 * missar tiden mellan uppgifterna, så röktestet 2026-11-19 (talserier grund,
 * omladdning mitt i) fick time_spent 1 s för en session som pågick i två och
 * en halv minut, och resultatet visade "0:01 av 12 min".
 *
 * Tiden per uppgift ligger kvar i answers[] och används fortfarande för
 * frågestatistiken och genomgången. Bara sessionens totala tid ändras.
 *
 * Saknas started_at, eller är den trasig, faller vi tillbaka på `reserv`
 * (summan av tiden per uppgift), så att slutförandet aldrig fallerar.
 *
 * Ett otidsatt test kan lämnas öppet över natten. Är tiden sedan start
 * längre än TAK_SEKUNDER räknas i stället summan per uppgift (högst taket),
 * så att en paus inte blir ett resultat på tolv timmar.
 */
export const TAK_SEKUNDER = 3 * 60 * 60

export function sessionstid(
  startedAt: string | Date | null | undefined,
  nu: number = Date.now(),
  reserv = 0
): number {
  const r = Math.max(0, Math.floor(Number.isFinite(reserv) ? reserv : 0))
  if (startedAt) {
    const start = startedAt instanceof Date ? startedAt.getTime() : new Date(startedAt).getTime()
    if (Number.isFinite(start)) {
      const vagg = Math.max(0, Math.floor((nu - start) / 1000))
      if (vagg <= TAK_SEKUNDER) return vagg
      return r > 0 ? Math.min(r, TAK_SEKUNDER) : TAK_SEKUNDER
    }
  }
  return r
}

/** Summan av tiden per uppgift, med valfri nyckel (time_spent eller timeSpent). */
export function summaUppgiftstid(
  answers: readonly unknown[] | null | undefined,
  nyckel: 'time_spent' | 'timeSpent' = 'time_spent'
): number {
  if (!Array.isArray(answers)) return 0
  return answers.reduce<number>((s, a) => {
    const v = (a as Record<string, unknown> | null)?.[nyckel]
    return s + (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  }, 0)
}
