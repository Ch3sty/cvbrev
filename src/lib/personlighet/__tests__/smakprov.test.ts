/**
 * Personlighetsprovet (docs/design/rod-trad-prov-spec-2026-09-24.md):
 * poängsättningen med omvändning, ordningen, valideringen, tolkningen,
 * konsekvensen, kvoten och att facit aldrig når klientkod.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  ANTAL_PASTAENDEN,
  SMAKPROV_PASTAENDEN,
  blandaOrdning,
  block,
  type SkalVarde,
  type SmakprovId,
} from '../smakprov-pastaenden'
import { SMAKPROV_ITEMS, konsekvens, omvandaIds, poangForSmakprov } from '../smakprov-facit'
import { validerBegaran } from '../smakprov-validering'
import {
  KRAVPROFILER,
  faktorUtfall,
  kravUtfall,
  profilMening,
  profilRubrik,
  segment,
  visadPoang,
} from '../smakprov-tolkning'
import { arTillganglig } from '../smakprov-rad'
import { checkIpRateLimit } from '@/lib/rate-limit/ip'

const TOKEN = 'f5ae063c-b3f4-4e16-b441-eed30f9affea'

function alla(v: SkalVarde): Array<{ id: SmakprovId; value: SkalVarde }> {
  return SMAKPROV_PASTAENDEN.map((p) => ({ id: p.id, value: v }))
}

/** Svar som ger maximalt utslag åt det håll `hog` säger per påstående. */
function maxProfil(): Array<{ id: SmakprovId; value: SkalVarde }> {
  return SMAKPROV_ITEMS.map((i) => ({ id: i.id as SmakprovId, value: (i.reverse ? 1 : 5) as SkalVarde }))
}

describe('banken och facit', () => {
  it('tjugo påståenden, fyra per faktor, hälften omvända', () => {
    expect(SMAKPROV_PASTAENDEN).toHaveLength(20)
    expect(ANTAL_PASTAENDEN).toBe(20)
    const perDim = new Map<string, { n: number; omv: number }>()
    for (const i of SMAKPROV_ITEMS) {
      const d = perDim.get(i.dimension) ?? { n: 0, omv: 0 }
      d.n++
      if (i.reverse) d.omv++
      perDim.set(i.dimension, d)
    }
    expect([...perDim.values()]).toEqual(Array(5).fill({ n: 4, omv: 2 }))
    expect(omvandaIds()).toHaveLength(10)
  })

  it('blocken om fyra följer faktorerna', () => {
    for (const i of SMAKPROV_ITEMS) {
      const sammaBlock = SMAKPROV_ITEMS.filter((j) => block(j.id as SmakprovId) === block(i.id as SmakprovId))
      expect(new Set(sammaBlock.map((j) => j.dimension)).size).toBe(1)
    }
  })

  it('inga talstreck i påståendena', () => {
    for (const p of SMAKPROV_PASTAENDEN) expect(p.text).not.toMatch(/—/)
  })
})

describe('poängsättningen med omvändning', () => {
  it('raka 5 och omvända 1 ger 100 på alla fem', () => {
    expect(poangForSmakprov(maxProfil())).toEqual({
      openness: 100,
      conscientiousness: 100,
      extraversion: 100,
      agreeableness: 100,
      neuroticism: 100,
    })
  })

  it('samma svar på allt tar ut sig: 50 per faktor', () => {
    const s = poangForSmakprov(alla(5))
    expect(Object.values(s)).toEqual([50, 50, 50, 50, 50])
  })

  it('ett omvänt påstående vänds: 1 på s-02 höjer samvetsgrannheten', () => {
    const bas = alla(3)
    const upp = bas.map((a) => (a.id === 's-02' ? { ...a, value: 1 as SkalVarde } : a))
    expect(poangForSmakprov(upp).conscientiousness).toBeGreaterThan(poangForSmakprov(bas).conscientiousness)
  })

  it('Stabilitet visas som 100 minus särbarhet', () => {
    const s = poangForSmakprov(maxProfil())
    expect(visadPoang(s, 'stability')).toBe(0)
    expect(faktorUtfall(s).find((f) => f.key === 'stability')?.band).toBe('low')
  })
})

describe('ordningen', () => {
  it('samma token ger samma ordning, alla tjugo en gång', () => {
    const a = blandaOrdning(TOKEN)
    expect(blandaOrdning(TOKEN)).toEqual(a)
    expect(new Set(a).size).toBe(20)
  })

  it('två ur samma faktor står aldrig intill varandra, för hundra tokens', () => {
    for (let n = 0; n < 100; n++) {
      const o = blandaOrdning(`token-${n}`)
      for (let i = 1; i < o.length; i++) expect(block(o[i])).not.toBe(block(o[i - 1]))
    }
  })
})

describe('valideringen', () => {
  const giltig = { token: TOKEN, answers: alla(3), slug: 'personlighetstest-jobb-guide' }

  it('godtar tjugo giltiga svar', () => {
    expect(validerBegaran(giltig)?.answers).toHaveLength(20)
  })

  it('avvisar fel token, fel antal, dubbletter, okända id och värden utanför skalan', () => {
    expect(validerBegaran({ ...giltig, token: 'abc' })).toBeNull()
    expect(validerBegaran({ ...giltig, answers: giltig.answers.slice(1) })).toBeNull()
    const dubblett = [...giltig.answers.slice(1), giltig.answers[1]]
    expect(validerBegaran({ ...giltig, answers: dubblett })).toBeNull()
    const okand = giltig.answers.map((a, i) => (i === 0 ? { id: 's-99', value: 3 } : a))
    expect(validerBegaran({ ...giltig, answers: okand })).toBeNull()
    const sex = giltig.answers.map((a, i) => (i === 0 ? { ...a, value: 6 } : a))
    expect(validerBegaran({ ...giltig, answers: sex })).toBeNull()
    expect(validerBegaran(null)).toBeNull()
  })
})

describe('tolkningen', () => {
  it('meningen tar de två största utslagen', () => {
    const s = { openness: 50, conscientiousness: 90, extraversion: 10, agreeableness: 55, neuroticism: 50 }
    expect(profilMening(s)).toBe('Det rekryteraren lägger märke till först: hög samvetsgrannhet och låg utåtriktning.')
    expect(profilRubrik(s)).toBe('Hög samvetsgrannhet, låg utåtriktning')
  })

  it('en jämn profil får den jämna meningen', () => {
    expect(profilMening(poangForSmakprov(alla(3)))).toMatch(/en jämn profil utan utslag/)
  })

  it('segmenten: 1 till 5, aldrig 0', () => {
    expect([0, 1, 20, 21, 50, 80, 81, 100].map(segment)).toEqual([1, 1, 1, 2, 3, 4, 5, 5])
  })

  it('kravprofilerna ger ord, aldrig procent', () => {
    const s = poangForSmakprov(maxProfil())
    for (const k of KRAVPROFILER) expect(kravUtfall(s, k)).not.toMatch(/%|procent/)
    expect(KRAVPROFILER).toHaveLength(6)
    // Max på allt utom stabilitet (särbarhet 100 = stabilitet 0): Ekonomi kräver stabilitet mitt+.
    expect(kravUtfall(s, KRAVPROFILER[0])).toBe('Räkna med en fråga om stabilitet')
  })
})

describe('konsekvensen', () => {
  it('ärliga svar hänger ihop i alla fem', () => {
    expect(konsekvens(maxProfil())).toBe(5)
    expect(konsekvens(alla(3))).toBe(5)
  })

  it('"stämmer helt" på allt hänger inte ihop någonstans', () => {
    expect(konsekvens(alla(5))).toBe(0)
  })
})

describe('tillgången', () => {
  const NU = Date.parse('2026-09-24T12:00:00Z')
  it('bara ägaren ser en hämtad rad, och den går inte ut', () => {
    const rad = { user_id: null, claimed_by: 'a', expires_at: null }
    expect(arTillganglig(rad, 'a', NU + 400 * 86400000)).toBe(true)
    expect(arTillganglig(rad, 'b', NU)).toBe(false)
  })
  it('en ohämtad rad går ut efter sju dagar', () => {
    expect(arTillganglig({ user_id: null, claimed_by: null, expires_at: '2026-09-23T00:00:00Z' }, 'a', NU)).toBe(false)
  })
})

describe('kvoten: tre per IP och dygn, scope anon_personality', () => {
  function falskAdmin() {
    const rader = new Map<string, number>()
    return {
      from: () => {
        const filter: Record<string, string> = {}
        const q = {
          select: () => q,
          eq: (k: string, v: string) => {
            filter[k] = v
            return q
          },
          maybeSingle: async () => {
            const n = rader.get(`${filter.ip_hash}|${filter.scope}|${filter.window_start}`)
            return { data: n === undefined ? null : { count: n } }
          },
          upsert: async (r: { ip_hash: string; scope: string; window_start: string; count: number }) => {
            rader.set(`${r.ip_hash}|${r.scope}|${r.window_start}`, r.count)
            return { error: null }
          },
        }
        return q
      },
    }
  }

  it('tre prov släpps igenom, det fjärde stoppas', async () => {
    const admin = falskAdmin() as never
    const nu = new Date('2026-09-24T10:00:00Z')
    const svar = []
    for (let i = 0; i < 4; i++) svar.push((await checkIpRateLimit(admin, '1.2.3.4', 'anon_personality', 3, nu)).allowed)
    expect(svar).toEqual([true, true, true, false])
    // En annan IP har egen kvot.
    expect((await checkIpRateLimit(admin, '5.6.7.8', 'anon_personality', 3, nu)).allowed).toBe(true)
  })
})

describe('facit når aldrig klientkod', () => {
  it('ingen fil med use client importerar smakprov-facit', () => {
    const SRC = path.resolve(__dirname, '../../..')
    const traffar: string[] = []
    const gå = (dir: string) => {
      for (const namn of fs.readdirSync(dir)) {
        const full = path.join(dir, namn)
        if (fs.statSync(full).isDirectory()) {
          if (namn !== 'node_modules' && !namn.startsWith('.')) gå(full)
        } else if (/\.tsx?$/.test(namn)) {
          const t = fs.readFileSync(full, 'utf8')
          if (/^\s*['"]use client['"]/.test(t) && t.includes('smakprov-facit')) traffar.push(full)
        }
      }
    }
    gå(SRC)
    expect(traffar).toEqual([])
  })
})
