// Nivåkollens omfång i texterna ska följa motorerna (plan-testflode etapp 0).
import { describe, expect, it } from 'vitest'
import { NIVAKOLL_URVAL } from '../motor.server'
import { MATNING_ANTAL } from '@/lib/traning/niva'
import { NIVAKOLL_OMFANG, nivakollAntalTid, nivakollKortRad, nivakollOmfang } from '../omfang'
import { omattMeta } from '@/lib/tester/v4/rutter'
import { SPATIAL_NIVAKOLL_FORMER } from '../steg2.server'
import { SEKUNDER_PER_UPPGIFT as SPATIAL_S } from '@/lib/spatialV1/select'
import { MAT_DIG, nivakollMinuterOrd } from '@/lib/tester/v4/copy'

const summa = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

describe('Nivåkollens omfång', () => {
  it('antalen följer motorerna', () => {
    expect(NIVAKOLL_OMFANG.matris.uppgifter).toBe(MATNING_ANTAL)
    expect(NIVAKOLL_OMFANG.figurserie.uppgifter).toBe(summa(NIVAKOLL_URVAL.figurserie))
    expect(NIVAKOLL_OMFANG.deduktiv.uppgifter).toBe(summa(NIVAKOLL_URVAL.deduktiv))
    // Verbalt och numeriskt: en text eller ett underlag per nivå, fyra påståenden eller frågor var.
    expect(NIVAKOLL_OMFANG.verbal.uppgifter).toBe(summa(NIVAKOLL_URVAL.underlag) * 4)
    expect(NIVAKOLL_OMFANG.numerisk.uppgifter).toBe(summa(NIVAKOLL_URVAL.underlag) * 4)
    // Etapp 6: talserier, spatial och ordförråd.
    expect(NIVAKOLL_OMFANG.talserie.uppgifter).toBe(summa(NIVAKOLL_URVAL.talserie))
    expect(NIVAKOLL_OMFANG.spatial.uppgifter).toBe(summa(NIVAKOLL_URVAL.spatial))
    expect(NIVAKOLL_OMFANG.ordforrad.uppgifter).toBe(summa(NIVAKOLL_URVAL.ordforrad))
  })

  it('minuterna för talserier, spatial och ordförråd räknas ur provets tid per uppgift', () => {
    // Talserier 60 s, ordförråd 20 s, spatial per form: vriden figur 30 s, vikning och tärningar 45 s.
    const spatial = summa(Object.fromEntries(Object.entries(SPATIAL_NIVAKOLL_FORMER).map(([n, f]) => [n, f.reduce((s, x) => s + SPATIAL_S[x as 'A'], 0)])))
    expect(NIVAKOLL_OMFANG.talserie.minuter).toBe(Math.round((summa(NIVAKOLL_URVAL.talserie) * 60) / 60))
    expect(NIVAKOLL_OMFANG.spatial.minuter).toBe(Math.round(spatial / 60))
    expect(NIVAKOLL_OMFANG.ordforrad.minuter).toBe(Math.round((summa(NIVAKOLL_URVAL.ordforrad) * 20) / 60))
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.talserie)).toBe('Nio uppgifter, cirka nio minuter')
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.spatial)).toBe('Nio uppgifter, cirka sex minuter')
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.ordforrad)).toBe('Tolv uppgifter, cirka fyra minuter')
  })

  it('texterna per typ, aldrig matrisens tolv och åtta för alla', () => {
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.matris)).toBe('Tolv uppgifter, cirka åtta minuter')
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.figurserie)).toBe('Nio uppgifter, cirka sju minuter')
    expect(nivakollAntalTid(NIVAKOLL_OMFANG.deduktiv)).toBe('Sex uppgifter, cirka åtta minuter')
    expect(nivakollKortRad(NIVAKOLL_OMFANG.verbal)).toBe('Nivåkoll, 5 min')
    expect(nivakollMinuterOrd('figurserie')).toBe('Sju minuter')
    expect(nivakollMinuterOrd('matris')).toBe('Åtta minuter')
    expect(MAT_DIG.nivakollText('numerisk')).toBe('Åtta uppgifter, cirka tio minuter. Högst en om dagen räknas.')
  })

  it('alla åtta typer har Nivåkollen, med typens egen tid (etapp 6)', () => {
    expect(nivakollOmfang('personlighet')).toBeNull()
    expect(omattMeta('talserie')).toBe('Nivåkoll, 9 min')
    expect(omattMeta('spatial')).toBe('Nivåkoll, 6 min')
    expect(omattMeta('ordforrad')).toBe('Nivåkoll, 4 min')
    expect(omattMeta('figurserie')).toBe('Nivåkoll, 7 min')
    expect(omattMeta('matris')).toBe('Nivåkoll, 8 min')
  })
})
