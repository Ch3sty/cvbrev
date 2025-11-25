'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, FileText, Sparkles, Target, Lightbulb, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import PremiumNavbar from '@/components/PremiumNavbar'
import HeroWithSEOIntro from './HeroWithSEOIntro'
import CVSidebar from './CVSidebar'
import TipsSectionFlat from './TipsSectionFlat'
import FAQSection from './FAQSection'
import VarforDetFungerarCard from './VarforDetFungerarCard'

// SEO: Lazy-load InteractiveCVPreview för bättre Page Speed (client-only, tungt)
const InteractiveCVPreview = dynamic(
  () => import('./InteractiveCVPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
)

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
  initialHTML: string
}

export default function CVExempelPage({ data, initialHTML }: CVExempelPageProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'varfor' | 'tips'>('preview')

  // Icon mapping för "Varför det fungerar" cards
  const ICONS = [CheckCircle, Target, Sparkles, FileText, CheckCircle, Target]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PremiumNavbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-cyan-600 transition-colors">
            Hem
          </Link>
          <span>/</span>
          <Link href="/cv-exempel" className="hover:text-cyan-600 transition-colors">
            CV-exempel
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{data.yrke}</span>
        </nav>
      </div>

      {/* Hero with SEO Intro - ALLTID SYNLIG */}
      <HeroWithSEOIntro
        yrke={data.yrke}
        intro={data.intro}
        seoIntro={data.seoIntro}
      />

      {/* NY: Tab Layout Section */}
      <section id="preview" className="py-12 md:py-16 bg-white scroll-mt-4">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">

              {/* Sidebar - Vänster kolumn */}
              <div className="lg:col-span-4 order-2 lg:order-1">
                <div className="lg:sticky lg:top-6">
                  <CVSidebar
                    yrke={data.yrke}
                    viktigtAttTankaPa={[
                      'Använd ATS-optimerade nyckelord från jobbannonsen',
                      'Kvantifiera resultat med konkreta siffror',
                      'Anpassa profiltext för varje ansökan',
                      'Inkludera branschspecifika certifieringar',
                      'Balansera tekniska och mjuka färdigheter'
                    ]}
                  />
                </div>
              </div>

              {/* Main Content - Höger kolumn */}
              <div className="lg:col-span-8 order-1 lg:order-2">
                {/* Tab Navigation */}
                <div className="border-b border-slate-200 mb-6">
                  <div className="flex flex-col sm:flex-row gap-1">
                    {[
                      { id: 'preview' as const, label: 'Se hur CV:t ser ut', icon: FileText },
                      { id: 'varfor' as const, label: 'Varför det fungerar', icon: Target },
                      { id: 'tips' as const, label: 'Tips för ditt yrke', icon: Lightbulb }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 min-h-[48px] touch-manipulation ${
                          activeTab === tab.id
                            ? 'text-cyan-600 border-cyan-600 bg-cyan-50/50'
                            : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content - undvik CLS med konsekvent animation */}
                <AnimatePresence mode="wait">
                  {activeTab === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InteractiveCVPreview
                        exempelCV={data.exempelCV}
                        yrke={data.yrke}
                        initialHTML={initialHTML}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'varfor' && (
                    <motion.div
                      key="varfor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.varforDetFungerar.map((item, idx) => {
                          const Icon = ICONS[idx] || CheckCircle
                          return (
                            <VarforDetFungerarCard
                              key={idx}
                              rubrik={item.rubrik}
                              text={item.text}
                              icon={Icon}
                              index={idx}
                            />
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'tips' && (
                    <motion.div
                      key="tips"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TipsSectionFlat
                        tips={data.tips}
                        yrke={data.yrke}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Accordion med Schema.org */}
      <FAQSection
        faq={data.faq}
        yrke={data.yrke}
      />

      {/* Relaterade Resurser */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Relaterade CV-exempel */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                Relaterade CV-exempel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.relaterade.map((rel, idx) => (
                  <Link
                    key={idx}
                    href={`/cv-exempel/${rel.slug}`}
                    className="group bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-xl p-6 border-2 border-transparent hover:border-cyan-600 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {rel.yrke}
                      </h3>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Se professionellt CV-exempel för {rel.yrke.toLowerCase()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Användbara verktyg */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
                Skapa ditt eget CV
              </h2>
              <div className="max-w-2xl mx-auto">
                <Link
                  href="/dashboard/skapa-cv"
                  className="group bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-xl p-8 hover:shadow-2xl transition-all duration-300 block"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">
                        Få konkret feedback
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        Vi pekar ut vad rekryterare saknar och ger förbättringsförslag du kan använda direkt.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Gör ditt CV redo för ATS-system
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Ladda upp ditt nuvarande CV så visar vi automatiskt exakt vad som saknas för att passera ATS-filter. Du godkänner ändringarna och laddar ner i valfri professionell design. Alternativt flyttar vi över all din info till ny mall direkt – utan omskrivning.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard/skapa-cv">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Kom igång gratis
                </button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              Analys på 60 sekunder • Fungerar med ATS-system • Professionella mallar
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
