'use client'

/**
 * Mallraden under remsan och mallarket (skissen yta 1: "Panel  PDF  Word
 * ingår i Premium" och raden under med nivå, pris och stil). Trycket på
 * namnet öppnar arket med beskrivningen och formatet.
 */
import { useState } from 'react'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonInfo, IkonPdf, IkonWord } from '@/components/illustrations/MallIkoner'
import Ark from './Ark'
import { FORMAT, MALL_ARK, REMSA } from './texter'

export interface MallradProps {
  mall: MallKort
  /** "149 kr i månaden" (eller kampanjens), för premiummallar. */
  pris?: string
  /** Word är öppet för mallen: gratismall, eller kontot har Premium. */
  harWord?: boolean
}

export default function Mallrad({ mall, pris, harWord }: MallradProps) {
  const [open, setOpen] = useState(false)
  const underrad =
    mall.niva === 'premium' && pris ? `${REMSA.niva.premium}, ${pris}. ${mall.stil}` : `${REMSA.niva[mall.niva]}. ${mall.stil}`
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 font-semibold text-ink-1 hover:bg-papper-2"
          aria-haspopup="dialog"
        >
          {mall.namn}
          <IkonInfo size={15} className="text-ink-3" />
        </button>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[.02em] text-ink-2">
            <IkonPdf size={16} />
            {FORMAT.pdf}
          </span>
          {mall.word ? (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold tracking-[.02em] ${harWord ? 'text-ink-2' : 'text-ink-3 opacity-70'}`}>
              <IkonWord size={16} />
              {harWord ? FORMAT.word : FORMAT.wordIngarPremium}
            </span>
          ) : null}
        </span>
      </div>
      <p className="text-meta text-ink-3">{underrad}</p>

      <Ark open={open} onClose={() => setOpen(false)} rubrik={mall.namn} under={`${REMSA.niva[mall.niva]}${mall.niva === 'premium' && pris ? `, ${pris}` : ''}`}>
        <div className="grid gap-3 pb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mall.bild.stor} alt="" className="mx-auto w-40 rounded-md border border-kant bg-white" />
          <div>
            <p className="text-ey uppercase text-ink-3">{MALL_ARK.passar}</p>
            <p className="mt-1 text-sm text-ink-1">{mall.stil}</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-ink-2">
            {mall.word ? <IkonWord size={18} /> : <IkonPdf size={18} />}
            {mall.word ? (mall.niva === 'gratis' ? MALL_ARK.wordGratis : MALL_ARK.word) : MALL_ARK.baraPdf}
          </p>
        </div>
      </Ark>
    </div>
  )
}
