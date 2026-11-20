'use client'

/**
 * Ett testtypkort i omgång 3 (skissens Main, .typ): scenen i väggens färg,
 * namnet, en rad om läget, mätaren med nivån (eller Nivåkollens svar, eller
 * tom mätare) och handlingen nederst. Hela kortet är en knapp som öppnar
 * startarket med sätten att öva; ingen knapp i knappen.
 */

import Link from 'next/link'
import type { TestTypId, TesttypKort } from '@/lib/tester/v4/typer'
import { omattMeta } from '@/lib/tester/v4/rutter'
import { TESTER } from '@/components/tester-v4/tester/copy'
import { knappText } from '@/components/tester-v4/tester/TesttypKort'
import { Las3, Matare3, matareEtikett, Pil3, TypScen } from './delar'
import { tal1, ZON_TEXT, zonFor } from './matt'

export function kortRad(k: TesttypKort, planNamn: string | null): string {
  if (k.niva.status === 'paborjad' && k.niva.svar) return `Nivåkoll påbörjad, ${k.niva.svar.besvarade} av ${k.niva.svar.antal} svar`
  if (k.niva.status !== 'matt' || k.niva.niva == null) return planNamn && k.ingarIPlan ? `Ingår i ${planNamn}, inte mätt än` : 'Inte mätt än'
  const z = zonFor(k.niva.niva)
  return z === 'grund' ? ZON_TEXT.grund : z === 'avancerad' ? 'Avancerad, på provens nivå' : 'Expert, över provens nivå'
}

export default function TypKort3({ kort, planNamn, vald, onOppna }: { kort: TesttypKort; planNamn: string | null; vald: boolean; onOppna: (t: TestTypId) => void }) {
  const lage = kort.niva
  const matt = lage.status === 'matt' && lage.niva != null
  const h = kort.primar
  return (
    <button
      type="button"
      className="t3-typ"
      data-testtyp={kort.id}
      data-vald={vald ? '' : undefined}
      aria-expanded={vald}
      aria-label={`${kort.namn}. ${kortRad(kort, planNamn)}${matt ? `, nivå ${tal1(lage.niva as number)}` : ''}. ${TESTER.kort.oppnaMeny(kort.namn)}`}
      onClick={() => onOppna(kort.id)}
    >
      <span className="t3-typ-scen">
        <TypScen typ={kort.id} />
      </span>
      <span className="t3-typ-kropp">
        <span>
          <span className="t3-typ-namn">{kort.namn}</span>
          <small>{kortRad(kort, planNamn)}</small>
        </span>
        <span className="t3-typ-niv">
          {lage.status === 'paborjad' && lage.svar ? (
            <span className="t3-svarbitar" style={{ gridTemplateColumns: `repeat(${lage.svar.antal}, minmax(0, 1fr))` }} aria-hidden="true">
              {Array.from({ length: lage.svar.antal }, (_, i) => (
                <span key={i} data-svarad={i < lage.svar!.besvarade ? '' : undefined} />
              ))}
            </span>
          ) : matt ? (
            <>
              <Matare3 niva={lage.niva} storlek="liten" etikett={matareEtikett(lage.niva)} />
              <span className="t3-typ-tal">{tal1(lage.niva as number)}</span>
            </>
          ) : (
            <span className="t3-typ-omatt">
              <Matare3 niva={null} storlek="liten" etikett="Ingen nivå än" />
              <small>{omattMeta(kort.id)}</small>
            </span>
          )}
        </span>
        <span className="t3-typ-gor">
          <span className="inline-flex items-center gap-1.5">
            {h.las ? <Las3 size={14} /> : null}
            {h.las ? knappText(h) : h.etikett === 'Fortsätt' ? 'Gör klart Nivåkollen' : h.slag === 'nivakoll' ? 'Gör Nivåkollen' : knappText(h)}
          </span>
          <Pil3 />
        </span>
      </span>
    </button>
  )
}

export function PersonlighetKort3({ gjord, href }: { gjord: boolean; href: string }) {
  return (
    <Link href={href} className="t3-typ" data-testtyp="personlighet">
      <span className="t3-typ-scen">
        <TypScen typ="personlighet" />
      </span>
      <span className="t3-typ-kropp">
        <span>
          <span className="t3-typ-namn">Personlighet</span>
          <small>Inga rätta svar, ingen nivå</small>
        </span>
        <span className="t3-typ-niv">
          <span className="t3-typ-rad">{TESTER.personlighet.text.split('.')[0]}.</span>
        </span>
        <span className="t3-typ-gor">
          {gjord ? TESTER.personlighet.knappGjord : TESTER.personlighet.knapp}
          <Pil3 />
        </span>
      </span>
    </Link>
  )
}
