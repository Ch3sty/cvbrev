import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * CTA-block för rekryterarinsikter. Används i MDX och som avslutning
 * på varje insikt. Pekar ALLTID mot rekryterarflödet, aldrig kandidatverktygen.
 *
 * Publikt omgång 3: grundens tonade kort med klack och kopparknappen,
 * färgerna ur tokens (inget beige, ingen gradient). Text, rubrik (h3) och
 * länkar som förut. Används bara av insikterna.
 */
export default function InsiktCTA({
  rubrik = 'Sök i en kandidatpool med verifierade testresultat',
  text = 'Varje profil i Jobbcoach.ai:s kandidatpool har verifierade testresultat och en arbetsstilsrapport. Anonymt tills kandidaten tackar ja till kontakt. Kostnadsfritt för verifierade rekryterare under lanseringsperioden.',
}: {
  rubrik?: string
  text?: string
}) {
  return (
    <div className="not-prose my-10 rounded-[22px] border-2 border-b-[6px] border-[var(--kant-stark)] bg-[var(--ton)] p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.09em] text-[var(--koppar-ink)] mb-2">
        För rekryterare
      </p>
      <h3 className="text-xl sm:text-2xl font-black text-[var(--ink-1)] mb-3">{rubrik}</h3>
      <p className="text-sm sm:text-base text-[var(--ink-2)] leading-relaxed mb-5 max-w-2xl">{text}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/rekryterare/registrera"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-2xl bg-[var(--koppar)] text-[var(--koppar-text)] font-bold text-sm shadow-[0_4px_0_var(--koppar-klack)] hover:bg-[var(--koppar-topp)] transition-colors"
        >
          Skapa rekryterarkonto
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
        <Link
          href="/for-rekryterare"
          className="inline-flex items-center justify-center px-5 py-3 min-h-[48px] rounded-2xl border-2 border-[var(--ink-1)] text-[var(--ink-1)] font-bold text-sm hover:bg-[var(--papper)] transition-colors"
        >
          Så fungerar kandidatpoolen
        </Link>
      </div>
    </div>
  )
}
