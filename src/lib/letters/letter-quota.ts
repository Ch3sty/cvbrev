/**
 * Brev-kvotens "aktiv vs låst"-logik (samma mönster som src/lib/cv/cv-quota.ts).
 *
 * Gratisanvändare får spara obegränsat antal brev, men bara de N senast
 * uppdaterade (updated_at DESC, fallback created_at) är AKTIVA. Övriga är
 * låsta: de visas gråade i listan och kan inte redigeras förrän användaren
 * uppgraderar eller tar bort brev så att de hamnar bland de N senaste.
 *
 * Pure functions — inga side-effects, lätt att unit-testa.
 */

export const FREE_ACTIVE_LETTER_LIMIT = 2

interface LetterLike {
  id: string
  updated_at?: string | null
  created_at?: string | null
}

function letterTimestamp(letter: LetterLike): number {
  const raw = letter.updated_at || letter.created_at
  const time = raw ? new Date(raw).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

/**
 * Returnera ID:n för de brev som är AKTIVA (de N senast uppdaterade).
 * Övriga är låsta.
 */
export function getActiveLetterIds<T extends LetterLike>(
  letters: T[],
  maxActive: number = FREE_ACTIVE_LETTER_LIMIT
): Set<string> {
  if (maxActive >= letters.length) {
    return new Set(letters.map((l) => l.id))
  }
  const sorted = [...letters].sort((a, b) => letterTimestamp(b) - letterTimestamp(a))
  return new Set(sorted.slice(0, maxActive).map((l) => l.id))
}

/**
 * Snabb check om ett specifikt brev är låst givet hela listan + max-gränsen.
 */
export function isLetterLocked<T extends LetterLike>(
  letterId: string,
  letters: T[],
  maxActive: number = FREE_ACTIVE_LETTER_LIMIT
): boolean {
  return !getActiveLetterIds(letters, maxActive).has(letterId)
}
