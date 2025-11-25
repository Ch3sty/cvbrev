import { Star, Eye, Download, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface HeroWithSEOIntroProps {
  yrke: string
  intro: string
  seoIntro: string // 150-200 ord, SEO-kritiskt, alltid synligt
}

export default function HeroWithSEOIntro({ yrke, intro, seoIntro }: HeroWithSEOIntroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-indigo-50 py-12 md:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-cyan-200 mb-6">
            <Star className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-900">
              Professionellt CV-exempel
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            CV-exempel: {yrke}
          </h1>

          {/* Intro paragraph */}
          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            {intro}
          </p>

          {/* SEO Intro - ALLTID SYNLIG, ALDRIG EXPANDERBAR */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Så skriver du ett CV som {yrke.toLowerCase()}
            </h2>

            {/* SEO-kritiskt innehåll: 150-200 ord, crawlbart HTML */}
            <div className="text-base md:text-lg text-slate-700 leading-relaxed space-y-4">
              {seoIntro.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph.trim()}</p>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/cv-mallar" className="flex-1 sm:flex-initial">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Ladda ner CV-mallar
              </button>
            </Link>

            <Link
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-cyan-600 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Visa förhandsvisning
            </Link>
          </div>

          {/* Scroll hint (endast desktop) */}
          <Link
            href="#preview"
            className="hidden md:flex items-center gap-2 mx-auto mt-12 text-slate-500 hover:text-cyan-600 transition-colors w-fit"
          >
            <span className="text-sm font-medium">Se CV-exempel</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </Link>
        </div>
      </div>
    </section>
  )
}
