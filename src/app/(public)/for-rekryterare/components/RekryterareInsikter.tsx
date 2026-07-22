import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { getAllInsikterMeta } from '@/lib/blog'

/**
 * Insikter-sektion: lyfter kunskapsinnehållet för rekryterare från
 * /for-rekryterare/insikter. Serverkomponent, läser MDX-metadata vid build.
 */
export default function RekryterareInsikter() {
  const insikter = getAllInsikterMeta().slice(0, 6)

  if (insikter.length === 0) return null

  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sektion-header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} />
            Insikter
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Kunskap som förbättrar
            <br className="hidden sm:block" />{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              nästa rekrytering
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Forskningsläget, regelverken och hantverket. Skrivet för dig som
            rekryterar, med källorna synliga.
          </p>
        </div>

        {/* Insiktskort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {insikter.map((insikt) => (
            <Link
              key={insikt.slug}
              href={`/for-rekryterare/insikter/${insikt.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 transition-all hover:border-orange-300 hover:-translate-y-0.5"
              style={{
                boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.2)',
              }}
            >
              <h3 className="text-base font-black text-slate-900 mb-2 leading-snug group-hover:text-orange-700 transition-colors">
                {insikt.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                {insikt.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700">
                Läs insikten
                <ArrowRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </span>
            </Link>
          ))}
        </div>

        {/* Länk till hubben */}
        <div className="text-center mt-8">
          <Link
            href="/for-rekryterare/insikter"
            className="inline-flex items-center gap-2 text-base font-bold text-slate-700 hover:text-orange-700 transition-colors"
          >
            Alla insikter för rekryterare
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
