import Link from 'next/link'
import { FileText, Mail, ArrowRight } from 'lucide-react'

interface CrossLinkCTAProps {
  currentType: 'cv' | 'personligt-brev'
  yrke: string
  slug: string
}

/**
 * CrossLinkCTA - Sidebar-komponent som länkar CV ↔ Personligt brev
 *
 * Placeras i sidebar på CV-exempel och Personligt brev-exempel sidor.
 * Responsiv: Sticky på desktop, inline på mobil.
 */
export default function CrossLinkCTA({ currentType, yrke, slug }: CrossLinkCTAProps) {
  const isCV = currentType === 'cv'

  const targetUrl = isCV
    ? `/personligt-brev-exempel/${slug}`
    : `/cv-exempel/${slug}`

  const targetLabel = isCV
    ? 'personligt brev'
    : 'CV'

  const TargetIcon = isCV ? Mail : FileText

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <TargetIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-slate-900">Komplett ansökan</h3>
      </div>

      <p className="text-sm text-slate-700 mb-4 leading-relaxed">
        {isCV
          ? `Ett CV räcker inte. Komplettera med ett skräddarsytt personligt brev för ${yrke.toLowerCase()} och öka dina chanser till intervju.`
          : `Komplettera ditt personliga brev med ett ATS-optimerat CV för ${yrke.toLowerCase()} för en komplett ansökan.`
        }
      </p>

      <Link href={targetUrl}>
        <button className="w-full px-4 py-3 min-h-[48px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          <TargetIcon className="w-4 h-4" />
          <span>Se {targetLabel}-exempel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  )
}
