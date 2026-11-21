/**
 * Väggen i Dina brev och Mallar (skissens Main, Hem-ny, Mallar och
 * Mobil-hem): plommon, cirkeln uppe till höger, fast höjd så att panelen
 * under alltid lyfts lika mycket (558 px på dator, 438 px på telefonen; Hem-ny
 * ritar 664 på dator). Innehållet (flikarna, raden, hjälten) kommer som
 * children och står i en 1120 px bred spalt på dator.
 *
 * kulle: kullen längs nederkanten, som i Mallar. På Dina brev står kullarna i
 * banan (BrevBana) och väggen har ingen egen.
 *
 * Serverkomponent.
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

export interface BrevVaggProps {
  children: ReactNode
  /** Höjd på dator i px. 558 i Main och Mallar, 664 i Hem-ny. */
  hojd?: number
  /** Höjd på telefonen i px. 438 i Mobil-hem. */
  hojdMobil?: number
  /** Kullen längs nederkanten (Mallar). */
  kulle?: boolean
  /** Landmärkets namn för skärmläsare, t.ex. "Nästa steg". */
  etikett?: string
  className?: string
}

export function BrevVagg({ children, hojd = 558, hojdMobil = 438, kulle, etikett, className }: BrevVaggProps) {
  const stil = { ['--b3-vagg-h' as string]: `${hojd}px`, ['--b3-vagg-h-mobil' as string]: `${hojdMobil}px` } as CSSProperties
  return (
    <section className={className ? `b3-vagg ${className}` : 'b3-vagg'} style={stil} aria-label={etikett}>
      <div className="b3-vagg-dekor" aria-hidden="true">
        <span className="b3-vagg-cirkel" />
        {kulle ? (
          <svg className="b3-vagg-kulle" viewBox="0 400 1440 158" preserveAspectRatio="none">
            <path d="M0 558V470C300 420 620 520 900 460S1300 400 1440 430V558Z" style={{ fill: 'var(--b3-kulle-1)' }} />
          </svg>
        ) : null}
      </div>
      <div className="b3-vagg-inre">{children}</div>
    </section>
  )
}

export type BrevFlik = 'dina-brev' | 'mallar'

/**
 * Flikarna överst i väggen: Dina brev och Mallar, med en rad om vad sidan
 * gör. Riktiga länkar; den aktiva bär aria-current="page". På telefonen delar
 * de bredden och Mallar säger "Samma som ditt CV".
 */
export function BrevFlikar({ aktiv, hrefDinaBrev, hrefMallar }: { aktiv: BrevFlik; hrefDinaBrev: string; hrefMallar: string }) {
  const flikar = [
    { id: 'dina-brev' as const, href: hrefDinaBrev, namn: 'Dina brev', rad: 'Läget och nästa steg', radKort: 'Läget och nästa steg' },
    { id: 'mallar' as const, href: hrefMallar, namn: 'Mallar', rad: 'Samma mall som ditt CV', radKort: 'Samma som ditt CV' },
  ]
  return (
    <nav className="b3-flikar" aria-label="Personliga brev">
      {flikar.map((f) => {
        const ar = f.id === aktiv
        return (
          <Link key={f.id} href={f.href} className="b3-flik" aria-current={ar ? 'page' : undefined} prefetch={ar ? false : undefined}>
            <b>{f.namn}</b>
            <small className="hidden xl:block">{f.rad}</small>
            <small className="xl:hidden">{f.radKort}</small>
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Telefonens ark i väggen med kravtalet i en rund bricka (Mobil-hem, till
 * höger om rubriken). children är brevets miniatyr. Utan tal visas bara arket.
 */
export function VaggArk({ children, href, etikett, tal, av }: { children: ReactNode; href: string; etikett: string; tal?: number | null; av?: number | null }) {
  return (
    <Link href={href} className="b3-vaggark" aria-label={etikett}>
      <span className="b3-vaggark-ark" aria-hidden="true">
        {children}
      </span>
      {tal != null ? (
        <span className="b3-vaggark-tal" aria-hidden="true">
          {tal}
          {av != null ? <small>/{av}</small> : null}
        </span>
      ) : null}
    </Link>
  )
}
