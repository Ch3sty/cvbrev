/**
 * Brevet i tre stycken (skrivtipsen på /verktyg/personligt-brev). De gamla
 * ritningarna per mall-id ur LETTER_TEMPLATES är borta sedan våg 1
 * (2026-11-21): mallarna visas med brevets egna miniatyrer ur brevmotorn
 * (src/components/publikt/brevmallar.ts). aria-hidden.
 */

/** Brevet i tre stycken: öppningen i koppar, mitten och avslutet i grått. */
export function TreStycken() {
  return (
    <svg viewBox="0 0 200 240" width={200} height={240} fill="none" stroke="var(--ink-1)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
      <rect x="20" y="8" width="160" height="224" rx="10" fill="var(--panel)" />
      <path d="M40 30h44" strokeWidth="3.5" />
      <path d="M40 42h28" stroke="var(--kant-stark)" />
      <rect x="34" y="60" width="4" height="40" rx="2" fill="var(--koppar)" stroke="none" />
      <path d="M48 64h110M48 76h100M48 88h74" />
      <rect x="34" y="112" width="4" height="52" rx="2" fill="var(--kant-stark)" stroke="none" />
      <path d="M48 116h110M48 128h110M48 140h96M48 152h80" />
      <rect x="34" y="176" width="4" height="28" rx="2" fill="var(--kant-stark)" stroke="none" />
      <path d="M48 180h110M48 192h64" />
      <path d="M40 218h40" />
    </svg>
  )
}
