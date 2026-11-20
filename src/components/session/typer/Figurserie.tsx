'use client'

/**
 * Figurserier i ramen (plan-testflode-2026-11-20 avsnitt 3.3, omgång 3 steg
 * 2a: skissens Test-figurserier, Test-figurserier-bryter och
 * Mobil-figurserier-tva), samma uppgift i alla lägen.
 *
 *   Härnäst  brädet med fem figurer och luckan sist, numrerade 1 till 6.
 *            På dator en rad om sex i en kolumn om 900 med frågan överst och
 *            sex klossar i rad under. På telefonen två rader om tre (brickorna
 *            minst 72 px) med pilar mellan och en böjd linje från radslut till
 *            radstart, frågan under brädet och svaren två och två ner till
 *            foten. Bytet sker på kolumnens bredd (container query), inte på
 *            fönstrets. Efter facit står rätt figur i luckan på grön bricka.
 *   Bryter   de sex brickorna på brädet är själva svaren, med tangentbrickan
 *            uppe till vänster och etiketten efter facit.
 *
 * Figurerna är V7-renderarnas: i väggfärg på brickan, i figurens bläck i
 * klossarna, med tjock linje. Alla rutor har aspect-ratio (CLS 0).
 */

import { FigurV7 } from '@/lib/logicTestV7/layered.v7'
import type { V7Cell } from '@/lib/logicTestV7/types.v7'
import { FIGUR_PASS_COPY } from '@/lib/tester/pass-copy'
import { useRubrikTagg } from '@/components/tests/RubrikTagg'
import { BOKSTAV, Pill, SvarRuta, Tangent, tillstandFor } from '../Svarskort'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'
import { SerieMiniatyr } from '@/components/tests/serie/FigurserieRad'
import { BradeLucka } from './Matris'

/** Etiketten på den figur som bryter mönstret, efter facit (skissen). */
const BRYTER_ETIKETT = 'Bryter'

export interface FigurserieU extends RamUppgift {
  form: 'harnast' | 'bryter'
  rad: V7Cell[]
  options: V7Cell[]
}

/** Pilen mellan brickorna i tvåradsbrädet. */
export function SeriePil() {
  return (
    <span className="sess-serie-pil" aria-hidden="true">
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2l4 4-4 4" />
      </svg>
    </span>
  )
}

/**
 * Den böjda linjen från första radens slut till andra radens början
 * (skissens Mobil-figurserier-tva och Mobil-talserier-par-tva), i radens
 * designmått. Strecket behåller sin bredd när linjen sträcks.
 */
export function SerieOrm({ bredd, hojd, radMitt, mitt, rad2Mitt }: { bredd: number; hojd: number; radMitt: number; mitt: number; rad2Mitt: number }) {
  const h = bredd
  const v = (n: number) => +n.toFixed(1)
  const d = `M${v(h + 4)} ${radMitt}H${v(h + 6)}Q${v(h + 14)} ${radMitt} ${v(h + 14)} ${radMitt + 8}V${mitt - 8}Q${v(h + 14)} ${mitt} ${v(h + 6)} ${mitt}H-6Q-14 ${mitt} -14 ${mitt + 8}V${rad2Mitt - 8}Q-14 ${rad2Mitt} -6 ${rad2Mitt}`
  return (
    <svg className="sess-serie-orm h-full w-full" viewBox={`0 0 ${bredd} ${hojd}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={`M-11 ${rad2Mitt - 6.5}l6.5 6.5-6.5 6.5`} fill="none" stroke="var(--sess-brade-ink-2)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Härnäst: brädet med fem figurer och luckan, numrerade. */
function SerieBrade({ u, facit }: { u: FigurserieU; facit: number | null }) {
  const fylld = facit != null ? u.options[facit] : null
  const n = u.rad.length + 1
  return (
    <div
      role="img"
      aria-label={`Serien läses rad för rad från vänster: ${u.rad.length} figurer och en lucka på plats ${n}`}
      className="matrisyta sess-brade sess-seriebrade"
      data-serie-kort
      data-serie-rad="anpassad"
    >
      <div className="sess-serie-rad" data-serie>
        {u.rad.map((c, i) => (
          <div key={i} className="sess-serie-plats">
            <div className="relative">
              <div className="sess-brade-ruta sess-fig-ruta">
                <FigurV7 cell={c} />
              </div>
              {i % 3 !== 2 ? <SeriePil /> : null}
            </div>
            <span className="sess-serie-nr" aria-hidden="true">
              {i + 1}
            </span>
          </div>
        ))}
        <div className="sess-serie-plats">
          {fylld ? (
            <div className="sess-brade-ruta sess-fig-ruta" data-fylld="" data-lucka="fylld">
              <FigurV7 cell={fylld} />
            </div>
          ) : (
            <BradeLucka />
          )}
          <span className="sess-serie-nr" data-lucka="" aria-hidden="true">
            {n}
          </span>
        </div>
        <span className="pointer-events-none absolute inset-0" aria-hidden="true">
          <SerieOrm bredd={328} hojd={268} radMitt={50} mitt={134} rad2Mitt={196} />
        </span>
      </div>
    </div>
  )
}

/** Bryter mönstret: brickorna på brädet är svaren. */
function BryterBrade({ u, vald, facit, onValj, last }: Pick<UppgiftProps<FigurserieU>, 'u' | 'vald' | 'facit' | 'onValj' | 'last'>) {
  return (
    <div className="matrisyta sess-brade sess-seriebrade" data-serie-rad="anpassad" data-serie-kort>
      <div role="radiogroup" aria-label="Sex figurer, välj den som bryter mönstret" className="sess-serie-rad" data-serie>
        {u.rad.map((c, i) => {
          const t = tillstandFor(i, vald, facit)
          return (
            <div key={i} className="sess-serie-plats">
              <button
                type="button"
                role="radio"
                aria-checked={t === 'vald' || t === 'fel' || (t === 'ratt' && vald === i)}
                aria-label={`Figur ${BOKSTAV(i)}${t === 'ratt' ? ', den som bryter mönstret' : t === 'fel' ? ', ditt svar, fel' : ''}`}
                disabled={last}
                onClick={() => onValj?.(i)}
                data-tillstand={t}
                data-svar={BOKSTAV(i)}
                className="sess-bryter-ruta sess-fig-ruta touch-manipulation"
              >
                <Tangent tecken={BOKSTAV(i)} tillstand={t} className="absolute left-[7px] top-[7px] z-10 lg:left-2.5 lg:top-2.5" />
                {t === 'fel' ? (
                  <Pill tillstand="fel" className="absolute right-1.5 top-2 z-10 hidden min-[400px]:inline-flex lg:right-2.5 lg:top-2.5" />
                ) : t === 'ratt' ? (
                  <span className="sess-pill sess-etikett absolute right-1.5 top-2 z-10 hidden min-[400px]:inline-flex lg:right-2.5 lg:top-2.5" data-pill="ratt">
                    {BRYTER_ETIKETT}
                  </span>
                ) : null}
                <FigurV7 cell={c} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FigurserieUppgift({ u, vald, facit, efterFel, onValj, last }: UppgiftProps<FigurserieU>) {
  const bryter = u.form === 'bryter'
  // p i artiklarnas provruta (RubrikTagg, omgång 2 steg C), annars h2.
  const Rubrik = useRubrikTagg()
  return (
    <div className="flex flex-1 flex-col gap-3.5 lg:gap-5" data-figurserie-uppgift={u.form} data-brade-layout="serie" data-fyll-hojd={bryter ? undefined : ''}>
      <div className="lg:order-first">
        <Rubrik tabIndex={-1} data-uppgift-rubrik className="text-fraga text-ink-1 outline-none">
          {bryter ? FIGUR_PASS_COPY.fraga.bryter : FIGUR_PASS_COPY.fraga.harnast}
        </Rubrik>
        {bryter ? <p className="mt-1 text-sm leading-5 text-ink-2">{FIGUR_PASS_COPY.fraga.bryterHjalp}</p> : null}
      </div>
      {bryter ? (
        <div className="order-first lg:order-none">
          <BryterBrade u={u} vald={vald} facit={facit} onValj={onValj} last={last} />
        </div>
      ) : (
        <>
          <div className="order-first lg:order-none">
            <SerieBrade u={u} facit={facit} />
          </div>
          <div role="radiogroup" aria-label="Svarsalternativ" className="matrisyta sess-fig sess-serie-svar flex-1" data-serie-alt>
            {u.options.map((o, i) => (
              <SvarRuta
                key={i}
                i={i}
                tillstand={tillstandFor(i, vald, facit)}
                ditt={facit != null && vald === i}
                efterFel={efterFel}
                disabled={last}
                onValj={onValj}
              >
                <FigurV7 cell={o} />
              </SvarRuta>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const FIGURSERIE: TypRitare<FigurserieU> = {
  kind: 'figurserie',
  namn: 'Figurserier',
  form: 'remsa',
  antalAlternativ: (u) => (u.form === 'bryter' ? u.rad.length : u.options.length),
  Uppgift: FigurserieUppgift,
  Miniatyr: ({ u }) => <SerieMiniatyr rad={u.rad} form={u.form} ratt={null} fast />,
}
