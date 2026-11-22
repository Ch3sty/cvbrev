/**
 * Startbladet på /verktyg/skapa-cv (publikt omgång 3, skissen skapa-cv):
 * besökarens val, yrkestiteln och "ladda upp" eller "skriv från början",
 * bärs genom registreringen in i byggaren. Registreringen tar emot målet som
 * ?redirect= (sakerRedirect i src/components/registrering/intent.ts) och
 * byggaren läser valet ur adressen:
 *
 *   skriv: ?borja=1&titel=  startbladet hoppas över, titeln är ifylld
 *          (samma kontrakt som "Vilket jobb söker du?" i Ditt CV).
 *   ladda: ?ladda=1&titel=  startbladet öppnas med titeln ifylld och
 *          uppladdningen redan uppfälld.
 *
 * Inget sparas på servern före kontot. Ren funktion, testad i
 * __tests__/startval.test.ts.
 */

export type Startval = 'ladda' | 'skriv'

export const TITEL_MAX = 80

export function lasStartval(raw: unknown): Startval {
  return raw === 'ladda' ? 'ladda' : 'skriv'
}

/** Byggarens adress med valet. Utan titel öppnas startbladet som vanligt. */
export function byggarStart(titelRa: string | null | undefined, val: Startval): string {
  const titel = (titelRa ?? '').replace(/\s+/g, ' ').trim().slice(0, TITEL_MAX)
  const q = new URLSearchParams({ fran: 'registrering' })
  if (val === 'ladda') q.set('ladda', '1')
  if (titel) {
    q.set('titel', titel)
    if (val === 'skriv') q.set('borja', '1')
  }
  return `/dashboard/skapa-cv?${q.toString()}`
}

/** Registreringen med byggaren som mål. */
export function startvalHref(titel: string | null | undefined, val: Startval): string {
  return `/register?${new URLSearchParams({ redirect: byggarStart(titel, val) }).toString()}`
}
