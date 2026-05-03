'use client'

import dynamic from 'next/dynamic'

import CompleteApplicationPackage from '@/components/CompleteApplicationPackage'

import Breadcrumb from '@/components/exempel-shared/Breadcrumb'
import ExempelHero from '@/components/exempel-shared/ExempelHero'
import ExempelInfoCard from '@/components/exempel-shared/ExempelInfoCard'
import VarforFungerarSection from '@/components/exempel-shared/VarforFungerarSection'
import TipsSection from '@/components/exempel-shared/TipsSection'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import RelateradeYrkenGrid from '@/components/exempel-shared/RelateradeYrkenGrid'
import FinalCTA from '@/components/exempel-shared/FinalCTA'
import CvPreviewShell from '@/components/cv-exempel-shared/CvPreviewShell'

// Lazy-load InteractiveCVPreview för Page Speed
const InteractiveCVPreview = dynamic(() => import('./InteractiveCVPreview'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-white rounded-2xl border border-orange-100 p-8 animate-pulse"
      style={{ minHeight: '800px' }}
    >
      <div className="space-y-4">
        <div className="h-8 bg-orange-100 rounded w-3/4" />
        <div className="h-4 bg-orange-100/70 rounded w-1/2" />
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-orange-100/70 rounded w-full" />
          <div className="h-4 bg-orange-100/70 rounded w-5/6" />
        </div>
      </div>
    </div>
  ),
})

interface CVExampleData {
  yrke: string
  sokvolym: number
  intro: string
  seoIntro: string
  exempelCV: any
  varforDetFungerar: Array<{
    rubrik: string
    text: string
  }>
  tips: Array<{
    rubrik: string
    text: string
  }>
  faq: Array<{
    fraga: string
    svar: string
  }>
  relaterade: Array<{
    yrke: string
    slug: string
  }>
  kategori: string
}

interface CVExempelPageProps {
  data: CVExampleData
  slug: string
  initialHTML: string
}

export default function CVExempelPage({
  data,
  slug,
  initialHTML,
}: CVExempelPageProps) {
  // Mappa CV-data till de delade komponenternas format
  const varforItems = data.varforDetFungerar.map((item) => ({
    titel: item.rubrik,
    beskrivning: item.text,
  }))

  const faqItems = data.faq.map((item) => ({
    q: item.fraga,
    a: item.svar,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">

      <Breadcrumb
        items={[
          { label: 'Hem', href: '/' },
          { label: 'CV-exempel', href: '/cv-exempel' },
          { label: data.yrke },
        ]}
      />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 max-w-6xl space-y-10 sm:space-y-12 md:space-y-16">
        {/* Hero */}
        <ExempelHero
          variant="cv"
          yrke={data.yrke}
          intro={data.intro}
          primaryCtaHref="/dashboard/skapa-cv"
          primaryCtaLabel="Skapa mitt CV"
          secondaryCtaTargetId="preview"
          secondaryCtaLabel="Se exemplet"
        />

        {/* Info-card */}
        <ExempelInfoCard
          eyebrow="Vad du får här"
          title="Komplett CV-exempel som inspirerar"
          description={`Se exakt hur ett ATS-optimerat CV för ${data.yrke.toLowerCase()} ser ut — med rätt nyckelord, kvantifierade resultat och struktur. Använd det som mall för ditt eget.`}
          features={[
            'ATS-optimerat',
            'Branschspecifika nyckelord',
            'Kvantifierade resultat',
            'Modern design',
            'Färdig att kopiera',
          ]}
        />

        {/* Live preview */}
        <section id="preview" className="scroll-mt-6">
          <CvPreviewShell yrke={data.yrke}>
            <InteractiveCVPreview
              exempelCV={data.exempelCV}
              yrke={data.yrke}
              initialHTML={initialHTML}
            />
          </CvPreviewShell>
        </section>

        {/* Varför det fungerar */}
        <VarforFungerarSection
          variant="cv"
          yrke={data.yrke}
          items={varforItems}
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
              Så bygger du ett CV som {data.yrke.toLowerCase()}
            </h2>
            <div className="text-base sm:text-lg text-slate-700 leading-relaxed space-y-4 max-w-3xl">
              {data.seoIntro.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph.trim()}</p>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <FaqAccordion variant="cv" yrke={data.yrke} items={faqItems} />

        {/* Relaterade yrken */}
        <RelateradeYrkenGrid variant="cv" items={data.relaterade} />

        {/* CompleteApplicationPackage */}
        <CompleteApplicationPackage
          currentType="cv"
          yrke={data.yrke}
          slug={slug}
        />

        {/* Final CTA */}
        <FinalCTA variant="cv" yrke={data.yrke} ctaHref="/dashboard/skapa-cv" />
      </main>
    </div>
  )
}
