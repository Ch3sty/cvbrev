/**
 * Vägen från en fråga på /verktyg/jobbcoachen in i ett riktigt första
 * meddelande (publikt omgång 3, "inga genvägar"): registreringen med
 * redirect till Jobbcoachen i kontot, där frågan står i fältet (?fraga=,
 * läses av src/app/dashboard/jobbcoachen/page.tsx). Den skickas först när
 * hon själv trycker, som förslagen i kontot. Ren, klientsäker.
 */
export const COACH_KONTO = '/dashboard/jobbcoachen'

export function coachHref(fraga?: string | null): string {
  const f = fraga?.replace(/\s+/g, ' ').trim().slice(0, 500)
  const mal = f ? `${COACH_KONTO}?fraga=${encodeURIComponent(f)}` : COACH_KONTO
  return `/register?redirect=${encodeURIComponent(mal)}`
}
