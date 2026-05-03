/**
 * CV-kvotgränsens "aktiv vs låst"-logik.
 *
 * Free-användare har max 2 aktiva CV. En premium-användare som tidigare hade
 * fler CV och avslutar sitt abonnemang ska behålla sina CV i databasen, men
 * bara de N senaste (efter created_at DESC) ska kunna användas i andra flöden.
 *
 * Pure functions — inga side-effects, lätt att unit-testa.
 */

/**
 * Sortera CV efter created_at DESC och returnera ID:n för de som är AKTIVA
 * (de N senaste). Övriga är låsta.
 */
export function getActiveCvIds<T extends { id: string; created_at: string }>(
  cvs: T[],
  maxCvs: number
): Set<string> {
  if (maxCvs >= cvs.length) {
    // Alla är aktiva
    return new Set(cvs.map((c) => c.id))
  }
  const sorted = [...cvs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return new Set(sorted.slice(0, maxCvs).map((c) => c.id))
}

/**
 * Returnerar samma CV-array med en `isLocked`-flagga tillagd på varje.
 * Behåller original-ordningen så UI-rendering inte sorteras om.
 */
export function markActiveAndLocked<
  T extends { id: string; created_at: string },
>(cvs: T[], maxCvs: number): Array<T & { isLocked: boolean }> {
  const activeIds = getActiveCvIds(cvs, maxCvs)
  return cvs.map((cv) => ({ ...cv, isLocked: !activeIds.has(cv.id) }))
}

/**
 * Snabb check om ett specifikt CV är låst givet hela listan + max-gränsen.
 */
export function isCvLocked<T extends { id: string; created_at: string }>(
  cvId: string,
  cvs: T[],
  maxCvs: number
): boolean {
  return !getActiveCvIds(cvs, maxCvs).has(cvId)
}
