import Link from 'next/link'
import { Lightbulb, CheckCircle, Zap, Sparkles } from 'lucide-react'
import CrossLinkCTA from '@/components/CrossLinkCTA'

interface CVSidebarProps {
  yrke: string
  slug: string
  viktigtAttTankaPa: string[]
}

export default function CVSidebar({ yrke, slug, viktigtAttTankaPa }: CVSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Box 1: Viktigt att tänka på */}
      <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-2xl p-6 border border-cyan-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-slate-900">Viktigt att tänka på</h3>
        </div>
        <ul className="space-y-3">
          {viktigtAttTankaPa.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Box 2: Länk till Personligt brev */}
      <CrossLinkCTA
        currentType="cv"
        yrke={yrke}
        slug={slug}
      />

      {/* Box 3: Statistik */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Statistik</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">ATS-kompatibilitet</span>
              <span className="text-sm font-bold text-green-600">95%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                style={{ width: '95%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Läsbarhet</span>
              <span className="text-sm font-bold text-blue-600">92%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                style={{ width: '92%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Nyckelordsoptimering</span>
              <span className="text-sm font-bold text-purple-600">88%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                style={{ width: '88%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Box 4: CTA */}
      <div className="bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
          <Zap className="w-6 h-6" />
        </div>
        <h3 className="font-bold mb-2">Förbättra ditt CV</h3>
        <p className="text-white/90 text-sm mb-4">
          Ladda upp ditt CV så analyserar vi automatiskt vad du ska ändra för att få fler intervjuer. Eller flytta över din info till ny professionell design direkt.
        </p>
        <Link href="/dashboard/cv-mallar">
          <button className="w-full px-4 py-3 bg-white text-cyan-600 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Kom igång gratis
          </button>
        </Link>
      </div>
    </div>
  )
}
