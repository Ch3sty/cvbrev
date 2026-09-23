'use client'

/**
 * Det gemensamma skalet för de nio kalkylatorerna: fälten, resultatet på
 * bläck, Dela-knappen och Bädda in. Varje kalkylator räknar själv och
 * lämnar hit vad som ska visas.
 *
 * useIndata håller kalkylatorns inmatning, läser en äldre länks parametrar
 * vid första renderingen i webbläsaren (länkar som inte skrivits om till den
 * delade vyn) och håller adressfältet i takt med uträkningen, så att en
 * omladdning eller ett kopierat adressfält ger samma resultat.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { useQuerySynk } from './dela'
import DelaResultat, { BaddaInLank, BaddaInPanel } from './DelaResultat'
import { KalkylatorRam, ResultatYta } from './ui'
import { delningsUrl, type Slug } from '@/lib/rakna/delning'
import { vanligaMellanslag } from '@/lib/rakna/format'
import type { Parametrar } from '@/lib/rakna/sok'
import type { FordelningSegment } from '@/components/shell/Fordelning'

export function useIndata<T>(start: T, las: (sok: URLSearchParams) => T) {
  const [indata, setIndata] = useState<T>(start)
  useEffect(() => {
    if (window.location.search.length > 1) setIndata(las(new URLSearchParams(window.location.search)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [indata, setIndata] as const
}

export interface KalkylatorSkalProps {
  slug: Slug
  /** Kalkylatorns titel, för inbäddningskoden. */
  titel: string
  falt: ReactNode
  etikett: string
  /** Rubriken på bläckytan: förutsättningarna, "35 000 kr i Stockholm". */
  premiss: ReactNode
  tal: string
  enhet: string
  mening: ReactNode
  segment?: readonly FordelningSegment[]
  kalla: string
  /** Extra innehåll på bläckytan under talet: poster, en jämförelse. */
  detaljer?: ReactNode
  parametrar: Parametrar
  /** Delningstexten utan länk. */
  delText: string
}

export default function KalkylatorSkal(p: KalkylatorSkalProps) {
  const [badda, setBadda] = useState(false)
  useQuerySynk(p.parametrar)
  const url = delningsUrl(p.slug, p.parametrar)

  return (
    <KalkylatorRam
      falt={p.falt}
      resultat={
        <ResultatYta
          etikett={p.etikett}
          premiss={p.premiss}
          tal={p.tal}
          segment={p.segment}
          enhet={p.enhet}
          mening={p.mening}
          kalla={p.kalla}
          dela={<DelaResultat url={url} text={vanligaMellanslag(p.delText)} titel={p.titel} />}
          sekundar={<BaddaInLank oppen={badda} onToggle={() => setBadda((b) => !b)} />}
        >
          {p.detaljer}
        </ResultatYta>
      }
      efter={badda ? <BaddaInPanel slug={p.slug} titel={p.titel} /> : null}
    />
  )
}
