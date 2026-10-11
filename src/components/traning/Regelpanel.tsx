/**
 * Regeln och misstaget efter svaret (spec-rummen 4.4, konceptets .regel i
 * P2 och P3, testansvarigs beslut 15.7).
 *
 * Rummets ton, radie 14. Överst raden "Inte den här · 52 s" eller
 * "Rätt · 29 s" som eyebrow i ton-ink, sedan regeln ur bankens rule (18/23,
 * bläck; i mörkt läge ton-ink), sedan misstaget för det valda alternativet
 * ur bankens misstag som en egen mening. Saknas misstaget visas bara
 * regeln. Ingen regeltext skrivs här.
 *
 * role="status" och aria-live så att skärmläsaren läser upp utfallet.
 */

export interface RegelpanelProps {
  /** "Inte den här · 52 s" */
  rad: string
  regel: string
  misstag?: string | null
}

export default function Regelpanel({ rad, regel, misstag }: RegelpanelProps) {
  return (
    <div role="status" aria-live="polite" className="regelpanel rounded-[14px] bg-ton px-4 py-3.5 text-ton-ink">
      <p className="text-ey uppercase text-ton-ink">{rad}</p>
      <p className="regelpanel-regel mt-1 font-display text-lg font-bold leading-[23px] tracking-[-.01em]">{regel}</p>
      {misstag ? <p className="mt-1.5 text-sm leading-5 text-ink-2">{misstag}</p> : null}
    </div>
  )
}
