import type { NivaLage, PlanV4, TestTypId, UtvecklingsPunkt, UtvecklingV4Data } from '@/lib/tester/v4/typer'
import { TEST_TYP_ORDNING } from '@/lib/tester/v4/typer'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'


export function punkt(typ: TestTypId, dag: string, slag: UtvecklingsPunkt['slag'], niva: number | null, extra: Partial<UtvecklingsPunkt> = {}): UtvecklingsPunkt {

  return {
    id: `${typ}-${dag}-${slag}${extra.raknas === false ? '-ovning' : ''}`,
    typ,
    dag,
    slag,
    niva,
    raknas: true,
    resultat: slag === 'ovningsprov' ? { ratt: 13, antal: 20 } : { ratt: 7, antal: 10 },
    overTid: 0.2,
    href: `/dashboard/tester/pass?session=${typ}-${dag}`,
    ...extra,
  }
}

export const PLAN_ALVA: PlanV4 = {
  mittTest: 'alva',
  namn: 'Alva Logic',
  typer: ['matris'],
  provdatum: '2026-11-25',
  dagarKvar: 6,
  planStart: '2026-11-01',
  dagsmal: 2,
  format: 'Provet har 20 uppgifter med två minuter var.',
  ovningsprov: null,
  franArtikel: false,
}

const matt = (niva: number): NivaLage => ({ status: 'matt', niva, osakerhet: 0.6, tak: 7.5 })
const omatt: NivaLage = { status: 'omatt', niva: null, osakerhet: 0.6, tak: 7.5 }

export function data(over: Partial<UtvecklingV4Data> = {}): UtvecklingV4Data {
  const punkter = over.punkter ?? [
    punkt('matris', '2026-10-11', 'nivakoll', 5.0),
    punkt('matris', '2026-10-13', 'trana', 5.2),
    punkt('matris', '2026-10-18', 'nivakoll', 5.4),
    punkt('matris', '2026-11-12', 'ovningsprov', null, { provNamn: 'Övningsprov Alva' }),
    punkt('matris', '2026-11-17', 'trana', 6.3),
    punkt('deduktiv', '2026-11-02', 'nivakoll', 5.0),
    punkt('deduktiv', '2026-11-14', 'nivakoll', 5.3),
  ]
  const nivaer: Partial<Record<TestTypId, NivaLage>> = { matris: matt(6.3), deduktiv: matt(5.3) }
  return {
    idag: '2026-11-19',
    plan: null,
    typer: TEST_TYP_ORDNING.map((id) => ({ id, namn: DELTYP_NAMN[id], ingarIPlan: false, niva: nivaer[id] ?? omatt })),
    punkter,
    historikLast: false,
    provdag: null,
    matrisMonster: null,
    gratis: {
      premium: true,
      harHistorik: true,
      grundKvarIdag: 1,
      pafyllning: '2026-11-19T23:00:00.000Z',
      nivakollGjord: {},
      pris: { namn: 'Jobbcoach Premium', prisrad: '149 kr i månaden', knapp: 'Öppna allt' },
    },
    paket: { scope: null, track: null, planKey: null },
    ...over,
  }
}
