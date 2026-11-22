/**
 * Delningsbilden (og:image och twitter:image) för sidor vars bild är en WebP.
 *
 * Facebook, LinkedIn och flera chattappar visar inte alltid en WebP i
 * förhandsvisningen. Varje sådan bild har därför en JPG-syster i 1200 × 630
 * bredvid sig, framtagen av scripts/artikelbild/delningsbild.ts:
 * /images/artiklar/<slug>-v2.webp får /images/artiklar/<slug>-v2-og.jpg.
 * Sidans JSON-LD och bilden på sidan pekar kvar på WebP-filen.
 */

export const DELNINGSBILD_BREDD = 1200
export const DELNINGSBILD_HOJD = 630
export const DELNINGSBILD_TYP = 'image/jpeg'

const SAJT = 'https://www.jobbcoach.ai'

/** Sökvägen till JPG-systern: samma mapp och namn, med -og.jpg i stället för .webp. */
export function delningsbildSrc(webp: string): string {
  if (!/\.webp$/.test(webp)) throw new Error(`delningsbilden görs bara av en WebP: ${webp}`)
  return webp.replace(/\.webp$/, '-og.jpg')
}

/** Bildposten för openGraph.images och twitter.images, med mått, typ och alt. */
export function delningsbild(webp: string, alt?: string) {
  const src = delningsbildSrc(webp.replace(/^https?:\/\/[^/]+/, ''))
  return {
    url: `${SAJT}${src}`,
    width: DELNINGSBILD_BREDD,
    height: DELNINGSBILD_HOJD,
    type: DELNINGSBILD_TYP,
    ...(alt ? { alt } : {}),
  }
}

/** Räkna ut-hubbens gemensamma bild, på hubben och på varje kalkylator. */
export const RAKNA_UT_DELNINGSBILD = delningsbild(
  '/images/rakna-ut.webp',
  'Räkna ut: kalkylatorer för lön efter skatt, uppsägningstid, semesterersättning och vad en anställd kostar',
)
