/**
 * Textpasset och sifferpasset på hemvyn (beställning omgång 2, B2): rader
 * under dagens pass när planen har verbalt eller numeriskt, bock när passet
 * är gjort, låst för gratis.
 */
import { describe, expect, it } from 'vitest'
import { byggHemvy, vnPassSektion, type Sektion } from '../hemvy'
import { fixtur } from '../forhandsvisning'

const KOLL = { verbal: { niva: 4.2, dag: '2026-11-08' }, numerisk: { niva: 5.1, dag: '2026-11-08' } }

function medPlan(testtyper: string[], betalande: boolean, gjord = { verbal: false, numerisk: false }, nivakoll: Record<string, { niva: number; dag: string }> = KOLL) {
  const inp = fixtur('1b')
  const s = inp.status!
  return {
    ...inp,
    status: {
      ...s,
      plan: { ...(s.plan ?? { user_id: 'u', leverantor: null, variant: null, provdatum: null, sikte: null, utfall: null, utfall_svarat_at: null, utfall_fraga_igen_at: null }), testtyper },
      behorighet: { harOvanGrund: betalande, harProvlage: betalande, harHistorik: betalande },
      vnPassIdag: gjord,
      nivakoll,
    },
  }
}

const rader = (sektioner: Sektion[]) => sektioner.find((x) => x.typ === 'rader' && x.nyckel === 'vnpass') as Extract<Sektion, { typ: 'rader' }> | undefined

describe('text- och sifferpassen på hemvyn', () => {
  it('rader för de valda testtyperna, länk för Premium, bock när gjort', () => {
    const m = byggHemvy(medPlan(['matris', 'verbal', 'numerisk'], true, { verbal: true, numerisk: false }))
    const r = rader(m.sektioner)!
    expect(r.rader.map((x) => x.titel)).toEqual(['Textpass', 'Sifferpass'])
    expect(r.rader[0].hoger).toEqual({ typ: 'bock', text: 'Gjort' })
    expect(r.rader[1].hoger).toMatchObject({ typ: 'lank', href: '/dashboard/tester/pass?typ=sifferpass' })
  })
  it('gratis: raden låst med Ingår i Premium', () => {
    const m = byggHemvy(medPlan(['matris', 'verbal'], false, undefined, { verbal: KOLL.verbal }))
    const r = rader(m.sektioner)!
    expect(r.rader).toHaveLength(1)
    expect(r.rader[0].hoger).toMatchObject({ typ: 'las', text: 'Ingår i Premium' })
  })
  it('utan Nivåkoll för typen leder raden till Nivåkollen, gratis och olåst (testplanen steg 1)', () => {
    const m = byggHemvy(medPlan(['matris', 'verbal'], false, { verbal: false, numerisk: false }, {}))
    const r = rader(m.sektioner)!
    expect(r.rader[0].hoger).toEqual({ typ: 'lank', text: 'Kolla min nivå', href: '/dashboard/tester/pass?typ=nivakoll&kind=verbal' })
  })
  it('Nivåkollen ensam ger raden även när planen saknar typen', () => {
    const s = medPlan(['matris'], true, { verbal: false, numerisk: false }, { numerisk: KOLL.numerisk }).status
    const sek = vnPassSektion(s, ['matris']) as Extract<Sektion, { typ: 'rader' }>
    expect(sek.rader.map((x) => x.titel)).toEqual(['Sifferpass'])
  })
  it('inga rader utan verbalt eller numeriskt i planen', () => {
    expect(vnPassSektion(medPlan(['matris'], true, undefined, {}).status, ['matris'])).toBeNull()
  })
})
