// @vitest-environment node
/**
 * Tärningarnas misstagstexter mot kubdatan (omgång 3, del D). Varje påstående
 * om vilken sida som måste visa vad, om spegelvända tärningar och om sidor
 * som redan syns prövas mot `kub`. Kontrollen ligger i
 * scripts/lib/facit-kontroll.mjs. Inga kända avvikelser: alla texter prövas.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { kollaTarningMisstag } from '../../../../scripts/lib/facit-kontroll.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const alla: Q[] = ['bankGrund', 'bankAvancerad', 'bankExpert'].flatMap((f) => JSON.parse(readFileSync(`src/lib/spatialV1/${f}.json`, 'utf8')))
const uppgift = (id: string) => JSON.parse(JSON.stringify(alla.find((x) => x.id === id)))

describe('tärningarnas misstagstexter', () => {
  it('alla 120 tärningsuppgifter prövas och stämmer mot kubdatan', () => {
    const tarningar = alla.filter((q) => q.form === 'C' && q.referens?.kind === 'kub')
    expect(tarningar.length).toBe(120)
    expect(tarningar.flatMap((q) => kollaTarningMisstag(q))).toEqual([])
  })

  it('de omskrivna texterna (omgång 3) beskriver det verkliga felet', () => {
    // Spegelbilden av rätt svar, inte av den första tärningen.
    for (const [id, i] of [['sp-a-c-33', 2], ['sp-a-c-36', 2], ['sp-a-c-37', 0]] as const) {
      const q = uppgift(id)
      expect(q.misstag[i], id).toMatch(/^Spegelvänd\. \S+ och \S+ har bytt plats jämfört med rätt svar/)
      expect(kollaTarningMisstag(q), id).toEqual([])
    }
    // Pricken står till vänster här men till höger i rätt svar.
    expect(uppgift('sp-g-c-01').misstag[1]).toMatch(/^Här står pricken till vänster, inte till höger som i rätt svar\./)
  })

  it('en text som pekar på fel symbol eller fel par fälls', () => {
    const q = uppgift('sp-g-c-01')
    expect(kollaTarningMisstag(q)).toEqual([])
    q.misstag[1] = 'Med kvadraten och pricken placerade så här måste höger sida visa en stjärna, inte en dubbelring.'
    expect(kollaTarningMisstag(q).join()).toMatch(/höger sida måste visa ring, texten säger stjarna/)
    const r = uppgift('sp-a-c-33')
    r.misstag[2] = 'Spegelvänd. Stjärnan och triangeln har bytt plats jämfört med rätt svar, och en tärning går aldrig att vrida till sin spegelbild.'
    expect(kollaTarningMisstag(r).join()).toMatch(/inte rätt svar med stjarna och triangel utbytta/)
  })
})
