'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, FileText, Mail } from 'lucide-react'
import {
  IconVard,
  IconTech,
  IconEkonomi,
  IconService,
  IconUtbildning,
  IconOffentlig,
  IconHantverk,
  IconIndustri,
  IconLogistik,
  IconStudent,
} from './illustrations/ExempelIcons'
import { Kategori } from './exempel-data'

const ICON_MAP: Record<
  Kategori['iconKey'],
  ({ className }: { className?: string }) => React.ReactElement
> = {
  vard: IconVard,
  tech: IconTech,
  ekonomi: IconEkonomi,
  service: IconService,
  utbildning: IconUtbildning,
  offentlig: IconOffentlig,
  hantverk: IconHantverk,
  industri: IconIndustri,
  logistik: IconLogistik,
  student: IconStudent,
}

interface KategoriPageContentProps {
  kategori: Kategori
  type: 'cv' | 'brev'
  /** En karta over slug -> visningsnamn for yrkena (eftersom olika yrken finns i CV vs brev). */
  yrkenMap: Record<string, string>
}

export default function KategoriPageContent({
  kategori,
  type,
  yrkenMap,
}: KategoriPageContentProps) {
  const Icon = ICON_MAP[kategori.iconKey]

  // Filtrera kategorins yrken till de som faktiskt finns i denna typ (CV eller brev)
  const yrkenIDennaTyp = kategori.yrken.filter((slug) => yrkenMap[slug])

  const galleryUrl = type === 'cv' ? '/cv-exempel' : '/personligt-brev-exempel'
  const yrkePathPrefix =
    type === 'cv' ? '/cv-exempel' : '/personligt-brev-exempel'
  const otherTypePrefix =
    type === 'cv' ? '/personligt-brev-exempel' : '/cv-exempel'
  const typeLabel = type === 'cv' ? 'CV-exempel' : 'Personligt brev-exempel'
  const otherTypeLabel =
    type === 'cv' ? 'personligt brev' : 'CV'

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 65%)',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-slate-500"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-orange-700 transition-colors">
              Hem
            </Link>
            <span>/</span>
            <Link
              href="/exempel"
              className="hover:text-orange-700 transition-colors"
            >
              Exempel
            </Link>
            <span>/</span>
            <Link
              href={galleryUrl}
              className="hover:text-orange-700 transition-colors"
            >
              {typeLabel}
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{kategori.namn}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
                {typeLabel} · {kategori.namn}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
                {typeLabel} för{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {kategori.namn.toLowerCase()}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {kategori.introIngress}
              </p>
            </div>
            <Icon className="hidden lg:block w-32 h-32 flex-shrink-0" />
          </motion.div>
        </div>
      </section>

      {/* Yrken-grid */}
      <section className="py-12 sm:py-16 bg-orange-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {yrkenIDennaTyp.length} yrken inom {kategori.namn.toLowerCase()}
            </h2>
            <Link
              href={galleryUrl}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 hover:text-orange-800"
            >
              Se alla {typeLabel.toLowerCase()}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {yrkenIDennaTyp.map((slug, idx) => {
              const namn = yrkenMap[slug]
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.3, delay: idx * 0.025 }}
                >
                  <Link
                    href={`${yrkePathPrefix}/${slug}`}
                    className="group block bg-white rounded-2xl border border-orange-100 p-4 sm:p-5 hover:border-orange-300 transition-colors"
                    style={{
                      boxShadow:
                        '0 4px 16px -10px rgba(249, 115, 22, 0.14)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #F97316, #DC2626)',
                        }}
                      >
                        {type === 'cv' ? (
                          <FileText className="w-5 h-5" strokeWidth={2.2} />
                        ) : (
                          <Mail className="w-5 h-5" strokeWidth={2.2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors leading-tight">
                          {namn}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {typeLabel}
                        </p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                        strokeWidth={2.5}
                      />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cross-link till andra typen */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
            Behöver du även {otherTypeLabel}?
          </h2>
          <p className="text-base text-slate-600 mb-5">
            Vi har {kategori.yrken.length} {otherTypeLabel}-exempel inom{' '}
            {kategori.namn.toLowerCase()}.
          </p>
          <Link
            href={`${otherTypePrefix}/kategori/${kategori.slug}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-base transition-colors min-h-[48px] border border-orange-200"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
            Se {otherTypeLabel}-exempel för {kategori.namn.toLowerCase()}
          </Link>
        </div>
      </section>

      {/* CTA tillbaka */}
      <section className="py-12 sm:py-16 bg-orange-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Hittade du inte ditt yrke?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-6">
            Bläddra hela biblioteket eller välj en annan bransch på hub-sidan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href={galleryUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-base min-h-[48px] w-full sm:w-auto"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.42)',
              }}
            >
              Alla {typeLabel.toLowerCase()}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <Link
              href="/exempel"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-orange-200 text-slate-900 font-bold text-base min-h-[48px] w-full sm:w-auto hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
            >
              Tillbaka till hubben
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
