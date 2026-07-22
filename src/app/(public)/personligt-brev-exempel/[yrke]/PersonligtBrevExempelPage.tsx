'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight } from 'lucide-react'

import CompleteApplicationPackage from '@/components/CompleteApplicationPackage'

import Breadcrumb from '@/components/exempel-shared/Breadcrumb'
import ExempelHero from '@/components/exempel-shared/ExempelHero'
import ExempelInfoCard from '@/components/exempel-shared/ExempelInfoCard'
import VarforFungerarSection from '@/components/exempel-shared/VarforFungerarSection'
import TipsSection from '@/components/exempel-shared/TipsSection'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import RelateradeYrkenGrid from '@/components/exempel-shared/RelateradeYrkenGrid'
import FinalCTA from '@/components/exempel-shared/FinalCTA'
import BrevPreviewShell from '@/components/brev-exempel-shared/BrevPreviewShell'

// SEO: Lazy-load InteractiveLetterPreview för bättre Page Speed
const InteractiveLetterPreview = dynamic(
  () => import('./InteractiveLetterPreview'),
  {
    ssr: false,
    loading: () => (
      <div
        className="bg-white rounded-2xl border border-orange-100 p-8 animate-pulse"
        style={{ minHeight: '600px' }}
      >
        <div className="space-y-4">
          <div className="h-6 bg-orange-100 rounded w-3/4" />
          <div className="h-4 bg-orange-100/70 rounded w-1/2" />
          <div className="h-4 bg-orange-100/70 rounded w-5/6" />
          <div className="h-4 bg-orange-100/70 rounded w-4/5" />
        </div>
      </div>
    ),
  }
)

interface ExampleData {
  yrke: string
  sokvolym: number
  intro: string
  seoIntro?: string
  exempelBrev: {
    namn: string
    adress: string
    telefon: string
    epost: string
    arbetsgivare: string
    roll: string
    datum: string
    brevText: string
  }
  varforDetFungerar: Array<{
    titel: string
    beskrivning: string
  }>
  tips: Array<{
    rubrik: string
    text: string
  }>
  relaterade: Array<{
    yrke: string
    slug: string
  }>
  faq: Array<{
    q: string
    a: string
  }>
  relateradeArtiklar?: Array<{
    titel: string
    slug: string
  }>
  relateradeVerktyg?: Array<{
    namn: string
    slug: string
    beskrivning: string
  }>
}

interface PersonligtBrevExempelPageProps {
  data: ExampleData
  slug: string
}

export default function PersonligtBrevExempelPage({
  data,
  slug,
}: PersonligtBrevExempelPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">

      <Breadcrumb
        items={[
          { label: 'Hem', href: '/' },
          { label: 'Personliga brev', href: '/personligt-brev-exempel' },
          { label: data.yrke },
        ]}
      />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 max-w-6xl space-y-10 sm:space-y-12 md:space-y-16">
        {/* Hero */}
        <ExempelHero
          variant="letter"
          yrke={data.yrke}
          intro={data.intro}
          primaryCtaHref="/dashboard/skapa-brev"
          primaryCtaLabel="Skapa mitt personliga brev"
          secondaryCtaTargetId="preview"
          secondaryCtaLabel="Se exemplet"
        />

        {/* Info-card: vad får besökaren */}
        <ExempelInfoCard
          eyebrow="Vad du får här"
          title="Komplett exempel på 60 sek"
          description={`Färdigskrivet personligt brev för ${data.yrke.toLowerCase()} som du kan kopiera och anpassa direkt. Plus skäl till varför det fungerar och konkreta tips för din bransch.`}
          features={[
            'Komplett brev',
            'ATS-optimerat',
            '6 mallar',
            '11 typsnitt',
            'Kopiera direkt',
          ]}
        />

        {/* Live preview. Vissa poster använder stad/foretag i stället för adress/arbetsgivare */}
        <section id="preview" className="scroll-mt-6">
          <BrevPreviewShell yrke={data.yrke}>
            <InteractiveLetterPreview
              exempelBrev={{
                ...data.exempelBrev,
                adress:
                  data.exempelBrev.adress ??
                  (data.exempelBrev as Record<string, string>).stad ??
                  '',
                arbetsgivare:
                  data.exempelBrev.arbetsgivare ??
                  (data.exempelBrev as Record<string, string>).foretag ??
                  '',
              }}
            />
          </BrevPreviewShell>
        </section>

        {/* Varför det fungerar */}
        <VarforFungerarSection
          variant="letter"
          yrke={data.yrke}
          items={data.varforDetFungerar}
        />

        {/* Tips */}
        <TipsSection yrke={data.yrke} items={data.tips} />

        {/* SEO Intro-text */}
        {data.seoIntro && (
          <section
            className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-6 sm:p-8 md:p-10"
            style={{
              boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
              }}
            />
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
              Skriv-guide
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Så skriver du ett personligt brev som {data.yrke.toLowerCase()}
            </h2>
            <div className="text-base sm:text-lg text-slate-700 leading-relaxed space-y-4 max-w-3xl">
              {data.seoIntro.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph.trim()}</p>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <FaqAccordion variant="letter" yrke={data.yrke} items={data.faq} />

        {/* Relaterade yrken */}
        <RelateradeYrkenGrid variant="letter" items={data.relaterade} />

        {/* CompleteApplicationPackage - cross-link CV ↔ brev */}
        <CompleteApplicationPackage
          currentType="personligt-brev"
          yrke={data.yrke}
          slug={slug}
        />

        {/* Relaterade artiklar */}
        {data.relateradeArtiklar && data.relateradeArtiklar.length > 0 && (
          <section>
            <div className="mb-5 sm:mb-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
                Läs mer
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Mer om {data.yrke.toLowerCase()}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              {data.relateradeArtiklar.map((artikel, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white p-5 sm:p-6"
                  style={{
                    boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      }}
                    >
                      <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">
                        {artikel.titel}
                      </h3>
                      <p className="text-xs text-slate-500">Kommer snart</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Relaterade verktyg */}
        {data.relateradeVerktyg && data.relateradeVerktyg.length > 0 && (
          <section>
            <div className="mb-5 sm:mb-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
                Verktyg
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Verktyg som hjälper dig vidare
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
              {data.relateradeVerktyg.map((verktyg, idx) => (
                <Link key={idx} href={verktyg.slug}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white p-5 sm:p-6 h-full flex flex-col group"
                    style={{
                      boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                      }}
                    >
                      <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-orange-700 transition-colors">
                      {verktyg.namn}
                    </h3>
                    <p className="text-sm text-slate-600 flex-grow leading-relaxed">
                      {verktyg.beskrivning}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-orange-700 font-bold text-sm">
                      <span>Använd verktyget</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={2.5}
                      />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <FinalCTA
          variant="letter"
          yrke={data.yrke}
          ctaHref="/dashboard/skapa-brev"
        />
      </main>
    </div>
  )
}
