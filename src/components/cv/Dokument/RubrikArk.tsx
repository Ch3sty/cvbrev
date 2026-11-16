'use client'

/**
 * Rubrikarket (skissen yta 3, "Två ark som öppnas från dokumentet"): från
 * ett tryck på en rubrik. "Rubrik över dina kompetenser", radioknappar i
 * 48 px-rader ur rubrikbiblioteket, "Skriv egen rubrik" (högst 40 tecken),
 * "Tillbaka till förslagen". Dokumentet bakom uppdateras direkt (ingen
 * dimma). Gratis. Ytan sparar: utkastet på provsidan, cv_texts.section_titles
 * via PUT /api/cv/section-titles inloggat.
 */
import { useEffect, useState } from 'react'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import Ark from './Ark'
import { BIBLIOTEK, RUBRIK_MAX } from '@/lib/cv/rubriker'
import { RUBRIK_ARK } from './texter'

export interface RubrikArkProps {
  sektion: Sektion | null
  /** Rubriken som står på arket nu. */
  nuvarande: string
  /** Har CV:t en egen rubrik vald för avsnittet (annars förslaget)? */
  egenVald: boolean
  onVal: (sektion: Sektion, rubrik: string | null, kalla: 'forslag' | 'egen') => void
  onClose: () => void
}

export default function RubrikArk({ sektion, nuvarande, egenVald, onVal, onClose }: RubrikArkProps) {
  const alternativ = sektion ? BIBLIOTEK[sektion] : []
  const iListan = alternativ.some((a) => a.toLowerCase() === nuvarande.toLowerCase())
  const [egen, setEgen] = useState(!iListan && nuvarande ? nuvarande : '')
  const [skriver, setSkriver] = useState(!iListan && Boolean(nuvarande))

  useEffect(() => {
    const finns = alternativ.some((a) => a.toLowerCase() === nuvarande.toLowerCase())
    setEgen(!finns ? nuvarande : '')
    setSkriver(!finns && Boolean(nuvarande))
    // Bara när arket öppnas för ett nytt avsnitt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sektion])

  if (!sektion) return null

  return (
    <Ark
      open
      onClose={onClose}
      utanDimma
      rubrik={RUBRIK_ARK.over[sektion]}
      fot={
        <div className="flex items-center justify-between gap-3">
          {egenVald ? (
            <button
              type="button"
              onClick={() => {
                onVal(sektion, null, 'forslag')
                onClose()
              }}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
            >
              {RUBRIK_ARK.tillbaka}
            </button>
          ) : (
            <span className="text-meta text-ink-3">{RUBRIK_ARK.foljer}</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl bg-ink-1 px-5 text-sm font-semibold text-papper"
          >
            {RUBRIK_ARK.klar}
          </button>
        </div>
      }
    >
      <div role="radiogroup" aria-label={RUBRIK_ARK.over[sektion]}>
        {alternativ.map((a) => {
          const vald = !skriver && a.toLowerCase() === nuvarande.toLowerCase()
          return (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={vald}
              onClick={() => {
                setSkriver(false)
                onVal(sektion, a, 'forslag')
              }}
              className={`flex min-h-12 w-full items-center gap-2.5 rounded-[10px] px-1.5 text-left text-sm text-ink-1 ${vald ? 'bg-papper-2' : 'hover:bg-papper-2'}`}
            >
              <span aria-hidden className={`h-[18px] w-[18px] shrink-0 rounded-full ${vald ? 'border-[5px] border-ink-1' : 'border-[1.5px] border-kant-stark'}`} />
              {a}
            </button>
          )
        })}
        <button
          type="button"
          role="radio"
          aria-checked={skriver}
          onClick={() => setSkriver(true)}
          className={`flex min-h-12 w-full items-center gap-2.5 rounded-[10px] px-1.5 text-left text-sm text-ink-1 ${skriver ? 'bg-papper-2' : 'hover:bg-papper-2'}`}
        >
          <span aria-hidden className={`h-[18px] w-[18px] shrink-0 rounded-full ${skriver ? 'border-[5px] border-ink-1' : 'border-[1.5px] border-kant-stark'}`} />
          {RUBRIK_ARK.egen}
        </button>
        {skriver ? (
          <input
            autoFocus
            value={egen}
            maxLength={RUBRIK_MAX}
            placeholder={RUBRIK_ARK.egenPlats}
            onChange={(e) => {
              setEgen(e.target.value)
              const t = e.target.value.trim()
              if (t) onVal(sektion, t.slice(0, RUBRIK_MAX), 'egen')
            }}
            className="mt-1 h-12 w-full rounded-[10px] border border-kant-stark bg-papper px-3 text-[15px] text-ink-1 outline-none focus:border-ink-1"
          />
        ) : null}
      </div>
    </Ark>
  )
}
