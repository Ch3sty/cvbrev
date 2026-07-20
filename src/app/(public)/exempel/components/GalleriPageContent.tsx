'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  FileText,
  Mail,
  Search,
  X,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import {
  IconVard,
  IconTech,
  IconEkonomi,
  IconService,
  IconUtbildning,
  IconOffentlig,
  IconHantverk,
  ExempelHeroIcon,
} from './illustrations/ExempelIcons'
import { Kategori, KATEGORIER } from './exempel-data'
import type { FaqItem } from './galleri-faq'
import MallarGuideSection from './MallarGuideSection'

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
}

/**
 * Mappa fran galleri-datans kategori-string till var KategoriSlug.
 * Galleri-datan anvander 'teknik' medan vi anvander 'tech'.
 */
function normalizeKategori(input: string): Kategori['slug'] {
  if (input === 'teknik') return 'tech'
  return input as Kategori['slug']
}

export interface GalleriYrke {
  slug: string
  namn: string
  kategori: string
  intro: string
}

interface GalleriPageContentProps {
  type: 'cv' | 'brev'
  yrken: GalleriYrke[]
  faqItems: FaqItem[]
}

export default function GalleriPageContent({
  type,
  yrken,
  faqItems,
}: GalleriPageContentProps) {
  const [activeKat, setActiveKat] = useState<'all' | Kategori['slug']>('all')
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const isCV = type === 'cv'
  const typeLabel = isCV ? 'CV-exempel' : 'Personliga brev-exempel'
  const typeShort = isCV ? 'CV' : 'brev'
  const yrkePathPrefix = isCV ? '/cv-exempel' : '/personligt-brev-exempel'
  const otherTypePrefix = isCV
    ? '/personligt-brev-exempel'
    : '/cv-exempel'
  const otherTypeLabel = isCV ? 'personliga brev' : 'CV'

  // Filtrera yrken baserat pa kategori + sok
  const filtreradeYrken = useMemo(() => {
    const sokLower = search.trim().toLowerCase()
    return yrken.filter((y) => {
      const kat = normalizeKategori(y.kategori)
      const matcharKat = activeKat === 'all' || kat === activeKat
      const matcharSok =
        !sokLower ||
        y.namn.toLowerCase().includes(sokLower) ||
        y.slug.includes(sokLower)
      return matcharKat && matcharSok
    })
  }, [yrken, activeKat, search])

  return (
    <main className="bg-white min-h-screen">
      {/* Topp-glow */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 h-[400px] -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 65%)',
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex items-center gap-2 text-sm text-slate-500 flex-wrap"
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
            <span className="text-slate-700 font-medium">{typeLabel}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                />
                {typeLabel}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
                {isCV ? `${yrken.length} CV-exempel.` : 'Personligt brev-mallar och exempel:'}{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {isCV ? 'Ett för ditt yrke.' : `${yrken.length} yrken (gratis)`}
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                {isCV
                  ? 'Inspiration för ditt eget CV. Se färdiga, ATS-optimerade CV-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor — perfekta att utgå från för din egen jobbansökan.'
                  : 'Hitta rätt mall för ditt personliga brev. Färdiga exempel skrivna med rätt ton, struktur och nyckelord för svenska rekryterare som du kan använda som mall för ditt eget brev.'}
              </p>

              {/* Sok */}
              <div className="relative max-w-md mx-auto lg:mx-0">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  strokeWidth={2.5}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Sök efter yrke..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-orange-100 bg-white focus:border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-sm sm:text-base"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    aria-label="Rensa sökfält"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Hero-illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center justify-center"
            >
              <ExempelHeroIcon className="w-72 h-72" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Kategori-pills */}
      <section className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-y border-orange-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Filtrera efter bransch"
            className="
              flex gap-2 overflow-x-auto snap-x snap-mandatory
              -mx-4 px-4 sm:mx-0 sm:px-0
              pb-1 scrollbar-hide
            "
            style={{ scrollbarWidth: 'none' }}
          >
            <FilterPill
              label="Alla yrken"
              count={yrken.length}
              active={activeKat === 'all'}
              onClick={() => setActiveKat('all')}
            />
            {KATEGORIER.map((kat) => {
              const Icon = ICON_MAP[kat.iconKey]
              const antalIDennaTyp = yrken.filter(
                (y) => normalizeKategori(y.kategori) === kat.slug
              ).length
              if (antalIDennaTyp === 0) return null
              return (
                <FilterPill
                  key={kat.slug}
                  label={kat.namn}
                  count={antalIDennaTyp}
                  icon={<Icon className="w-5 h-5" />}
                  active={activeKat === kat.slug}
                  onClick={() => setActiveKat(kat.slug)}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Yrkes-grid */}
      <section className="py-10 sm:py-14 bg-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {filtreradeYrken.length} yrken
              {activeKat !== 'all' && (
                <span className="text-slate-500 font-bold">
                  {' '}
                  · {KATEGORIER.find((k) => k.slug === activeKat)?.namn}
                </span>
              )}
              {search && (
                <span className="text-slate-500 font-bold">
                  {' '}
                  · "{search}"
                </span>
              )}
            </h2>
          </div>

          {filtreradeYrken.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 mb-4">
                Inga yrken matchar din sökning.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setActiveKat('all')
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-sm border border-orange-200 transition-colors"
              >
                Rensa filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filtreradeYrken.map((yrke, idx) => {
                const kat = KATEGORIER.find(
                  (k) => k.slug === normalizeKategori(yrke.kategori)
                )
                const Icon = kat ? ICON_MAP[kat.iconKey] : IconOffentlig
                return (
                  <motion.div
                    key={yrke.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(idx * 0.015, 0.4),
                    }}
                  >
                    <Link
                      href={`${yrkePathPrefix}/${yrke.slug}`}
                      className="group block bg-white rounded-3xl border border-orange-100 p-5 hover:border-orange-200 transition-colors h-full"
                      style={{
                        boxShadow:
                          '0 6px 24px -14px rgba(249, 115, 22, 0.16)',
                      }}
                      aria-label={`Se ${typeShort}-exempel för ${yrke.namn}`}
                    >
                      <Icon className="w-12 h-12 sm:w-14 sm:h-14 mb-3" />

                      {kat && (
                        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                          {kat.namn}
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-tight">
                        {yrke.namn}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {yrke.intro}
                      </p>

                      <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-sm group-hover:gap-2.5 transition-all">
                        {isCV ? (
                          <FileText className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <Mail className="w-4 h-4" strokeWidth={2.5} />
                        )}
                        Se {typeShort}-exempel
                        <ArrowRight
                          className="w-3.5 h-3.5"
                          strokeWidth={2.5}
                        />
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cross-link till andra typen */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight">
            Behöver du även {otherTypeLabel}?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-6">
            En komplett ansökan kräver båda. Vi har {yrken.length}{' '}
            {otherTypeLabel}-exempel inom samma yrken.
          </p>
          <Link
            href={otherTypePrefix}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-base transition-colors min-h-[48px] border border-orange-200"
          >
            Bläddra {otherTypeLabel}-exempel
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* Long-form SEO-section: guide om mallar */}
      <MallarGuideSection type={type} />

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-orange-50/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
              <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
              Vanliga frågor om {typeShort}-exempel
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
              Det du undrar om {typeShort}-exemplen
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Hittar du inte svaret?{' '}
              <a
                href="mailto:support@jobbcoach.ai"
                className="text-orange-700 hover:text-orange-800 font-bold"
              >
                Hör av dig
              </a>
              .
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl border overflow-hidden transition-colors ${
                    isOpen ? 'border-orange-300' : 'border-orange-100'
                  }`}
                  style={
                    isOpen
                      ? {
                          boxShadow:
                            '0 8px 24px -12px rgba(249, 115, 22, 0.18)',
                        }
                      : {
                          boxShadow:
                            '0 2px 8px -4px rgba(249, 115, 22, 0.08)',
                        }
                  }
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-orange-50/40 transition-colors touch-manipulation"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-orange-600 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={2.5}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-orange-100 pt-4">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA-band */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-white"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-4">
                  Klar att skriva
                  <br className="hidden sm:block" />{' '}
                  ditt eget {typeShort}?
                </h2>
                <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  Använd exemplen som inspiration och bygg ditt eget med våra
                  verktyg. Helt gratis att börja.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start lg:justify-start justify-center">
                  <Link
                    href={isCV ? '/dashboard/skapa-cv' : '/dashboard/skapa-brev'}
                    className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white font-black text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:bg-orange-50 active:scale-[0.98] transition-all"
                    style={{
                      color: '#DC2626',
                      boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    Skapa {typeShort} gratis
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                      strokeWidth={2.8}
                    />
                  </Link>
                  <Link
                    href="/exempel"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border-2 border-white/40 text-white font-bold text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:border-white/70 transition-colors"
                  >
                    Tillbaka till hubben
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/25">
                  <ExempelHeroIcon className="w-44 h-44" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

interface FilterPillProps {
  label: string
  count: number
  icon?: React.ReactNode
  active: boolean
  onClick: () => void
}

function FilterPill({ label, count, icon, active, onClick }: FilterPillProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`
        flex-shrink-0 snap-start inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
        text-sm font-bold transition-all min-h-[44px] whitespace-nowrap
        ${
          active
            ? 'text-white shadow-md'
            : 'bg-white text-slate-700 border border-orange-100 hover:border-orange-300'
        }
      `}
      style={
        active
          ? {
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
            }
          : undefined
      }
    >
      {icon}
      <span>{label}</span>
      <span
        className={`text-[11px] font-black ${
          active ? 'text-white/85' : 'text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
