'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, Search, ShieldCheck, Crown, FileText, Sparkles } from 'lucide-react'
import { useState, useMemo } from 'react'

import Breadcrumb from '@/components/Breadcrumb'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import type { Yrkesmall } from '../yrkesmall-data'

type FilterType = 'all' | 'free' | 'premium' | 'yrkesmallar' | 'modern' | 'traditional' | 'creative'

interface CvMallarPageContentProps {
  yrkesmallar: Yrkesmall[]
  faqItems: { q: string; a: string }[]
}

export default function CvMallarPageContent({
  yrkesmallar,
  faqItems,
}: CvMallarPageContentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const yrkesmallSlugSet = useMemo(
    () => new Set(yrkesmallar.map(y => y.mallId)),
    [yrkesmallar]
  )

  const filteredTemplates = useMemo(() => {
    let list = SIMPLE_TEMPLATES
    if (activeFilter === 'free') list = list.filter(t => t.tier === 'free')
    if (activeFilter === 'premium') list = list.filter(t => t.tier === 'premium')
    if (activeFilter === 'yrkesmallar') list = list.filter(t => yrkesmallSlugSet.has(t.id))
    if (activeFilter === 'modern' || activeFilter === 'traditional' || activeFilter === 'creative') {
      list = list.filter(t => t.category === activeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.metadata?.suitableFor || []).some(s => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeFilter, searchQuery, yrkesmallSlugSet])

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Alla mallar' },
    { id: 'free', label: 'Gratis' },
    { id: 'premium', label: 'Premium' },
    { id: 'yrkesmallar', label: 'Yrkesmallar' },
    { id: 'modern', label: 'Modern' },
    { id: 'traditional', label: 'Traditionell' },
    { id: 'creative', label: 'Kreativ' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">
      <Breadcrumb
        items={[
          { name: 'Hem', href: '/' },
          { name: 'Exempel', href: '/exempel' },
          { name: 'CV-mallar', href: '/cv-mallar' },
        ]}
      />

      {/* Hero */}
      <section className="container mx-auto px-3 sm:px-4 pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            {SIMPLE_TEMPLATES.length} CV-mallar
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
            CV-mallar för svenska yrken{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              gratis och premium
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Välj rätt design för din ansökan. Alla mallar är ATS-säkra, anpassade för svenska arbetsgivare och uppdaterade för 2026. Yrkesmallar hjälper dig välja det som passar din bransch.
          </p>

          {/* Sok */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2.5} />
            <input
              type="search"
              placeholder="Sök yrke eller stil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-400 text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Yrkesmallar - prioriterat snabblanksomrade for SEO och sokintent */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-6xl">
        <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8" style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}>
          <div className="flex items-center gap-3 mb-5">
            <span
              className="w-1 h-8 rounded-sm"
              style={{ background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)' }}
              aria-hidden
            />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Yrkesmallar — för ditt specifika yrke
            </h2>
          </div>
          <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-3xl">
            Mallar designade för specifika yrken med sektioner som lyfter rätt meriter — legitimationer, behörigheter, kompetensområden. Klicka för att se varför mallen passar yrket och vad rekryterare letar efter.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {yrkesmallar.map((y) => (
              <Link
                key={y.slug}
                href={`/cv-mallar/${y.slug}`}
                className="group flex flex-col bg-orange-50/40 hover:bg-orange-50 border border-orange-100 hover:border-orange-200 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                  >
                    <FileText className="w-4 h-4" strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-slate-900 leading-tight">
                      {y.namn}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mt-0.5">
                      {y.mallNamn}-mallen
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-snug line-clamp-2 mb-3 flex-1">
                  {y.intro}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 group-hover:translate-x-0.5 transition-transform">
                  Visa mall
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + alla mallar */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Alla våra CV-mallar
          </h2>
          <p className="text-base text-slate-600">
            Filtrera efter typ, stil eller tier. Klicka på en mall för att se den i aktion.
          </p>
        </div>

        {/* Filter-pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === f.id
                  ? 'text-white shadow-md'
                  : 'bg-white border border-orange-100 text-slate-700 hover:border-orange-300'
              }`}
              style={
                activeFilter === f.id
                  ? {
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
                    }
                  : undefined
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Mall-grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="group bg-white border border-slate-200 hover:border-orange-200 rounded-2xl overflow-hidden transition-all"
              style={{ boxShadow: '0 4px 16px -10px rgba(0, 0, 0, 0.08)' }}
            >
              <div className="relative aspect-[3/4] bg-slate-50 border-b border-slate-100">
                <Image
                  src={t.imagePath}
                  alt={`${t.name} CV-mall`}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 240px, 160px"
                />
                {t.tier === 'premium' && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Premium
                  </span>
                )}
                {t.features?.atsSafe && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                    ATS
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-base font-black text-slate-900 leading-tight">
                  {t.name}
                </div>
                <div className="text-xs text-slate-600 leading-snug mt-1 line-clamp-2">
                  {t.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Designguide-sektion - long-form content for topical authority */}
      <section className="bg-white py-14 sm:py-20 border-t border-orange-100/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              Guide
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-3">
              Vad gör en bra CV-mall för svenska arbetsgivare?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Det handlar inte bara om hur det ser ut. Här är fyra saker som avgör.
            </p>
          </div>

          <div className="space-y-10 sm:space-y-12">
            <GuideBlock
              eyebrow="ATS-säkerhet"
              title="Mallen måste passera rekryteringssystemet"
            >
              <p>
                Innan en människa läser ditt CV passerar det ofta ett ATS — Applicant Tracking System. Det är mjukvara som indexerar texten, sorterar in kandidater på sökord och rangordnar matchningar. ATS-system har problem med vissa designval: clip-paths, absolutpositionerade textfält, ovanliga typsnitt, och kolumner där läsordningen blir fel.
              </p>
              <p>
                Våra ATS-säkra mallar (märkta med grön ATS-badge) använder vanlig flödeslayout, standardrubriker som "Arbetslivserfarenhet" och "Utbildning", och typsnitt som finns i alla operativsystem. Du får designkänslan utan att riskera att rekryteringssystemet sorterar bort dig innan en människa ens ser ditt CV.
              </p>
            </GuideBlock>

            <GuideBlock
              eyebrow="Branschmatchning"
              title="Olika yrken kräver olika mall-DNA"
            >
              <p>
                En läkare, en barnskötare och en säljare har helt olika meriter att lyfta — legitimationer, pedagogiska metoder, säljsiffror. En generisk mall sätter alla i samma form, vilket sällan funkar. Yrkesspecifika mallar har sektioner och rubriker anpassade till branschen: "Klinisk tjänstgöring" istället för "Arbetslivserfarenhet" för läkare. "Pedagogisk erfarenhet" för lärare.
              </p>
              <p>
                Det handlar också om visuell kod. Vården och offentlig sektor förväntar sig dämpade färger och tydlig struktur. Marknadsföring och kreativa yrken har utrymme för djärvare grepp. Välj en mall vars visuella språk matchar branschen du söker dig till.
              </p>
            </GuideBlock>

            <GuideBlock
              eyebrow="Erfarenhetsnivå"
              title="Mallen ska passa hur långt du kommit i karriären"
            >
              <p>
                Som student utan jobberfarenhet är fokus utbildning, projekt och praktik. Student-mallen flippar sektionsordningen och ger plats för det. Som senior konsult med 15+ års erfarenhet behöver du kompakt typografi som ryms — Konsulten-mallen kör 12.5px body istället för 13.5px för att få plats med fler jobb utan att verka cramad.
              </p>
              <p>
                Generella mallar (Norrsken, Aspekt) fungerar bra i mitten av karriären. Executive-mallar (Atlas) signalerar prestige och passar för C-suite eller styrelseroller där tradition väger tungt.
              </p>
            </GuideBlock>

            <GuideBlock
              eyebrow="Mall vs exempel"
              title="Använd båda — de är kompletterande"
            >
              <p>
                En CV-mall är design-strukturen — typsnitt, sektionsordning, färger, layout. Ett{' '}
                <Link href="/cv-exempel" className="text-orange-700 font-bold underline underline-offset-2">
                  CV-exempel
                </Link>{' '}
                är ett färdigt CV med någon annans innehåll som du kan låta dig inspireras av. När du skriver ditt eget, börja med exempel-sidan för ditt yrke (för att få bra formuleringar) och välj sedan en mall för designen.
              </p>
              <p>
                För varje yrkesmall här länkar vi till motsvarande CV-exempel — så du kan både se ett färdigt CV och välja den mall som passar bäst. Använd mallväljaren i appen för att testa hur ditt CV ser ut i olika designer.
              </p>
            </GuideBlock>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Vanliga frågor om CV-mallar
          </h2>
          <p className="text-base text-slate-600">
            Allt du behöver veta innan du väljer.
          </p>
        </div>
        <FaqAccordion variant="cv" yrke="CV-mallar" items={faqItems} />
      </section>

      {/* Cross-link CTA till cv-exempel */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-4xl">
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-3xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            Letar du efter ett färdigt CV-exempel istället?
          </h2>
          <p className="text-base text-slate-600 mb-5 max-w-xl mx-auto">
            Vi har 74 färdiga CV-exempel skrivna för specifika yrken — perfekta att inspireras av när du skriver ditt eget innehåll.
          </p>
          <Link
            href="/cv-exempel"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.4)',
            }}
          >
            Se CV-exempel
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function GuideBlock({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
        {eyebrow}
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-4">
        {title}
      </h3>
      <div className="prose prose-slate max-w-none text-base text-slate-700 leading-relaxed space-y-3">
        {children}
      </div>
    </motion.div>
  )
}
