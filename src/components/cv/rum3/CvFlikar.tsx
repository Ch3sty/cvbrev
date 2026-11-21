/**
 * Flikraden i CV-rummets vägg: Ditt CV, Mallar och Analys med en underrad
 * som säger vad fliken gör (kort form under 768 px). Testernas klasser
 * (.t3-flikar, .t3-flik) i CV-rummets petrol via de rumsmedvetna
 * tokens i globals.css. Riktiga länkar; valt CV följer med i ?cv=.
 *
 * Server component.
 */
import Link from 'next/link'
import { CV_FLIKAR, flikHref, type CvFlik } from './flikar'

export interface CvFlikarProps {
  aktiv: CvFlik
  /** CV:t som visas, så att det följer med till de andra flikarna. */
  cvId?: string | null
}

export default function CvFlikar({ aktiv, cvId }: CvFlikarProps) {
  return (
    <nav aria-label="CV" className="t3-flikar cv3-flikar" data-cv-flikar>
      {CV_FLIKAR.map((f) => {
        const ar = f.id === aktiv
        return (
          <Link
            key={f.id}
            href={flikHref(f.id, cvId)}
            className="t3-flik"
            data-flik={f.id}
            aria-current={ar ? 'page' : undefined}
            // Ingen förhämtning: flikarna visar alltid färska tal (forhamtaCvSida i flikar.ts).
            prefetch={false}
          >
            <b>{f.namn}</b>
            <small className="hidden md:block">{f.rad}</small>
            <small className="md:hidden">{f.radKort}</small>
          </Link>
        )
      })}
    </nav>
  )
}
