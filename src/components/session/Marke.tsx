/**
 * Sessionens egna märken (omgång 2, steg A): ritade, inte standardikoner.
 * Samma tre märken överallt där rätt och fel visas: svarskorten, de tre
 * fasta knapparna, Förklaringens rubrikrad, Uppgiftslistans rader och det
 * publika provets lista.
 *
 *   ratt  rund bricka, 2 px ring i positiv, vit yta, bocken som en kort och
 *         en lång pennstroke med lätt sväng
 *   fel   samma bricka i fel, krysset som två strokar som möts strax ovanför
 *         mitten
 *   ton   samma bricka i ton-ink med ett streck: vet inte och obesvarad, att
 *         be om förklaringen är inte ett fel
 *
 * `fylld` är radens variant i Uppgiftslistan (skissen Resultat-1440): fylld
 * cirkel i positiv eller fel med vitt tecken, obesvarad på papper-2 med ett
 * streck i ink-3. 22 px där.
 *
 * Fast viewBox 24 och fasta width/height-attribut, så att rutan har sin
 * storlek före CSS (CLS 0). aria-hidden: texten bredvid bär meningen.
 * `pop` ger 240 ms-rörelsen när märket kommer (sess-pop i globals.css, av
 * under prefers-reduced-motion).
 *
 * Ingen 'use client': går att rita på servern (det publika provet, steg C).
 */

export type MarkeTyp = 'ratt' | 'fel' | 'ton'

const FARG: Record<MarkeTyp, string> = {
  ratt: 'var(--positiv)',
  fel: 'var(--fel)',
  ton: 'var(--ton-ink)',
}

export interface MarkeProps {
  typ: MarkeTyp
  /** Yttermått i px. 24 i svarskorten, 28 i Förklaringen, 20 i de tre fasta, 22 i listan. */
  storlek?: number
  /** Radens variant: fylld cirkel med vitt tecken. */
  fylld?: boolean
  /** 240 ms pop när märket kommer. */
  pop?: boolean
  className?: string
}

export default function Marke({ typ, storlek = 24, fylld = false, pop = false, className = '' }: MarkeProps) {
  const klass = `${pop ? 'sess-pop ' : ''}block flex-shrink-0 ${className}`.trim()
  if (fylld) {
    const bg = typ === 'ratt' ? 'var(--positiv)' : typ === 'fel' ? 'var(--fel)' : 'var(--papper-2)'
    const tecken = typ === 'ton' ? 'var(--ink-3)' : 'var(--papper)'
    return (
      <svg viewBox="0 0 24 24" width={storlek} height={storlek} aria-hidden="true" focusable="false" className={klass} data-marke={typ}>
        <circle cx="12" cy="12" r="12" fill={bg} />
        {typ === 'ratt' ? (
          <path d="M7.4 12.3l3 3 6.3-6.6" fill="none" stroke={tecken} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        ) : typ === 'fel' ? (
          <path d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6" fill="none" stroke={tecken} strokeWidth="2.25" strokeLinecap="round" />
        ) : (
          <path d="M7.5 12h9" fill="none" stroke={tecken} strokeWidth="2.5" strokeLinecap="round" />
        )}
      </svg>
    )
  }
  const c = FARG[typ]
  return (
    <svg viewBox="0 0 24 24" width={storlek} height={storlek} aria-hidden="true" focusable="false" className={klass} data-marke={typ}>
      <circle cx="12" cy="12" r="10.5" fill="var(--papper)" stroke={c} strokeWidth="2" />
      {typ === 'ratt' ? (
        <path d="M7.2 12.6c1.3.9 2.4 2.1 3.3 3.5 1.9-3.3 4.2-6.1 6.9-8.3" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : typ === 'fel' ? (
        <path d="M8.3 8.1c2.5 2.3 4.9 4.9 7.4 7.8M15.9 8.3c-2.6 2.4-5.1 4.9-7.6 7.5" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <path d="M8 12h8" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

/** Låset i det publika provets rader och spärren (steg C). */
export function Las({ storlek = 14, className = '' }: { storlek?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={storlek}
      height={storlek}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`block flex-shrink-0 ${className}`}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
