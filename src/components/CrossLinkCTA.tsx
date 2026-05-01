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
 * Premium orange/röd-DNA. Kompakt sidebar-card.
 */
export default function CrossLinkCTA({ currentType, yrke, slug }: CrossLinkCTAProps) {
  const isCV = currentType === 'cv'

  const targetUrl = isCV
    ? `/personligt-brev-exempel/${slug}`
    : `/cv-exempel/${slug}`

  const targetLabel = isCV ? 'personligt brev' : 'CV'

  const TargetIcon = isCV ? Mail : FileText

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5 sm:p-6"
      style={{
        boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <TargetIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
            Komplettera ansökan
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
            Hela paketet
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-700 mb-4 leading-relaxed">
        {isCV
          ? `Ett CV räcker inte. Komplettera med ett skräddarsytt personligt brev för ${yrke.toLowerCase()} och öka chansen till intervju.`
          : `Komplettera brevet med ett ATS-optimerat CV för ${yrke.toLowerCase()} så blir ansökan komplett.`}
      </p>

      <Link href={targetUrl}>
        <button
          className="w-full min-h-[48px] px-4 py-3 rounded-xl text-white font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <TargetIcon className="w-4 h-4" strokeWidth={2.5} />
          <span>Se {targetLabel}-exempel</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </button>
      </Link>
    </div>
  )
}
