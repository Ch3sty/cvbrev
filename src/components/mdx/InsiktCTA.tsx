import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * CTA-block för rekryterarinsikter. Används i MDX och som avslutning
 * på varje insikt. Pekar ALLTID mot rekryterarflödet, aldrig kandidatverktygen.
 */
export default function InsiktCTA({
  rubrik = 'Sök i en kandidatpool med verifierade testresultat',
  text = 'Varje profil i Jobbcoach.ai:s kandidatpool har verifierade testresultat och en arbetsstilsrapport. Anonymt tills kandidaten tackar ja till kontakt. Kostnadsfritt för verifierade rekryterare under lanseringsperioden.',
}: {
  rubrik?: string
  text?: string
}) {
  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
        För rekryterare
      </p>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">{rubrik}</h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5 max-w-2xl">{text}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/rekryterare/registrera"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        >
          Skapa rekryterarkonto
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
        <Link
          href="/for-rekryterare"
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-orange-300 text-orange-700 font-bold text-sm hover:bg-orange-50 transition-colors"
        >
          Så fungerar kandidatpoolen
        </Link>
      </div>
    </div>
  )
}
