'use client'

/**
 * En uppgift i text- och sifferpasset (beställning omgång 2, B2), med
 * underlaget överst.
 *
 * Textpasset: texten i en ram som står kvar överst medan påståendena byts
 * (egen rullning när texten är lång), påståendet under och tre lika breda
 * knappar. Sifferpasset: underlaget överst med inledningen och tabellen eller
 * diagrammet (tabellen rullar i sidled i sin egen ram), frågan och
 * alternativen som rader.
 *
 * Efter svaret står alla svar kvar: det valda i bläck, det rätta i koppar
 * med en kopparpunkt, de andra nedtonade. Aldrig rött. Förklaringen under,
 * i rummets ton. Typen (påståendetyp eller misstagstyp) visas aldrig här:
 * den avslöjar regeln.
 *
 * Text- och tabellrenderingen är testvyernas (splitIntoParagraphs,
 * NumericalTable, NumericalChart), inte deras sessionslogik.
 */

import NumericalTable from '@/components/tests/numerical-shared/NumericalTable'
import NumericalChart from '@/components/tests/numerical-shared/NumericalChart'
import { splitIntoParagraphs } from '@/components/tests/verbal-shared/splitParagraphs'
import { VN_PASS_COPY } from '@/lib/tester/pass-copy'
import type { VnAterkoppling, VnKind, VnPunkt, VnUnderlag } from '@/lib/tester/pass-typer'

const C = VN_PASS_COPY

export function Underlag({ kind, underlag }: { kind: VnKind; underlag: VnUnderlag }) {
  if (kind === 'verbal') {
    return (
      <section
        aria-label={underlag.titel}
        className="sticky top-0 z-10 -mx-4 max-h-[42vh] overflow-y-auto border-b border-kant bg-golv px-4 pb-3 pt-1 lg:max-h-[48vh]"
        data-vn-underlag="text"
      >
        <div className="rounded-xl border border-kant bg-panel p-4">
          <h2 className="text-kort text-ink-1">{underlag.titel}</h2>
          <div className="mt-2 space-y-2.5 text-[15px] leading-[24px] text-ink-1">
            {splitIntoParagraphs(underlag.text ?? '').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    )
  }
  return (
    <section aria-label={underlag.titel} className="flex flex-col gap-2.5" data-vn-underlag="siffror">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-kort text-ink-1">{underlag.titel}</h2>
        <span className="shrink-0 text-meta text-ink-3">{C.raknare}</span>
      </div>
      {underlag.kontext ? (
        <div className="rounded-xl border border-kant bg-panel p-3.5 text-sm leading-[22px] text-ink-2">
          {underlag.kontext.split('\n\n').map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {p.trim()}
            </p>
          ))}
        </div>
      ) : null}
      {underlag.tabell ? <NumericalTable data={underlag.tabell} /> : null}
      {underlag.diagram ? <NumericalChart config={underlag.diagram as never} /> : null}
    </section>
  )
}

export interface VnUppgiftProps {
  kind: VnKind
  punkt: VnPunkt
  nr: number
  antal: number
  /** Det valda svaret (id), eller null. */
  vald: string | null
  aterkoppling: VnAterkoppling | null
  last: boolean
  onValj?: (svar: string) => void
}

export function VnUppgift({ kind, punkt, nr, antal, vald, aterkoppling, last, onValj }: VnUppgiftProps) {
  const avslojad = aterkoppling != null
  const ratt = aterkoppling?.ratt ?? null
  const verbal = kind === 'verbal'
  const rattText = ratt ? punkt.alternativ.find((a) => a.id === ratt)?.text ?? null : null
  return (
    <div className="flex flex-col gap-3" data-vn-uppgift={punkt.nyckel}>
      <p className="text-ey uppercase text-ink-3">{verbal ? C.fraga.pastaende(nr, antal) : C.fraga.fraga(nr, antal)}</p>
      <p className="font-display text-[19px] font-bold leading-[26px] tracking-[-.01em] text-ink-1">{punkt.text}</p>
      <div
        role="radiogroup"
        aria-label={C.fraga.svarAria}
        className={verbal ? 'grid grid-cols-3 gap-2' : 'flex flex-col gap-2'}
      >
        {punkt.alternativ.map((a, i) => {
          const arVald = vald === a.id
          const arRatt = avslojad && ratt === a.id
          const dim = avslojad && !arVald && !arRatt
          const kant = arRatt
            ? arVald
              ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar),0_0_0_3px_var(--koppar-mjuk)]'
              : 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]'
            : arVald
              ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]'
              : 'border-kant'
          const tillagg = arVald && arRatt ? ', ditt svar, rätt svar' : arVald ? ', ditt svar' : arRatt ? ', rätt svar' : ''
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={arVald}
              aria-label={`${verbal ? '' : `${String.fromCharCode(65 + i)}. `}${a.text}${tillagg}`}
              disabled={last}
              onClick={() => onValj?.(a.id)}
              className={`relative flex min-h-[52px] touch-manipulation items-center rounded-xl border bg-papper text-ink-1 transition-[border-color,opacity] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koppar motion-reduce:transition-none ${kant} ${
                dim ? 'opacity-[.38]' : ''
              } ${last ? 'cursor-default' : 'active:bg-papper-2'} ${
                verbal ? 'justify-center px-1.5 text-center text-[13px] font-semibold leading-4 sm:text-sm' : 'gap-3 px-3.5 py-2.5 text-left text-[15px] leading-5'
              }`}
            >
              {verbal ? null : (
                <span className={`w-4 shrink-0 text-[12px] font-semibold ${arRatt ? 'text-koppar-ink' : arVald ? 'text-ink-1' : 'text-ink-3'}`} aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span className={verbal ? '' : 'min-w-0 flex-1 tabular-nums'}>{a.text}</span>
              {arRatt ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-koppar" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
      {aterkoppling ? (
        <div role="status" aria-live="polite" className="regelpanel rounded-[14px] bg-ton px-4 py-3.5 text-ton-ink" data-vn-forklaring>
          <p className="flex items-baseline justify-between gap-3">
            <span className="text-ey uppercase text-ton-ink">{C.aterkoppling.forklaring}</span>
            <span className="text-[12px] leading-4 text-ink-3">{aterkoppling.correct ? C.aterkoppling.ratt : C.aterkoppling.fel}</span>
          </p>
          {!aterkoppling.correct && rattText ? (
            <p className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em]">{C.aterkoppling.rattSvar(rattText)}</p>
          ) : null}
          {aterkoppling.forklaring ? <p className="mt-1.5 text-sm leading-[21px] text-ink-1">{aterkoppling.forklaring}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
