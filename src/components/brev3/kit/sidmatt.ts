/**
 * Hur stor del av en sida brevet fyller, mätt på det ritade arket (BrevArk)
 * i sidans DOM, aldrig uppskattat. Brevmotorn sätter data-grans (sidans
 * nedre gräns i mm) på arket och .brev-slut sist i brevet; över 1 går
 * brevet över till sida två. Används av Brevet (längdmätaren) och Mallar
 * (raden om två sidor).
 */

/** Väntan efter att arkets HTML bytts, så att arket hunnit ritas och skalas. */
export const BREV_MATT_FORDROJNING_MS = 120

/** Det första arket under `rot` som syns (bredd över noll). */
export function synligtArk(rot: ParentNode, selektor = '.cv.brev'): HTMLElement | null {
  return [...rot.querySelectorAll<HTMLElement>(selektor)].find((e) => e.getBoundingClientRect().width > 0) ?? null
}

/** Andelen av sidan fram till .brev-slut, eller null om arket saknar slutmarkören. */
export function matBrevAndel(ark: HTMLElement): number | null {
  const slut = ark.querySelector<HTMLElement>('.brev-slut')
  if (!slut) return null
  const r = ark.getBoundingClientRect()
  const skala = r.width / (ark.offsetWidth || 1)
  const gransPx = (Number(ark.getAttribute('data-grans')) || 279) * (96 / 25.4) * skala
  return (slut.getBoundingClientRect().top - r.top) / gransPx
}

/** En mätning hör till exakt den HTML som mättes. */
export interface BrevMatt {
  html: string
  andel: number
}

/**
 * Raden om två sidor i Mallar: bara för ett eget brev, bara när mätningen
 * gäller arket som visas nu (aldrig ett gammalt värde medan nytt ark
 * laddas) och bara när brevet går över sidan.
 */
export function visaTvaSidor(p: { egetBrev: boolean; html: string | null; matt: BrevMatt | null }): boolean {
  return p.egetBrev && p.html !== null && p.matt !== null && p.matt.html === p.html && p.matt.andel > 1
}
