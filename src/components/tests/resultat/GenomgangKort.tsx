'use client'

/**
 * Det lyfta kortet på resultatsidan (skiss Provbladet, avsnitt 3, steg s3):
 * genomgången av det som gick fel, med de missade frågorna som små provblad.
 * Vyns enda kopparknapp.
 *
 * Matrislogiken ritar matrisen i 80 px utan svarsalternativ (MatrisMiniatyr).
 * Verbalt och numeriskt visar påståendet eller frågan som en kort
 * textmarkering, den markerade raden i provbladets bild.
 */

import Link from 'next/link'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import MatrisMiniatyr from '@/components/tests/shared/reviews/MatrisMiniatyr'
import type { GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'
import type { ResultatFraga } from '@/lib/tester/resultat'
import { RESULTAT, type Sakord } from '@/lib/tester/copy'

const RAD = 'mt-3.5 flex flex-col items-stretch gap-2.5 lg:flex-row lg:items-center lg:gap-[18px]'

export interface GenomgangKortProps {
  lage: 'missar' | 'alla-ratt' | 'saknas'
  missar: ResultatFraga[]
  totalt: number
  /** Matrislogikens frågor i visad ordning, för miniatyrerna. */
  genomgang?: GenomgangsFraga[] | null
  sak: Sakord
  regel: string
  /** "Två av tre är samma familj: ..." eller null. */
  samma?: string | null
  hubHref: string
  gorOm: string
  /** Öppnar genomgången, med missarna (eller en fråga) utfällda. */
  onGaIgenom: (nr?: number) => void
  onVisaAlla: () => void
  className?: string
}

const VISAS = 3

export default function GenomgangKort(p: GenomgangKortProps) {
  const visade = p.missar.slice(0, VISAS)

  let titel: string
  let text: string
  if (p.lage === 'saknas') {
    titel = RESULTAT.genomgang.saknas
    text = RESULTAT.genomgang.saknasText
  } else if (p.lage === 'alla-ratt') {
    titel = RESULTAT.genomgang.allaRatt
    text = RESULTAT.genomgang.allaRattText
  } else {
    titel = RESULTAT.genomgang.titel(p.missar.length, p.sak)
    text = [p.regel, p.samma].filter(Boolean).join(' ')
  }

  return (
    <section
      aria-label={RESULTAT.genomgang.rub}
      className={`relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft ${p.className ?? ''}`}
    >
      <p className="text-ey text-koppar-ink">{RESULTAT.genomgang.rub}</p>
      <h2 className="mt-1 text-kort-t text-ink-1">{titel}</h2>
      <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{text}</p>

      {p.lage === 'missar' && visade.length > 0 ? (
        <ul className="mt-3 grid max-w-[420px] grid-cols-3 gap-2.5" data-missar>
          {visade.map((f) => {
            const fraga = p.genomgang?.[f.nr - 1]
            return (
              <li key={f.nr} className="min-w-0">
                <button
                  type="button"
                  onClick={() => p.onGaIgenom(f.nr)}
                  className="block h-full w-full rounded-xl border border-kant bg-papper p-2 text-left hover:border-kant-stark sm:p-2.5"
                >
                  {fraga ? (
                    <MatrisMiniatyr fraga={fraga} />
                  ) : (
                    <span className="block aspect-square overflow-hidden rounded-md border border-kant bg-papper-2 p-1.5">
                      <span lang="sv" className="line-clamp-5 hyphens-auto text-[11px] leading-[15px] text-ink-1 [overflow-wrap:anywhere]">
                        <mark className="rounded-sm bg-ton px-0.5 text-ink-1 [box-decoration-break:clone]">{f.text}</mark>
                      </span>
                    </span>
                  )}
                  <b className="mt-2 block truncate text-xs font-semibold leading-4 text-ink-1 sm:text-[13px] sm:leading-[17px]">{RESULTAT.genomgang.nr(f.nr, p.sak)}</b>
                  {f.grupp || f.kalla ? (
                    <span className="line-clamp-2 block text-xs leading-4 text-ink-3">{f.grupp ?? f.kalla}</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className={RAD}>
        {p.lage === 'saknas' ? (
          <Link href={p.hubHref} className={`${KNAPP_PRIMAR} lg:w-auto`}>
            {p.gorOm}
          </Link>
        ) : p.lage === 'alla-ratt' ? (
          <button type="button" onClick={p.onVisaAlla} className={`${KNAPP_PRIMAR} lg:w-auto`}>
            {RESULTAT.genomgang.visaGenomgang}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => p.onGaIgenom()} className={`${KNAPP_PRIMAR} lg:w-auto`}>
              {RESULTAT.genomgang.knapp(p.missar.length, p.sak)}
            </button>
            <button type="button" onClick={p.onVisaAlla} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
              {RESULTAT.genomgang.visaAlla(p.totalt)}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
