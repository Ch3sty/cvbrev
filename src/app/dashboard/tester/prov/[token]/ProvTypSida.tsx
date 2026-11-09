/**
 * Resultatsidan efter kontot för provet utan konto i typerna utöver matrisen
 * (spec-prov-fler-typer-2026-11-09 avsnitt 4, saas-leads slutliga beslut
 * 2026-11-10). Samma sida och samma ordning som matrisens: resultatet, vägen
 * vidare direkt under, sedan genomgången med rätt svar och förklaring.
 *
 * Vägen vidare per typ:
 *   figurserier, deduktivt, verbalt, numeriskt   typens Nivåkoll, som räknar
 *                                                in provets svar (gratis första gången)
 *   spatial förmåga, talserier, ordförråd        typens grundtest (gratis)
 *   I-provet                                     grundtestet i deltestet där hon
 *                                                tappade mest, och övningsprovet i Premium
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { PROV_COPY, type GenomgangUppgift, type NyProvTyp } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import { nivakollHref } from '@/lib/traning/rutter'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { talord } from '@/lib/traning/copy'
import ProvTypGenomgang from './ProvTypGenomgang'

const PANEL = 'rounded-xl border border-kant bg-panel p-4 sm:p-6'
const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

const GRUNDTEST: Record<'spatial' | 'talserie' | 'ordforrad', { href: string; namn: string }> = {
  spatial: { href: '/dashboard/tester/spatial-grund', namn: 'spatial förmåga' },
  talserie: { href: '/dashboard/tester/talserier-grund', namn: 'talserier' },
  ordforrad: { href: '/dashboard/tester/ordforrad-grund', namn: 'ordförråd' },
}

function svensktDatum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(new Date(iso))
}

function versal(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

export default function ProvTypSida({
  typ,
  token,
  skapad,
  uppgifter,
  underlag,
  harNivakoll,
}: {
  typ: NyProvTyp
  token: string
  skapad: string
  uppgifter: GenomgangUppgift[]
  underlag: Record<string, VnUnderlag>
  harNivakoll: boolean
}) {
  const c = PROV_COPY[typ]
  const ratt = uppgifter.filter((u) => ('valt' in u ? u.correct : u.genomgang.correct)).length
  const totalt = uppgifter.length
  const premium = `${paketKort()}, ${prisPeriod(SALD_PLAN)}`

  let vidare: { href: string; knapp: string; rubrik: string; text: string; cta: string }
  if (typ === 'figurserie' || typ === 'deduktiv' || typ === 'verbal' || typ === 'numerisk') {
    vidare = harNivakoll
      ? {
          href: '/dashboard/tester',
          knapp: 'Till dagens pass',
          rubrik: 'Nästa steg: dagens pass',
          text: `Du har gjort Nivåkollen i ${c.namn}. Passet ligger på din nivå och tar några minuter.`,
          cta: `prov-${typ}-pass`,
        }
      : {
          href: nivakollHref(typ),
          knapp: `Kolla min nivå, cirka ${c.nivakollMinuter} min`,
          rubrik: 'Nästa steg: Nivåkollen',
          text: `Dina ${talord(totalt)} svar räknas in. Några uppgifter till, sedan vet du din nivå i ${c.namn} och får ett pass för i dag.`,
          cta: `prov-${typ}-nivakollen`,
        }
  } else if (typ === 'iprov') {
    // Deltestet där hon tappade mest, annars talserierna (I-provets svåraste del för de flesta).
    const tapp = new Map<string, number>()
    for (const u of uppgifter) if (!('valt' in u ? u.correct : u.genomgang.correct)) tapp.set(u.kind, (tapp.get(u.kind) ?? 0) + 1)
    const svagast = ([...tapp].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'talserie') as keyof typeof GRUNDTEST
    const g = GRUNDTEST[svagast] ?? GRUNDTEST.talserie
    vidare = {
      href: g.href,
      knapp: `Gör grundtestet i ${g.namn}`,
      rubrik: `Nästa steg: ${g.namn}`,
      text: `Grundnivån i varje deltest är gratis. Börja med ${g.namn}, där tappade du mest. Hela övningsprovet i I-provets ordning, med tid per deltest, ingår i ${premium}.`,
      cta: 'prov-iprov-grundtest',
    }
  } else {
    const g = GRUNDTEST[typ]
    vidare = {
      href: g.href,
      knapp: `Gör grundtestet i ${g.namn}`,
      rubrik: `Nästa steg: grundtestet`,
      text: `Grundnivån i ${g.namn} är gratis, med genomgång efter testet. Avancerad, expert och pass varje dag ingår i ${premium}.`,
      cta: `prov-${typ}-grundtest`,
    }
  }

  return (
    <>
      <RumHuvud title={`Ditt prov i ${c.namn}, alla svar`} description={`${versal(c.namn)}, ${talord(totalt)} uppgifter. Här ser du vilka du fick rätt, rätt svar och ${c.forklaring} bakom varje uppgift.`} />
      <Golv>
        <div className="w-full max-w-3xl space-y-4 sm:space-y-6" data-prov-typ={typ}>
          <section className={PANEL} aria-labelledby="prov-resultat">
            <h2 id="prov-resultat" className="text-steg uppercase text-ink-3">
              Ditt resultat
            </h2>
            <p className="mt-1 text-meta text-ink-3">{`Provet utan konto, ${talord(totalt)} uppgifter, ${svensktDatum(skapad)}`}</p>
            <div className="mt-2 flex items-baseline gap-2.5">
              <span className="text-tal-display text-ink-1">{ratt}</span>
              <span className="text-sm text-ink-3">{`rätt av ${totalt}`}</span>
            </div>
            <div className="mt-2.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${totalt}, minmax(0, 1fr))` }} aria-hidden="true">
              {uppgifter.map((u) => (
                <span key={u.nyckel} className={`h-1.5 rounded-[3px] ${('valt' in u ? u.correct : u.genomgang.correct) ? 'bg-ink-1' : 'bg-insunken'}`} />
              ))}
            </div>
          </section>

          <section className={PANEL} aria-labelledby="prov-vidare">
            <h2 id="prov-vidare" className="text-kort-t text-ink-1">
              {vidare.rubrik}
            </h2>
            <p className="mt-1 text-sm leading-[22px] text-ink-2">{vidare.text}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link href={vidare.href} data-cta={vidare.cta} className={`${KNAPP_PRIMAR} sm:w-auto`}>
                {vidare.knapp}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {typ === 'iprov' ? (
                <Link href="/dashboard/tester/iprov" data-cta="prov-iprov-ovningsprov" className={TEXTLANK}>
                  I-provet, övningsprov
                </Link>
              ) : (
                <Link href="/dashboard/tester" className={TEXTLANK}>
                  Till rekryteringstesterna
                </Link>
              )}
            </div>
          </section>

          <ProvTypGenomgang uppgifter={uppgifter} underlag={underlag} token={token} />

          <div className="flex">
            <Link href={vidare.href} data-cta={`${vidare.cta}-fot`} className={TEXTLANK}>
              {vidare.knapp}
            </Link>
          </div>
        </div>
      </Golv>
    </>
  )
}
