// @vitest-environment node
/**
 * Tärningarnas misstagstexter mot kubdatan (omgång 3, del D). Varje påstående
 * om vilken sida som måste visa vad, om spegelvända tärningar och om sidor
 * som redan syns prövas mot `kub`. Kontrollen ligger i
 * scripts/lib/facit-kontroll.mjs. KANDA är avvikelser som är listade för
 * testansvarig och inte rättade; nya avvikelser fäller testet.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { kollaTarningMisstag } from '../../../../scripts/lib/facit-kontroll.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const alla: Q[] = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/spatialV1/${f}.json`, 'utf8')))

// "X och Y har bytt plats … omvänd ordning jämfört med den första tärningen":
// alternativet är spegelbilden av facit, inte av den första tärningen (en sida
// syns inte på den), och paret står i samma ordning som på den första tärningen.
const KANDA = [
  'sp-a-c-33 alternativ C: inte samma tre sidor som den första tärningen',
  'sp-a-c-36 alternativ C: inte samma tre sidor som den första tärningen',
  'sp-a-c-37 alternativ A: inte samma tre sidor som den första tärningen',
]

describe('tärningarnas misstagstexter', () => {
  it('alla 120 tärningsuppgifter prövas och bara de kända avvikelserna finns', () => {
    const tarningar = alla.filter((q) => q.form === 'C' && q.referens?.kind === 'kub')
    expect(tarningar.length).toBe(120)
    expect(tarningar.flatMap((q) => kollaTarningMisstag(q))).toEqual(KANDA)
  })

  it('en text som pekar på fel symbol fälls', () => {
    const q = JSON.parse(JSON.stringify(alla.find((x) => x.id === 'sp-g-c-01')))
    expect(kollaTarningMisstag(q)).toEqual([])
    q.misstag[1] = 'Med kvadraten och pricken placerade så här måste höger sida visa en stjärna, inte en dubbelring.'
    expect(kollaTarningMisstag(q).join()).toMatch(/höger sida måste visa ring, texten säger stjarna/)
  })
})
