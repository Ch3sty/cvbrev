/**
 * CV-exporten (/api/cv/generate-formatted) svarar 422 name_required när
 * varken CV:t eller profilen har ett namn. Kontosteget frågar inte efter namn
 * sedan 2026-11-09, så det händer oftare än förr. Klienten visar då
 * NameRequiredNotice och gör om nedladdningen när namnet är sparat, samma
 * mönster som nedladdningen av personliga brev.
 */

export class NamnKravsError extends Error {
  constructor() {
    super('name_required')
    this.name = 'NamnKravsError'
  }
}

/** Kastar NamnKravsError om svaret är 422 name_required. Läser en kopia av svaret. */
export async function kastaOmNamnKravs(res: Response): Promise<void> {
  if (res.status !== 422) return
  const data = await res
    .clone()
    .json()
    .catch(() => null)
  if (data && typeof data === 'object' && (data as { error?: unknown }).error === 'name_required') {
    throw new NamnKravsError()
  }
}

export function arNamnKravs(err: unknown): err is NamnKravsError {
  return err instanceof NamnKravsError || (err instanceof Error && err.message === 'name_required')
}
