'use client'

/**
 * Annonsfältet i lyftkortet "Skriv ett brev utan konto" (skissen
 * personligt-brev, byggbriefens beslut 6). Ett riktigt fält: annonsen läggs i
 * fliken (sessionStorage, publikt-brev-val.ts) när besökaren trycker på
 * knappen, och startflödet fyller i den. Aldrig i adressen.
 *
 * Knappen är serverns vanliga länk till /skapa-brev/start (children), så att
 * länken står i HTML som förut och fungerar utan JavaScript. Trycket fångas
 * här på vägen ner, före navigeringen.
 */
import { useId, useState, type ReactNode } from 'react'
import { MAX_ANNONS, sparaAnnonsTillStart } from '@/lib/letters/publikt-brev-val'

export default function AnnonsFalt({ children, under }: { children: ReactNode; under?: ReactNode }) {
  const id = useId()
  const [annons, setAnnons] = useState('')
  return (
    <div className="pb-falt">
      <label htmlFor={id}>Annonsen</label>
      <textarea
        id={id}
        value={annons}
        onChange={(e) => setAnnons(e.target.value)}
        maxLength={MAX_ANNONS}
        rows={5}
        placeholder="Klistra in annonsen här, hela texten. Vi läser ut kraven och skriver brevet mot dem."
      />
      <div
        className="pb-falt-rad"
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest('a')) sparaAnnonsTillStart(annons)
        }}
      >
        {children}
        {under}
      </div>
    </div>
  )
}
