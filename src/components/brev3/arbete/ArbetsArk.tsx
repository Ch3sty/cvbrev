'use client'

/**
 * Brevets ark i arbetsläget. På dator 480 px brett och ritat i rätt skala
 * redan vid serverrenderingen; på telefonen mäts behållaren (ArbetsYta ger
 * den full bredd i Brevet och 132 px i Skriv). Två ark i DOM:en, ett per
 * skärmform, så att datorns ark aldrig väntar på en mätning.
 */
import { forwardRef, type ReactNode } from 'react'
import { BrevArk } from '@/components/brev3/ark'

interface Props {
  html: string
  ariaLabel: string
  saknatKrav?: { nr: number; stycke: number } | null
  onStycke?: (i: number) => void
  /** Ligger över datorns ark (skrivbrickan i Skriv). */
  overlay?: ReactNode
  /** Visa telefonens ark (av när telefonen inte ska rita något, t.ex. i Målgången). */
  telefon?: boolean
}

const ArbetsArk = forwardRef<HTMLDivElement, Props>(function ArbetsArk({ html, ariaLabel, saknatKrav, onStycke, overlay, telefon = true }, ref) {
  return (
    <>
      <div ref={ref} className="relative hidden xl:block">
        <BrevArk html={html} bredd={480} lage="arbete" saknatKrav={saknatKrav} onStycke={onStycke} ariaLabel={ariaLabel} />
        {overlay}
      </div>
      {telefon ? (
        <div className="xl:hidden">
          <BrevArk html={html} lage="arbete" saknatKrav={saknatKrav} onStycke={onStycke} ariaLabel={ariaLabel} />
        </div>
      ) : null}
    </>
  )
})

export default ArbetsArk
