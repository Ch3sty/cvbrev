// Nivåkollens omfång i texterna ska följa motorerna (plan-testflode etapp 0).
import { describe, expect, it } from 'vitest'
import { NIVAKOLL_URVAL } from '../motor.server'
import { MATNING_ANTAL } from '@/lib/traning/niva'
import { NIVAKOLL_OMFANG, nivakollAntalTid, nivakollKortRad, nivakollOmfang } from '../omfang'
import { omattMeta } from '@/lib/tester/v4/rutter'
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

  it('typer utan Nivåkoll får nivåtestet', () => {
    expect(nivakollOmfang('talserie')).toBeNull()
    expect(omattMeta('talserie')).toBe('Nivåtest, 15 uppgifter')
    expect(omattMeta('ordforrad')).toBe('Nivåtest, 20 uppgifter')
    expect(omattMeta('figurserie')).toBe('Nivåkoll, 7 min')
    expect(omattMeta('matris')).toBe('Nivåkoll, 8 min')
  })
})
